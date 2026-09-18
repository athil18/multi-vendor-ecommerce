/**
 * Product Reviews & Verified Purchase Validation API Route
 * 
 * @agent engineering-backend-architect
 * @agent security-appsec-engineer
 */

import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { apiSuccess } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-handler';
import { AppError, ValidationError } from '@/lib/errors';
import { createReviewSchema, updateReviewSchema } from '@/lib/schemas/commerce';
import prisma from '@/lib/prisma';
import xss from 'xss';

const createReviewHandler = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const p = await params;
  const id = p.id;

  const user = await getAuthUser(req);
  if (!user || user.role !== 'customer') {
    throw new AppError('Unauthorized. Only customers can submit reviews', 401, 'UNAUTHORIZED');
  }

  // Verified Purchase Protection
  const purchasedItem = await prisma.orderItem.findFirst({
    where: {
      productId: id,
      order: {
        customerId: user.id,
        paymentStatus: 'completed',
      },
      status: { not: 'cancelled' },
    },
  });

  if (!purchasedItem) {
    throw new AppError('You must purchase this product to submit a review', 403, 'FORBIDDEN');
  }

  const body = await req.json();
  const validationResult = createReviewSchema.safeParse(body);
  if (!validationResult.success) {
    throw new ValidationError('Validation failed', validationResult.error.flatten().fieldErrors);
  }

  const data = validationResult.data;
  const sanitizedComment = xss(data.comment);

  const existingReview = await prisma.review.findUnique({
    where: {
      customerId_productId: {
        customerId: user.id,
        productId: id,
      },
    },
  });
  if (existingReview && !existingReview.deletedAt) {
    throw new AppError('You have already reviewed this product', 409, 'CONFLICT');
  }

  const review = await prisma.$transaction(async (tx) => {
    const created = await tx.review.create({
      data: {
        productId: id,
        customerId: user.id,
        rating: data.rating,
        title: data.title ? xss(data.title) : null,
        comment: sanitizedComment,
        images: data.images || [],
        recommendation: data.recommendation,
        pros: data.pros ? data.pros.map((p) => xss(p)) : [],
        cons: data.cons ? data.cons.map((c) => xss(c)) : [],
        status: 'pending',
      },
    });

    const product = await tx.product.findUnique({ where: { id } });
    if (product) {
      const newNumReviews = product.numReviews + 1;
      const newRating = ((product.rating * product.numReviews) + data.rating) / newNumReviews;
      await tx.product.update({
        where: { id },
        data: {
          numReviews: newNumReviews,
          rating: newRating,
        },
      });
    }

    return created;
  });

  return apiSuccess({ review: { ...review, _id: review.id } }, 201, 'Review submitted successfully');
};

const updateReviewHandler = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const p = await params;
  const id = p.id;

  const user = await getAuthUser(req);
  if (!user || user.role !== 'customer') {
    throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  }

  const body = await req.json();
  const validationResult = updateReviewSchema.safeParse(body);
  if (!validationResult.success) {
    throw new ValidationError('Validation failed', validationResult.error.flatten().fieldErrors);
  }

  const data = validationResult.data;

  const review = await prisma.$transaction(async (tx) => {
    const existing = await tx.review.findUnique({
      where: {
        customerId_productId: {
          customerId: user.id,
          productId: id,
        },
      },
    });
    if (!existing || existing.deletedAt) {
      throw new AppError('Review not found', 404, 'NOT_FOUND');
    }

    const oldRating = existing.rating;
    const updatePayload: any = { status: 'pending' };

    if (data.rating !== undefined) updatePayload.rating = data.rating;
    if (data.title !== undefined) updatePayload.title = xss(data.title);
    if (data.comment !== undefined) updatePayload.comment = xss(data.comment);
    if (data.images !== undefined) updatePayload.images = data.images;
    if (data.recommendation !== undefined) updatePayload.recommendation = data.recommendation;
    if (data.pros !== undefined) updatePayload.pros = data.pros.map((p) => xss(p));
    if (data.cons !== undefined) updatePayload.cons = data.cons.map((c) => xss(c));

    const updated = await tx.review.update({
      where: { id: existing.id },
      data: updatePayload,
    });

    if (data.rating !== undefined && data.rating !== oldRating) {
      const product = await tx.product.findUnique({ where: { id } });
      if (product && product.numReviews > 0) {
        const newRating = ((product.rating * product.numReviews) - oldRating + data.rating) / product.numReviews;
        await tx.product.update({
          where: { id },
          data: { rating: newRating },
        });
      }
    }

    return updated;
  });

  return apiSuccess({ review: { ...review, _id: review.id } }, 200, 'Review updated successfully');
};

const deleteReviewHandler = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const p = await params;
  const id = p.id;

  const user = await getAuthUser(req);
  if (!user) {
    throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  }

  await prisma.$transaction(async (tx) => {
    const existing = await tx.review.findUnique({
      where: {
        customerId_productId: {
          customerId: user.id,
          productId: id,
        },
      },
    });
    if (!existing || existing.deletedAt) {
      throw new AppError('Review not found', 404, 'NOT_FOUND');
    }

    await tx.review.delete({ where: { id: existing.id } });

    const product = await tx.product.findUnique({ where: { id } });
    if (product && product.numReviews > 0) {
      const newNumReviews = product.numReviews - 1;
      let newRating = 0;
      if (newNumReviews > 0) {
        newRating = ((product.rating * product.numReviews) - existing.rating) / newNumReviews;
      }
      await tx.product.update({
        where: { id },
        data: {
          numReviews: newNumReviews,
          rating: newRating,
        },
      });
    }
  });

  return apiSuccess(null, 200, 'Review deleted successfully');
};

export const POST = withErrorHandler(createReviewHandler);
export const PUT = withErrorHandler(updateReviewHandler);
export const DELETE = withErrorHandler(deleteReviewHandler);
