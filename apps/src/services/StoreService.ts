/**
 * Multi-Vendor Store Management Service
 * 
 * @agent engineering-backend-architect
 * @agent engineering-api-platform-engineer
 */

import { IStoreRepository, StoreEntity } from '@/core/ports/IStoreRepository';
import { prismaStoreRepository } from '@/infrastructure/database/repositories/PrismaStoreRepository';
import { AppError } from '@/lib/errors';
import slugify from 'slugify';

export interface CreateStoreDTO {
  sellerId: string;
  name: string;
  description?: string;
  logo?: string;
  banner?: string;
}

export class StoreService {
  constructor(private storeRepo: IStoreRepository = prismaStoreRepository) {}

  async getStoreBySellerId(sellerId: string): Promise<StoreEntity | null> {
    return this.storeRepo.findBySellerId(sellerId);
  }

  async getStoreBySlug(slug: string): Promise<StoreEntity> {
    const store = await this.storeRepo.findBySlug(slug);
    if (!store) {
      throw new AppError('Store not found', 404, 'STORE_NOT_FOUND');
    }
    return store;
  }

  async createStore(dto: CreateStoreDTO): Promise<StoreEntity> {
    const existing = await this.storeRepo.findBySellerId(dto.sellerId);
    if (existing) {
      throw new AppError('Seller already has an active store', 409, 'STORE_ALREADY_EXISTS');
    }

    let slug = slugify(dto.name, { lower: true, strict: true });
    const slugConflict = await this.storeRepo.findBySlug(slug);
    if (slugConflict) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    return this.storeRepo.create({
      sellerId: dto.sellerId,
      name: dto.name,
      slug,
      description: dto.description,
      logo: dto.logo,
      banner: dto.banner,
      trustScore: 100.0,
      fraudRiskLevel: 'low',
      governanceStatus: 'good_standing',
      stripeOnboardingComplete: false,
      payoutsEnabled: false,
    });
  }

  async updateStore(sellerId: string, data: Partial<StoreEntity>): Promise<StoreEntity> {
    const store = await this.storeRepo.findBySellerId(sellerId);
    if (!store) {
      throw new AppError('Store not found for this seller', 404, 'STORE_NOT_FOUND');
    }

    return this.storeRepo.update(store.id, data);
  }

  async listStores(options: { page?: number; limit?: number; status?: string }) {
    return this.storeRepo.listStores(options);
  }
}

export const storeService = new StoreService();
