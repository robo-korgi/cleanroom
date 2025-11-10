# 019 — Signup + Email Verification (TEST FIRST) — Supabase Auth

Meta:
- created: 2025-11-10
- depends-on: 016a (Supabase Auth), 018 (Optional Resend SMTP)
- scope: User signup with email verification using Supabase Auth

## Objective
Test-first implementation of user signup with email verification using **Supabase Auth**. Supabase handles token generation, email delivery, and verification state. Next.js App Router with Server Actions.

**Key Change from Previous Approach**: We use Supabase Auth's built-in email confirmation instead of custom token tables. See **016a-session-management-supabase-auth.md** for session management details.

## Contract
- User signs up with email + password
- Supabase Auth sends verification email automatically
- User clicks verification link in email
- Supabase confirms email and redirects to app
- User can now sign in
- Role defaults to `'user'` (never accept role from client)

## Data Model (Supabase Auth)

### Supabase Tables

**auth.users** (managed by Supabase):
- `id` (UUID, primary key)
- `email` (unique)
- `encrypted_password` (hashed by Supabase)
- `email_confirmed_at` (timestamp, nullable)
- `created_at`, `updated_at`

**public.users** (your app table):
- `id` (UUID, FK to auth.users.id)
- `email` (text, unique)
- `display_name` (text, nullable)
- `avatar_url` (text, nullable)
- `role` (pgEnum 'admin' | 'user', default 'user')
- `created_at`, `updated_at`

**Database Trigger** (syncs auth.users → public.users):

See **016a** for complete trigger setup. Summary:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'user'  -- ALWAYS default to 'user'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## No Custom Token Table

**REMOVED**: Custom `email_verification_tokens` table is NOT needed. Supabase Auth manages verification tokens internally.

## Test-First Plan

### A) Unit tests (Vitest) — Server Actions

**File**: `tests/unit/signup-action.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { signupAction } from '@/app/(auth)/signup/actions'
import { mockSupabaseClient } from '../helpers'

describe('signupAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates user with Supabase Auth', async () => {
    const mockAuth = {
      signUp: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' }, session: null },
        error: null,
      }),
    }

    const result = await signupAction({
      email: 'test@example.com',
      password: 'SecurePass123!',
      displayName: 'Test User',
    })

    expect(mockAuth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'SecurePass123!',
      options: {
        emailRedirectTo: 'http://localhost:3000/auth/callback',
        data: {
          display_name: 'Test User',
        },
      },
    })
    expect(result).toEqual({ success: true })
  })

  it('returns error for existing email', async () => {
    const mockAuth = {
      signUp: vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already registered' },
      }),
    }

    const result = await signupAction({
      email: 'existing@example.com',
      password: 'SecurePass123!',
    })

    expect(result).toEqual({
      success: false,
      error: 'Email already registered',
    })
  })

  it('NEVER accepts role from client', async () => {
    const result = await signupAction({
      email: 'hacker@example.com',
      password: 'SecurePass123!',
      role: 'admin',  // Malicious attempt
    })

    // Verify role is NOT passed to Supabase
    // User will get 'user' role from DB trigger
    expect(mockAuth.signUp).not.toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          data: expect.objectContaining({ role: 'admin' })
        })
      })
    )
  })
})
```

### B) API/Action Contract Tests (Playwright API testing)

**File**: `tests/e2e/signup-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test'
import { resetDatabase, createTestUser, deleteTestUser } from '../helpers/database'

test.beforeEach(async () => {
  await resetDatabase()
})

test('successful signup sends verification email', async ({ page }) => {
  await page.goto('/signup')

  await page.fill('[name="email"]', 'newuser@example.com')
  await page.fill('[name="password"]', 'SecurePass123!')
  await page.fill('[name="displayName"]', 'New User')
  await page.click('button[type="submit"]')

  // Expect success message
  await expect(page.getByText(/check your email/i)).toBeVisible()

  // Should redirect to login or confirmation page
  await expect(page).toHaveURL(/\/(login|signup\/success)/)
})

test('duplicate email shows error', async ({ page }) => {
  // Create existing user
  const existingUser = await createTestUser({
    email: 'existing@example.com',
    password: 'password123',
  })

  await page.goto('/signup')

  await page.fill('[name="email"]', 'existing@example.com')
  await page.fill('[name="password"]', 'SecurePass123!')
  await page.click('button[type="submit"]')

  // Should show error
  await expect(page.getByText(/already registered/i)).toBeVisible()

  await deleteTestUser(existingUser.id)
})

test('weak password shows validation error', async ({ page }) => {
  await page.goto('/signup')

  await page.fill('[name="email"]', 'newuser@example.com')
  await page.fill('[name="password"]', '123')  // Too weak
  await page.click('button[type="submit"]')

  await expect(page.getByText(/password.*least.*characters/i)).toBeVisible()
})
```

