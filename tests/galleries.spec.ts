import { test, expect } from '@playwright/test';

test.describe('Component Gallery @smoke', () => {
  test('renders components page with heading', async ({ page }) => {
    await page.goto('/components');
    await expect(page.getByRole('heading', { name: 'Components', level: 1 })).toBeVisible();
  });

  test('displays all input component types', async ({ page }) => {
    await page.goto('/components');

    // Verify input components exist via data-testid
    await expect(page.getByTestId('cmp-input-text')).toBeVisible();
    await expect(page.getByTestId('cmp-input-textarea')).toBeVisible();
    await expect(page.getByTestId('cmp-input-email')).toBeVisible();
    await expect(page.getByTestId('cmp-input-url')).toBeVisible();
    await expect(page.getByTestId('cmp-input-password')).toBeVisible();
    await expect(page.getByTestId('cmp-input-number')).toBeVisible();
    await expect(page.getByTestId('cmp-input-select')).toBeVisible();
    await expect(page.getByTestId('cmp-input-checkbox')).toBeVisible();
    await expect(page.getByTestId('cmp-input-radio')).toBeVisible();
    await expect(page.getByTestId('cmp-input-switch')).toBeVisible();
    await expect(page.getByTestId('cmp-input-date')).toBeVisible();
    await expect(page.getByTestId('cmp-input-datetime')).toBeVisible();
  });

  test('displays alert components', async ({ page }) => {
    await page.goto('/components');

    await expect(page.getByTestId('cmp-alert-error')).toBeVisible();
    await expect(page.getByTestId('cmp-alert-success')).toBeVisible();
    await expect(page.getByTestId('cmp-alert-warning')).toBeVisible();
    await expect(page.getByTestId('cmp-alert-info')).toBeVisible();
  });

  test('displays toast trigger buttons', async ({ page }) => {
    await page.goto('/components');

    await expect(page.getByTestId('cmp-toast-trigger-error')).toBeVisible();
    await expect(page.getByTestId('cmp-toast-trigger-success')).toBeVisible();
    await expect(page.getByTestId('cmp-toast-trigger-warning')).toBeVisible();
    await expect(page.getByTestId('cmp-toast-trigger-info')).toBeVisible();
  });

  test('displays button and card components', async ({ page }) => {
    await page.goto('/components');

    await expect(page.getByTestId('ui-button')).toBeVisible();
    await expect(page.getByTestId('ui-card')).toBeVisible();
  });

  test('displays table components', async ({ page }) => {
    await page.goto('/components');

    await expect(page.getByTestId('cmp-table-infolist')).toBeVisible();
  });

  test('displays pagination component', async ({ page }) => {
    await page.goto('/components');

    await expect(page.getByTestId('cmp-pagination')).toBeVisible();
  });

  test('password toggle works', async ({ page }) => {
    await page.goto('/components');

    const passwordInput = page.getByTestId('cmp-input-password');
    const toggleButton = page.getByTestId('cmp-input-password-toggle');

    // Initially should be password type
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Click toggle again
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});

test.describe('Block Gallery @smoke', () => {
  test('renders blocks page with heading', async ({ page }) => {
    await page.goto('/blocks');
    await expect(page.getByRole('heading', { name: 'Blocks', level: 1 })).toBeVisible();
  });

  test('displays form block', async ({ page }) => {
    await page.goto('/blocks');

    await expect(page.getByTestId('blk-form')).toBeVisible();
  });

  test('displays user profile card blocks', async ({ page }) => {
    await page.goto('/blocks');

    const profileCards = page.getByTestId('blk-user-profile-card');
    await expect(profileCards).toBeVisible();
  });

  test('displays info list block', async ({ page }) => {
    await page.goto('/blocks');

    await expect(page.getByTestId('blk-info-list')).toBeVisible();
  });

  test('displays table block', async ({ page }) => {
    await page.goto('/blocks');

    await expect(page.getByTestId('blk-table')).toBeVisible();
  });

  test('form validation shows errors', async ({ page }) => {
    await page.goto('/blocks');

    // Find submit button and click it without filling form
    const submitButton = page.getByRole('button', { name: 'Submit' });
    await submitButton.click();

    // Error summary should appear
    await expect(page.getByTestId('blk-form-error-summary')).toBeVisible();

    // Error summary should contain error messages
    await expect(page.getByTestId('blk-form-error-summary')).toContainText('Name is required');
    await expect(page.getByTestId('blk-form-error-summary')).toContainText('Email is required');
  });
});
