# 020 — Admin bootstrap seed (privileged creation, no public path)

## Objective
Create exactly one **admin** user intentionally via a privileged, non-public path. No scripts included in this doc; instruction-only.

## Policy
- Public signup never assigns admin.
- Admin can only be created by a **privileged operation**:
  - local dev: one-time bootstrap
  - production: controlled runbook step by the operator

## Inputs
- `email` (admin)
- `hashed_password` (precomputed via server-side util)
- `role = 'admin'` (explicit)

## Behavior
- Insert a user row with `role = 'admin'` directly via server-side privileged code.
- If an admin already exists, skip creating another (idempotent).
- Log the action to server console with timestamp (dev only).

## Verification
- Query users table and assert at least one user has `role = 'admin'` after the bootstrap step.
- Ensure public signup continues to assign only `role = 'user'`.

## Security
- Keep the bootstrap path inaccessible in production unless explicitly invoked by an operator.
- Never expose an HTTP endpoint that can set `role = 'admin'` without strong auth and authorization.

## Follow-up
- Admin UI for user management will rely on `role = 'admin'` guard.
- Access controls should check `role` centrally (middleware/server actions).

## Authorization guard cross‑reference
- The bootstrap admin creation flow is a **privileged operation** and must be protected by the centralized guard from **021**: `requireRole(session, 'admin')`, or executed via an operator-only path.
- Never expose a public HTTP endpoint that assigns `role='admin'` without the guard.
