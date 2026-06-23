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

    // The booking form uses a custom AvailabilityCalendar (click-based grid),
    // not native date inputs.  We need to navigate to a future month and
    // click two available days to set a start → end range.

    // Wait for the calendar grid to render
    const calendarGrid = page.locator('.grid.grid-cols-7').last();
    await expect(calendarGrid).toBeVisible({ timeout: 15000 });

    // Navigate 3 months ahead so we're safely in the future & avoid collisions
    const nextMonthBtn = page.getByRole('button', { name: /next month/i });
    for (let i = 0; i < 3; i++) {
      await nextMonthBtn.click();
      await page.waitForTimeout(200);
    }

    // Pick two enabled (available) day buttons for start and end
    const availableDays = calendarGrid.locator('button:not([disabled])');
    const dayCount = await availableDays.count();
    if (dayCount >= 2) {
      // Click the first available day (sets start date)
      await availableDays.nth(0).click();
      await page.waitForTimeout(300);
      // Click a later available day (sets end date)
      const endIdx = Math.min(4, dayCount - 1);
      await availableDays.nth(endIdx).click();
      await page.waitForTimeout(300);
    }

    // Agree to terms (required checkbox)
    const termsCheckbox = page.locator('input[type="checkbox"]');
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }

    // submit and confirm redirect
    const sendBtn = page.getByRole('button', { name: /send booking request/i });
    await expect(sendBtn).toBeVisible();
    await sendBtn.click();
    await page.waitForURL(/\/my-bookings|\/dashboard/, { timeout: 15000 });
    expect(page.url()).toMatch(/my-bookings|dashboard/);
  });
});
