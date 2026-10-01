/**
 * Admin Security & System Audit Log API Route
 * 
 * @agent security-appsec-engineer
 * @agent engineering-observability-engineer
 */

import { AuthorizationError } from '@/lib/errors';
import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const GET = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser(req);

  if (!user || user.role !== 'admin') {
    throw new AuthorizationError('Admin access required');
  }

  const logs = await prisma.eventLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({
    success: true,
    data: logs,
    total: logs.length,
  });
});
