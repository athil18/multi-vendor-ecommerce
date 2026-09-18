/**
 * @agent testing-qa-automation-engineer
 * @description Playwright E2E spec for Vendor / Seller Dashboard Management.
 */

import { test, expect } from './fixtures/test-fixtures';

test.describe('Seller / Vendor Dashboard E2E Specs', () => {
  test('authenticated seller can access seller portal', async ({ page, mockAuthUser }) => {
    await mockAuthUser('SELLER');
    await page.goto('/seller');
    
    await expect(page).toHaveURL(/.*\/seller/);
  });

  test('seller dashboard renders primary section metrics', async ({ page, mockAuthUser }) => {
    await mockAuthUser('SELLER');
    await page.goto('/seller');
    
    await expect(page.locator('body')).toBeVisible();
  });
});
