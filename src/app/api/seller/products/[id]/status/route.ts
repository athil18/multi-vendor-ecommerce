/**
 * Seller Product Status State Machine & Transition API Route
 * 
 * @agent engineering-backend-architect
 * @agent 02-code-review-agent
 */

import { AuthorizationError, NotFoundError, ValidationError } from '@/lib/errors';
import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { productStatusUpdateSchema } from '@/lib/schemas/commerce';
import { ProductStatus } from '@prisma/client';

export const PRODUCT_STATUS_TRANSITIONS: Record<ProductStatus, ProductStatus[]> = {
  draft: ['pending_review', 'archived'],
  pending_review: ['approved', 'rejected', 'draft'],
  approved: ['published', 'archived'],
  published: ['archived'],
  rejected: ['draft'],
  archived: ['draft'],
};

export const PATCH = withErrorHandler(async(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const user = await getAuthUser(req);

  if (!user || user.role !== 'seller') {
    throw new AuthorizationError('Forbidden');
  }

  const product = await prisma.product.findUnique({
    where: { id },
  });
  if (!product || product.deletedAt) {
    throw new NotFoundError('Product not found');
  }

  // Owner check
  if (product.sellerId !== user.id) {
    throw new AuthorizationError('Forbidden');
  }

  const body = await req.json();
  const { status: newStatus } = productStatusUpdateSchema.parse(body);

  if (!newStatus) {
    throw new ValidationError('New status is required');
  }

  const currentStatus = product.status as ProductStatus;
  const allowedTransitions = PRODUCT_STATUS_TRANSITIONS[currentStatus];

  if (!allowedTransitions || !allowedTransitions.includes(newStatus as ProductStatus)) {
    return NextResponse.json(
      {
        message: `Cannot transition from '${currentStatus}' to '${newStatus}'. Allowed: ${allowedTransitions?.join(', ') || 'none'}`,
      },
      { status: 400 }
    );
  }

  const updated = await prisma.product.update({
    where: { id },
    data: { status: newStatus as ProductStatus },
  });

  return NextResponse.json({ ...updated, _id: updated.id });
});
