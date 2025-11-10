# Environment Variables Setup

## How It Works

Package.json scripts **do not** automatically load `.env` files. We use `dotenv-cli` to load them explicitly.

## Setup for Local Testing

### 1. Create `.env.local` file

```bash
cp .env.local.example .env.local
```

### 2. Add your secrets

Edit `.env.local` and add your Vercel bypass secret (only needed if Deployment Protection is enabled):

```bash
# .env.local
VERCEL_AUTOMATION_BYPASS_SECRET=your-actual-secret-here
```

Get the secret from:
**Vercel Dashboard** → **Settings** → **Deployment Protection** → **Protection Bypass for Automation**

### 3. Scripts now work automatically

```bash
# These now load .env.local automatically:
yarn test:e2e:pre   # Tests preview.cleanroom.website
yarn test:e2e:prod  # Tests cleanroom.website
```

## How the Scripts Work

**Before (without dotenv-cli):**
```json
"test:e2e:pre": "BASE_URL=https://preview.cleanroom.website yarn test:e2e"
```
❌ Cannot access secrets from `.env.local`

**After (with dotenv-cli):**
```json
"test:e2e:pre": "dotenv -e .env.local -- bash -c 'BASE_URL=https://preview.cleanroom.website yarn test:e2e'"
```
✅ Loads `.env.local` → then runs the command with those vars available

## What Gets Loaded

| File | Purpose | Committed to Git? | Loaded by |
|------|---------|-------------------|-----------|
| `.env.example` | Template for Vercel/production vars | ✅ Yes | Manual reference |
| `.env.local.example` | Template for local secrets | ✅ Yes | Manual copy |
| `.env.local` | Your actual local secrets | ❌ No (gitignored) | dotenv-cli |

## Alternative: Manual Override

If you don't want to create `.env.local`, you can still pass the variable directly:

```bash
VERCEL_AUTOMATION_BYPASS_SECRET=xyz yarn test:e2e:pre
```

But using `.env.local` is cleaner and more secure.

## If Deployment Protection is Disabled

If you disabled Deployment Protection in Vercel (recommended), you **don't need** the bypass secret at all:

```bash
# .env.local can be empty or not exist
# These will work fine:
yarn test:e2e:pre
yarn test:e2e:prod
```

The `dotenv-cli` will gracefully handle missing `.env.local` files.

## Security Notes

- ✅ `.env.local` is in `.gitignore` (never committed)
- ✅ Only use `.env.local` for local development secrets
- ✅ Production secrets go in Vercel Dashboard (never in code)
- ❌ Never commit real secrets to git
- ❌ Never put secrets in `.env.example` files

## Testing the Setup

```bash
# 1. Create .env.local (if using bypass secret)
echo "VERCEL_AUTOMATION_BYPASS_SECRET=your-secret" > .env.local

# 2. Run preview tests
yarn test:e2e:pre

# 3. Run production tests
yarn test:e2e:prod

# 4. Or run specific test file
yarn test:e2e:pre tests/deployment.spec.ts
```

## Troubleshooting

**"dotenv: command not found"**
```bash
yarn add -D dotenv-cli
```

**"Failed to load .env.local"**
- It's okay if the file doesn't exist (dotenv-cli handles this gracefully)
- Only create it if you need the bypass secret

**Tests still hitting login page**
- Either disable Deployment Protection in Vercel (easiest)
- Or add the correct bypass secret to `.env.local`

---

**TL;DR:**
1. If Deployment Protection is disabled: You're done, just run `yarn test:e2e:pre`
2. If Deployment Protection is enabled: Create `.env.local` with your bypass secret, then run `yarn test:e2e:pre`
