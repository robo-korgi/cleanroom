# 007 — Playwright matrix (prod, preview, docker) — TEST FIRST

## Objective
Define Playwright config and a first failing smoke test. Targets:
- prod: `https://cleanroom.website`
- preview: `https://preview.cleanroom.website`
- docker: `http://localhost:3000` (adjust if needed)

## Files to add

### `playwright.config.ts`
```ts
import { defineConfig, devices } from '@playwright/test';

const PROD_URL    = process.env.PROD_URL    ?? 'https://cleanroom.website';
const PREVIEW_URL = process.env.PREVIEW_URL ?? 'https://preview.cleanroom.website';
const DOCKER_URL  = process.env.DOCKER_URL  ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { trace: 'on-first-retry' },
  projects: [
    { name: 'vercel-prod',    use: { ...devices['Desktop Chrome'], baseURL: PROD_URL    } },
    { name: 'vercel-preview', use: { ...devices['Desktop Chrome'], baseURL: PREVIEW_URL } },
    { name: 'local-docker',   use: { ...devices['Desktop Chrome'], baseURL: DOCKER_URL  } },
  ],
});
```

### `tests/smoke.spec.ts` (write this first; no homepage yet → RED)
```ts
import { test, expect } from '@playwright/test';

test('homepage shows Hello world', async ({ page, baseURL }) => {
  if (!baseURL) throw new Error('No baseURL set');
  await page.goto('/');
  await expect(page.getByText(/hello world/i)).toBeVisible();
});
```

## Execute — expect RED
- Run against any/all projects (homepage not implemented yet).

## Minimal implementation to go GREEN (only after RED)

### `app/page.tsx` (App Router)
```tsx
export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Hello world</h1>
      <p>Smoke test target for Playwright.</p>
    </main>
  );
}
```

Re-run tests against prod/preview/docker until GREEN. The preview target always uses the stable alias.

## Note for email verification tests (preview target)
When end-to-end tests involve clicking verification links, prefer the **dev-only JSON endpoint** described in step 014 (e.g., `/__test__/last-verification.json`) to retrieve the latest `verifyUrl`, instead of scraping any mailbox UI. This keeps tests stable and environment-agnostic. Ensure these endpoints are **disabled in production**.

## Note: add `/admin` access checks when admin exists
Once the bootstrap admin from step 015 is present, extend e2e to assert:
- Unauthenticated GET `/admin` → 401 (or login redirect if that is the chosen behavior).
- Authenticated `user` → 403.
- Authenticated `admin` → 200.
Run these across the Playwright matrix (prod, preview, docker) as applicable.
