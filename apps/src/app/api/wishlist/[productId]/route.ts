/**
 * Remove Product from Wishlist
 * 
 * @agent engineering-backend-architect
 * @agent engineering-api-platform-engineer
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { withErrorHandler } from '@/lib/api-handler';
import { AuthenticationError } from '@/lib/errors';

export const DELETE = withErrorHandler(
  async (req: NextRequest, { params }: { params: Promise<{ productId: string }> }) => {
    const { productId } = await params;

    const user = await getAuthUser(req);
    if (!user) {
      throw new AuthenticationError('Unauthorized');
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: user.id },
    });

    if (wishlist) {
      const updatedProductIds = wishlist.productIds.filter((id) => id !== productId);
      await prisma.wishlist.update({
        where: { id: wishlist.id },
        data: { productIds: updatedProductIds },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Removed from wishlist',
    });
  }
);
