/**
 * Admin Product Catalog Moderation Route
 * 
 * @agent engineering-backend-architect
 * @agent 04-sql-query-agent
 */

import { AuthorizationError } from '@/lib/errors';
import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, authorizeRole } from '@/lib/auth';
import { parsePagination } from '@/lib/pagination';

export const GET = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser(req);

  if (!user || !authorizeRole(user, ['admin'])) {
    throw new AuthorizationError('Forbidden');
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const keyword = searchParams.get('keyword');

  const queryObj: Record<string, string> = {};
  searchParams.forEach((val, key) => {
    queryObj[key] = val;
  });
  const { page, limit, skip } = parsePagination(queryObj);

  const where: any = { deletedAt: null };

  if (status && status !== 'all') {
    where.status = status;
  }

  if (keyword) {
    where.OR = [
      { name: { contains: keyword, mode: 'insensitive' } },
      { description: { contains: keyword, mode: 'insensitive' } },
    ];
  }

  const count = await prisma.product.count({ where });
  const products = await prisma.product.findMany({
    where,
    include: {
      category: { select: { id: true, name: true } },
      seller: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip,
  });

  return NextResponse.json({
    data: products,
    meta: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
  });
});

