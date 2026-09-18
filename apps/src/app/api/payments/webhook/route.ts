/**
 * Stripe Webhook Ingestion Route (Idempotent Event Processing)
 * 
 * @agent engineering-payments-billing-engineer
 * @agent engineering-backend-architect
 */

import { ValidationError } from '@/lib/errors';
import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import * as Sentry from '@sentry/nextjs';
import { AlertDispatcher } from '@/lib/alerting';
import { logger, logError } from '@/lib/logger';
import { PaymentService } from '@/services/PaymentService';
import { PrismaTransactionManager } from '@/infrastructure/database/PrismaTransactionManager';
import { PrismaOrderRepository } from '@/infrastructure/database/repositories/PrismaOrderRepository';
import { PrismaCatalogRepository } from '@/infrastructure/database/repositories/PrismaCatalogRepository';
import { PrismaLedgerService } from '@/infrastructure/database/repositories/PrismaLedgerService';

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

const txManager = new PrismaTransactionManager();
const orderRepo = new PrismaOrderRepository();
const catalogRepo = new PrismaCatalogRepository();
const ledgerService = new PrismaLedgerService();

const paymentService = new PaymentService(txManager, orderRepo, catalogRepo, ledgerService);

export const POST = withErrorHandler(async (req: NextRequest) => {
  const sig = req.headers.get('stripe-signature');
  const rawBody = await req.text();

  if (!sig || !STRIPE_WEBHOOK_SECRET) {
    throw new ValidationError('Webhook signature or secret missing');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    AlertDispatcher.dispatch('high', 'Stripe Webhook Verification Failed', { error: err });
    throw new ValidationError('Webhook signature verification failed');
  }

  const existingEvent = await prisma.eventLog.findUnique({ where: { eventId: event.id } });
  if (existingEvent) {
    logger.info(`Duplicate Stripe Webhook received: ${event.id}. Responding with 200.`);
    return NextResponse.json({ received: true, duplicate: true });
  }

  const processingStartTime = Date.now();
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();

  return Sentry.withIsolationScope(async () => {
    Sentry.setTag('stripe_event_type', event.type);
    
    // Create eventLog with 'pending' status first
    await prisma.eventLog.create({
      data: {
        eventId: event.id,
        eventType: event.type,
        status: 'pending',
        stripeCreatedAt: event.created ? new Date(event.created * 1000) : undefined,
        requestId,
        processingNode: process.env.HOSTNAME || 'default',
      },
    }).catch((err: any) => {
      if (err.code === 'P2002') { // Prisma Unique constraint violation
        logger.info(`Duplicate Stripe Webhook received: ${event.id}. Responding with 200.`);
        throw new Response(JSON.stringify({ received: true, duplicate: true }), { status: 200 });
      }
      throw err;
    });

    try {
      await paymentService.handleWebhookEvent(event);

      // Mark as processed on success
      await prisma.eventLog.update({
        where: { eventId: event.id },
        data: { 
          status: 'processed',
          processingDurationMs: Date.now() - processingStartTime,
        },
      });

      return NextResponse.json({ received: true });
    } catch (err: any) {
      // Mark as failed on error for retry
      await prisma.eventLog.update({
        where: { eventId: event.id },
        data: { 
          status: 'failed',
          error: err.message,
          processingDurationMs: Date.now() - processingStartTime,
        },
      }).catch(() => {});
      
      logError(err as Error, { eventType: event.type });
      throw err;
    }
  });
});

