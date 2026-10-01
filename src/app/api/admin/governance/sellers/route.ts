/**
 * Admin Governance Sellers & Stores API Route
 * 
 * @agent engineering-backend-architect
 * @agent security-appsec-engineer
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

  const stores = await prisma.store.findMany({
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              products: { where: { deletedAt: null } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const formatted = stores.map((s) => ({
    id: s.id,
    sellerId: s.sellerId,
    name: s.name,
    slug: s.slug,
    description: s.description,
    trustScore: s.trustScore || 100,
    stripeOnboardingComplete: s.stripeOnboardingComplete,
    payoutsEnabled: s.payoutsEnabled,
    status: s.seller?.status || 'active',
    sellerName: s.seller?.name || 'Unknown Seller',
    sellerEmail: s.seller?.email || '',
    productCount: s.seller?._count?.products || 0,
    createdAt: s.createdAt,
  }));

  return NextResponse.json({
    success: true,
    data: formatted,
    total: formatted.length,
  });
});
