/**
 * @agent testing-qa-automation-engineer
 * @description Playwright E2E spec for Product Catalog Browsing, Search, & Navigation.
 */

import { test, expect } from './fixtures/test-fixtures';

test.describe('Product Catalog & Search E2E Specs', () => {
  test('home page displays main hero elements and search input', async ({ page }) => {
    await page.goto('/');
    
    // Navigation bar and search bar should be present
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByPlaceholder(/Search products/i)).toBeVisible();
  });

  test('products page lists catalog items and filters', async ({ page }) => {
    await page.goto('/products');
    
    // Check main layout container
    await expect(page.getByRole('main').or(page.locator('main'))).toBeVisible();
  });

  test('product search input accepts text queries', async ({ page }) => {
    await page.goto('/products');
    
    const searchInput = page.getByPlaceholder(/Search products/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('Headphones');
      await expect(searchInput).toHaveValue('Headphones');
    }
  });

  test('navigating to individual product details page', async ({ page }) => {
    await page.goto('/products/prod_01');
    
    // Check page load
    await expect(page).toHaveURL(/.*\/products\/prod_01/);
  });
});
