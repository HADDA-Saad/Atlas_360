import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env.test') });

test.describe('Guide Booking Flow (Authenticated)', () => {
  test('log in, pick a guide, send booking request', async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL;
    const password = process.env.TEST_USER_PASSWORD;
    test.skip(!email || !password, 'needs TEST_USER_EMAIL + TEST_USER_PASSWORD in .env.test');

    // log in
    await page.goto('/auth/login');
    await page.getByPlaceholder(/email/i).or(page.getByLabel(/email/i)).fill(email!);
    await page.getByPlaceholder(/password/i).or(page.getByLabel(/password/i)).fill(password!);
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    await page.waitForURL(/\/dashboard|\/explore|\/$/, { timeout: 10000 });

    // go to guides page and click first "Book Now"
    await page.goto('/guides');
    const bookNowBtn = page.getByRole('button', { name: /book now/i }).first();
    await expect(bookNowBtn).toBeVisible({ timeout: 10000 });
    await bookNowBtn.click();

    // pick random future dates so we don't collide with previous runs
    const dateInputs = page.locator('input[type="date"]');
    await expect(dateInputs.nth(0)).toBeVisible({ timeout: 5000 });
    if (await dateInputs.count() >= 2) {
      const randomOffset = Math.floor(Math.random() * 1000) + 10;
      const start = new Date();
      start.setDate(start.getDate() + randomOffset);
      const end = new Date(start);
      end.setDate(end.getDate() + 4);

      await dateInputs.nth(0).fill(start.toISOString().split('T')[0]);
      await dateInputs.nth(1).fill(end.toISOString().split('T')[0]);
    }

    // submit and confirm redirect
    const sendBtn = page.getByRole('button', { name: /send booking request/i });
    await expect(sendBtn).toBeVisible();
    await sendBtn.click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    expect(page.url()).toContain('/dashboard');
  });
});
