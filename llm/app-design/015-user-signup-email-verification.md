# 015 — Signup + Email Verification (TEST FIRST) — React Email + Resend + Token table

## Objective
Test-first implementation of a branded verification email for new signups using Resend. Flow uses an application-managed verification token stored in DB. Next.js App Router.

## Contract
- On signup, system issues a verification token and emails a branded message with a **Verify** link.
- Hitting the verify link marks the token as used and confirms the user’s email.
- Idempotent: clicking an already-used/expired token returns a stable, non-failing UX.

## Data model (Drizzle)
Table: `email_verification_tokens`
- `id` (serial PK)
- `user_id` (UUID or text FK to users table)
- `token` (string, unique, random; e.g., 32–48 chars)
- `expires_at` (timestamp)
- `used_at` (timestamp nullable, initially null)
- `created_at` (timestamp default now())

`users` table must include an `email_confirmed_at` datetime (nullable) or equivalent flag.

## Test-first plan

### A) Unit tests (Vitest) — token lifecycle
- createToken(user_id) produces a unique token, sets `expires_at` correctly
- verifyToken(token) returns associated user if valid + not expired + not used
- verifyToken marks token as used and sets user.email_confirmed_at

### B) API contract test (Playwright request) — `/api/auth/verify?token=...`
- Request with a valid token returns 302 redirect to a “verified” screen
- Invalid/expired/used token returns 302 redirect to a “try again” screen (or status 410/400 mapped to UI)

### C) UI e2e (Playwright) — minimal happy path
- Fill signup form
- Expect a toast/notice “Check your email”
- (In non-prod, surface the last sent verification URL in a debug panel or test-only endpoint to complete the click flow during e2e)

Note: In production, real email must deliver. In CI-less local testing, prefer a **test-only endpoint** that returns the last generated verification URL to Playwright. This avoids depending on inbox access in tests.

## Implementation (only after RED)

### 1) React Email template (branded)
- Props: `{ verifyUrl }`
- Elements: logo, H1 (“Confirm your email”), body copy, CTA button to verifyUrl, fallback verifyUrl as plain link
- Footer: optional brand footprint

### 2) Send function (server-only)
- Input: `{ to, userId }`
- Generate token (secure random), insert row in `email_verification_tokens` with TTL (e.g., 24h)
- Compose `verifyUrl = ${APP_URL}/api/auth/verify?token=...` (use PREVIEW_URL for preview tests as needed)
- Render React Email template → HTML
- Call Resend send with `{ from: MAIL_FROM, to, subject, html }`

### 3) Signup submission (route/action)
- After creating user record, call send function
- Return generic success message regardless of specific send state (avoid info leaks)

### 4) Verify route
- GET `/api/auth/verify?token=...`
- Validate token: exists, not expired, not used
- If valid: set `used_at=now()`, set `users.email_confirmed_at=now()`, redirect to success page
- If invalid: redirect to retry/failure page
- Do not leak internal reasons

### 5) Test hooks (dev-only)
- Test-only endpoint (dev) returns the **last verification URL** for the most recent signup (for Playwright to “click” without mailbox access)
- Ensure it is not available in production

## Security & reliability
- Tokens must be one-time. Expire and mark as used on success.
- Do not echo whether an email is registered on signup errors.
- If using Supabase for users, do not mutate Supabase system fields directly unless supported; instead, mirror confirmed state in your own `profiles` table or use Supabase email confirmation if you choose to switch later.
- Domain sending identity must be verified (SPF/DKIM) to reduce spam placement.

## Notes
- If you prefer Supabase-managed confirmation later: configure Supabase SMTP to Resend and use Supabase’s built-in confirmation link. Branding is less flexible than React Email, but the flow is managed by Supabase.
- Keep branded mailers for non-critical notifications if you choose that path.

## Dev-only test surfaces for e2e

### A) JSON endpoint (preferred for Playwright)
- Route path (example): `/__test__/last-verification.json`
- Environment gate: only enabled when `NODE_ENV !== 'production'`
- Response shape:
  ```json
  {
    "email": "user@example.com",
    "verifyUrl": "https://preview.cleanroom.website/api/auth/verify?token=...",
    "createdAt": "2025-11-09T20:15:00Z"
  }
  ```
- Behavior:
  - Returns the most recently generated verification URL (or 404 if none).
  - Optionally require a secret header (e.g., `X-Test-Secret`) to read.
  - Never logs or exposes full token lists.
- Playwright usage:
  - GET this endpoint, parse `verifyUrl`, then `page.goto(verifyUrl)` to complete verification.

### B) Optional visual preview route (for manual branding checks)
- Route path (example): `/__dev__/email/verify-preview`
- Environment gate: only enabled when `NODE_ENV !== 'production'`
- Behavior:
  - Renders the React Email verification template using sample props, or the most recent captured props.
  - No external delivery needed; used for fast visual iteration.
- Notes:
  - Do not ship this route to production.
  - Keep any sample data generic and non-sensitive.

### C) Capture mechanism (dev-only)
- In dev, capture the last issued verification email payload in memory (singleton module) or a temp storage.
- JSON endpoint and preview route both read from this capture.
- On prod builds, the capture is disabled / returns 404.

### Security gates
- Endpoints must be **disabled in production**.
- Optionally require a shared test header in non-prod to read JSON endpoint.
- Avoid listing multiple emails; return only the last one.
- Always log access to these dev endpoints to the server console (non-prod only) for traceability.

## Role assignment policy (baked-in)
- On signup, set `role = 'user'` server-side. Ignore any client-supplied `role`.
- Only privileged server paths (admin UI/seed) can set `role = 'admin'`.
- Tests should assert that public signup results in `role = 'user'` regardless of payload.
- DB uses `pgEnum('role', ['admin','user'])`, and `users.role` has a default of `'user'`.

## Session authorization enforcement (mandatory)
- Role checks must run server-side only.
- Use **server-side session store** keyed by an opaque session ID.
- Session cookie must be: `HttpOnly`, `Secure`, `SameSite=Lax` (or Strict if possible).
- Never trust role or user identity from client input.
- After role changes, **invalidate and re-issue** sessions (force re-login or session refresh).
- Admin UI and privileged operations must be guarded by `role = 'admin'` at the server layer.
- `/api/healthz` and public endpoints remain unauthenticated unless otherwise required.

## Authorization guard cross‑reference
- Public signup and verification endpoints must **not** set admin roles.
- Any privileged action (e.g., resending batches, managing users) must call the centralized guard from **017**: `requireRole(session, 'admin')`.
- Tests: verify unauthenticated/user cannot access privileged mail endpoints; admin succeeds.
