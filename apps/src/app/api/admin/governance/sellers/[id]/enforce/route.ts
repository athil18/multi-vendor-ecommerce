import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorizeRole, getAuthUser } from '@/lib/auth';
import { AuthorizationError, NotFoundError } from '@/lib/errors';
import { z } from 'zod';

const enforceSchema = z.object({
  action: z.enum(['warning', 'restricted', 'suspended', 'banned']),
  reason: z.string(),
});

export const POST = withErrorHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const user = await getAuthUser(req);
  if (!user || !authorizeRole(user, ['admin'])) {
    throw new AuthorizationError('Forbidden');
  }

  const body = await req.json();
  const { action, reason } = enforceSchema.parse(body);

  const sellerId = (await params).id;
  const store = await prisma.store.findUnique({ where: { sellerId } });
  if (!store) {
    throw new NotFoundError('Store not found');
  }

  const updateData: any = {
    governanceStatus: action as any,
  };
  
  if (action === 'suspended' || action === 'banned') {
    updateData.payoutsEnabled = false;
    
    if (action === 'banned') {
      await prisma.user.update({
        where: { id: sellerId },
        data: { status: 'suspended' },
      });
    }
  }

  if (action === 'restricted') {
    // For restricted, we keep payoutsEnabled as-is but set governanceStatus
  }

  const updatedStore = await prisma.store.update({
    where: { id: store.id },
    data: updateData,
  });

  return NextResponse.json({ 
    message: `Seller enforcement applied: ${action}`,
    governanceStatus: updatedStore.governanceStatus,
    payoutsEnabled: updatedStore.payoutsEnabled
  });
});

