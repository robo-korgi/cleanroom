# 007a — Test Helpers and Fixtures

Meta:
- created: 2025-11-10
- depends-on: 007 (Playwright matrix), 016a (Supabase Auth)
- scope: Reusable test utilities and data fixtures

## Objective
Provide reusable test helpers and fixtures for Playwright e2e tests and Vitest unit tests. Eliminate duplication and make tests more maintainable.

## Directory Structure

```
tests/
  helpers/
    auth.ts           # Authentication helpers
    database.ts       # Database utilities
    fixtures.ts       # Test data fixtures
    playwright.ts     # Playwright-specific helpers
  fixtures/
    users.json        # Sample user data
    seed-data.sql     # Test database seeds
  smoke/
    *.spec.ts        # Smoke tests
  e2e/
    *.spec.ts        # Full e2e tests
```

## Authentication Helpers

### File: `tests/helpers/auth.ts`

```typescript
import { Page } from '@playwright/test'
import { createServerClient } from '@/lib/supabase/server'

/**
 * Create a test user in Supabase Auth
 */
export async function createTestUser(options: {
  email: string
  password: string
  displayName?: string
  role?: 'admin' | 'user'
}) {
  const { email, password, displayName, role = 'user' } = options

  const supabase = createServerClient()

  // Create auth user (auto-confirmed for tests)
  const { data: { user }, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      display_name: displayName || email.split('@')[0],
    },
  })

  if (error) throw error
  if (!user) throw new Error('User not created')

  // Update role in public.users table
  if (role === 'admin') {
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', user.id)

    if (updateError) throw updateError
  }

  return user
}

/**
 * Delete a test user
 */
export async function deleteTestUser(userId: string) {
  const supabase = createServerClient()

  // Deleting from auth.users cascades to public.users
  await supabase.auth.admin.deleteUser(userId)
}

/**
 * Login via Playwright UI
 */
export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.fill('[name="email"]', email)
  await page.fill('[name="password"]', password)
  await page.click('button[type="submit"]')

  // Wait for redirect to home
  await page.waitForURL('/', { timeout: 10000 })

  // Wait for nav to show logged-in state
  await page.waitForSelector('[data-testid="nav-account-email"]', { timeout: 5000 })
}

/**
 * Login as admin user
 */
export async function loginAsAdmin(page: Page) {
  await loginAs(page, 'admin@test.local', 'test-admin-pass')
}

/**
 * Login as regular user
 */
export async function loginAsUser(page: Page) {
  await loginAs(page, 'user@test.local', 'test-user-pass')
}

/**
 * Logout via UI
 */
export async function logout(page: Page) {
  await page.click('[data-testid="nav-signout"]')
  await page.waitForURL('/login', { timeout: 5000 })
}

/**
 * Get current session via API
 */
export async function getSession(page: Page) {
  return await page.evaluate(async () => {
    const response = await fetch('/api/auth/session')
    return response.json()
  })
}
```

## Database Helpers

### File: `tests/helpers/database.ts`

```typescript
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const TEST_DB_URL = process.env.TEST_DATABASE_URL!

/**
 * Get test database client
 */
export function getTestDb() {
  const client = postgres(TEST_DB_URL)
  return drizzle(client)
}

/**
 * Clear all tables (except migrations)
 */
export async function clearDatabase() {
  const db = getTestDb()

  // Disable foreign key checks
  await db.execute(sql`SET session_replication_role = 'replica'`)

  // Get all tables
  const tables = await db.execute(sql`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename != 'drizzle_migrations'
  `)

  // Truncate each table
  for (const { tablename } of tables) {
    await db.execute(sql.raw(`TRUNCATE TABLE "${tablename}" CASCADE`))
  }

  // Re-enable foreign key checks
  await db.execute(sql`SET session_replication_role = 'origin'`)
}

/**
 * Run seed data
 */
export async function seedDatabase() {
  const db = getTestDb()

  // Create test users
  await createTestUser({
    email: 'admin@test.local',
    password: 'test-admin-pass',
    displayName: 'Test Admin',
    role: 'admin',
  })

  await createTestUser({
    email: 'user@test.local',
    password: 'test-user-pass',
    displayName: 'Test User',
    role: 'user',
  })

  // Add more seed data as needed
}

/**
 * Reset database to clean state
 */
export async function resetDatabase() {
  await clearDatabase()
  await seedDatabase()
}
```

