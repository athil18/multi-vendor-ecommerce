/**
 * Product Retrieval by Slug API Route
 * 
 * @agent engineering-backend-architect
 * @agent 04-sql-query-agent
 */

import { NotFoundError } from '@/lib/errors';
import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const GET = withErrorHandler(async(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) => {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      seller: { select: { id: true, name: true, email: true } },
      variants: true,
    },
  });

  if (!product || product.deletedAt) {
    throw new NotFoundError('Product not found');
  }

  // Visibility guard: only published products are publicly accessible.
  if (product.status !== 'published') {
    const user = await getAuthUser(req);
    const isOwner = user && product.sellerId === user.id;
    const isAdmin = user && user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new NotFoundError('Product not found');
    }
  }

  return NextResponse.json({
    ...product,
    _id: product.id,
    categoryId: product.category,
    sellerId: product.seller ? { ...product.seller, _id: product.seller.id } : null,
  });
});