### C) Email Verification E2E Test

**File**: `tests/e2e/email-verification.spec.ts`

```typescript
import { test, expect } from '@playwright/test'
import { resetDatabase } from '../helpers/database'

test.beforeEach(async () => {
  await resetDatabase()
})

test('user can verify email and login', async ({ page }) => {
  // 1. Sign up
  await page.goto('/signup')
  await page.fill('[name="email"]', 'verify-test@example.com')
  await page.fill('[name="password"]', 'SecurePass123!')
  await page.click('button[type="submit"]')

  await expect(page.getByText(/check your email/i)).toBeVisible()

  // 2. Get verification link (test-only endpoint)
  // In production, user would click link in email
  // In tests, we fetch the link from Supabase or test endpoint

  if (process.env.NODE_ENV !== 'production') {
    // Option A: Use Supabase Admin API to get confirmation token
    // Option B: Fetch from test-only endpoint (see Dev-Only Test Surfaces below)

    const response = await page.request.get('/__test__/last-verification-link')
    const { confirmationUrl } = await response.json()

    // 3. Click verification link
    await page.goto(confirmationUrl)

    // Should redirect to app after verification
    await expect(page).toHaveURL(/\/(login|auth\/callback)/)
  }

  // 4. Now user can login
  await page.goto('/login')
  await page.fill('[name="email"]', 'verify-test@example.com')
  await page.fill('[name="password"]', 'SecurePass123!')
  await page.click('button[type="submit"]')

  // Should be logged in
  await expect(page).toHaveURL('/')
  await expect(page.getByTestId('nav-account-email')).toHaveText('verify-test@example.com')
})
```

### D) Role Assignment Test

**File**: `tests/e2e/signup-security.spec.ts`

```typescript
import { test, expect } from '@playwright/test'
import { resetDatabase, getTestDb } from '../helpers/database'

test('signup ALWAYS assigns user role', async ({ page }) => {
  await resetDatabase()

  // Attempt to signup with admin role in payload (malicious)
  await page.goto('/signup')
  await page.fill('[name="email"]', 'hacker@example.com')
  await page.fill('[name="password"]', 'SecurePass123!')

  // Intercept request and add role field
  await page.route('**/api/auth/signup', async (route) => {
    const request = route.request()
    const postData = JSON.parse(request.postData() || '{}')
    postData.role = 'admin'  // Malicious payload

    await route.continue({
      postData: JSON.stringify(postData)
    })
  })

  await page.click('button[type="submit"]')

  // Verify in database that role is 'user', NOT 'admin'
  const db = getTestDb()
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, 'hacker@example.com'))
    .limit(1)

  expect(user[0].role).toBe('user')  // Server enforced!
})
```

## Implementation (After RED)

### 1) Signup Page UI

**File**: `app/(auth)/signup/page.tsx`

```typescript
import { SignupForm } from './SignupForm'

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div>
          <h1 className="text-3xl font-bold">Create your account</h1>
          <p className="text-muted-foreground mt-2">
            Sign up to get started
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}
```

### 2) Signup Form Component

**File**: `app/(auth)/signup/SignupForm.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { signupAction } from './actions'

export function SignupForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsPending(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const displayName = formData.get('displayName') as string

    const result = await signupAction({ email, password, displayName })

    setIsPending(false)

    if (!result.success) {
      setError(result.error || 'Signup failed')
      return
    }

    // Redirect to success page
    router.push('/signup/success')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive" data-testid="cmp-alert-error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <p className="text-sm text-muted-foreground mt-1">
          At least 8 characters
        </p>
      </div>

      <div>
        <Label htmlFor="displayName">Display Name (optional)</Label>
        <Input
          id="displayName"
          name="displayName"
          type="text"
          autoComplete="name"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Creating account...' : 'Sign up'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <a href="/login" className="text-primary hover:underline">
          Sign in
        </a>
      </p>
    </form>
  )
}
```

### 3) Signup Server Action

**File**: `app/(auth)/signup/actions.ts`

```typescript
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().optional(),
})

export async function signupAction(input: {
  email: string
  password: string
  displayName?: string
  role?: string  // Malicious clients might send this
}) {
  // Validate input (ignore role field)
  const parsed = signupSchema.safeParse(input)

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0].message,
    }
  }

  const { email, password, displayName } = parsed.data

  const supabase = createServerClient()

  // Sign up with Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      data: {
        display_name: displayName || email.split('@')[0],
        // NEVER pass role here! It's set by DB trigger
      },
    },
  })

  if (error) {
    return {
      success: false,
      error: error.message === 'User already registered'
        ? 'Email already registered'
        : 'Signup failed. Please try again.',
    }
  }

  if (!data.user) {
    return {
      success: false,
      error: 'Signup failed. Please try again.',
    }
  }

  return { success: true }
}
```

