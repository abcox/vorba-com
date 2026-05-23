import { expect, test } from '@playwright/test';

async function setThemeAndOpenServices(page: import('@playwright/test').Page, theme: 'light' | 'dark') {
  await page.addInitScript((initialTheme) => {
    window.localStorage.setItem('app-theme', initialTheme);
  }, theme);

  await page.goto('/services');
  await expect(page.locator('body')).toHaveClass(new RegExp(`${theme}-theme`));
}

test.describe('Service page theme behavior', () => {
  test('service subsection surface differs between light and dark themes', async ({ browser }) => {
    const lightContext = await browser.newContext();
    const lightPage = await lightContext.newPage();
    await setThemeAndOpenServices(lightPage, 'light');

    const lightSubsection = lightPage.locator('[data-testid^="service-subsection-"]').first();
    await expect(lightSubsection).toBeVisible();
    const lightBackground = await lightSubsection.evaluate((el) => getComputedStyle(el).backgroundColor);

    const darkContext = await browser.newContext();
    const darkPage = await darkContext.newPage();
    await setThemeAndOpenServices(darkPage, 'dark');

    const darkSubsection = darkPage.locator('[data-testid^="service-subsection-"]').first();
    await expect(darkSubsection).toBeVisible();
    const darkBackground = await darkSubsection.evaluate((el) => getComputedStyle(el).backgroundColor);

    expect(lightBackground).not.toBe(darkBackground);

    await lightContext.close();
    await darkContext.close();
  });

  test('theme toggle switches from light to dark on service page', async ({ page }) => {
    await setThemeAndOpenServices(page, 'light');

    await page.getByTestId('menu-toggle-button').click();
    await expect(page.getByTestId('menu-dialog')).toBeVisible();
    await page.getByTestId('theme-toggle').click();

    await expect(page.locator('body')).toHaveClass(/dark-theme/);
  });
});
