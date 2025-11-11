import { test, expect } from '@playwright/test';

test.describe('Navigation Auth States', () => {
  test('@smoke: Public nav shows Sign In + Sign Up', async ({ page }) => {
    await page.goto('/');

    const nav = page.getByTestId('nav');
    await expect(nav).toBeVisible();

    // Logged-out state shows Sign In and Sign Up
    await expect(page.getByTestId('nav-signin')).toBeVisible();
    await expect(page.getByTestId('nav-signup')).toBeVisible();

    // Logged-in elements should not be visible
    await expect(page.getByTestId('nav-account-email')).not.toBeVisible();
    await expect(page.getByTestId('nav-signout')).not.toBeVisible();
    await expect(page.getByTestId('nav-admin')).not.toBeVisible();
  });

  test('@smoke: Homepage shows Less Boilerplate card', async ({ page }) => {
    await page.goto('/');

    // Check for the card content
    await expect(page.getByText('Less Boilerplate')).toBeVisible();
    await expect(page.getByText('More boil 🔥')).toBeVisible();
  });

  test('@smoke: Nav logo and home links are present', async ({ page }) => {
    await page.goto('/');

    const nav = page.getByTestId('nav');
    await expect(nav).toBeVisible();

    // Logo should be visible and link to home
    const logo = page.getByTestId('nav-logo');
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute('href', '/');
  });

  // Note: Auth flow tests (@auth tags) will be implemented once auth is functional
  // These are placeholders for the test structure:

  test.skip('@auth: After login, nav shows Account + Sign Out', async ({ page }) => {
    // TODO: Implement once Supabase auth is configured
    // 1. Navigate to sign in page
    // 2. Fill in credentials
    // 3. Submit form
    // 4. Verify nav updates without full refresh
    // 5. Check for nav-account-email and nav-signout
  });

  test.skip('@auth: After signup, auto-login and nav updates', async ({ page }) => {
    // TODO: Implement once Supabase auth is configured
    // 1. Navigate to sign up page
    // 2. Fill in new user credentials
    // 3. Submit form
    // 4. Verify auto-login and nav updates
  });

  test.skip('@auth: Sign out redirects to / and nav reverts', async ({ page }) => {
    // TODO: Implement once Supabase auth is configured
    // 1. Log in first
    // 2. Click sign out
    // 3. Verify redirect to /
    // 4. Verify nav shows logged-out state
  });

  test.skip('@admin: Admin link visible only for admin accounts', async ({ page }) => {
    // TODO: Implement once admin roles are configured
    // 1. Log in as admin user
    // 2. Verify nav-admin link is visible
    // 3. Log out and log in as regular user
    // 4. Verify nav-admin link is not visible
  });
});