### 4) Success Page

**File**: `app/(auth)/signup/success/page.tsx`

```typescript
export default function SignupSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8 text-center">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Check your email</h1>
          <p className="text-muted-foreground">
            We sent a verification link to your email address.
            Click the link to verify your account.
          </p>
          <p className="text-sm text-muted-foreground">
            Didn't receive the email? Check your spam folder or{' '}
            <a href="/signup/resend" className="text-primary hover:underline">
              resend verification email
            </a>
          </p>
        </div>
        <div className="pt-4">
          <a
            href="/login"
            className="text-sm text-primary hover:underline"
          >
            Return to login
          </a>
        </div>
      </div>
    </div>
  )
}
```

### 5) Auth Callback Handler

**File**: `app/auth/callback/route.ts`

```typescript
import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createServerClient()

    // Exchange code for session
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to home page after verification
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
```

See **016a** for complete callback implementation.

## Dev-Only Test Surfaces for E2E

To test email verification in CI/local without checking inbox:

### Option A: Supabase Admin API (Recommended)

Use Supabase Admin API to get confirmation token:

**File**: `tests/helpers/auth.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function getVerificationUrl(email: string): Promise<string> {
  // Get user by email
  const { data: users } = await supabaseAdmin.auth.admin.listUsers()
  const user = users.users.find(u => u.email === email)

  if (!user) throw new Error('User not found')

  // Generate email verification link
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'signup',
    email,
  })

  if (error) throw error

  return data.properties.action_link
}
```

Usage in tests:

```typescript
test('user can verify email', async ({ page }) => {
  await page.goto('/signup')
  // ... fill form and submit ...

  // Get verification link via Admin API
  const verifyUrl = await getVerificationUrl('test@example.com')

  // Visit verification link
  await page.goto(verifyUrl)

  // Continue testing...
})
```

### Option B: Test-Only Endpoint (Alternative)

**File**: `app/__test__/last-verification-link/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// Only available in non-production
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const supabase = createServerClient()

  // Get most recent unverified user
  const { data: users } = await supabase.auth.admin.listUsers()
  const unverifiedUser = users.users
    .filter(u => !u.email_confirmed_at)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

  if (!unverifiedUser) {
    return NextResponse.json({ error: 'No pending verifications' }, { status: 404 })
  }

  // Generate verification link
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'signup',
    email: unverifiedUser.email!,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    email: unverifiedUser.email,
    confirmationUrl: data.properties.action_link,
    createdAt: unverifiedUser.created_at,
  })
}
```

## Security & Reliability

### Role Assignment (Critical)
- **NEVER** accept `role` from client input
- DB trigger sets `role = 'user'` on signup
- Only admin seed scripts or privileged server paths can set `role = 'admin'`
- Tests MUST verify malicious role payloads are ignored

### Email Verification
- Supabase handles token generation, expiration, and one-time use
- Tokens are cryptographically secure
- Verification links expire after 24 hours (configurable in Supabase dashboard)

### Session Management
- Supabase creates session AFTER email verification (if `confirm_email` is enabled)
- If `confirm_email` is disabled, session is created immediately (not recommended for production)
- Configure in **Supabase Dashboard** → **Authentication** → **Settings** → **Email Auth**:
  ```
  ✅ Enable email confirmations
  ✅ Secure email change
  ```

### Password Requirements
- Minimum 8 characters (enforced client + server)
- Configure stronger requirements in Supabase dashboard if needed
- Supabase hashes passwords with bcrypt automatically

## Configuration

### Supabase Dashboard Settings

**Authentication** → **Settings**:

```
Site URL: https://cleanroom.website
Redirect URLs:
  - http://localhost:3000/auth/callback
  - https://preview.cleanroom.website/auth/callback
  - https://cleanroom.website/auth/callback

Email Auth:
  ✅ Enable email confirmations
  ✅ Secure email change
  ✅ Double confirm email changes

Password Requirements:
  Minimum length: 8
```

### Environment Variables

See **002b-environment-variables.md** for complete list.

Required for signup:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=https://cleanroom.website
```

## Exit Criteria

- Signup form renders with email, password, display name
- Server action validates input and calls Supabase Auth
- Supabase sends verification email
- Verification link confirms email and redirects to app
- User can login after verification
- User ALWAYS gets `role = 'user'` on signup
- Malicious role payloads are ignored
- Tests pass for happy path and error cases
- Test helpers can retrieve verification links for e2e tests
- No custom token tables in codebase
