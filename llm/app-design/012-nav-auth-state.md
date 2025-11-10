# 012 — Nav + Auth UI State (TEST FIRST)

Meta:
- updated: 2025-11-10T05:46:04.563076Z
- depends-on: 005-components-and-blocks-pages.md
- matrix: local-docker, vercel-preview, vercel-prod

## Goal
Define navigation behavior across auth states using Playwright tests first **and** mount nav globally in the layout.

## States & Visibility
- Logged-out: Logo/Home, Sign In, Sign Up.
- Logged-in (user): Logo/Home, Account (email + avatar fallback), Sign Out.
- Logged-in (admin): Logged-in user items plus Admin link -> /admin.

## Redirect Rules
- On login/signup success:
  - If user attempted to reach protected page, redirect back.
  - Else redirect to `/` (or `/dashboard` if introduced later).
- On sign out: redirect to `/`.

## No-Refresh Requirement
- Nav must update immediately on auth changes (hydration-safe).

## Selectors
- data-testid="nav"
- nav-logo, nav-home
- nav-signin, nav-signup
- nav-account-email, nav-account-avatar
- nav-signout
- nav-admin

## Mobile
- Same visibility rules; layout (hamburger vs inline) defined later (out of scope for now).

## Layout Integration (new)
- Place nav block inside the **root layout** so it renders on all pages.
- Home page (`/`) should include a **Card** with:
  - Title: “Less Boilerplate”
  - Subtitle: “More boil 🔥”
- Ensure SSR-safe rendering so first paint reflects current auth state.

## Test Matrix (behavioral)
1. @smoke: Public nav shows Sign In + Sign Up.
2. @auth: After login, nav shows Account + Sign Out (no full refresh).
3. @auth: After signup, auto-login and nav updates (no full refresh).
4. @auth: Sign out → redirect to `/` and nav reverts to logged-out state.
5. @admin: Admin link visible only for admin accounts.
6. @smoke: `/` shows the “Less Boilerplate / More boil 🔥” card content.

## Edge Cases
- Session expiration falls back to public nav.
- Deep-link to protected page redirects back post-login.
- Admin link never appears for non-admin accounts.

## Exit Criteria
- All nav/layout specs pass in local-docker and vercel targets.
