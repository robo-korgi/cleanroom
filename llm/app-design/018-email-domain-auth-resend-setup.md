# 018 — Email domain auth + Resend + React Email (branded)

Meta:
- created: 2025-11-10
- depends-on: 016a (Supabase Auth)
- scope: Optional Resend SMTP for branded Supabase Auth emails

## Objective
Authorize domain for transactional email and enable branded verification mailers sent by Supabase Auth. Provider: **Resend** (as custom SMTP for Supabase). Templates: **React Email** (optional for custom emails). No shell scripts.

**Note**: This step is OPTIONAL. Supabase Auth sends verification emails by default using Supabase's SMTP. Configure Resend as custom SMTP only if you want:
- Branded email templates with your logo/styling
- Better deliverability with your own domain
- Custom email content beyond Supabase's default templates

See **016a-session-management-supabase-auth.md** for Supabase Auth setup and default email verification flow.

## Domain: cleanroom.website
Sender: `no-reply@cleanroom.website`

## Provider setup
1. Create Resend account + project.
2. Create a **sending domain**: `cleanroom.website`.
3. Capture required DNS values from Resend for SPF + DKIM.

## DNS (Namecheap) — TXT records only
Add/verify the following TXT records (values come from Resend; examples shown):

- SPF (authorize Resend):
  - **Host:** `@`
  - **Type:** TXT
  - **Value:** `v=spf1 include:resend.com ~all`

- DKIM (signing):
  - **Host:** `resend._domainkey`
  - **Type:** TXT
  - **Value:** (Resend-provided long value)

- DMARC (policy; start permissive, can tighten later):
  - **Host:** `_dmarc`
  - **Type:** TXT
  - **Value:** `v=DMARC1; p=none; rua=mailto:postmaster@cleanroom.website`

Do not modify A/CNAME records from earlier steps. No SSL purchase at registrar.

## Verification state
- Wait for Resend to show **Domain Verified** and **DKIM Verified**.
- Keep SPF/DMARC present for deliverability and alignment.

## App dependencies (Next.js App Router)
- `resend` (Node SDK)
- `@react-email/components` (optional: `react-email` dev tooling)

## Environment (project secrets)
- `RESEND_API_KEY` (project-level secret)
- `MAIL_FROM=no-reply@cleanroom.website`
- `APP_URL=https://cleanroom.website` (prod canonical)
- `PREVIEW_URL=https://preview.cleanroom.website` (stable preview alias)

## React Email templating (structure)
Create a mail template component in app code (no runtime dev server needed). The component receives `{ verifyUrl }` and renders a branded layout (logo, typography, CTA button). Keep inline-safe styles.

## Send API (high level)
- Server-only function that composes props and calls Resend’s send endpoint with `from`, `to`, `subject`, and HTML from the React Email component render.
- Do not send from client. Call only inside server actions/route handlers.

## Deliverability
- Use a real domain mailbox for `MAIL_FROM` (or a valid alias).
- Keep SPF/DKIM/DMARC valid.
- Avoid spammy content; include brand name and physical contact info in footer (optional).

## Supabase Custom SMTP Configuration

To use Resend as Supabase's email provider:

### 1. Get Resend SMTP Credentials

After verifying your domain in Resend:
- SMTP Host: `smtp.resend.com`
- SMTP Port: `465` (SSL) or `587` (TLS)
- Username: `resend`
- Password: Your Resend API Key (starts with `re_`)

### 2. Configure in Supabase Dashboard

**Supabase Dashboard** → **Authentication** → **Email Templates** → **Settings**:

```
SMTP Host: smtp.resend.com
SMTP Port: 465
SMTP User: resend
SMTP Password: re_xxxxxxxxxxxx
Sender Email: no-reply@cleanroom.website
Sender Name: Cleanroom
```

### 3. Customize Email Templates (Optional)

**Supabase Dashboard** → **Authentication** → **Email Templates**:

Available templates:
- **Confirm signup**: Sent when user signs up
- **Magic Link**: Sent for passwordless login
- **Change Email Address**: Sent when user changes email
- **Reset Password**: Sent for password reset

Each template supports these variables:
- `{{ .ConfirmationURL }}` - Verification link (Supabase-managed)
- `{{ .Token }}` - Verification token (if you want to build custom URL)
- `{{ .Email }}` - User's email
- `{{ .SiteURL }}` - Your app URL (from Supabase config)

**Example branded signup template**:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Confirm your email</title>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #2563eb;">Welcome to Cleanroom!</h1>
    <p>Thanks for signing up. Please confirm your email address to get started.</p>
    <p>
      <a href="{{ .ConfirmationURL }}"
         style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
        Verify Email Address
      </a>
    </p>
    <p style="color: #666; font-size: 14px;">
      Or copy and paste this link: <br>
      <a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a>
    </p>
    <p style="color: #999; font-size: 12px; margin-top: 40px;">
      Cleanroom | cleanroom.website
    </p>
  </div>
</body>
</html>
```

### 4. React Email for Custom Transactional Emails

For emails NOT handled by Supabase Auth (e.g., notifications, newsletters), use React Email + Resend SDK:

**File**: `emails/VerifyEmail.tsx`

```tsx
import { Button, Html, Head, Body, Container, Heading, Text } from '@react-email/components'

interface VerifyEmailProps {
  verifyUrl: string
}

export default function VerifyEmail({ verifyUrl }: VerifyEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'system-ui, sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Heading style={{ color: '#2563eb' }}>Welcome to Cleanroom!</Heading>
          <Text>Thanks for signing up. Please confirm your email address.</Text>
          <Button href={verifyUrl} style={{
            padding: '12px 24px',
            background: '#2563eb',
            color: 'white',
            borderRadius: '6px'
          }}>
            Verify Email Address
          </Button>
        </Container>
      </Body>
    </Html>
  )
}
```

**Usage** (for custom emails only):

```typescript
// lib/email.ts
import { Resend } from 'resend'
import VerifyEmail from '@/emails/VerifyEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendCustomEmail(to: string, verifyUrl: string) {
  await resend.emails.send({
    from: 'no-reply@cleanroom.website',
    to,
    subject: 'Verify your email',
    react: VerifyEmail({ verifyUrl }),
  })
}
```

**Important**: For Supabase Auth emails (signup, password reset, magic link), use Supabase's template editor. Only use React Email + Resend SDK for custom transactional emails outside of authentication.

## Testing Email Delivery

### Development (Local)

Use **Mailpit** instead of Resend (see **002a-docker-compose-local-dev.md**):

```bash
# .env.local - don't configure Supabase custom SMTP locally
# Supabase will use local inbucket (port 54325) when using supabase CLI
# Or use Mailpit for custom emails via Resend SDK

# For custom emails (non-Supabase Auth)
USE_MAILPIT=true
SMTP_HOST=localhost
SMTP_PORT=1025
```

Mailpit UI: http://localhost:8025

### Preview/Production

Configure Supabase custom SMTP in dashboard (per environment).
