/**
 * User Addresses Management API Route
 * 
 * @agent engineering-backend-architect
 * @agent 21-pii-sanitization-agent
 */

import { AuthenticationError } from '@/lib/errors';
import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { createAddressSchema } from '@/lib/schemas/commerce';

export const GET = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser(req);

  if (!user) {
    throw new AuthenticationError('Not authorized');
  }

  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
  });
  return NextResponse.json({ data: addresses.map(a => ({ ...a, _id: a.id })) });
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser(req);

  if (!user) {
    throw new AuthenticationError('Not authorized');
  }

  const body = await req.json();
  const { type, street, city, state, zip, country, isDefault } = createAddressSchema.parse(body);

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: user.id, type: type as any },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId: user.id,
      type: type as any,
      street,
      city,
      state,
      zip,
      country,
      isDefault: isDefault || false,
    },
  });

  return NextResponse.json({ data: { ...address, _id: address.id } }, { status: 201 });
});

