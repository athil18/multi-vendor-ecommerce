/**
 * @agent testing-qa-automation-engineer
 * @description Custom Playwright test fixtures for user sessions, cart states, and mock APIs.
 */

import { test as base, Page } from '@playwright/test';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export interface MockUser {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
}

export const MOCK_USERS: Record<string, MockUser> = {
  customer: {
    id: 'cuid000000000000000000000001',
    email: 'customer@example.com',
    name: 'Jane Customer',
    role: 'CUSTOMER',
  },
  seller: {
    id: 'cuid000000000000000000000002',
    email: 'vendor@example.com',
    name: 'Apex Tech Vendor',
    role: 'SELLER',
  },
  admin: {
    id: 'cuid000000000000000000000003',
    email: 'admin@platform.com',
    name: 'Ecosystem Administrator',
    role: 'ADMIN',
  },
};

export type CustomFixtures = {
  mockAuthUser: (role?: 'CUSTOMER' | 'SELLER' | 'ADMIN') => Promise<void>;
  setupMockProducts: () => Promise<void>;
};

export const test = base.extend<CustomFixtures>({
  mockAuthUser: async ({ page, context }, use) => {
    const mockAuth = async (role: 'CUSTOMER' | 'SELLER' | 'ADMIN' = 'CUSTOMER') => {
      const user = Object.values(MOCK_USERS).find((u) => u.role === role) || MOCK_USERS.customer;
      const secret = process.env.JWT_SECRET || 'nexus_super_secure_jwt_secret_dev_key_at_least_32_bytes_long';
      const token = jwt.sign(
        { id: user.id, role: user.role.toLowerCase(), email: user.email },
        secret,
        { expiresIn: '1h' }
      );

      // Set cookies for Next.js Edge Middleware
      await context.addCookies([
        {
          name: 'auth_token',
          value: token,
          url: 'http://localhost:3000',
        },
        {
          name: 'auth_role',
          value: user.role.toLowerCase(),
          url: 'http://localhost:3000',
        },
      ]);

      // Inject session token / local storage user state
      await page.addInitScript((data) => {
        window.localStorage.setItem('auth_user', JSON.stringify(data.user));
        window.localStorage.setItem('auth_token', data.token);
        window.localStorage.setItem('auth-storage', JSON.stringify({
          state: {
            user: { ...data.user, role: data.user.role.toLowerCase() },
            token: data.token,
            role: data.user.role.toLowerCase(),
          },
          version: 0,
        }));
        window.localStorage.setItem('cart-storage', JSON.stringify({
          state: {
            cart: [
              {
                productId: 'prod_01',
                name: 'Pro Wireless Noise-Canceling Headphones',
                price: 299.99,
                quantity: 1,
                image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
              },
            ],
          },
          version: 0,
        }));
      }, { user, token });
    };

    await use(mockAuth);
  },

  setupMockProducts: async ({ page }, use) => {
    const setupApiStubs = async () => {
      await page.route('/api/products*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            products: [
              {
                id: 'prod_01',
                name: 'Pro Wireless Noise-Canceling Headphones',
                slug: 'pro-wireless-headphones',
                basePrice: 299.99,
                seller: { name: 'Apex Audio' },
              },
              {
                id: 'prod_02',
                name: 'UltraWide Curved Gaming Monitor 34"',
                slug: 'ultrawide-gaming-monitor',
                basePrice: 699.99,
                seller: { name: 'TechVision Inc' },
              },
            ],
            total: 2,
          }),
        });
      });
    };

    await use(setupApiStubs);
  },
});

export { expect } from '@playwright/test';
