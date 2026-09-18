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

  const sellerId = (await params).id;
  const store = await prisma.store.findUnique({ where: { sellerId } });
  if (!store) {
    throw new NotFoundError('Store not found');
  }

  // Calculate Metrics
  const totalOrders = await prisma.orderItem.count({ where: { sellerId } });
  const cancelledOrders = await prisma.orderItem.count({ where: { sellerId, status: 'cancelled' } });
  
  const refundedOrders = await prisma.dispute.count({
    where: { sellerId, status: 'resolved', refundAmount: { gt: 0 } }
  });
  
  const disputes = await prisma.dispute.count({ where: { sellerId } });

  const cancelRate = totalOrders > 0 ? cancelledOrders / totalOrders : 0;
  const refundRate = totalOrders > 0 ? refundedOrders / totalOrders : 0;
  const disputeRate = totalOrders > 0 ? disputes / totalOrders : 0;

  // Base score 100
  let score = 100;
  
  // Penalties
  score -= (cancelRate * 100);
  score -= (refundRate * 150);
  score -= (disputeRate * 500);

  if (score < 0) score = 0;
  if (score > 100) score = 100;

  // Fraud Risk Level
  let fraudRiskLevel: 'low' | 'medium' | 'high' = 'low';
  if (refundRate > 0.1 || disputeRate > 0.05 || score < 60) {
    fraudRiskLevel = 'medium';
  }
  if (refundRate > 0.2 || disputeRate > 0.1 || score < 40) {
    fraudRiskLevel = 'high';
  }

  const updatedStore = await prisma.store.update({
    where: { id: store.id },
    data: {
      trustScore: Math.round(score),
      fraudRiskLevel: fraudRiskLevel as any,
    },
  });

  return NextResponse.json({ 
    trustScore: updatedStore.trustScore, 
    fraudRiskLevel: updatedStore.fraudRiskLevel,
    metrics: { cancelRate, refundRate, disputeRate }
  });
});