## Playwright Helpers

### File: `tests/helpers/playwright.ts`

```typescript
import { Page, expect } from '@playwright/test'

/**
 * Wait for toast message to appear
 */
export async function waitForToast(page: Page, text: string) {
  const toast = page.locator('[data-testid^="cmp-toast"]', { hasText: text })
  await expect(toast).toBeVisible({ timeout: 5000 })
  return toast
}

/**
 * Wait for alert message to appear
 */
export async function waitForAlert(page: Page, variant: 'error' | 'success' | 'warning' | 'info') {
  const alert = page.locator(`[data-testid="cmp-alert-${variant}"]`)
  await expect(alert).toBeVisible({ timeout: 5000 })
  return alert
}

/**
 * Fill form field by label
 */
export async function fillFieldByLabel(page: Page, label: string, value: string) {
  const input = page.locator(`label:has-text("${label}") + input`)
  await input.fill(value)
}

/**
 * Submit form and wait for navigation or response
 */
export async function submitFormAndWait(page: Page, buttonText: string = 'Save') {
  const button = page.getByRole('button', { name: new RegExp(buttonText, 'i') })

  await Promise.all([
    page.waitForLoadState('networkidle'),
    button.click(),
  ])
}

/**
 * Check if element is visible without waiting
 */
export async function isVisible(page: Page, selector: string): Promise<boolean> {
  try {
    const element = page.locator(selector)
    return await element.isVisible({ timeout: 100 })
  } catch {
    return false
  }
}

/**
 * Take screenshot with timestamp
 */
export async function takeDebugScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  await page.screenshot({
    path: `test-results/debug-${name}-${timestamp}.png`,
    fullPage: true,
  })
}

/**
 * Wait for API call to complete
 */
export async function waitForApiCall(page: Page, urlPattern: string | RegExp) {
  return page.waitForResponse((response) => {
    const url = response.url()
    if (typeof urlPattern === 'string') {
      return url.includes(urlPattern)
    }
    return urlPattern.test(url)
  }, { timeout: 10000 })
}

/**
 * Mock API response
 */
export async function mockApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  response: any,
  status: number = 200
) {
  await page.route(urlPattern, (route) => {
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(response),
    })
  })
}
```

## Test Fixtures

### File: `tests/helpers/fixtures.ts`

```typescript
import { test as base } from '@playwright/test'
import { resetDatabase } from './database'
import { createTestUser, deleteTestUser } from './auth'

/**
 * Extended Playwright test with fixtures
 */
export const test = base.extend<{
  authenticatedPage: Page
  adminPage: Page
  cleanDb: void
}>({
  /**
   * Clean database before each test
   */
  cleanDb: [async ({}, use) => {
    await resetDatabase()
    await use()
  }, { auto: true }],

  /**
   * Page with authenticated user
   */
  authenticatedPage: async ({ page, cleanDb }, use) => {
    const user = await createTestUser({
      email: 'testuser@example.com',
      password: 'test-password',
      displayName: 'Test User',
    })

    await loginAs(page, 'testuser@example.com', 'test-password')

    await use(page)

    await deleteTestUser(user.id)
  },

  /**
   * Page with authenticated admin
   */
  adminPage: async ({ page, cleanDb }, use) => {
    const admin = await createTestUser({
      email: 'testadmin@example.com',
      password: 'admin-password',
      displayName: 'Test Admin',
      role: 'admin',
    })

    await loginAs(page, 'testadmin@example.com', 'admin-password')

    await use(page)

    await deleteTestUser(admin.id)
  },
})

export { expect } from '@playwright/test'
```

### File: `tests/fixtures/users.json`

```json
[
  {
    "email": "michael.scott@test.local",
    "displayName": "Michael Scott",
    "role": "user"
  },
  {
    "email": "jim.halpert@test.local",
    "displayName": "Jim Halpert",
    "role": "user"
  },
  {
    "email": "dwight.schrute@test.local",
    "displayName": "Dwight Schrute",
    "role": "admin"
  },
  {
    "email": "pam.beesly@test.local",
    "displayName": "Pam Beesly",
    "role": "user"
  }
]
```

## Usage Examples

### Using Fixtures

