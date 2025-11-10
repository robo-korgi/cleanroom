# 016 — Drizzle + Vitest DB — TEST FIRST (local Postgres) with Role Model (pgEnum)

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
- Table `email_verification_tokens` will be introduced in step 020.
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
- Public signup flow (step 020) must **always** set `role = 'user'` irrespective of client input.
- Admin creation occurs via a **bootstrap seed** or privileged action (step 020).

## Session authorization enforcement (mandatory)
- Role checks must run server-side only.
- Use **server-side session store** keyed by an opaque session ID.
- Session cookie must be: `HttpOnly`, `Secure`, `SameSite=Lax` (or Strict if possible).
- Never trust role or user identity from client input.
- After role changes, **invalidate and re-issue** sessions (force re-login or session refresh).
- Admin UI and privileged operations must be guarded by `role = 'admin'` at the server layer.
- `/api/healthz` and public endpoints remain unauthenticated unless otherwise required.

## Authorization guard cross‑reference
- All privileged DB mutations must be gated by the centralized authz utility from **021**: `requireRole(session, 'admin')`.
- Unit/e2e tests for admin-only paths should assert: unauthenticated → 401, user → 403, admin → 200.
- Public signup and verification flows must **not** accept role from client and never bypass server-side checks.

## Database Migration Workflow

### Drizzle Config

**File:** `drizzle.config.ts`

```typescript
import type { Config } from 'drizzle-kit'
import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())

export default {
  schema: './db/schema/**/*.ts',
  out: './drizzle/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config
```

### Commands

**package.json scripts:**

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate:pg",
    "db:migrate": "drizzle-kit push:pg",
    "db:migrate:dev": "dotenv -e .env.local -- drizzle-kit push:pg",
    "db:migrate:test": "dotenv -e .env.test -- drizzle-kit push:pg",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx scripts/seed.ts",
    "db:reset": "./scripts/db-reset.sh"
  }
}
```

### Workflow

#### 1. Create/Update Schema
Edit schema files:
```
db/schema/
  users.ts
  posts.ts
  etc.ts
```

#### 2. Generate Migration
```bash
pnpm db:generate
```

This creates SQL migration file in `drizzle/migrations/YYYYMMDD_description.sql`.

Review the generated SQL to ensure it's correct.

#### 3. Apply Migration

**Local Development:**
```bash
pnpm db:migrate:dev
```

**Test Database:**
```bash
pnpm db:migrate:test
```

**Production:**
Migrations run automatically via Supabase migration system or:
```bash
DATABASE_URL=$PROD_DB_URL pnpm db:migrate
```

#### 4. Seed Data (Optional)
```bash
pnpm db:seed
```

### Migration Files

**Example:** `drizzle/migrations/20250110_add_users.sql`

```sql
-- Create role enum
CREATE TYPE "role" AS ENUM('admin', 'user');

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" text NOT NULL UNIQUE,
  "display_name" text,
  "avatar_url" text,
  "role" "role" DEFAULT 'user' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create index on email
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users" ("email");
```

### Testing Migrations

**Test migrations in isolation:**

```typescript
// tests/migrations/users.test.ts
import { describe, it, expect, beforeAll } from 'vitest'
import { sql } from 'drizzle-orm'
import { getTestDb, resetDatabase } from '../helpers/database'

describe('User migrations', () => {
  beforeAll(async () => {
    await resetDatabase()
  })

  it('creates users table with role enum', async () => {
    const db = getTestDb()

    // Check table exists
    const tables = await db.execute(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'users'
    `)

    expect(tables.rows.length).toBe(1)

    // Check role enum exists
    const enums = await db.execute(sql`
      SELECT typname
      FROM pg_type
      WHERE typname = 'role'
    `)

    expect(enums.rows.length).toBe(1)
  })

  it('defaults role to user', async () => {
    const db = getTestDb()

    await db.execute(sql`
      INSERT INTO users (email)
      VALUES ('test@example.com')
    `)

    const result = await db.execute(sql`
      SELECT role FROM users WHERE email = 'test@example.com'
    `)

    expect(result.rows[0].role).toBe('user')
  })
})
```

### Rollback Strategy

Drizzle doesn't have built-in rollback. For rollback:

1. **Keep migration history in git**
2. **Write down migrations manually if needed:**

```sql
-- drizzle/migrations/20250110_rollback_users.sql
DROP TABLE IF EXISTS "users";
DROP TYPE IF EXISTS "role";
```

3. **Or restore from database backup**

### Production Migration Strategy

#### Option 1: Manual (Recommended for small teams)
1. Generate migration locally: `pnpm db:generate`
2. Review SQL carefully
3. Test on preview environment
4. Run on production during maintenance window

#### Option 2: Automated via Supabase
1. Add migrations to `supabase/migrations/` directory
2. Supabase CLI applies them automatically:
   ```bash
   supabase db push
   ```

#### Option 3: CI/CD Pipeline
```yaml
# .github/workflows/migrate.yml
name: Database Migration

on:
  push:
    branches: [main]
    paths:
      - 'db/schema/**'
      - 'drizzle/migrations/**'

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
      - name: Install dependencies
        run: pnpm install
      - name: Run migrations
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: pnpm db:migrate
```

### Migration Best Practices

1. **Always review generated SQL** - Drizzle generates migrations, but review before applying
2. **Test migrations on preview first** - Never apply untested migrations to production
3. **Backup before major migrations** - Take database snapshot before destructive changes
4. **Avoid breaking changes** - Add new columns as nullable, migrate data, then add NOT NULL constraint
5. **Use transactions** - Wrap complex migrations in BEGIN/COMMIT
6. **Keep migrations small** - One logical change per migration file

### Schema Change Example

**Adding a new column:**

1. Update schema:
```typescript
// db/schema/users.ts
export const users = pgTable('users', {
  // ... existing fields
  bio: text('bio'), // New field, nullable
})
```

2. Generate migration:
```bash
pnpm db:generate
```

3. Review generated SQL:
```sql
ALTER TABLE "users" ADD COLUMN "bio" text;
```

4. Apply to test DB:
```bash
pnpm db:migrate:test
```

5. Test with Vitest

6. Apply to production:
```bash
DATABASE_URL=$PROD_DB_URL pnpm db:migrate
```

### Seed Script

**File:** `scripts/seed.ts`

```typescript
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { users } from '../db/schema/users'

const DATABASE_URL = process.env.DATABASE_URL!

async function seed() {
  const client = postgres(DATABASE_URL)
  const db = drizzle(client)

  console.log('Seeding database...')

  // Clear existing data (be careful!)
  await db.delete(users)

  // Insert seed data
  await db.insert(users).values([
    {
      email: 'admin@test.local',
      display_name: 'Test Admin',
      role: 'admin',
    },
    {
      email: 'user@test.local',
      display_name: 'Test User',
      role: 'user',
    },
  ])

  console.log('✅ Seed complete')

  await client.end()
}

seed().catch(console.error)
```

Run: `pnpm db:seed`

### Environment-Specific Migrations

**Local/Test:** Fast, can reset anytime
```bash
pnpm db:reset  # Drops and recreates
```

**Preview:** Like production, but can be more aggressive
```bash
pnpm db:migrate:dev
pnpm db:seed  # Add test data
```

**Production:** Careful, no resets
```bash
# Manual review required
pnpm db:generate
# Review SQL
pnpm db:migrate
# NO seeding in production!
```
