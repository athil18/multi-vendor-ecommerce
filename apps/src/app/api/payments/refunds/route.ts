/**
 * Multi-Vendor Escrow Refund & Transfer Reversal API Route
 * 
 * @agent engineering-payments-billing-engineer
 * @agent finance-financial-analyst
 */

import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { getAuthUser } from '@/lib/auth';
import { AuthorizationError, ValidationError, AppError } from '@/lib/errors';
import { validatePaymentTransition } from '@/lib/order-status';
import { postJournalEntry, ACCOUNTS, LineItemInput } from '@/lib/ledger';
import { logger, logError } from '@/lib/logger';

export const POST = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser(req);
  if (!user || user.role !== 'admin') {
    throw new AuthorizationError('Admin privileges required to issue refunds');
  }

  const { orderId, amount, reason, reverseTransfer } = await req.json();

  if (!orderId) throw new ValidationError('Order ID is required');

  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw new ValidationError('Order not found');
      if (!order.stripePaymentIntentId) throw new ValidationError('No Stripe Payment Intent exists for this order');

      const currentStatus = order.paymentStatus;
      if (currentStatus === 'refunded') {
        throw new ValidationError('Order is already refunded');
      }

      // Validate transition: completed -> refunded
      validatePaymentTransition(currentStatus, 'refunded');

      const refundAmountCents = amount ? Math.round(amount * 100) : undefined;

      // 1. Transfer Reversals
      if (reverseTransfer) {
        const payouts = await tx.financialLedger.findMany({ 
          where: {
            orderId: order.id, 
            type: 'payout', 
            status: 'completed' 
          }
        });
        
        for (const payout of payouts) {
          if (payout.stripeReferenceId) {
            try {
              const reversal = await stripe.transfers.createReversal(payout.stripeReferenceId, {
                description: `Reversal for refunded order ${order.id}`
              });
              
              await tx.financialLedger.create({
                data: {
                  orderId: order.id,
                  sellerId: payout.sellerId,
                  type: 'reversal',
                  amount: payout.amount,
                  currency: 'usd',
                  status: 'completed',
                  stripeReferenceId: reversal.id,
                  description: `Transfer Reversal: ${reason || 'Refund initiated'}`
                }
              });

              logger.info('Transfer reversal succeeded', {
                orderId: String(order.id),
                transferId: payout.stripeReferenceId,
                reversalId: reversal.id,
                amount: payout.amount,
              });
            } catch (err: any) {
              logError(err, {
                step: 'TRANSFER_REVERSAL',
                orderId: String(order.id),
                transferId: payout.stripeReferenceId,
                sellerId: payout.sellerId ? String(payout.sellerId) : undefined,
              });
              throw new AppError(
                `Failed to reverse seller transfer ${payout.stripeReferenceId}: ${err.message}`,
                502,
                'EXTERNAL_SERVICE_ERROR'
              );
            }
          }
        }
      }

      // 2. Stripe Customer Refund
      let refund;
      try {
        const refundArgs: any = {
          payment_intent: order.stripePaymentIntentId,
          reason: 'requested_by_customer'
        };
        if (refundAmountCents) refundArgs.amount = refundAmountCents;

        refund = await stripe.refunds.create(refundArgs);

        logger.info('Stripe refund created', {
          orderId: String(order.id),
          refundId: refund.id,
          paymentIntentId: order.stripePaymentIntentId,
          amountCents: refundAmountCents ?? 'full',
        });
      } catch (err: any) {
        logError(err, {
          step: 'STRIPE_REFUND',
          orderId: String(order.id),
          paymentIntentId: order.stripePaymentIntentId,
          requestedAmountCents: refundAmountCents,
        });
        throw new AppError(
          `Stripe refund failed for payment ${order.stripePaymentIntentId}: ${err.message}`,
          502,
          'EXTERNAL_SERVICE_ERROR'
        );
      }

      // 3. Update Order and Items Status
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'refunded',
          aggregateStatus: 'cancelled',
        },
      });

      // Restock variant stocks and cancel items
      const items = await tx.orderItem.findMany({ where: { orderId: order.id } });
      for (const item of items) {
        if (item.status !== 'cancelled') {
          await tx.orderItem.update({
            where: { id: item.id },
            data: { status: 'cancelled' },
          });

          if (item.variantId) {
            await tx.variant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      }

      // 4. Financial Ledger Entry
      await tx.financialLedger.create({
        data: {
          orderId: order.id,
          type: 'refund',
          amount: amount || order.totalAmount,
          currency: 'usd',
          status: 'completed',
          stripeReferenceId: refund.id,
          description: `Customer Refund: ${reason || 'Manual Admin Refund'}`
        }
      });

      // 5. DOUBLE-ENTRY LEDGER: REFUND_ISSUED
      let totalPayoutReversal = 0;
      let totalFeeReversal = 0;
      let totalTaxReversal = 0;
      const ledgerLines: LineItemInput[] = [];

      for (const item of items) {
        const payoutCents = Math.round(item.sellerPayout * 100);
        const feeCents = Math.round(item.platformFee * 100);
        const taxCents = Math.round(item.taxAmount * 100);
        totalPayoutReversal += payoutCents;
        totalFeeReversal += feeCents;
        totalTaxReversal += taxCents;
        if (payoutCents > 0) {
          ledgerLines.push({ accountId: ACCOUNTS.VENDOR_ESCROW, amount: payoutCents, direction: 'DEBIT', entityId: item.sellerId });
        }
      }
      if (totalFeeReversal > 0) {
        ledgerLines.push({ accountId: ACCOUNTS.PLATFORM_COMMISSION, amount: totalFeeReversal, direction: 'DEBIT' });
      }
      if (totalTaxReversal > 0) {
        ledgerLines.push({ accountId: ACCOUNTS.TAX_PAYABLE, amount: totalTaxReversal, direction: 'DEBIT' });
      }
      const totalDebit = totalPayoutReversal + totalFeeReversal + totalTaxReversal;
      ledgerLines.push({ accountId: ACCOUNTS.STRIPE_CASH_IN_TRANSIT, amount: totalDebit, direction: 'CREDIT' });

      await postJournalEntry({
        idempotencyKey: `admin_refund_${order.id}_${refund.id}`,
        eventName: 'REFUND_ISSUED',
        currency: 'usd',
        orderId: order.id,
        lines: ledgerLines,
      }, tx);

      return { refund };
    });

    return NextResponse.json({ success: true, refund: result.refund });
  } catch (error: any) {
    logError(error, {
      step: 'REFUND_TRANSACTION',
      orderId: orderId,
      requestedAmount: amount,
      reason,
      reverseTransfer,
      errorType: error instanceof AppError ? error.code : 'UNKNOWN',
    });

    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      'The refund could not be processed due to an unexpected error. Please try again or contact support.',
      500,
      'INTERNAL_SERVER_ERROR'
    );
  }
});

