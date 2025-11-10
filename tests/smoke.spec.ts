import { test, expect } from '@playwright/test';

test('homepage shows Cleanroom', async ({ page, baseURL }) => {
  if (!baseURL) throw new Error('No baseURL set');
  await page.goto('/');
  await expect(page.getByText(/Cleanroom/)).toBeVisible();
});
