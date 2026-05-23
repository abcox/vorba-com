import { expect, test } from '@playwright/test';

test('home page renders app root', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Vorba Web/i);
  await expect(page.locator('app-root')).toBeVisible();
});
