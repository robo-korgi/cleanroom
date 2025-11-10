# 004 — Create Supabase Project

**Goal:** Provision Postgres, Auth, and Storage for Cleanroom.

## You Do
- [ ] Go to https://supabase.com/ → **New Project**.
- [ ] Organization: `Cleanroom` (or similar).
- [ ] Project name: `cleanroom`.
- [ ] Region: pick closest to your users (e.g., `us-east-1`).
- [ ] Database password: generate strong secret (store in vault).
- [ ] Wait for provisioning to finish.

### Capture these values (vault only; do not commit)
- [ ] **Project URL** (API URL)
- [ ] **Anon Key**
- [ ] **Service Role Key** (server only)
- [ ] **Database connection string**

## Recommended Settings
- [ ] Auth → **Email Auth** enabled (password or magic link).
- [ ] Auth → **Site URL**: `https://cleanroom.website` (add later once live; keep `http://localhost:3000` too).
- [ ] Storage → **Create bucket** `public` (public) and `private` (restricted).
- [ ] Database → Extend pool size if needed later.

## Exit Criteria
- Supabase project is visible and healthy.
- Keys saved securely.
- Ready to wire Vercel env vars in **006**.
