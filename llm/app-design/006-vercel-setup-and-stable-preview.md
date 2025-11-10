# 006 — Vercel setup + stable preview alias + HTTPS (App Router)

## Objective
Connect the app to Vercel, attach domains, establish a stable preview alias, and ensure HTTPS via Vercel’s automatic certificates.

## Domains
- Production: `https://cleanroom.website`
- Stable preview: `https://preview.cleanroom.website`

## Steps
1) Create/import the project in Vercel (framework: Next.js).
2) Project → Settings → Domains → Add:
   - `cleanroom.website`
   - `preview.cleanroom.website`
3) Registrar DNS (Namecheap):
   - `@` (apex) → **A** → `76.76.21.21` (Vercel anycast)
   - `www` → **CNAME** → `cname.vercel-dns.com.` (redirect `www` → apex in Vercel)
   - `preview` → **CNAME** → `cname.vercel-dns.com.`
4) Wait until both hostnames show **Verified** in Vercel.

## HTTPS / SSL
- No purchase needed at the registrar.
- **Automatic** Let’s Encrypt certificates are provisioned by Vercel once the domains are verified.
- Confirm certificate state in Vercel → Domains (status should be Issued/Active).

## Optional hardening (post‑verification)
- Set `cleanroom.website` as **Primary** and configure `www → apex` redirect in Vercel.
- Enable HSTS (HTTP Strict Transport Security) at the app level when ready; ensure all subresources are HTTPS.
- Consider adding a redirect rule to force HTTPS for all requests if not already enforced by the platform.

## Stable preview alias use
- The preview alias remains a fixed hostname.
- Before running preview tests, repoint the alias to the latest preview deployment.
- Playwright preview tests should target the stable alias, not hash URLs.

## Deployment policy
- Do not auto‑promote to production.
- Production only changes via explicit promotion or domain alias reassignment after tests pass.
