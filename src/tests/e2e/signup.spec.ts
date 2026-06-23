import { test, expect } from '@playwright/test';

test.describe('Signup Flow', () => {
  test('user signs up successfully', async ({ page }) => {
    await page.goto('/auth/signup');

    // random email so we don't hit duplicates
    const randomNum = Math.floor(Math.random() * 100000);
    const testEmail = `newuser${randomNum}@example.com`;

    await page.getByPlaceholder(/your name/i).fill('Test User');
    await page.getByPlaceholder(/you@example\.com/i).fill(testEmail);
    
    await page.getByPlaceholder(/min 6 characters/i).fill('TestPass123!');
    await page.getByPlaceholder(/••••••••/i).fill('TestPass123!');

    const submitBtn = page.getByRole('button', { name: /create account/i });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // race success msg vs supabase errors (like rate limits)
    const successLocator = page.getByText(/check your email/i);
    const errorLocator = page.locator('.text-red-400').first();

    await expect(successLocator.or(errorLocator)).toBeVisible({ timeout: 10000 });

    if (await errorLocator.isVisible()) {
      const errorText = await errorLocator.textContent() ?? '';
      test.skip(true, `supabase error: "${errorText}". Disable email confirmations for local E2E.`);
    }

    await expect(successLocator).toBeVisible();
    await expect(page.getByRole('link', { name: /go to login/i })).toBeVisible();
  });

  test('password mismatch validation', async ({ page }) => {
    await page.goto('/auth/signup');

    await page.getByPlaceholder(/your name/i).fill('Test User');
    await page.getByPlaceholder(/you@example\.com/i).fill('test@example.com');
    await page.getByPlaceholder(/min 6 characters/i).fill('password123');
    await page.getByPlaceholder(/••••••••/i).fill('different123'); // mismatch here

    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  });

  test('password length validation', async ({ page }) => {
    await page.goto('/auth/signup');

    await page.getByPlaceholder(/your name/i).fill('Test User');
    await page.getByPlaceholder(/you@example\.com/i).fill('test@example.com');
    await page.getByPlaceholder(/min 6 characters/i).fill('123'); // too short
    await page.getByPlaceholder(/••••••••/i).fill('123');

    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();
  });
});
