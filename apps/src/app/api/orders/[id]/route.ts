/**
 * Order Retrieval API Route with Role-Based Access Scoping
 * 
 * @agent engineering-backend-architect
 * @agent 02-code-review-agent
 */

import { AuthenticationError, AuthorizationError, NotFoundError, ValidationError } from '@/lib/errors';
import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { serializeOrder, serializeOrderItem } from '@/lib/order-serialization';

const ID_FORMAT_REGEX = /^(c[a-z0-9]{20,}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[a-f0-9]{24})$/i;

export const GET = withErrorHandler(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  if (!id || !ID_FORMAT_REGEX.test(id)) {
    throw new ValidationError('Invalid order ID format');
  }

  const user = await getAuthUser(req);

  if (!user) {
    throw new AuthenticationError('Not authorized');
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: { shippingAddress: true, items: { include: { product: true } } },
  });
  
  if (!order || order.deletedAt) {
    throw new NotFoundError('Order not found');
  }

  const customerIdStr = order.customerId;
  
  let hasSellerAccess = false;
  if (user.role === 'seller') {
    const sellerItem = await prisma.orderItem.findFirst({
      where: { orderId: order.id, sellerId: user.id },
    });
    if (sellerItem) {
      hasSellerAccess = true;
    }
  }

  if (customerIdStr !== user.id && user.role !== 'admin' && !hasSellerAccess) {
    throw new AuthorizationError('Forbidden');
  }

  const itemsWhere: any = { orderId: order.id };
  if (user.role === 'seller' && customerIdStr !== user.id) {
    itemsWhere.sellerId = user.id;
  }
  const items = await prisma.orderItem.findMany({
    where: itemsWhere,
    include: { product: { select: { id: true, name: true, images: true, slug: true } } },
  });

  const serializedOrder = serializeOrder(order);
  const serializedItems = items.map((item) => serializeOrderItem(item));

  return NextResponse.json({ order: serializedOrder, items: serializedItems });
});

