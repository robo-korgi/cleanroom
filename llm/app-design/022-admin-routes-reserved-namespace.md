# 022 — Admin routes reserved namespace (`/admin/**`)

## Objective
Reserve `/admin/**` now and enforce admin-only access using the centralized guard from **021**. No admin UI yet.

## Scope
- Next.js App Router
- Server-side checks only
- No scripts

## Contract
- Any request under `/admin/**` requires `role = 'admin'`.
- Unauthenticated → 401
- Authenticated `user` (non-admin) → 403
- Authenticated `admin` → 200

## Location
- Namespace root: `app/admin/`

## Guard
- Use the centralized `requireRole(session, 'admin') from **020**.
- Session is loaded server-side before rendering or responding.

## Minimal shape (App Router)

- `app/admin/layout.tsx`  
  - server component: load session, call `requireRole(session, 'admin')`, render children.
  - On error: map to 401/403 (edge or node runtime; per project error boundary strategy).

- `app/admin/page.tsx`  
  - server component: simple placeholder (e.g., “Admin reserved”).

- Optional: middleware gate (route segment)  
  - If using middleware for early blocking, apply only to `/admin` matcher and call the same guard server-side.

## Error handling
- For 401/403, return proper status via route handlers or dedicated error boundaries. Do not leak internal details.
- Optionally redirect 401 to `/login`, but keep 403 as a hard forbidden response.

## Tests (Playwright)
- Unauthenticated GET `/admin` → 401 (or redirected to login if you choose that behavior).
- Authenticated `user` GET `/admin` → 403.
- Authenticated `admin` GET `/admin` → 200.

## Cross-references
- **021-authorization-guards.md** — guard contract and semantics.
- **016-drizzle-db-test-first.md** — role enum + default role.
- **020-admin-bootstrap-seed.md** — initial admin creation (privileged path).

## Notes
- Keep `/admin/**` out of site navigation for non-admins.
- Do not place public assets exclusively under `/admin/**`.
- Admin runtime can adopt stricter session TTL, re-auth for critical actions, and MFA later.
