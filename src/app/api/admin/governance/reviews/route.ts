import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorizeRole, getAuthUser } from '@/lib/auth';
import { AuthorizationError, NotFoundError } from '@/lib/errors';

export const GET = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser(req);
  if (!user || !authorizeRole(user, ['admin'])) {
    throw new AuthorizationError('Forbidden');
  }

  const reviews = await prisma.review.findMany({
    where: { status: 'pending' },
    include: { customer: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json(reviews);
});

export const PATCH = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser(req);
  if (!user || !authorizeRole(user, ['admin'])) {
    throw new AuthorizationError('Forbidden');
  }

  const { reviewId, status, moderationReason } = await req.json();

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new NotFoundError('Review not found');

  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: {
      status: status as any,
      moderatedById: user.id,
      ...(moderationReason ? { moderationReason } : {}),
    },
  });

  return NextResponse.json({ message: 'Review moderated', review: updatedReview });
});

