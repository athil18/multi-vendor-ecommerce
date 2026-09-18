/**
 * Dispute Escalation & Management API Route
 * 
 * @agent engineering-backend-architect
 * @agent engineering-support-engineer
 */

import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorizeRole, getAuthUser } from '@/lib/auth';
import { AuthorizationError, NotFoundError } from '@/lib/errors';
import { z } from 'zod';

const createDisputeSchema = z.object({
  orderId: z.string(),
  orderItemId: z.string(),
  reason: z.enum(['item_not_received', 'item_damaged', 'wrong_item', 'other']),
  description: z.string(),
  evidenceUrls: z.array(z.string()).optional(),
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser(req);
  if (!user || !authorizeRole(user, ['customer'])) {
    throw new AuthorizationError('Forbidden');
  }

  const body = await req.json();
  const { orderId, orderItemId, reason, description, evidenceUrls } = createDisputeSchema.parse(body);

  const order = await prisma.order.findFirst({ where: { id: orderId, customerId: user.id } });
  if (!order) {
    throw new NotFoundError('Order not found');
  }

  const orderItem = await prisma.orderItem.findFirst({ where: { id: orderItemId, orderId } });
  if (!orderItem) {
    throw new NotFoundError('OrderItem not found in this order');
  }

  const sellerId = orderItem.sellerId;

  const dispute = await prisma.dispute.create({
    data: {
      orderId,
      orderItemId,
      buyerId: user.id,
      sellerId,
      reason: reason as any,
      description,
      evidenceUrls: evidenceUrls || [],
      status: 'open',
    },
  });

  return NextResponse.json(dispute, { status: 201 });
});

export const GET = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser(req);
  if (!user) throw new AuthorizationError('Forbidden');

  const where: any = {};
  if (user.role === 'customer') where.buyerId = user.id;
  if (user.role === 'seller') where.sellerId = user.id;

  const disputes = await prisma.dispute.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(disputes);
});

