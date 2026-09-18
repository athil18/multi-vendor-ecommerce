/**
 * Authenticated User Profile Endpoint
 * 
 * @agent engineering-identity-access-engineer
 * @agent 21-pii-sanitization-agent
 */

import { AuthenticationError, NotFoundError } from '@/lib/errors';
import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const GET = withErrorHandler(async (req: NextRequest) => {
  const authUser = await getAuthUser(req);

  if (!authUser) {
    throw new AuthenticationError('Not authorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      avatar: true,
    },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    avatar: user.avatar,
  });
});
