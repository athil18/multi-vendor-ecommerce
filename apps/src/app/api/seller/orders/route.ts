/**
 * Seller Order Items Query Route
 * 
 * @agent engineering-backend-architect
 * @agent 04-sql-query-agent
 */

import { AuthorizationError } from '@/lib/errors';
import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { parsePagination } from '@/lib/pagination';
import { serializeOrderItem } from '@/lib/order-serialization';

export const GET = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser(req);

  if (!user || user.role !== 'seller') {
    throw new AuthorizationError('Forbidden');
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const queryObj: Record<string, string> = {};
  searchParams.forEach((val, key) => {
    queryObj[key] = val;
  });
  const { page, limit, skip } = parsePagination(queryObj);

  const where: any = { sellerId: user.id };

  if (status && status !== 'all') {
    where.status = status;
  }

  const items = await prisma.orderItem.findMany({
    where,
    include: {
      order: { select: { id: true, aggregateStatus: true, paymentStatus: true, shippingAddress: true, createdAt: true } },
      product: { select: { id: true, name: true, images: true } },
    },
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  const total = await prisma.orderItem.count({ where });
  const serializedItems = items.map((item) => serializeOrderItem(item));

  return NextResponse.json({
    data: serializedItems,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

