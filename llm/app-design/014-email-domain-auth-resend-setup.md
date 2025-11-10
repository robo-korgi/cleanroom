# 014 — Email domain auth + Resend + React Email (branded)

## Objective
Authorize domain for transactional email and enable branded verification mailers. Provider: **Resend**. Templates: **React Email**. No shell scripts.

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
