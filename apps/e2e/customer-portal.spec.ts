/**
 * @agent testing-qa-automation-engineer
 * @description Playwright E2E spec for Customer Order Tracking & Dispute Workflows.
 */

import { test, expect } from './fixtures/test-fixtures';

test.describe('Customer Portal & Disputes E2E Specs', () => {
  test('authenticated customer can access customer dashboard', async ({ page, mockAuthUser }) => {
    await mockAuthUser('CUSTOMER');
    await page.goto('/customer');
    
    await expect(page).toHaveURL(/.*\/customer/);
  });

  test('customer order detail route resolves correctly', async ({ page, mockAuthUser }) => {
    await mockAuthUser('CUSTOMER');
    await page.goto('/customer/orders/ord_1001');
    
    await expect(page).toHaveURL(/.*\/customer\/orders\/ord_1001/);
  });
});
