import { test, expect } from '@playwright/test';

test.describe('Mobile Navigation (Step 014)', () => {
  test('@smoke: mobile hamburger visible on small viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.getByTestId('nav-mobile-toggle')).toBeVisible();
  });

  test('@smoke: desktop hamburger hidden on large viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await expect(page.getByTestId('nav-mobile-toggle')).not.toBeVisible();
  });

  test('@mobile: drawer opens on hamburger click', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await page.getByTestId('nav-mobile-toggle').click();
    await expect(page.getByTestId('nav-mobile-drawer')).toBeVisible();
  });

  test('@mobile: drawer closes on backdrop click', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await page.getByTestId('nav-mobile-toggle').click();
    await expect(page.getByTestId('nav-mobile-drawer')).toBeVisible();

    // Click backdrop (Sheet's overlay)
    await page.locator('[data-radix-dialog-overlay]').click({ position: { x: 10, y: 10 } });
    await expect(page.getByTestId('nav-mobile-drawer')).not.toBeVisible();
  });

  test('@mobile: drawer closes on link click', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await page.getByTestId('nav-mobile-toggle').click();
    await expect(page.getByTestId('nav-mobile-drawer')).toBeVisible();

    // Click a link in the mobile drawer
    await page.getByTestId('nav-mobile-drawer').getByRole('link').first().click();

    // Wait a moment for the animation
    await page.waitForTimeout(300);
    await expect(page.getByTestId('nav-mobile-drawer')).not.toBeVisible();
  });

  test('@mobile: Components and Blocks links visible in drawer', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await page.getByTestId('nav-mobile-toggle').click();
    await expect(page.getByTestId('nav-mobile-drawer')).toBeVisible();

    // Check that Components and Blocks links are present
    const drawer = page.getByTestId('nav-mobile-drawer');
    await expect(drawer.getByRole('link', { name: 'Components' })).toBeVisible();
    await expect(drawer.getByRole('link', { name: 'Blocks' })).toBeVisible();
  });

  test.skip('@auth: authenticated drawer shows avatar menu', async ({ page }) => {
    // TODO: Implement once auth helpers are ready
    // 1. Login first
    // 2. Set mobile viewport
    // 3. Open drawer
    // 4. Verify avatar menu is visible in drawer
  });

  test('@smoke: desktop nav shows Components and Blocks', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');

    // Verify Components and Blocks are visible in desktop nav
    const nav = page.getByTestId('nav');
    await expect(nav.getByRole('link', { name: 'Components' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Blocks' })).toBeVisible();
  });
});
