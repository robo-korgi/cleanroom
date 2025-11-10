import { test, expect } from '@playwright/test';

/**
 * Deployment verification tests
 * These tests verify that production and preview deployments are accessible
 * and functioning correctly with HTTPS.
 *
 * Run against production:
 *   BASE_URL=https://cleanroom.website yarn test:e2e deployment.spec.ts
 *
 * Run against preview:
 *   BASE_URL=https://preview.cleanroom.website yarn test:e2e deployment.spec.ts
 */

test.describe('Deployment Verification @smoke @deployment', () => {
  test('application is accessible via HTTPS', async ({ page }) => {
    await page.goto('/');

    // Verify HTTPS protocol
    expect(page.url()).toMatch(/^https:/);

    // Verify page loads without errors
    const title = await page.title();
    expect(title).toBe('Cleanroom');
  });

  test('component gallery loads correctly', async ({ page }) => {
    await page.goto('/components');

    // Verify HTTPS
    expect(page.url()).toMatch(/^https:/);

    // Verify page renders
    await expect(page.getByRole('heading', { name: 'Components', level: 1 })).toBeVisible();

    // Verify at least one component is visible
    await expect(page.getByTestId('cmp-input-text')).toBeVisible();
  });

  test('block gallery loads correctly', async ({ page }) => {
    await page.goto('/blocks');

    // Verify HTTPS
    expect(page.url()).toMatch(/^https:/);

    // Verify page renders
    await expect(page.getByRole('heading', { name: 'Blocks', level: 1 })).toBeVisible();

    // Verify at least one block is visible
    await expect(page.getByTestId('blk-form')).toBeVisible();
  });

  test('no console errors on page load', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');

    // Allow some time for any lazy-loaded resources
    await page.waitForLoadState('networkidle');

    // Should have no errors
    expect(errors).toHaveLength(0);
  });

  test('static assets load via HTTPS', async ({ page }) => {
    const insecureRequests: string[] = [];

    page.on('request', (request) => {
      const url = request.url();
      // Check for http:// requests (mixed content)
      if (url.startsWith('http://') && !url.startsWith('http://localhost')) {
        insecureRequests.push(url);
      }
    });

    await page.goto('/components');
    await page.waitForLoadState('networkidle');

    // Should have no insecure requests
    expect(insecureRequests).toHaveLength(0);
  });
});
