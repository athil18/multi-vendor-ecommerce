/**
 * Admin Escrow Financials & Split Payouts API Route
 * 
 * @agent engineering-payments-billing-engineer
 * @agent engineering-backend-architect
 */

import { AuthorizationError } from '@/lib/errors';
import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const GET = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser(req);

  if (!user || user.role !== 'admin') {
    throw new AuthorizationError('Admin access required');
  }

  const [orders, count] = await Promise.all([
    prisma.order.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        totalAmount: true,
        paymentStatus: true,
        aggregateStatus: true,
        createdAt: true,
        customer: {
          select: { name: true, email: true },
        },
        items: {
          select: {
            id: true,
            price: true,
            quantity: true,
            status: true,
            seller: {
              select: { name: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.order.count({ where: { deletedAt: null } }),
  ]);

  // Calculate real monetary metrics in floating numbers derived from cents
  let totalGMV = 0;
  let escrowLocked = 0;
  let settledPayouts = 0;

  orders.forEach((o) => {
    const amt = Number(o.totalAmount || 0);
    totalGMV += amt;

    if (o.paymentStatus === 'completed') {
      if (o.aggregateStatus === 'delivered') {
        settledPayouts += amt * 0.90; // 90% vendor payout
      } else {
        escrowLocked += amt; // Vault held in escrow
      }
    }
  });

  const platformFeesCollected = totalGMV * 0.10; // 10% platform take-rate

  return NextResponse.json({
    success: true,
    data: {
      metrics: {
        totalGMV: Math.round(totalGMV * 100) / 100,
        escrowLocked: Math.round(escrowLocked * 100) / 100,
        settledPayouts: Math.round(settledPayouts * 100) / 100,
        platformFees: Math.round(platformFeesCollected * 100) / 100,
        totalOrders: count,
      },
      orders,
    },
  });
});
