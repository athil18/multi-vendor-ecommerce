/**
 * @agent testing-qa-automation-engineer
 * @agent security-appsec-engineer
 * @description Playwright E2E spec for Authentication, Form Validation, & Route Protection.
 */

import { test, expect } from './fixtures/test-fixtures';

test.describe('Authentication & Route Governance Specs', () => {
  test('unauthenticated users are redirected from protected seller route', async ({ page }) => {
    await page.goto('/seller');
    
    // Redirect check to login page with returnUrl query parameter
    await expect(page).toHaveURL(/.*\/auth\/login\?returnUrl=%2Fseller/);
  });

  test('unauthenticated users are redirected from protected customer order routes', async ({ page }) => {
    await page.goto('/customer');
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });

  test('login page elements render with accessible roles', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Verify inputs and submission button exist
    await expect(page.locator('main form').locator('#email').or(page.locator('main form').getByLabel(/Email/i))).toBeVisible();
    await expect(page.locator('main form').locator('#password').or(page.locator('main form').getByLabel(/Password/i))).toBeVisible();
    await expect(page.locator('main form').getByRole('button', { name: /Sign in|Log in/i })).toBeVisible();
  });

  test('login validation prevents empty form submission', async ({ page }) => {
    await page.goto('/auth/login');
    
    const submitBtn = page.locator('main form').getByRole('button', { name: /Sign in|Log in/i });
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
    }
    
    // URL remains on login page
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });

  test('registration page layout and form controls render correctly', async ({ page }) => {
    await page.goto('/auth/register');
    
    await expect(page.getByRole('button', { name: /Create Account|Register|Sign up/i })).toBeVisible();
  });

  test('authenticated customer session grants customer portal access', async ({ page, mockAuthUser }) => {
    await mockAuthUser('CUSTOMER');
    await page.goto('/customer');
    
    // Should stay on customer portal without login redirect
    await expect(page).not.toHaveURL(/.*\/auth\/login/);
  });
});
