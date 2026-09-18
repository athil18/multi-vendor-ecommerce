/**
 * Port: Store Repository Contract
 * 
 * @agent engineering-backend-architect
 * @agent engineering-api-platform-engineer
 */

export interface StoreEntity {
  id: string;
  sellerId: string;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  banner?: string | null;
  stripeConnectedAccountId?: string | null;
  stripeOnboardingComplete: boolean;
  payoutsEnabled: boolean;
  trustScore: number;
  fraudRiskLevel: string;
  governanceStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStoreRepository {
  findById(id: string): Promise<StoreEntity | null>;
  findBySellerId(sellerId: string): Promise<StoreEntity | null>;
  findBySlug(slug: string): Promise<StoreEntity | null>;
  create(data: Partial<StoreEntity>): Promise<StoreEntity>;
  update(id: string, data: Partial<StoreEntity>): Promise<StoreEntity>;
  updateStripeDetails(
    stripeAccountId: string,
    data: { payoutsEnabled?: boolean; stripeOnboardingComplete?: boolean }
  ): Promise<void>;
  listStores(options: { page?: number; limit?: number; status?: string }): Promise<{ stores: StoreEntity[]; total: number }>;
}
