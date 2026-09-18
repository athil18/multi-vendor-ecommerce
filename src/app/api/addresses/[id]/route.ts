import { AuthenticationError, AuthorizationError, NotFoundError } from '@/lib/errors';
import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { createAddressSchema } from '@/lib/schemas/commerce';

export const PUT = withErrorHandler(async(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const user = await getAuthUser(req);

  if (!user) {
    throw new AuthenticationError('Not authorized');
  }

  const address = await prisma.address.findUnique({
    where: { id },
  });
  if (!address) {
    throw new NotFoundError('Address not found');
  }

  if (address.userId !== user.id) {
    throw new AuthorizationError('Forbidden');
  }

  const body = await req.json();
  const validation = createAddressSchema.partial().safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { message: 'Validation failed', errors: validation.error.format() },
      { status: 400 }
    );
  }

  const updateData = validation.data;

  if (updateData.isDefault) {
    const type = updateData.type || address.type;
    await prisma.address.updateMany({
      where: { userId: user.id, type: type as any, id: { not: id } },
      data: { isDefault: false },
    });
  }

  const updatedAddress = await prisma.address.update({
    where: { id },
    data: {
      ...updateData,
      type: updateData.type ? (updateData.type as any) : undefined,
    },
  });
  return NextResponse.json({ data: { ...updatedAddress, _id: updatedAddress.id } });
});

export const DELETE = withErrorHandler(async(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const user = await getAuthUser(req);

  if (!user) {
    throw new AuthenticationError('Not authorized');
  }

  const address = await prisma.address.findUnique({
    where: { id },
  });
  if (!address) {
    throw new NotFoundError('Address not found');
  }

  if (address.userId !== user.id) {
    throw new AuthorizationError('Forbidden');
  }

  await prisma.address.delete({
    where: { id },
  });
  return NextResponse.json({ message: 'Address deleted successfully' });
});

