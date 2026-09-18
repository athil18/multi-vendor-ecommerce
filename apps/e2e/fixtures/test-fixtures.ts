/**
 * @agent testing-qa-automation-engineer
 * @description Custom Playwright test fixtures for user sessions, cart states, and mock APIs.
 */

import { test as base, Page } from '@playwright/test';

export interface MockUser {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
}

export const MOCK_USERS: Record<string, MockUser> = {
  customer: {
    id: 'user_cust_01',
    email: 'customer@example.com',
    name: 'Jane Customer',
    role: 'CUSTOMER',
  },
  seller: {
    id: 'user_seller_01',
    email: 'vendor@example.com',
    name: 'Apex Tech Vendor',
    role: 'SELLER',
  },
  admin: {
    id: 'user_admin_01',
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
  mockAuthUser: async ({ page }, use) => {
    const mockAuth = async (role: 'CUSTOMER' | 'SELLER' | 'ADMIN' = 'CUSTOMER') => {
      const user = Object.values(MOCK_USERS).find((u) => u.role === role) || MOCK_USERS.customer;
      
      // Inject session token / local storage user state
      await page.addInitScript((userData) => {
        window.localStorage.setItem('auth_user', JSON.stringify(userData));
        window.localStorage.setItem('auth_token', 'mock_jwt_token_qa_e2e');
      }, user);
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
