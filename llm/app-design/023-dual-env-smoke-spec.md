# 023 - Dual-Env Smoke Spec (Playwright)
Goal: Establish a tiny but rock-solid Playwright suite that runs against both environments:
- local-docker: your containerized Next dev server
- prod-vercel: your deployed production site

This is the first CI gate. If smoke fails on either env, we block deploys.

---

## 1) Test Matrix & Conventions
- Two configs:
  - playwright.local.ts -> BASE_URL=http://localhost:3000
  - playwright.prod.ts  -> BASE_URL=https://cleanroom.website (or your Vercel preview URL initially)
- Tags:
  - @smoke required to pass for deploys
- Artifacts: always collect trace/screenshots/videos on failure in CI

---

## 2) Files to add
```
/playwright/
  helpers/
    env.ts
  smoke/
    app-load.spec.ts
    auth-ui.spec.ts          # initially skipped until auth is wired
playwright.local.ts
playwright.prod.ts
```

env.ts
```ts
export const BASE_URL =
  process.env.BASE_URL ||
  (process.env.TARGET_ENV === "prod-vercel"
    ? "https://cleanroom.website"
    : "http://localhost:3000");
```

playwright.local.ts
```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./playwright",
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  grep: /@smoke/,
});
```

playwright.prod.ts
```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./playwright",
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.BASE_URL || "https://cleanroom.website",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  grep: /@smoke/,
});
```

---

## 3) Smoke specs
app-load.spec.ts
```ts
import { test, expect } from "@playwright/test";

test.describe("@smoke", () => {
  test("app loads and header visible", async ({ page }) => {
    await page.goto("/");
    // Replace with your real header role/name once you have it
    const header = page.getByRole("banner");
    await expect(header).toBeVisible();
  });

  test("has analytics tag (vercel or custom)", async ({ page }) => {
    await page.goto("/");
    // Loosest possible check to avoid flake; tighten later if needed
    const hasAnyAnalyticsTag = await page.evaluate(() => {
      const s = Array.from(document.querySelectorAll("script"));
      return s.some((el) =>
        (el.src || "").includes("vercel-analytics") ||
        (el.innerHTML || "").includes("vercel-analytics")
      );
    });
    expect(hasAnyAnalyticsTag).toBeTruthy();
  });
});
```

auth-ui.spec.ts (initially test.fixme until auth exists)
```ts
import { test, expect } from "@playwright/test";

test.describe("@smoke", () => {
  test.fixme("login via UI shows identity", async ({ page }) => {
    await page.goto("/login");
    // fill email/password as needed later
    // expect nav to show user identity
  });

  test.fixme("logout returns to public state", async ({ page }) => {
    // perform logout
    // assert auth UI switched to public
  });
});
```

---

## 4) Scripts
Add to package.json:
```json
{
  "scripts": {
    "test:e2e:local": "playwright test -c playwright.local.ts",
    "test:e2e:prod": "playwright test -c playwright.prod.ts",
    "test:e2e": "npm-run-all -s test:e2e:local test:e2e:prod"
  }
}
```

Run locally:
```bash
# with Docker app running on :3000
pnpm test:e2e:local

# once prod is live
pnpm test:e2e:prod
```

---

## 5) CI Gate (sketch)
- Job matrix runs two entries in parallel:
  - TARGET_ENV=local-docker -> start docker compose -> run test:e2e:local
  - TARGET_ENV=prod-vercel  -> set BASE_URL to production -> run test:e2e:prod
- Upload the Playwright HTML report and traces.

Add this gate before deploy. Only deploy when both @smoke suites pass.

---

## 6) Next upgrades
- Replace banner detection with explicit data-testid="site-header" to lower flake.
- Turn on auth-ui.spec.ts once auth is implemented.
- Add a /api/health ping pre-test to fast-fail if the app is not ready.
- Create a nightly full suite with broader coverage and retries.
