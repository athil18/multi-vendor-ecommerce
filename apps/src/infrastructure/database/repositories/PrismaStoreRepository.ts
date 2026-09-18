/**
 * Prisma Store Repository Implementation
 * 
 * @agent engineering-backend-architect
 * @agent engineering-api-platform-engineer
 */

import prisma from '@/lib/prisma';
import { IStoreRepository, StoreEntity } from '@/core/ports/IStoreRepository';

export class PrismaStoreRepository implements IStoreRepository {
  async findById(id: string): Promise<StoreEntity | null> {
    const store = await prisma.store.findUnique({
      where: { id },
    });
    return (store as StoreEntity) || null;
  }

  async findBySellerId(sellerId: string): Promise<StoreEntity | null> {
    const store = await prisma.store.findUnique({
      where: { sellerId },
    });
    return (store as StoreEntity) || null;
  }

  async findBySlug(slug: string): Promise<StoreEntity | null> {
    const store = await prisma.store.findUnique({
      where: { slug },
    });
    return (store as StoreEntity) || null;
  }

  async create(data: Partial<StoreEntity>): Promise<StoreEntity> {
    const created = await prisma.store.create({
      data: {
        sellerId: data.sellerId!,
        name: data.name!,
        slug: data.slug!,
        description: data.description,
        logo: data.logo,
        banner: data.banner,
        stripeConnectedAccountId: data.stripeConnectedAccountId,
        trustScore: data.trustScore ?? 100.0,
      },
    });
    return created as StoreEntity;
  }

  async update(id: string, data: Partial<StoreEntity>): Promise<StoreEntity> {
    const updated = await prisma.store.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.logo !== undefined && { logo: data.logo }),
        ...(data.banner !== undefined && { banner: data.banner }),
        ...(data.payoutsEnabled !== undefined && { payoutsEnabled: data.payoutsEnabled }),
        ...(data.stripeOnboardingComplete !== undefined && {
          stripeOnboardingComplete: data.stripeOnboardingComplete,
        }),
      },
    });
    return updated as StoreEntity;
  }

  async updateStripeDetails(
    stripeAccountId: string,
    data: { payoutsEnabled?: boolean; stripeOnboardingComplete?: boolean }
  ): Promise<void> {
    await prisma.store.updateMany({
      where: { stripeConnectedAccountId: stripeAccountId },
      data: {
        ...(data.payoutsEnabled !== undefined && { payoutsEnabled: data.payoutsEnabled }),
        ...(data.stripeOnboardingComplete !== undefined && {
          stripeOnboardingComplete: data.stripeOnboardingComplete,
        }),
      },
    });
  }

  async listStores(options: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ stores: StoreEntity[]; total: number }> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (options.status) {
      where.governanceStatus = options.status;
    }

    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.store.count({ where }),
    ]);

    return {
      stores: stores as StoreEntity[],
      total,
    };
  }
}

export const prismaStoreRepository = new PrismaStoreRepository();
