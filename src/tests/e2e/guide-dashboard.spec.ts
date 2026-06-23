import { test, expect } from '@playwright/test';

test.describe('Guide Dashboard', () => {
  test('update profile + block a calendar date', async ({ page }) => {
    const email = process.env.TEST_GUIDE_EMAIL;
    const password = process.env.TEST_GUIDE_PASSWORD;
    test.skip(!email || !password, 'needs TEST_GUIDE_EMAIL + TEST_GUIDE_PASSWORD in .env.test');

    // log in
    await page.goto('/auth/login');
    await page.getByPlaceholder(/email/i).or(page.getByLabel(/email/i)).fill(email!);
    await page.getByPlaceholder(/password/i).or(page.getByLabel(/password/i)).fill(password!);
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    await page.waitForURL(/\/dashboard|\/explore|\/$/, { timeout: 10000 });
    await page.goto('/dashboard/guide');

    // profile settings
    const profileTab = page.getByRole('button', { name: /profile settings/i });
    await expect(profileTab).toBeVisible();
    await profileTab.click();

    const bioTextarea = page.locator('textarea[id="guide-bio"]');
    await expect(bioTextarea).toBeVisible();
    await bioTextarea.fill('Experienced Atlas Mountains guide with 10 years of trekking experience.');

    await page.getByRole('button', { name: /save profile details/i }).click();
    await expect(page.getByText(/profile updated successfully/i)).toBeVisible();

    // availability calendar
    const calendarTab = page.getByRole('button', { name: /availability calendar/i });
    await calendarTab.click();

    const dateInput = page.locator('input[type="date"]');
    await page.getByText(/Block a specific date with a note/i).click();
    await expect(dateInput).toBeVisible();

    // random future date
    const randomOffset = Math.floor(Math.random() * 1000) + 10;
    const blockDate = new Date();
    blockDate.setDate(blockDate.getDate() + randomOffset);
    const dateStr = blockDate.toISOString().split('T')[0];

    await dateInput.fill(dateStr);
    await page.getByPlaceholder(/e\.g\. holiday/i).fill('Automated Test Blockout');
    await page.getByRole('button', { name: /block day/i }).click();

    const errorLocator = page.locator('.text-red-400');
    if (await errorLocator.isVisible({ timeout: 2000 }).catch(() => false)) {
      const errorText = await errorLocator.textContent();
      console.error('Availability Error:', errorText);
    }

    await expect(page.getByText(/Automated Test Blockout/i)).toBeVisible({ timeout: 10000 });
  });
});
