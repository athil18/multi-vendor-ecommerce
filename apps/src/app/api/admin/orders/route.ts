/**
 * Admin Orders Overview & Search API Route
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
import { serializeOrder } from '@/lib/order-serialization';

export const GET = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser(req);

  if (!user || user.role !== 'admin') {
    throw new AuthorizationError('Admin access required');
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const paymentStatus = searchParams.get('paymentStatus');
  const customerId = searchParams.get('customerId');
  const sellerId = searchParams.get('sellerId');
  const search = searchParams.get('search');

  const queryObj: Record<string, string> = {};
  searchParams.forEach((val, key) => {
    queryObj[key] = val;
  });
  const { page, limit, skip } = parsePagination(queryObj);

  const where: any = { deletedAt: null };

  if (status && status !== 'all') {
    where.aggregateStatus = status;
  }
  if (paymentStatus && paymentStatus !== 'all') {
    where.paymentStatus = paymentStatus;
  }
  if (customerId) {
    where.customerId = customerId;
  }
  if (sellerId) {
    where.sellerIds = { has: sellerId };
  }

  if (search && search.trim()) {
    where.id = { contains: search.trim() };
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, email: true, role: true, status: true } },
        shippingAddress: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ]);

  const serializedOrders = orders.map((order) => serializeOrder(order));

  return NextResponse.json({
    data: serializedOrders,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

