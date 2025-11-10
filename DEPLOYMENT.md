# Deployment Guide

This guide covers deploying Cleanroom to Vercel with production and preview environments.

## Prerequisites

- GitHub repository with code pushed
- Vercel account
- Domain registered at Namecheap: `cleanroom.website`
- Supabase project created (step 004 completed)

## Step 1: Create Vercel Project

1. Go to https://vercel.com/dashboard
2. Click **Add New** → **Project**
3. Import your Git repository
4. Framework Preset: **Next.js** (auto-detected)
5. Root Directory: `./` (default)
6. Build Command: `yarn build` (default)
7. Output Directory: `.next` (default)
8. Install Command: `yarn install` (default)
9. Click **Deploy**

## Step 2: Configure Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables, add:

### All Environments (Production, Preview, Development)

| Name | Value | Notes |
|------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[project-ref].supabase.co` | From Supabase dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | From Supabase dashboard (safe for client) |

### Production Only

| Name | Value | Notes |
|------|-------|-------|
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | From Supabase dashboard (SERVER ONLY) |

**Important:** The service role key should ONLY be set in Production environment and NEVER exposed to the client.

## Step 3: Add Custom Domains

In Vercel Dashboard → Project → Settings → Domains:

### Add Production Domain

1. Click **Add Domain**
2. Enter: `cleanroom.website`
3. Click **Add**

### Add Preview Domain

1. Click **Add Domain**
2. Enter: `preview.cleanroom.website`
3. Click **Add**

## Step 4: Configure DNS at Namecheap

Log in to Namecheap → Domain List → cleanroom.website → Advanced DNS

### Add/Update Records

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A Record | `@` | `76.76.21.21` | Automatic |
| CNAME Record | `www` | `cname.vercel-dns.com.` | Automatic |
| CNAME Record | `preview` | `cname.vercel-dns.com.` | Automatic |

**Note:** DNS propagation can take up to 48 hours, but typically completes in minutes.

## Step 5: Verify Domains

Back in Vercel → Settings → Domains:

1. Wait for both domains to show **Valid Configuration**
2. HTTPS certificates will be automatically provisioned via Let's Encrypt
3. Status should change to **Issued** and **Active**

This typically takes 5-10 minutes after DNS propagation.

## Step 6: Configure Primary Domain

In Vercel → Settings → Domains:

1. Find `cleanroom.website`
2. Click **Edit** → **Mark as Primary**
3. Enable redirect from `www.cleanroom.website` to `cleanroom.website`

## Step 7: Test Deployment

### Local Tests (Still Work)

```bash
yarn dev
yarn test:e2e
```

### Production Smoke Test

```bash
BASE_URL=https://cleanroom.website yarn test:e2e tests/deployment.spec.ts
```

### Preview Smoke Test

```bash
BASE_URL=https://preview.cleanroom.website yarn test:e2e tests/deployment.spec.ts
```

## Deployment Workflow

### Automatic Preview Deployments

- Every push to any branch triggers a preview deployment
- Preview URLs: `https://cleanroom-[hash].vercel.app`
- Stable preview alias: `https://preview.cleanroom.website`

### Manual Production Promotion

1. Push to `main` branch → Creates preview deployment
2. Run E2E tests against preview
3. If tests pass → Go to Vercel dashboard
4. Find the deployment → Click **Promote to Production**

**OR** use Vercel CLI:

```bash
vercel --prod
```

## Environment-Specific Testing

### Test Against Local

```bash
# Default
yarn test:e2e
```

### Test Against Preview

```bash
BASE_URL=https://preview.cleanroom.website yarn test:e2e
```

### Test Against Production

```bash
BASE_URL=https://cleanroom.website yarn test:e2e
```

## Security Checklist

- [ ] Service role key is ONLY in Production environment
- [ ] Service role key is NEVER used in client-side code
- [ ] HTTPS is active on both domains
- [ ] No mixed content warnings (all assets via HTTPS)
- [ ] `.env` and `.env.local` are in `.gitignore`
- [ ] Only use `.env.example` for templates

## Troubleshooting

### Domain not verifying

- Check DNS records are correct
- Wait for DNS propagation (use `dig cleanroom.website` to check)
- Ensure no conflicting records

### HTTPS certificate not issuing

- Ensure domain is verified first
- Wait 5-10 minutes
- Contact Vercel support if persists

### Environment variables not working

- Ensure variables are set for correct environment (Production/Preview/Development)
- Redeploy after changing environment variables
- Check variable names match exactly (case-sensitive)

### Preview URL vs Preview Domain

- Preview deployments get random URLs: `cleanroom-[hash].vercel.app`
- Stable preview domain: `preview.cleanroom.website` (manually assign in Vercel)
- Use stable preview domain for consistent testing

## Resources

- Vercel Docs: https://vercel.com/docs
- Vercel Domains: https://vercel.com/docs/concepts/projects/domains
- Supabase Dashboard: https://supabase.com/dashboard
