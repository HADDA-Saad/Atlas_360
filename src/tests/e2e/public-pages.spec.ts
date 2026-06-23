import { test, expect } from '@playwright/test';

test.describe('Public Pages', () => {
  test('home page loads', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  });

  test('explore page loads', async ({ page }) => {
    const response = await page.goto('/explore');
    expect(response?.status()).toBe(200);
  });

  test('destinations page loads', async ({ page }) => {
    const response = await page.goto('/destinations');
    expect(response?.status()).toBe(200);
  });

  test('pricing page loads', async ({ page }) => {
    const response = await page.goto('/pricing');
    expect(response?.status()).toBe(200);
    await expect(page.getByText('Explorer').first()).toBeVisible();
    await expect(page.getByText('Nomad').first()).toBeVisible();
    await expect(page.getByText('Elite').first()).toBeVisible();
  });

  test('about page loads', async ({ page }) => {
    const response = await page.goto('/about');
    expect(response?.status()).toBe(200);
  });

  test('guides page loads', async ({ page }) => {
    const response = await page.goto('/guides');
    expect(response?.status()).toBe(200);
  });
});
