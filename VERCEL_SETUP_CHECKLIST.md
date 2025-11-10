# Vercel Setup Checklist (Step 006)

Quick reference for manual Vercel deployment setup.

## Prerequisites

✅ Step 003 completed (DNS at Namecheap configured)
✅ Step 004 completed (Supabase project created with credentials)
✅ Step 005 completed (Component galleries working)
✅ Code pushed to GitHub repository

## Supabase Credentials You'll Need

From your Supabase project (step 004):
- Organization: `robo-korgi`
- Project: `cleanroom`
- Region: `us-east-1`
- Public bucket: `cleanroom-public`
- Private bucket: `cleanroom-private`

Get these from https://supabase.com/dashboard/project/[project-ref]/settings/api:
- ✅ Project URL
- ✅ Anon Key (public)
- ✅ Service Role Key (secret)

## Vercel Setup Steps

### 1. Create Vercel Project (5 min)

- [ ] Go to https://vercel.com/dashboard
- [ ] Click **Add New** → **Project**
- [ ] Import GitHub repository: `robo-korgi/cleanroom`
- [ ] Framework: Next.js (auto-detected)
- [ ] Click **Deploy** (wait for first build)

### 2. Add Environment Variables (5 min)

Go to: Vercel Dashboard → Project Settings → Environment Variables

**Add for ALL environments (Production, Preview, Development):**

```
NEXT_PUBLIC_SUPABASE_URL = https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGc...
```

**Add for PRODUCTION ONLY:**

```
SUPABASE_SERVICE_ROLE_KEY = eyJhbGc...
```

- [ ] Variables added
- [ ] Production-only service key confirmed
- [ ] Click **Save**

### 3. Add Custom Domains (2 min)

Go to: Vercel Dashboard → Project Settings → Domains

- [ ] Click **Add Domain**
- [ ] Enter: `cleanroom.website`
- [ ] Click **Add Domain**
- [ ] Enter: `preview.cleanroom.website`
- [ ] Both domains added

### 4. Verify DNS (Already Done in Step 003)

DNS should already be configured from step 003. Verify records at Namecheap:

```
Type      Host       Value
────────────────────────────────────────
A         @          76.76.21.21
CNAME     www        cname.vercel-dns.com.
CNAME     preview    cname.vercel-dns.com.
```

- [ ] Records confirmed in Namecheap
- [ ] Vercel shows "Valid Configuration" for both domains

### 5. Wait for HTTPS Certificates (5-10 min)

Vercel automatically provisions Let's Encrypt certificates.

In Vercel → Settings → Domains, wait for:
- [ ] `cleanroom.website` → Status: **Issued** / **Active**
- [ ] `preview.cleanroom.website` → Status: **Issued** / **Active**

### 6. Set Primary Domain (1 min)

- [ ] In Vercel Domains, find `cleanroom.website`
- [ ] Click **Edit** → **Mark as Primary**
- [ ] Enable redirect from `www` → apex (if desired)

### 6.5. Disable Deployment Protection (IMPORTANT - 2 min)

**Required for automated testing to work!**

- [ ] Go to **Settings** → **Deployment Protection**
- [ ] Find "Protection for Preview Deployments"
- [ ] Set to **Disabled** (or **Public** if available)
- [ ] Click **Save**

**Note:** If you see a Vercel login page when running tests, this is the issue. See `VERCEL_AUTH_FIX.md` for details.

### 7. Test Deployment (5 min)

**Test Production:**
```bash
# Open in browser
open https://cleanroom.website

# Run smoke tests
BASE_URL=https://cleanroom.website yarn test:e2e tests/deployment.spec.ts
```

**Test Preview:**
```bash
# Open in browser
open https://preview.cleanroom.website

# Run smoke tests
BASE_URL=https://preview.cleanroom.website yarn test:e2e tests/deployment.spec.ts
```

- [ ] Production loads via HTTPS
- [ ] Preview loads via HTTPS
- [ ] `/components` page works
- [ ] `/blocks` page works
- [ ] No console errors
- [ ] All tests pass

## Exit Criteria

- [x] Vercel project created and connected to GitHub
- [ ] Environment variables configured correctly
- [ ] Both domains verified and showing HTTPS (green lock)
- [ ] Production accessible at https://cleanroom.website
- [ ] Preview accessible at https://preview.cleanroom.website
- [ ] Deployment tests pass on both environments
- [ ] Service role key is ONLY in Production environment

## Common Issues

**Domain not verifying?**
- Wait for DNS propagation (can take up to 48h, usually minutes)
- Check DNS records at Namecheap
- Try `dig cleanroom.website` to verify

**HTTPS not working?**
- Ensure domain is verified first
- Wait 5-10 minutes for certificate issuance
- Check Vercel → Domains for certificate status

**Environment variables not working?**
- Redeploy after adding variables
- Check variable names are exact (case-sensitive)
- Ensure `NEXT_PUBLIC_` prefix for client-side vars

**Preview domain shows old deployment?**
- You may need to manually assign preview.cleanroom.website to a specific deployment
- Vercel Dashboard → Deployments → Click deployment → Assign to preview domain

## Next Steps

After completing step 006:
- [ ] Move to step 007: Playwright matrix (local + prod + preview)
- [ ] Configure CI/CD for automated testing

## Resources

- Full guide: See `DEPLOYMENT.md`
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
