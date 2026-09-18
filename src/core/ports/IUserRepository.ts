/**
 * Port: User Repository Contract
 * 
 * @agent engineering-backend-architect
 * @agent engineering-identity-access-engineer
 */

export interface UserEntity {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'seller' | 'customer';
  status: 'active' | 'suspended' | 'pending_verification';
  avatar?: string | null;
  stripeCustomerId?: string | null;
  refreshTokens?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(data: Partial<UserEntity>): Promise<UserEntity>;
  update(id: string, data: Partial<UserEntity>): Promise<UserEntity>;
  updateRefreshTokens(userId: string, tokens: string[]): Promise<void>;
  delete(id: string): Promise<void>;
}
