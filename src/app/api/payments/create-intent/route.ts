/**
 * Stripe Payment Intent Creation & Escrow Preparation
 * 
 * @agent engineering-payments-billing-engineer
 * @agent engineering-backend-architect
 */

import { AuthenticationError, NotFoundError, ValidationError } from '@/lib/errors';
import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { postJournalEntry, ACCOUNTS, LineItemInput } from '@/lib/ledger';

export const POST = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser(req);

  if (!user) {
    throw new AuthenticationError('Not authorized');
  }

  const { orderId } = await req.json();
  
  if (!orderId) {
    throw new ValidationError('Order ID is required');
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, customerId: user.id },
  });
  if (!order) {
    throw new NotFoundError('Order not found');
  }

  if (order.paymentStatus === 'completed') {
    throw new ValidationError('Order is already paid');
  }

  const items = await prisma.orderItem.findMany({
    where: { orderId: order.id },
  });
  const totalPlatformFee = items.reduce((sum, item) => sum + item.platformFee, 0);

  let paymentIntent;
  const amountInCents = Math.round(order.totalAmount * 100);

  // Stripe minimum amount constraint check
  if (amountInCents < 50 && amountInCents > 0) {
    throw new ValidationError('Amount must be at least $0.50 for Stripe processing.');
  }

  if (amountInCents === 0) {
    // Handle zero-amount orders directly without Stripe in a Prisma transaction
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'completed',
          aggregateStatus: 'processing',
          paidAt: new Date(),
        },
      });

      await tx.orderItem.updateMany({
        where: { orderId: order.id },
        data: { status: 'processing' },
      });

      const ledgerLines: LineItemInput[] = [];
      let totalPayout = 0;
      let totalFee = 0;
      let totalTax = 0;

      for (const item of items) {
        const payoutCents = Math.round(item.sellerPayout * 100);
        const feeCents = Math.round(item.platformFee * 100);
        const taxCents = Math.round(item.taxAmount * 100);
        totalPayout += payoutCents;
        totalFee += feeCents;
        totalTax += taxCents;

        if (payoutCents > 0) {
          ledgerLines.push({ accountId: ACCOUNTS.VENDOR_ESCROW, amount: payoutCents, direction: 'CREDIT', entityId: item.sellerId });
        }
      }

      if (totalFee > 0) {
        ledgerLines.push({ accountId: ACCOUNTS.PLATFORM_COMMISSION, amount: totalFee, direction: 'CREDIT' });
      }
      if (totalTax > 0) {
        ledgerLines.push({ accountId: ACCOUNTS.TAX_PAYABLE, amount: totalTax, direction: 'CREDIT' });
      }
      
      const totalCredit = totalPayout + totalFee + totalTax;
      if (totalCredit > 0) {
        ledgerLines.push({ accountId: ACCOUNTS.STRIPE_CASH_IN_TRANSIT, amount: totalCredit, direction: 'DEBIT' });
      } else {
        ledgerLines.push({ accountId: ACCOUNTS.STRIPE_CASH_IN_TRANSIT, amount: 0, direction: 'DEBIT' });
        ledgerLines.push({ accountId: ACCOUNTS.VENDOR_ESCROW, amount: 0, direction: 'CREDIT' });
      }

      await postJournalEntry({
        idempotencyKey: `zero_amount_${order.id}_paid`,
        eventName: 'ORDER_PAID',
        currency: 'usd',
        orderId: order.id,
        lines: ledgerLines
      }, tx);
    });

    return NextResponse.json({ clientSecret: null, message: 'Order is free' });
  }

  if (order.stripePaymentIntentId) {
    // Re-use or update existing intent
    paymentIntent = await stripe.paymentIntents.update(order.stripePaymentIntentId, {
      amount: amountInCents,
    });
  } else {
    // Create new intent
    paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: { orderId: order.id },
      transfer_group: order.id,
    });
    await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    });
  }

  return NextResponse.json({ clientSecret: paymentIntent.client_secret });
});

