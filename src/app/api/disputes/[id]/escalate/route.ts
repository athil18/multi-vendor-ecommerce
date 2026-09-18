/**
 * Admin Dispute Escalation and Resolution Route
 * 
 * @agent engineering-backend-architect
 * @agent engineering-support-engineer
 */

import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorizeRole, getAuthUser } from '@/lib/auth';
import { AuthorizationError, NotFoundError } from '@/lib/errors';

export const POST = withErrorHandler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const user = await getAuthUser(req);
  if (!user || !authorizeRole(user, ['admin'])) {
    throw new AuthorizationError('Forbidden');
  }

  const { id } = await params;
  const { action, resolutionNotes, refundAmount } = await req.json();

  const dispute = await prisma.dispute.findUnique({ where: { id } });
  if (!dispute) throw new NotFoundError('Dispute not found');

  let newStatus = dispute.status;
  if (action === 'resolve') {
    newStatus = 'resolved';
  } else if (action === 'reject') {
    newStatus = 'rejected';
  } else if (action === 'escalate') {
    newStatus = 'under_review';
  }

  const updatedDispute = await prisma.dispute.update({
    where: { id },
    data: {
      status: newStatus as any,
      refundAmount: action === 'resolve' ? refundAmount : dispute.refundAmount,
      resolutionNotes,
      resolvedById: user.id,
    },
  });

  // If resolved in favor of buyer, adjust store trust score
  if (action === 'resolve') {
    const store = await prisma.store.findUnique({ where: { sellerId: dispute.sellerId } });
    if (store) {
      await prisma.store.update({
        where: { id: store.id },
        data: { trustScore: Math.max(0, store.trustScore - 10) },
      });
    }
  }

  return NextResponse.json(updatedDispute);
});

