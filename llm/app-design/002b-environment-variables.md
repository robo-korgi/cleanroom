# 002b — Environment Variables

Meta:
- created: 2025-11-10
- depends-on: 002a (Docker), 004 (Supabase), 016a (Auth)
- scope: Complete environment variable configuration

## Objective
Catalog all environment variables needed across local development, preview, and production environments.

## Environment Files

### .env.example (Committed)
Template with dummy values for documentation:

```bash
#-----------------------
# App Configuration
#-----------------------
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

#-----------------------
# Supabase
#-----------------------
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

#-----------------------
# Database (Direct Connection)
#-----------------------
DATABASE_URL=postgresql://postgres:password@localhost:5432/cleanroom_dev
TEST_DATABASE_URL=postgresql://postgres:password@localhost:5433/cleanroom_test

#-----------------------
# Email (Production - Resend)
#-----------------------
RESEND_API_KEY=re_xxxxxxxxxxxx
MAIL_FROM=no-reply@cleanroom.website

#-----------------------
# Email (Development - Mailpit)
#-----------------------
USE_MAILPIT=true
SMTP_HOST=localhost
SMTP_PORT=1025

#-----------------------
# Storage (Supabase Storage or S3)
#-----------------------
STORAGE_PROVIDER=supabase  # or 's3' or 'r2'

# If using S3/R2
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=cleanroom-uploads

# If using Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=cleanroom-uploads

#-----------------------
# Analytics (Optional)
#-----------------------
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

#-----------------------
# Feature Flags (Optional)
#-----------------------
ENABLE_OAUTH=false
ENABLE_ADMIN_UI=true
```

### .env.local (Local Development - Not Committed)

```bash
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase (from project dashboard)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321  # if using supabase CLI
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-local-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-local-service-role-key>

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cleanroom_dev
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5433/cleanroom_test

# Email (use Mailpit locally)
USE_MAILPIT=true
SMTP_HOST=localhost
SMTP_PORT=1025
MAIL_FROM=no-reply@cleanroom.local

# Storage (use Supabase Storage locally)
STORAGE_PROVIDER=supabase
```

### .env.docker (Docker-specific - Not Committed)

```bash
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Docker-specific database URLs
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/cleanroom_dev
TEST_DATABASE_URL=postgresql://postgres:postgres@postgres_test:5432/cleanroom_test

# Mailpit (docker service)
USE_MAILPIT=true
SMTP_HOST=mailpit
SMTP_PORT=1025
MAIL_FROM=no-reply@cleanroom.local

STORAGE_PROVIDER=supabase
```

### .env.test (Test Environment - Not Committed)

```bash
NODE_ENV=test
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Test database
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5433/cleanroom_test

# Supabase (can use local or test project)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<test-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<test-service-role-key>

# Email (always use Mailpit or mock in tests)
USE_MAILPIT=true
SMTP_HOST=localhost
SMTP_PORT=1025

STORAGE_PROVIDER=mock
```

## Vercel Environment Variables

### Production
Set in Vercel Dashboard → Project → Settings → Environment Variables

**Environment:** Production

```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://cleanroom.website

# Supabase (Production Project)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<prod-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<prod-service-role-key>

# Database (Supabase provides this)
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres

# Email (Resend Production)
RESEND_API_KEY=<prod-api-key>
MAIL_FROM=no-reply@cleanroom.website

# Storage (Supabase Storage)
STORAGE_PROVIDER=supabase

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=<auto-set-by-vercel>

# Feature Flags
ENABLE_OAUTH=true
ENABLE_ADMIN_UI=true
```

### Preview
Set in Vercel Dashboard → Project → Settings → Environment Variables

**Environment:** Preview

```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://preview.cleanroom.website

# Supabase (can use same as prod or separate preview project)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx-preview.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<preview-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<preview-service-role-key>

# Database
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres

# Email (Resend with preview template)
RESEND_API_KEY=<same-as-prod>
MAIL_FROM=no-reply@preview.cleanroom.website

STORAGE_PROVIDER=supabase
```

## Variable Categories

### Public Variables (NEXT_PUBLIC_*)
**Exposed to browser**, can be accessed client-side:
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_VERCEL_ANALYTICS_ID`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`

⚠️ **Never put secrets in NEXT_PUBLIC_* variables!**

