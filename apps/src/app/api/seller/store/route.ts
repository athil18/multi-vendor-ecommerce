/**
 * Seller Store Management API Route
 * 
 * @agent engineering-backend-architect
 * @agent engineering-api-platform-engineer
 */

import { AuthorizationError, NotFoundError } from '@/lib/errors';
import { withErrorHandler } from '@/lib/api-handler';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { createStoreSchema } from '@/lib/schemas/commerce';
import { storeService } from '@/services/StoreService';

export const GET = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser(req);

  if (!user || user.role !== 'seller') {
    throw new AuthorizationError('Forbidden');
  }

  const store = await storeService.getStoreBySellerId(user.id);
  if (!store) {
    throw new NotFoundError('Store not found');
  }

  return NextResponse.json({ ...store, _id: store.id, storeName: store.name });
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const user = await getAuthUser(req);

  if (!user || user.role !== 'seller') {
    throw new AuthorizationError('Forbidden');
  }

  const body = await req.json();
  const { storeName, description, logo } = createStoreSchema.parse(body);

  const createdStore = await storeService.createStore({
    sellerId: user.id,
    name: storeName,
    description: description || undefined,
    logo: logo || undefined,
  });

  return NextResponse.json(
    { ...createdStore, _id: createdStore.id, storeName: createdStore.name },
    { status: 201 }
  );
});
