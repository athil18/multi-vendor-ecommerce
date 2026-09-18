/**
 * Order Item Status Transition & Aggregate Recalculation API Route
 * 
 * @agent engineering-backend-architect
 * @agent 02-code-review-agent
 */

import { AuthorizationError, NotFoundError } from '@/lib/errors';
import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { validateOrderItemTransition, recalculateOrderAggregateStatus } from '@/lib/order-status';
import { orderItemStatusUpdateSchema } from '@/lib/schemas/commerce';
import { serializeOrderItem } from '@/lib/order-serialization';

export const PUT = withErrorHandler(async(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const user = await getAuthUser(req);

  if (!user || user.role !== 'seller') {
    throw new AuthorizationError('Forbidden');
  }

  const body = await req.json();
  const { status } = orderItemStatusUpdateSchema.parse(body);

  const updatedItem = await prisma.$transaction(async (tx) => {
    const orderItem = await tx.orderItem.findUnique({
      where: { id },
    });
    if (!orderItem) {
      throw new NotFoundError('Order item not found');
    }

    // Owner check
    if (orderItem.sellerId !== user.id) {
      throw new AuthorizationError('Forbidden');
    }

    const currentStatus = orderItem.status;
    let savedItem = orderItem;

    if (status !== currentStatus) {
      // Validate transition logic
      validateOrderItemTransition(currentStatus, status as any);

      savedItem = await tx.orderItem.update({
        where: { id },
        data: { status: status as any },
      });
    }

    // Recalculate main order status inside transaction
    const allItems = await tx.orderItem.findMany({
      where: { orderId: orderItem.orderId },
      select: { status: true },
    });
    const aggregateStatus = recalculateOrderAggregateStatus(allItems.map((i) => i.status));

    await tx.order.update({
      where: { id: orderItem.orderId },
      data: { aggregateStatus: aggregateStatus as any },
    });

    return savedItem;
  });

  const serializedItem = serializeOrderItem(updatedItem);
  return NextResponse.json(serializedItem);
});

