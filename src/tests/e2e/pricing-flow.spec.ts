import { test, expect } from '@playwright/test';

test.describe('Pricing Flow', () => {
  test('unauthenticated user is blocked from subscribing', async ({ page }) => {
    await page.goto('/pricing');

    let alertMessage = '';
    page.on('dialog', async (dialog) => {
      alertMessage = dialog.message();
      await dialog.accept();
    });

    const subscribeBtn = page.getByRole('button', { name: /subscribe to nomad/i });
    await expect(subscribeBtn).toBeVisible();
    await subscribeBtn.click();

    await page.waitForTimeout(2000); // give fetch a sec
    expect(alertMessage).toMatch(/unauthorized|log in|failed/i);
  });

  test('authenticated user redirects to checkout', async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL;
    const password = process.env.TEST_USER_PASSWORD;
    test.skip(!email || !password, 'needs TEST_USER_EMAIL or TEST_USER_PASSWORD');

    // log in
    await page.goto('/auth/login');
    await page.getByPlaceholder(/email/i).or(page.getByLabel(/email/i)).fill(email!);
    await page.getByPlaceholder(/password/i).or(page.getByLabel(/password/i)).fill(password!);
    await page.getByRole('button', { name: /log in|sign in/i }).click();

    await page.waitForURL(/\/dashboard|\/explore|\/$/, { timeout: 10000 });

    // go to pricing
    await page.goto('/pricing');

    // The pricing page has "Subscribe to Nomad" and "Subscribe to Elite" buttons
    const buyBtn = page.getByRole('button', { name: /subscribe to nomad/i });
    await expect(buyBtn).toBeVisible();
    await buyBtn.click();

    await page.waitForURL(/checkout|stripe\.com/, { timeout: 15000 });
    expect(page.url()).toMatch(/checkout|stripe\.com/);
  });
});
