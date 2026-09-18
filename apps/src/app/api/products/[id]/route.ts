/**
 * Product Item Detail, Update, and Deletion API Route
 * 
 * @agent engineering-backend-architect
 * @agent 04-sql-query-agent
 */

import { AuthenticationError, AuthorizationError, NotFoundError, ValidationError } from '@/lib/errors';
import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import slugify from 'slugify';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { updateProductSchema } from '@/lib/schemas/commerce';

import { FALLBACK_CATALOG_MAP } from '@/lib/catalog-fallbacks';

export const GET = withErrorHandler(async(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      seller: { select: { id: true, name: true, email: true } },
      variants: true,
    },
  });

  if (!product || product.deletedAt) {
    if (FALLBACK_CATALOG_MAP[id]) {
      return NextResponse.json(FALLBACK_CATALOG_MAP[id]);
    }
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

export const PUT = withErrorHandler(async(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const user = await getAuthUser(req);

  if (!user) {
    throw new AuthenticationError('Not authorized');
  }

  const product = await prisma.product.findUnique({
    where: { id },
  });
  if (!product || product.deletedAt) {
    throw new NotFoundError('Product not found');
  }

  // Owner checks
  if (product.sellerId !== user.id && user.role !== 'admin') {
    throw new AuthorizationError('Forbidden');
  }

  if (product.status === 'rejected') {
    throw new ValidationError('Cannot edit a rejected product. Revert it to draft first.');
  }

  const body = await req.json();
  const validation = { data: updateProductSchema.parse(body) };
  const updateData: any = { ...validation.data };

  if (updateData.name && updateData.name !== product.name) {
    updateData.slug = slugify(updateData.name, { lower: true }) + '-' + Date.now();
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: updateData,
    include: {
      category: { select: { id: true, name: true, slug: true } },
    },
  });

  return NextResponse.json({
    ...updatedProduct,
    _id: updatedProduct.id,
    categoryId: updatedProduct.category,
  });
});

export const DELETE = withErrorHandler(async(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const user = await getAuthUser(req);

  if (!user) {
    throw new AuthenticationError('Not authorized');
  }

  const product = await prisma.product.findUnique({
    where: { id },
  });
  if (!product || product.deletedAt) {
    throw new NotFoundError('Product not found');
  }

  // Owner checks
  if (product.sellerId !== user.id && user.role !== 'admin') {
    throw new AuthorizationError('Forbidden');
  }

  if (product.status === 'published') {
    throw new ValidationError('Cannot delete a published product. Archive it first.');
  }

  // Cascade delete variants and product
  await prisma.variant.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });

  return NextResponse.json({ message: 'Product and its variants deleted successfully' });
});
