# Fixing Vercel Authentication/Protection for Preview Deployments

## Problem

Playwright tests against `preview.cleanroom.website` are redirected to Vercel login page due to Vercel's Deployment Protection feature.

## Solution

You need to disable or configure Deployment Protection for preview environments.

### Option 1: Disable Deployment Protection (Recommended for Testing)

1. Go to Vercel Dashboard → Your Project
2. Navigate to **Settings** → **Deployment Protection**
3. You'll see protection settings for different environments

**For Preview Deployments:**
- Find "Protection for Preview Deployments"
- Select **Standard Protection** and then choose **Disabled** or **Public**
- Click **Save**

**For Production (Optional but Recommended for Public Site):**
- Keep production public (no authentication required)
- Select **Disabled** for production deployments

### Option 2: Use Vercel Protection Bypass for Automation

If you want to keep protection enabled, you can use bypass tokens:

1. Go to **Settings** → **Deployment Protection**
2. Under "Protection Bypass for Automation", find your **Deployment Protection Secret**
3. Add this to your Playwright config or as a header

**Update `playwright.config.ts`:**

```typescript
export default defineConfig({
  // ... other config
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Add Vercel bypass token if protection is enabled
    extraHTTPHeaders: process.env.VERCEL_AUTOMATION_BYPASS_SECRET
      ? {
          'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
        }
      : {},
  },
  // ... rest of config
});
```

Then run tests with:
```bash
VERCEL_AUTOMATION_BYPASS_SECRET=your-secret-here BASE_URL=https://preview.cleanroom.website yarn test:e2e
```

### Option 3: Configure Vercel Protection to Allow Specific IPs

1. Go to **Settings** → **Deployment Protection**
2. Add your testing infrastructure's IP addresses to allowlist
3. Less practical for local testing

## Recommended Approach

For a public-facing application like Cleanroom:

1. **Disable protection for preview deployments** (easiest for testing)
2. **Keep production public** (no authentication)
3. Later, if you need protection, use Option 2 with bypass tokens in CI/CD

## Steps to Fix Right Now

1. **Go to Vercel Dashboard**
2. **Select your Cleanroom project**
3. **Go to Settings → Deployment Protection**
4. **Find "Protection for Preview Deployments"**
5. **Select "Disabled" or change to "Public"**
6. **Click Save**
7. **Re-run the test:**
   ```bash
   BASE_URL=https://preview.cleanroom.website yarn test:e2e tests/deployment.spec.ts
   ```

## Verification

After disabling protection:

```bash
# Should work without authentication
curl -I https://preview.cleanroom.website

# Should return 200 OK, not 307/302 redirect
```

## Important Notes

- Deployment Protection is a **paid Vercel feature** on Pro/Enterprise plans
- If you're on Hobby plan, you shouldn't have this issue (it might be password protection instead)
- If using password protection, remove it from: Settings → General → Password Protection

## Alternative: Check for Password Protection

If you're on Vercel Hobby plan:

1. Go to **Settings** → **General**
2. Scroll to **Password Protection**
3. If enabled, disable it or note the password
4. For Playwright, you'd need to handle the password prompt (not recommended)

## After Fix

Update your `VERCEL_SETUP_CHECKLIST.md` to include:

- [ ] Deployment Protection disabled for preview (or bypass configured)
- [ ] Tests pass without authentication prompt

---

**TL;DR:** Go to Vercel Settings → Deployment Protection → Set preview protection to "Disabled" → Save → Retry tests.
