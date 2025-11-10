# 012 — Drizzle + Vitest DB — TEST FIRST (local Postgres) with Role Model (pgEnum)

## Objective
Add a **role model baked-in** from the start. Create failing DB tests that require:
- Connecting to local Postgres (test DB via Docker on 5436).
- Inserting/selecting rows using Drizzle ORM.
- Enforcing a **role enum** with values `admin` and `user`.
- Defaulting new users to `role = 'user'`.

## Environment
- Test DB URL example: `postgres://postgres:postgres@localhost:5436/cleanroom_test` (in `.env.test.local`).
- Drizzle config points to `./db/schema.ts` and `./drizzle` migrations directory.

## Packages
- drizzle-orm, pg
- drizzle-kit (migrations)
- vitest, tsx, @types/node, dotenv

## Schema (Drizzle) — role enum + users + checkpoints
**File:** `db/schema.ts`

- Define `roleEnum = pgEnum('role', ['admin', 'user'])`.
- Table `users`:
  - `id` (serial or uuid primary key)
  - `email` (unique, not null)
  - `hashed_password` (not null)
  - `role` (roleEnum, not null, default `'user'`)
  - `email_confirmed_at` (timestamp, nullable)
  - `created_at`, `updated_at` (timestamps)
- Table `email_verification_tokens` will be introduced in step 014.
- Keep `checkpoints` table from earlier sample (for smoke testing migrations).

## Tests (Vitest) — write failing tests first (RED)
**File:** `tests/db.spec.ts`

- Assert DB connectivity (connect/disconnect without error).
- Insert into `checkpoints` and read (basic sanity).
- **Users table tests:**
  - Insert user with email+password only → expect `role = 'user'`.
  - Insert user with `role = 'admin'` should be allowed **only** inside privileged code path (not part of public signup). The test should simulate privileged insert (direct DB call) but document that public signup path must **not** accept role from client.
  - Query and assert role values are constrained to the enum (`admin`/`user`).

Run tests → expect failures until schema + migrations are applied.

## Migrations — make GREEN
- Generate migration from `db/schema.ts` (Drizzle Kit).
- Apply migration to **test DB**.
- Re-run Vitest → pass.

## Notes
- Prefer `pgEnum` for role to avoid stringly-typed roles.
- Public signup flow (step 014) must **always** set `role = 'user'` irrespective of client input.
- Admin creation occurs via a **bootstrap seed** or privileged action (step 015).

## Session authorization enforcement (mandatory)
- Role checks must run server-side only.
- Use **server-side session store** keyed by an opaque session ID.
- Session cookie must be: `HttpOnly`, `Secure`, `SameSite=Lax` (or Strict if possible).
- Never trust role or user identity from client input.
- After role changes, **invalidate and re-issue** sessions (force re-login or session refresh).
- Admin UI and privileged operations must be guarded by `role = 'admin'` at the server layer.
- `/api/healthz` and public endpoints remain unauthenticated unless otherwise required.

## Authorization guard cross‑reference
- All privileged DB mutations must be gated by the centralized authz utility from **017**: `requireRole(session, 'admin')`.
- Unit/e2e tests for admin-only paths should assert: unauthenticated → 401, user → 403, admin → 200.
- Public signup and verification flows must **not** accept role from client and never bypass server-side checks.
