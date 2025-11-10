# 016a — Session Management with Supabase Auth

Meta:
- created: 2025-11-10
- depends-on: 004 (Supabase project), 016 (DB setup)
- scope: Authentication and session management using Supabase Auth

## Objective
Use **Supabase Auth** (not custom auth) for all authentication and session management. Supabase handles password hashing, email verification, session storage, and OAuth - we just wire it up.

## Authentication Strategy: Supabase Auth

**Critical Decision:** We use **Supabase Auth**, not custom authentication.

### What Supabase Provides:
- User signup/login with email + password
- Email verification (built-in)
- OAuth providers (Google, GitHub, etc.)
- Password reset flows
- HTTP-only cookie session management
- Server-side session validation
- No custom JWT handling needed

### What We Don't Build:
- ❌ Custom password hashing
- ❌ Custom email verification tokens table
- ❌ Custom session storage
- ❌ Manual JWT parsing
- ❌ Custom password reset

## Session Storage

### How It Works
Supabase Auth uses **HTTP-only cookies** to store sessions:

1. User logs in → Supabase issues session tokens
2. Tokens stored in HTTP-only cookies (secure, can't be read by JS)
3. Next.js server reads cookies to validate session
4. Session contains: `user_id`, `email`, `role`, `email_confirmed_at`

### Cookie Configuration
Supabase automatically configures:
- `HttpOnly: true` - Can't be accessed via JavaScript
- `Secure: true` - HTTPS only (in production)
- `SameSite: Lax` - CSRF protection
- `Path: /` - Available to all routes

### Session Duration
- Default: 1 hour (access token)
- Refresh token: 30 days
- Auto-refresh handled by Supabase client

## Server-Side Session Access

### Helper: `createServerClient`

Create a helper to get Supabase client with cookies on the server:

**File:** `lib/supabase/server.ts`

```typescript
import { createServerClient as createClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createServerClient() {
  const cookieStore = cookies()

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
```

### Helper: `getSession`

**File:** `lib/auth/session.ts`

```typescript
import { createServerClient } from '@/lib/supabase/server'

export async function getSession() {
  const supabase = createServerClient()

  const { data: { session }, error } = await supabase.auth.getSession()

  if (error || !session) {
    return null
  }

  return session
}

export async function getUser() {
  const supabase = createServerClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

// Get user with role from our users table
export async function getUserWithRole() {
  const session = await getSession()
  if (!session) return null

  const supabase = createServerClient()

  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, display_name, role, avatar_url')
    .eq('id', session.user.id)
    .single()

  if (error) return null

  return user
}
```

## Client-Side Session Access

### Helper: `createBrowserClient`

**File:** `lib/supabase/client.ts`

```typescript
import { createBrowserClient as createClient } from '@supabase/ssr'

export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### React Hook: `useSession`

```typescript
'use client'

import { createBrowserClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  return { session, loading }
}
```

## User Schema with Supabase Auth

### Database Schema

Supabase has a built-in `auth.users` table we don't control. We create our own `public.users` table that mirrors it:

**File:** `packages/db/src/schema/users.ts`

```typescript
import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const roleEnum = pgEnum('role', ['admin', 'user'])

export const users = pgTable('users', {
  // Use Supabase auth user ID as primary key
  id: uuid('id').primaryKey().references(() => authUsers.id, { onDelete: 'cascade' }),

  email: text('email').notNull().unique(),
  display_name: text('display_name'),
  avatar_url: text('avatar_url'),

  role: roleEnum('role').notNull().default('user'),

  // Timestamps
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
})

// Reference to Supabase's auth.users (for FK constraint)
export const authUsers = pgTable('users', {
  id: uuid('id').primaryKey(),
}, { schema: 'auth' })
```

### Trigger: Sync auth.users → public.users

When a user signs up via Supabase Auth, automatically create a row in our `public.users` table:

**File:** `supabase/migrations/YYYYMMDD_create_users_trigger.sql`

```sql
-- Function to create public.users row when auth.users row is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at)
  VALUES (NEW.id, NEW.email, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Authorization Guards (Updated)

### requireRole (Server-Side)

**File:** `lib/auth/guards.ts`

```typescript
import { getUserWithRole } from './session'
import { redirect } from 'next/navigation'

type Role = 'admin' | 'user'

export async function requireRole(required: Role) {
  const user = await getUserWithRole()

  if (!user) {
    redirect('/login')
  }

  const ranks: Record<Role, number> = { user: 1, admin: 2 }

  if (ranks[user.role] < ranks[required]) {
    throw new Error('Forbidden')
  }

  return user
}

export async function requireAuth() {
  const user = await getUserWithRole()

  if (!user) {
    redirect('/login')
  }

  return user
}
```

## Login/Signup/Logout Flows

### Signup Server Action

**File:** `app/(auth)/signup/actions.ts`

```typescript
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const displayName = formData.get('displayName') as string

  const supabase = createServerClient()

  // Supabase handles email verification automatically
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Redirect to "check your email" page
  redirect('/auth/verify-email')
}
```

### Login Server Action

**File:** `app/(auth)/login/actions.ts`

```typescript
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = createServerClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/')
}
```

### Logout Server Action

**File:** `app/(auth)/logout/actions.ts`

```typescript
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function logout() {
  const supabase = createServerClient()

  await supabase.auth.signOut()

  redirect('/login')
}
```

### Auth Callback Handler

**File:** `app/auth/callback/route.ts`

```typescript
import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createServerClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to home or intended destination
  return NextResponse.redirect(requestUrl.origin)
}
```

## Email Verification

### Supabase Handles It
Supabase automatically:
1. Sends verification email when user signs up
2. Email contains magic link with code
3. User clicks link → redirects to `/auth/callback?code=...`
4. Callback handler exchanges code for session
5. User is now logged in and verified

### Custom Email Templates (Optional)
Configure in Supabase dashboard:
- Settings → Auth → Email Templates
- Customize subject, body, from name
- Use variables: `{{ .Token }}`, `{{ .Email }}`, `{{ .SiteURL }}`

### Using Resend Instead
If you want branded emails via Resend (from 018):
- Supabase Settings → Auth → SMTP Settings
- Configure Resend SMTP credentials
- Supabase will send emails via Resend

## Environment Variables

Required in `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxxx...  # Server-only, never expose

# App URLs (for redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Local dev
# NEXT_PUBLIC_APP_URL=https://preview.cleanroom.website  # Preview
# NEXT_PUBLIC_APP_URL=https://cleanroom.website  # Production
```

## Testing

### Test Helpers

```typescript
// tests/helpers/auth.ts
import { createServerClient } from '@/lib/supabase/server'

export async function createTestUser(email: string, password: string, role: 'user' | 'admin' = 'user') {
  const supabase = createServerClient()

  // Create auth user
  const { data: { user }, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) throw error

  // Update role in public.users
  await supabase
    .from('users')
    .update({ role })
    .eq('id', user.id)

  return user
}

export async function deleteTestUser(userId: string) {
  const supabase = createServerClient()

  await supabase.auth.admin.deleteUser(userId)
}
```

### Playwright Auth Helpers

```typescript
// tests/helpers/playwright-auth.ts
import { Page } from '@playwright/test'

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.fill('[name="email"]', email)
  await page.fill('[name="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL('/')
}

export async function loginAsAdmin(page: Page) {
  // Use test admin account
  await loginAs(page, 'admin@test.local', 'test-admin-password')
}
```

## Migration from Custom Auth (If Needed)

Since specs 018-019 incorrectly described custom auth, clarify:

### What Changes:
- ❌ Remove `email_verification_tokens` table (not needed)
- ❌ Remove custom password hashing code
- ❌ Remove custom email sending for verification
- ✅ Keep `public.users` table for app-specific data
- ✅ Keep role enum and authorization guards
- ✅ Add trigger to sync auth.users → public.users

### What Stays:
- User roles (`admin`/`user`) in our `public.users` table
- Authorization guards (`requireRole`, `requireAuth`)
- User profile data (display_name, avatar_url, etc.)

## Security Best Practices

1. **Never expose SUPABASE_SERVICE_ROLE_KEY to client**
2. **Use Row Level Security (RLS) policies** in Supabase:
   ```sql
   -- Users can only read their own data
   CREATE POLICY "Users can view own profile"
   ON public.users FOR SELECT
   USING (auth.uid() = id);

   -- Users can update their own data (except role)
   CREATE POLICY "Users can update own profile"
   ON public.users FOR UPDATE
   USING (auth.uid() = id);
   ```

3. **Validate role server-side** - Never trust client data
4. **Use server actions** for mutations, not client-side API calls
5. **Invalidate sessions** when role changes (force re-login)

## Exit Criteria

- Supabase Auth configured and working
- Session helpers (`getSession`, `getUser`, `getUserWithRole`) implemented
- Login/signup/logout flows working
- Email verification via Supabase (or Resend SMTP)
- Authorization guards using Supabase sessions
- `public.users` table synced with `auth.users`
- Tests can create users with roles
- No custom auth code remaining in specs 018-019
