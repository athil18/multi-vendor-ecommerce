/**
 * Escrow Release & Multi-Vendor Payout Scheduler
 * 
 * @agent engineering-payments-billing-engineer
 * @agent finance-financial-analyst
 */

import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { postJournalEntry, ACCOUNTS } from '@/lib/ledger';
import { logger } from '@/lib/logger';

// Automated / admin trigger for Escrow Release / Payout Scheduler
export const POST = withErrorHandler(async (req: NextRequest) => {
  const authHeader = req.headers.get('authorization');
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Find all orders eligible for payout release
  const eligibleOrders = await prisma.order.findMany({
    where: {
      aggregateStatus: 'delivered',
      paymentStatus: 'completed',
      deletedAt: null,
    },
  });

  const results = [];
  const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITEST;

  for (const order of eligibleOrders) {
    const items = await prisma.orderItem.findMany({
      where: {
        orderId: order.id,
        status: { notIn: ['cancelled'] },
      },
    });
    if (items.length === 0) continue;

    // Group by seller for Multi-Vendor Order Support
    const sellerTotals: Record<string, number> = {};
    for (const item of items) {
      const sellerIdStr = item.sellerId;
      if (!sellerTotals[sellerIdStr]) sellerTotals[sellerIdStr] = 0;
      sellerTotals[sellerIdStr] += item.sellerPayout;
    }

    // Process Payouts per seller
    for (const [sellerId, payoutAmount] of Object.entries(sellerTotals)) {
      if (payoutAmount <= 0) continue;
      
      // 1. Check TransferLog for previous success
      const log = await prisma.transferLog.findFirst({
        where: { orderId: order.id, sellerId },
      });
      if (log && log.status === 'success') continue;

      // 2. Extra double-payout check in FinancialLedger for security
      const existingPayout = await prisma.financialLedger.findFirst({
        where: {
          orderId: order.id,
          sellerId,
          type: 'payout',
          status: 'completed',
        },
      });
      if (existingPayout) {
        if (log) {
          await prisma.transferLog.update({
            where: { id: log.id },
            data: { status: 'success' },
          });
        } else {
          await prisma.transferLog.create({
            data: {
              orderId: order.id,
              sellerId,
              amount: Math.round(payoutAmount * 100),
              currency: 'usd',
              status: 'success',
              attempts: 1,
              lastAttemptAt: new Date(),
            },
          });
        }
        continue;
      }

      const currentAttempts = log ? log.attempts + 1 : 1;

      // 3. Retry limits & Dead letter state
      if (log && log.status === 'failed') {
        if (log.attempts >= 5) {
          results.push({ orderId: order.id, sellerId, status: 'failed', reason: 'Dead-letter limit reached' });
          continue;
        }
        if (log.nextRetryAt && new Date() < log.nextRetryAt) {
          results.push({ orderId: order.id, sellerId, status: 'waiting_for_retry', nextRetryAt: log.nextRetryAt });
          continue;
        }
      }

      // Check onboarding & account status
      const store = await prisma.store.findUnique({ where: { sellerId } });
      if (!store || !store.stripeConnectedAccountId || !store.payoutsEnabled) {
        const errorMsg = 'Onboarding incomplete';
        const delayMs = isTest 
          ? Math.pow(2, currentAttempts - 1) * 1000 
          : Math.pow(2, currentAttempts - 1) * 60 * 1000;
        const nextRetryAt = new Date(Date.now() + delayMs);

        if (log) {
          await prisma.transferLog.update({
            where: { id: log.id },
            data: {
              status: 'failed',
              attempts: currentAttempts,
              lastAttemptAt: new Date(),
              nextRetryAt: currentAttempts >= 5 ? null : nextRetryAt,
              error: errorMsg,
            },
          });
        } else {
          await prisma.transferLog.create({
            data: {
              orderId: order.id,
              sellerId,
              amount: Math.round(payoutAmount * 100),
              currency: 'usd',
              status: 'failed',
              attempts: currentAttempts,
              lastAttemptAt: new Date(),
              nextRetryAt: currentAttempts >= 5 ? null : nextRetryAt,
              error: errorMsg,
            },
          });
        }

        results.push({ orderId: order.id, sellerId, status: 'failed', reason: errorMsg });
        continue;
      }

      try {
        const transferAmountCents = Math.round(payoutAmount * 100);
        
        // Execute Stripe Transfer with deterministic idempotency key
        const transfer = await stripe.transfers.create({
          amount: transferAmountCents,
          currency: 'usd',
          destination: store.stripeConnectedAccountId,
          transfer_group: `ORDER_${order.id}`
        }, {
          idempotencyKey: `payout-${order.id}-${sellerId}`
        });

        // Record to Legacy Financial Ledger for backward compat
        const existingRef = await prisma.financialLedger.findFirst({
          where: { stripeReferenceId: transfer.id }
        });
        if (!existingRef) {
          await prisma.financialLedger.create({
            data: {
              stripeReferenceId: transfer.id,
              orderId: order.id,
              sellerId,
              type: 'payout',
              amount: payoutAmount,
              currency: 'usd',
              status: 'completed',
              description: 'Payout for delivered order',
            },
          });
        }

        // DOUBLE-ENTRY LEDGER: VENDOR_SETTLED
        await postJournalEntry({
          idempotencyKey: `payout_${order.id}_${sellerId}_${transfer.id}`,
          eventName: 'VENDOR_SETTLED',
          currency: 'usd',
          orderId: order.id,
          lines: [
            { accountId: ACCOUNTS.VENDOR_ESCROW, amount: transferAmountCents, direction: 'DEBIT', entityId: sellerId },
            { accountId: ACCOUNTS.STRIPE_CASH_IN_TRANSIT, amount: transferAmountCents, direction: 'CREDIT' },
          ]
        });

        // Record or update TransferLog success status
        if (log) {
          await prisma.transferLog.update({
            where: { id: log.id },
            data: {
              status: 'success',
              stripeTransferId: transfer.id,
              attempts: currentAttempts,
              lastAttemptAt: new Date(),
              nextRetryAt: null,
              error: null,
            },
          });
        } else {
          await prisma.transferLog.create({
            data: {
              orderId: order.id,
              sellerId,
              amount: transferAmountCents,
              currency: 'usd',
              status: 'success',
              stripeTransferId: transfer.id,
              attempts: currentAttempts,
              lastAttemptAt: new Date(),
            },
          });
        }

        results.push({ orderId: order.id, sellerId, status: 'completed' });
      } catch (err: any) {
        logger.error(`Payout failed for seller ${sellerId} on order ${order.id}`, { error: String(err.message || err) });
        
        const delayMs = isTest 
          ? Math.pow(2, currentAttempts - 1) * 1000 
          : Math.pow(2, currentAttempts - 1) * 60 * 1000;
        const nextRetryAt = new Date(Date.now() + delayMs);

        if (log) {
          await prisma.transferLog.update({
            where: { id: log.id },
            data: {
              status: 'failed',
              attempts: currentAttempts,
              lastAttemptAt: new Date(),
              nextRetryAt: currentAttempts >= 5 ? null : nextRetryAt,
              error: err.message,
            },
          });
        } else {
          await prisma.transferLog.create({
            data: {
              orderId: order.id,
              sellerId,
              amount: Math.round(payoutAmount * 100),
              currency: 'usd',
              status: 'failed',
              attempts: currentAttempts,
              lastAttemptAt: new Date(),
              nextRetryAt: currentAttempts >= 5 ? null : nextRetryAt,
              error: err.message,
            },
          });
        }

        results.push({ orderId: order.id, sellerId, status: 'failed', reason: err.message });
      }
    }
  }

  return NextResponse.json({ processed: results.length, details: results });
});