### Server-Only Variables
**Never exposed to browser**, only available server-side:
- `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **CRITICAL - Never expose!**
- `DATABASE_URL`
- `RESEND_API_KEY`
- `AWS_SECRET_ACCESS_KEY`
- `R2_SECRET_ACCESS_KEY`

### Environment-Specific
Variables that change per environment:
- `NODE_ENV`: `development` | `test` | `production`
- `NEXT_PUBLIC_APP_URL`: localhost | preview URL | production URL
- `DATABASE_URL`: local | preview | production database

## Loading Environment Variables

### Next.js Automatic Loading
Next.js automatically loads in order (later overrides earlier):
1. `.env` (all environments - committed with defaults)
2. `.env.local` (all environments - not committed)
3. `.env.development` (development only)
4. `.env.development.local` (development only - not committed)
5. `.env.production` (production only)
6. `.env.production.local` (production only - not committed)
7. `.env.test` (test only)
8. `.env.test.local` (test only - not committed)

### Manual Loading in Scripts

```typescript
// scripts/seed.ts
import dotenv from 'dotenv'
import path from 'path'

// Load .env.local for local development
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// Or load different env file
if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test.local' })
}
```

### Package.json Scripts with dotenv-cli

```json
{
  "scripts": {
    "dev": "dotenv -e .env.local -- next dev",
    "test": "dotenv -e .env.test.local -- vitest",
    "db:migrate": "dotenv -e .env.local -- drizzle-kit migrate",
    "db:seed": "dotenv -e .env.local -- tsx scripts/seed.ts"
  }
}
```

## Validation

### Runtime Validation (Recommended)

**File:** `lib/env.ts`

```typescript
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  NEXT_PUBLIC_APP_URL: z.string().url(),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Database
  DATABASE_URL: z.string().url().optional(),

  // Email
  RESEND_API_KEY: z.string().optional(),
  MAIL_FROM: z.string().email().optional(),
  USE_MAILPIT: z.string().transform(val => val === 'true').optional(),

  // Storage
  STORAGE_PROVIDER: z.enum(['supabase', 's3', 'r2']).default('supabase'),
})

export const env = envSchema.parse(process.env)
```

Use throughout app:
```typescript
import { env } from '@/lib/env'

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL  // Type-safe!
```

### Build-Time Validation

**File:** `next.config.js`

```javascript
const { z } = require('zod')

const requiredEnvVars = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
})

// Validate at build time
requiredEnvVars.parse(process.env)

module.exports = {
  // ... rest of config
}
```

## Security Best Practices

### 1. Never Commit Secrets
Add to `.gitignore`:
```
.env*.local
.env.production
.env.production.local
```

### 2. Use Different Keys Per Environment
- Development: Local Supabase or dev project
- Preview: Separate Supabase preview project
- Production: Production Supabase project

### 3. Rotate Keys Regularly
- Rotate API keys every 90 days
- Use Vercel's secret rotation feature
- Update Supabase keys in dashboard

### 4. Principle of Least Privilege
- Preview environment: Use less privileged keys if possible
- Test environment: Use dedicated test accounts/projects
- Development: Use local/mock services when possible

### 5. Audit Access
- Review who has access to Vercel dashboard
- Review who has access to Supabase dashboard
- Use team roles, not personal accounts

## Debugging Environment Variables

### Check What's Loaded

```typescript
// app/api/debug-env/route.ts (dev only!)
import { NextResponse } from 'next/server'

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 })
  }

  return NextResponse.json({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    HAS_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    HAS_RESEND_KEY: !!process.env.RESEND_API_KEY,
    // Never log actual secrets!
  })
}
```

### Common Issues

**"Variable is undefined"**
- Check spelling (case-sensitive)
- Ensure it's in correct .env file
- Restart Next.js dev server (required after .env changes)
- Check if it needs `NEXT_PUBLIC_` prefix

**"Variable works in dev but not production"**
- Did you set it in Vercel dashboard?
- Is it set for correct environment (production vs preview)?
- Did you redeploy after setting?

**"Public variable is undefined in browser"**
- Must start with `NEXT_PUBLIC_`
- Must be present at build time (not just runtime)

## Documentation for Team

**File:** `docs/environment-setup.md`

```markdown
# Environment Setup

## First Time Setup

1. Copy example file:
   ```bash
   cp .env.example .env.local
   ```

2. Get Supabase credentials from team lead

3. Fill in .env.local with your values

4. Start development:
   ```bash
   pnpm docker:up
   pnpm dev
   ```

## Required Variables

See `.env.example` for full list. At minimum you need:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- DATABASE_URL

## Getting Credentials

- Supabase: Ask team lead or check project dashboard
- Resend: For local dev, use Mailpit instead (see Docker docs)
```

## Exit Criteria
- `.env.example` documented with all variables
- Environment-specific files defined (.env.local, .env.test, etc.)
- Validation schema catches missing required variables
- Documentation explains how to set up each environment
- Security best practices documented
- Vercel environment variables configured for prod/preview
- No secrets committed to git
