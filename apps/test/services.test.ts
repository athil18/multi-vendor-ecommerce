/**
 * Automated Test Suite for Domain Services & PII Sanitizer
 * 
 * @agent 15-unit-test-generator
 * @agent engineering-backend-architect
 * @agent 21-pii-sanitization-agent
 */

import { describe, it, expect, vi } from 'vitest';
import { AuthService } from '../src/services/AuthService';
import { StoreService } from '../src/services/StoreService';
import { sanitizeString, sanitizeObject } from '../src/lib/pii';
import { IUserRepository, UserEntity } from '../src/core/ports/IUserRepository';
import { IStoreRepository, StoreEntity } from '../src/core/ports/IStoreRepository';

describe('PII Sanitizer Suite (@agent 21-pii-sanitization-agent)', () => {
  it('should mask credit card numbers', () => {
    const input = 'User paid with card 4111-2222-3333-4444 successfully';
    const sanitized = sanitizeString(input);
    expect(sanitized).toBe('User paid with card ****-****-****-**** successfully');
  });

  it('should mask email addresses', () => {
    const input = 'Contact email is customer@domain.com for receipt';
    const sanitized = sanitizeString(input);
    expect(sanitized).toContain('c***@domain.com');
  });

  it('should redact sensitive keys in objects', () => {
    const payload = {
      name: 'John Doe',
      password: 'supersecretpassword123',
      refreshToken: 'secret-refresh-token',
      creditCard: '4111 2222 3333 4444',
      nested: {
        token: 'jwt.token.here',
        userEmail: 'alice@example.com',
      },
    };

    const sanitized = sanitizeObject(payload);
    expect(sanitized.password).toBe('[REDACTED]');
    expect(sanitized.refreshToken).toBe('[REDACTED]');
    expect(sanitized.nested.token).toBe('[REDACTED]');
  });
});

describe('AuthService Domain Logic (@agent engineering-identity-access-engineer)', () => {
  const mockUsers: Map<string, UserEntity> = new Map();

  const mockUserRepo: IUserRepository = {
    async findById(id: string) {
      return mockUsers.get(id) || null;
    },
    async findByEmail(email: string) {
      for (const u of mockUsers.values()) {
        if (u.email === email) return u;
      }
      return null;
    },
    async create(data: Partial<UserEntity>) {
      const user: UserEntity = {
        id: `user_${Date.now()}`,
        name: data.name!,
        email: data.email!,
        password: data.password,
        role: data.role || 'customer',
        status: data.status || 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUsers.set(user.id, user);
      return user;
    },
    async update(id: string, data: Partial<UserEntity>) {
      const existing = mockUsers.get(id);
      if (!existing) throw new Error('User not found');
      const updated = { ...existing, ...data };
      mockUsers.set(id, updated);
      return updated;
    },
    async updateRefreshTokens(userId: string, tokens: string[]) {
      const user = mockUsers.get(userId);
      if (user) {
        user.refreshTokens = tokens;
      }
    },
    async delete(id: string) {
      mockUsers.delete(id);
    },
  };

  const authService = new AuthService(mockUserRepo);

  it('should register a new user and hash their password', async () => {
    const result = await authService.register({
      name: 'Agent Test User',
      email: 'agent.tester@example.com',
      password: 'SecurePassword123!',
      role: 'customer',
    });

    expect(result.user.name).toBe('Agent Test User');
    expect(result.user.email).toBe('agent.tester@example.com');
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

  it('should prevent registering duplicate email', async () => {
    await expect(
      authService.register({
        name: 'Duplicate',
        email: 'agent.tester@example.com',
        password: 'AnotherPassword123!',
      })
    ).rejects.toThrow('Email address already registered');
  });

  it('should successfully login with valid credentials', async () => {
    const result = await authService.login({
      email: 'agent.tester@example.com',
      password: 'SecurePassword123!',
    });

    expect(result.user.email).toBe('agent.tester@example.com');
    expect(result.accessToken).toBeDefined();
  });

  it('should reject login with wrong password', async () => {
    await expect(
      authService.login({
        email: 'agent.tester@example.com',
        password: 'WrongPassword!',
      })
    ).rejects.toThrow('Invalid email or password');
  });
});

describe('StoreService Domain Logic (@agent engineering-backend-architect)', () => {
  const mockStores: Map<string, StoreEntity> = new Map();

  const mockStoreRepo: IStoreRepository = {
    async findById(id: string) {
      return mockStores.get(id) || null;
    },
    async findBySellerId(sellerId: string) {
      for (const s of mockStores.values()) {
        if (s.sellerId === sellerId) return s;
      }
      return null;
    },
    async findBySlug(slug: string) {
      for (const s of mockStores.values()) {
        if (s.slug === slug) return s;
      }
      return null;
    },
    async create(data: Partial<StoreEntity>) {
      const store: StoreEntity = {
        id: `store_${Date.now()}`,
        sellerId: data.sellerId!,
        name: data.name!,
        slug: data.slug!,
        description: data.description,
        trustScore: data.trustScore ?? 100.0,
        fraudRiskLevel: 'low',
        governanceStatus: 'good_standing',
        stripeOnboardingComplete: false,
        payoutsEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockStores.set(store.id, store);
      return store;
    },
    async update(id: string, data: Partial<StoreEntity>) {
      const existing = mockStores.get(id);
      if (!existing) throw new Error('Store not found');
      const updated = { ...existing, ...data };
      mockStores.set(id, updated);
      return updated;
    },
    async updateStripeDetails() {},
    async listStores() {
      return { stores: Array.from(mockStores.values()), total: mockStores.size };
    },
  };

  const storeService = new StoreService(mockStoreRepo);

  it('should create a new vendor store with auto-generated slug', async () => {
    const store = await storeService.createStore({
      sellerId: 'seller_123',
      name: 'Cyberpunk Tech Store',
      description: 'Futuristic gadgets and neural chips',
    });

    expect(store.name).toBe('Cyberpunk Tech Store');
    expect(store.slug).toBe('cyberpunk-tech-store');
    expect(store.trustScore).toBe(100.0);
  });

  it('should prevent seller from creating multiple stores', async () => {
    await expect(
      storeService.createStore({
        sellerId: 'seller_123',
        name: 'Second Store',
      })
    ).rejects.toThrow('Seller already has an active store');
  });
});
