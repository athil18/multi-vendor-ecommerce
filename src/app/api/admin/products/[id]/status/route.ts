/**
 * Admin Product Status Approval/Rejection API Route
 * 
 * @agent engineering-backend-architect
 * @agent 02-code-review-agent
 */

import { AuthorizationError, NotFoundError } from '@/lib/errors';
import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser, authorizeRole } from '@/lib/auth';
import { productStatusUpdateSchema } from '@/lib/schemas/commerce';

export const PATCH = withErrorHandler(async(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const user = await getAuthUser(req);

  if (!user || !authorizeRole(user, ['admin'])) {
    throw new AuthorizationError('Forbidden');
  }

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.deletedAt) {
    throw new NotFoundError('Product not found');
  }

  const body = await req.json();
  const { status: newStatus } = productStatusUpdateSchema.parse(body);

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: { status: newStatus as any },
  });

  return NextResponse.json(updatedProduct);
});

