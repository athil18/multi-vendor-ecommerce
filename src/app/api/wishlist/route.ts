/**
 * Wishlist API Handler
 * 
 * @agent engineering-backend-architect
 * @agent engineering-api-platform-engineer
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { withErrorHandler } from '@/lib/api-handler';
import { AuthenticationError } from '@/lib/errors';

export const GET = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser(req);
  if (!user) {
    throw new AuthenticationError('Unauthorized');
  }

  let wishlist = await prisma.wishlist.findUnique({
    where: { userId: user.id },
  });

  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
      data: { userId: user.id, productIds: [] },
    });
  }

  const products = await prisma.product.findMany({
    where: {
      id: { in: wishlist.productIds },
      deletedAt: null,
    },
    include: {
      category: true,
      seller: {
        include: { store: true },
      },
    },
  });

  return NextResponse.json({
    success: true,
    data: products.map((p) => ({ ...p, _id: p.id })),
  });
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser(req);
  if (!user) {
    throw new AuthenticationError('Unauthorized');
  }

  const { productId } = await req.json();
  if (!productId) {
    return NextResponse.json({ success: false, message: 'ProductId is required' }, { status: 400 });
  }

  let wishlist = await prisma.wishlist.findUnique({
    where: { userId: user.id },
  });

  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
      data: { userId: user.id, productIds: [productId] },
    });
  } else if (!wishlist.productIds.includes(productId)) {
    wishlist = await prisma.wishlist.update({
      where: { id: wishlist.id },
      data: { productIds: { push: productId } },
    });
  }

  const products = await prisma.product.findMany({
    where: {
      id: { in: wishlist.productIds },
      deletedAt: null,
    },
  });

  return NextResponse.json({
    success: true,
    message: 'Added to wishlist',
    data: products.map((p) => ({ ...p, _id: p.id })),
  });
});
