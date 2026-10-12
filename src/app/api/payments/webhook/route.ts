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

const txManager = new PrismaTransactionManager();
const orderRepo = new PrismaOrderRepository();
const catalogRepo = new PrismaCatalogRepository();
const ledgerService = new PrismaLedgerService();

const paymentService = new PaymentService(txManager, orderRepo, catalogRepo, ledgerService);

export const POST = withErrorHandler(async (req: NextRequest) => {
  const sig = req.headers.get('stripe-signature');
  const rawBody = await req.text();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    if (!webhookSecret) {
      logError(new Error('FATAL: STRIPE_WEBHOOK_SECRET is not configured on the server.'));
    }
    throw new ValidationError('Webhook signature or secret missing');
  }

  let event: any;
  try {
    // Official Stripe constructEvent enforces:
    // 1. Raw unmodified request body
    // 2. stripe-signature header validation (t=timestamp, v1=hmac_sha256)
    // 3. Constant-time signature comparison (crypto.timingSafeEqual)
    // 4. Timestamp replay tolerance window (300 seconds / 5 minutes)
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret, 300);
  } catch (err: any) {
    const isExpired = err.message?.includes('tolerance');
    AlertDispatcher.dispatch('high', 'Stripe Webhook Verification Failed', {
      error: err.message,
      isExpired,
      hasSignature: Boolean(sig),
    });
    throw new ValidationError(`Webhook signature verification failed: ${err.message}`);
  }

  // Idempotency Gate: Check if event was previously ingested
  const existingEvent = await prisma.eventLog.findUnique({ where: { eventId: event.id } });
  if (existingEvent) {
    if (existingEvent.status === 'processed') {
      logger.info(`Duplicate Stripe Webhook received: ${event.id} (already processed). Responding with 200.`);
      return NextResponse.json({ received: true, duplicate: true });
    }
    if (existingEvent.status === 'pending') {
      logger.info(`Concurrent Stripe Webhook in-flight: ${event.id}. Responding with 200.`);
      return NextResponse.json({ received: true, duplicate: true, inFlight: true });
    }
    logger.info(`Retrying previously failed Stripe Webhook: ${event.id}`);
  }

  const processingStartTime = Date.now();
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();

  return Sentry.withIsolationScope(async () => {
    Sentry.setTag('stripe_event_type', event.type);
    
    // Create or update eventLog with 'pending' status
    let isConcurrentDuplicate = false;
    if (!existingEvent) {
      try {
        await prisma.eventLog.create({
          data: {
            eventId: event.id,
            eventType: event.type,
            status: 'pending',
            stripeCreatedAt: event.created ? new Date(event.created * 1000) : undefined,
            requestId,
            processingNode: process.env.HOSTNAME || 'default',
          },
        });
      } catch (err: any) {
        if (err.code === 'P2002') {
          // Prisma Unique constraint violation on concurrent webhook deliveries
          logger.info(`Duplicate Stripe Webhook race condition: ${event.id}. Responding with 200.`);
          isConcurrentDuplicate = true;
        } else {
          throw err;
        }
      }
    } else {
      // Re-mark existing failed record as pending for retry
      await prisma.eventLog.update({
        where: { eventId: event.id },
        data: {
          status: 'pending',
          requestId,
          processingNode: process.env.HOSTNAME || 'default',
        },
      });
    }

    if (isConcurrentDuplicate) {
      return NextResponse.json({ received: true, duplicate: true });
    }

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
      // Mark as failed on error for legitimate retry by Stripe
      await prisma.eventLog.update({
        where: { eventId: event.id },
        data: { 
          status: 'failed',
          error: err.message,
          processingDurationMs: Date.now() - processingStartTime,
        },
      }).catch(() => {});
      
      logError(err as Error, { eventType: event.type, eventId: event.id });
      throw err;
    }
  });
});

