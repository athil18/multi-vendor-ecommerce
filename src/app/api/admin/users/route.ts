/**
 * Super Admin User & Role Management API Route
 * 
 * Allows platform administrators to inspect user accounts, assign roles,
 * and enforce account status modifications (active / suspended).
 * 
 * @agent engineering-identity-access-engineer
 * @agent security-appsec-engineer
 */

import { AuthorizationError, BadRequestError } from '@/lib/errors';
import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const GET = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser(req);

  if (!user || user.role !== 'admin') {
    throw new AuthorizationError('Admin access required');
  }

  const { searchParams } = new URL(req.url);
  const roleFilter = searchParams.get('role');
  const search = searchParams.get('search');

  const where: any = {};
  if (roleFilter && roleFilter !== 'all') {
    where.role = roleFilter;
  }
  if (search && search.trim()) {
    where.OR = [
      { name: { contains: search.trim(), mode: 'insensitive' } },
      { email: { contains: search.trim(), mode: 'insensitive' } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      store: {
        select: {
          id: true,
          name: true,
          trustScore: true,
        },
      },
      _count: {
        select: {
          orders: true,
          reviews: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return NextResponse.json({
    success: true,
    data: users,
    total: users.length,
  });
});

export const PATCH = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser(req);

  if (!user || user.role !== 'admin') {
    throw new AuthorizationError('Admin access required');
  }

  const body = await req.json();
  const { userId, role, status } = body;

  if (!userId) {
    throw new BadRequestError('User ID is required');
  }

  const updateData: any = {};
  if (role) {
    if (!['customer', 'seller', 'admin'].includes(role)) {
      throw new BadRequestError('Invalid role specified');
    }
    updateData.role = role;
  }
  if (status) {
    if (!['active', 'suspended', 'pending_verification'].includes(status)) {
      throw new BadRequestError('Invalid user status specified');
    }
    updateData.status = status;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  });

  return NextResponse.json({
    success: true,
    data: updated,
    message: `User ${updated.email} updated successfully`,
  });
});
