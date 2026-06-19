import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('unauthenticated /dashboard redirects to login', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL(/\/auth|\/login/, { timeout: 10000 });
    expect(page.url()).not.toContain('/dashboard');
  });

  test('login page has email, password, and submit', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByPlaceholder(/email/i).or(page.getByLabel(/email/i))).toBeVisible();
    await expect(page.getByPlaceholder(/password/i).or(page.getByLabel(/password/i))).toBeVisible();
    await expect(page.getByRole('button', { name: /log in|submit|sign in/i })).toBeVisible();
  });

  test('empty submit stays on login page', async ({ page }) => {
    await page.goto('/auth/login');
    const submitBtn = page.getByRole('button', { name: /log in|submit|sign in/i });
    await submitBtn.click();
    expect(page.url()).toContain('/auth/login');
  });

  test('wrong credentials show error', async ({ page }) => {
    await page.goto('/auth/login');

    const emailInput = page.getByPlaceholder(/email/i).or(page.getByLabel(/email/i));
    const passInput = page.getByPlaceholder(/password/i).or(page.getByLabel(/password/i));

    await emailInput.fill('test@fake.com');
    await passInput.fill('wrongpassword');

    await page.getByRole('button', { name: /log in|submit|sign in/i }).click();

    await expect(page.locator('text=/error|invalid|incorrect|failed/i').first()).toBeVisible({ timeout: 5000 });
  });
});
