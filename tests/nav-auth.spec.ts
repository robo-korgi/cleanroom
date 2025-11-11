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

  // Note: Auth flow tests (@auth tags) require working Supabase auth

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

test.describe('Avatar Menu (Step 013)', () => {
  test('@smoke: Avatar menu not visible when logged out', async ({ page }) => {
    await page.goto('/');

    // Avatar menu should not be visible when logged out
    await expect(page.getByTestId('nav-avatar')).not.toBeVisible();
    await expect(page.getByTestId('nav-user-menu')).not.toBeVisible();
  });

  test.skip('@auth: Avatar menu visible when logged in', async ({ page }) => {
    // TODO: Implement once auth helpers are ready
    // 1. Log in
    // 2. Verify nav-avatar is visible
    // 3. Verify nav-user-menu is not visible initially
  });

  test.skip('@auth: Clicking avatar toggles menu open/closed', async ({ page }) => {
    // TODO: Implement once auth helpers are ready
    // 1. Log in
    // 2. Click avatar
    // 3. Verify menu becomes visible
    // 4. Click avatar again
    // 5. Verify menu closes
  });

  test.skip('@auth: Avatar menu contains Profile, Settings, Sign Out', async ({ page }) => {
    // TODO: Implement once auth helpers are ready
    // 1. Log in
    // 2. Click avatar to open menu
    // 3. Verify menu-profile link is visible
    // 4. Verify menu-settings link is visible
    // 5. Verify menu-signout button is visible
  });

  test.skip('@auth: Clicking Profile navigates to /u/{id}', async ({ page }) => {
    // TODO: Implement once auth helpers and profile routes are ready
    // 1. Log in
    // 2. Click avatar to open menu
    // 3. Click Profile
    // 4. Verify navigation to /u/{public_uuid}
    // 5. Verify menu closes
  });

  test.skip('@auth: Clicking Settings navigates to /account', async ({ page }) => {
    // TODO: Implement once auth helpers are ready
    // 1. Log in
    // 2. Click avatar to open menu
    // 3. Click Settings
    // 4. Verify navigation to /account
    // 5. Verify menu closes
  });

  test.skip('@auth: Clicking Sign Out logs user out', async ({ page }) => {
    // TODO: Implement once auth helpers are ready
    // 1. Log in
    // 2. Click avatar to open menu
    // 3. Click Sign Out
    // 4. Verify redirect to /
    // 5. Verify logged-out nav state
    // 6. Verify menu closes
  });

  test.skip('@auth: Menu closes when clicking outside', async ({ page }) => {
    // TODO: Implement once auth helpers are ready
    // 1. Log in
    // 2. Click avatar to open menu
    // 3. Click somewhere outside the menu
    // 4. Verify menu closes
  });

  test.skip('@auth: ESC key closes menu', async ({ page }) => {
    // TODO: Implement once auth helpers are ready
    // 1. Log in
    // 2. Click avatar to open menu
    // 3. Press ESC key
    // 4. Verify menu closes
  });

  test.skip('@auth: Keyboard navigation works in menu', async ({ page }) => {
    // TODO: Implement once auth helpers are ready
    // 1. Log in
    // 2. Press ENTER/SPACE on avatar to open menu
    // 3. Use arrow keys to navigate menu items
    // 4. Verify focus moves correctly
    // 5. Press ENTER on a menu item to activate it
  });
});