```typescript
// tests/e2e/user-profile.spec.ts
import { test, expect } from '../helpers/fixtures'

test('user can update profile', async ({ authenticatedPage }) => {
  // authenticatedPage is already logged in
  await authenticatedPage.goto('/account')

  await fillFieldByLabel(authenticatedPage, 'Display Name', 'New Name')
  await submitFormAndWait(authenticatedPage)

  await waitForToast(authenticatedPage, 'Profile updated')
})

test('admin can access admin panel', async ({ adminPage }) => {
  // adminPage is logged in as admin
  await adminPage.goto('/admin')

  await expect(adminPage).toHaveURL('/admin')
})
```

### Manual Auth Helpers

```typescript
// tests/e2e/auth-flow.spec.ts
import { test, expect } from '@playwright/test'
import { loginAs, logout, loginAsAdmin } from '../helpers/auth'

test('user can login and logout', async ({ page }) => {
  await loginAs(page, 'user@test.local', 'test-user-pass')

  await expect(page.getByTestId('nav-account-email')).toBeVisible()

  await logout(page)

  await expect(page.getByTestId('nav-signin')).toBeVisible()
})
```

### Database Helpers

```typescript
// tests/e2e/admin-users.spec.ts
import { test, expect } from '@playwright/test'
import { resetDatabase, getTestDb } from '../helpers/database'
import { loginAsAdmin } from '../helpers/auth'

test.beforeEach(async () => {
  await resetDatabase()
})

test('admin can view all users', async ({ page }) => {
  await loginAsAdmin(page)
  await page.goto('/admin/users')

  // Check that seeded users are visible
  await expect(page.getByText('admin@test.local')).toBeVisible()
  await expect(page.getByText('user@test.local')).toBeVisible()
})
```

### Playwright Helpers

```typescript
// tests/e2e/forms.spec.ts
import { test, expect } from '@playwright/test'
import { waitForToast, mockApiResponse } from '../helpers/playwright'
import { loginAs } from '../helpers/auth'

test('form shows success toast', async ({ page }) => {
  await loginAs(page, 'user@test.local', 'test-user-pass')
  await page.goto('/account')

  await page.fill('[name="displayName"]', 'Updated Name')
  await page.click('button[type="submit"]')

  await waitForToast(page, 'Profile updated successfully')
})

test('form handles API error', async ({ page }) => {
  await loginAs(page, 'user@test.local', 'test-user-pass')

  // Mock API error
  await mockApiResponse(
    page,
    /\/api\/user\/update/,
    { error: 'Server error' },
    500
  )

  await page.goto('/account')
  await page.fill('[name="displayName"]', 'Updated Name')
  await page.click('button[type="submit"]')

  await waitForAlert(page, 'error')
})
```

## Global Test Setup

### File: `tests/global-setup.ts`

```typescript
import { chromium, FullConfig } from '@playwright/test'
import { resetDatabase } from './helpers/database'

async function globalSetup(config: FullConfig) {
  console.log('Running global test setup...')

  // Reset test database
  await resetDatabase()

  // Start test server (if needed)
  // const server = spawn('pnpm', ['dev'])

  console.log('Global setup complete')
}

export default globalSetup
```

### File: `tests/global-teardown.ts`

```typescript
import { FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  console.log('Running global teardown...')

  // Cleanup test data
  // Stop test server (if started in setup)

  console.log('Global teardown complete')
}

export default globalTeardown
```

### Update: `playwright.config.ts`

```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  // ... other config

  globalSetup: require.resolve('./tests/global-setup'),
  globalTeardown: require.resolve('./tests/global-teardown'),

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
})
```

## Vitest Helpers (Unit Tests)

### File: `tests/unit/helpers.ts`

```typescript
import { expect, vi } from 'vitest'

/**
 * Mock Supabase client
 */
export function mockSupabaseClient() {
  return {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    },
  }
}

/**
 * Mock session
 */
export function mockSession(overrides = {}) {
  return {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      ...overrides,
    },
    access_token: 'test-token',
    expires_at: Date.now() + 3600000,
  }
}
```

## Exit Criteria

- Authentication helpers work for login/logout/user creation
- Database helpers can reset/seed test data
- Playwright helpers simplify common UI interactions
- Fixtures provide clean test isolation
- All helpers are typed and documented
- Examples demonstrate usage patterns
- Global setup/teardown configured
- Tests run reliably with helpers
