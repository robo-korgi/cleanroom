# Deployment Workflow

## Overview

Cleanroom uses a **test-gated deployment workflow** that ensures code quality across all environments before reaching production.

## Branch Strategy

- **`staging`** - Preview environment (https://preview.cleanroom.website)
- **`main`** - Production environment (https://cleanroom.website)

## Workflow

### 1. Development → Staging

**Work on staging branch:**
```bash
git checkout staging
# make changes
git add .
git commit -m "feat: new feature"
```

**Push to staging:**
```bash
git push origin staging
```

**What happens:**
- ✅ Pre-push hook runs local-docker tests
- ✅ If tests pass → push succeeds
- ❌ If tests fail → push is blocked
- 🚀 Vercel auto-deploys to preview.cleanroom.website

### 2. Staging → Production

**Deploy to production:**
```bash
yarn deploy
```

**What happens (7 steps):**

#### Step 1: Git Status Check
- ✅ Verifies no uncommitted changes
- ❌ Blocks if dirty working tree

#### Step 2: Local-Docker Tests
- 🐳 Runs smoke tests against localhost:3000
- ❌ Blocks deploy if tests fail

#### Step 3: Staging Tests
- 🔍 Runs smoke tests against preview.cleanroom.website
- ❌ Blocks deploy if tests fail

#### Step 4: Save Current Production
- 💾 Records current production deployment URL
- ℹ️ Needed for rollback if new deployment fails

#### Step 5: Deploy to Production
- 🚀 Executes `npx vercel --prod`
- ⏳ Waits 10 seconds for deployment to stabilize

#### Step 6: Production Tests
- 🧪 Runs smoke tests against cleanroom.website
- ❌ If tests fail → **automatic rollback**
- ✅ If tests pass → proceed to merge

#### Step 7: Merge Staging → Main
- 🔀 Merges staging into main
- 📤 Pushes main to remote
- ↩️ Returns to staging branch

## Bypass Mechanisms

### Pre-Push Hook Bypass

**Emergency only:**
```bash
git push --no-verify
```

**When to use:**
- Docker is down and can't be started quickly
- Emergency hotfix needed immediately
- Working on infrastructure changes that break tests temporarily

### Deploy Script Bypass

**Not recommended - manual process:**
```bash
# Deploy directly (skips all gates)
npx vercel --prod

# Then manually merge
git checkout main
git merge staging
git push origin main
git checkout staging
```

**Only use when:**
- Deploy script has a bug preventing deployment
- Emergency production fix needed
- You understand the risks of bypassing quality gates

## Rollback

### Automatic Rollback

If production tests fail after deployment, the script automatically:
1. Retrieves the previous production deployment URL
2. Points cleanroom.website back to the old deployment
3. Exits with error

### Manual Rollback

If you need to manually rollback:

```bash
# List recent deployments
vercel ls --prod

# Copy the deployment URL you want to restore
# Set it as the production alias
vercel alias set <deployment-url> cleanroom.website
```

## Testing Each Environment

### Local Docker
```bash
yarn test tests/smoke.spec.ts
```

### Staging (Preview)
```bash
yarn test:staging tests/smoke.spec.ts
```

### Production
```bash
yarn test:prod tests/smoke.spec.ts
```

## Common Scenarios

### Scenario 1: Normal Development

```bash
# On staging
git checkout staging

# Make changes, commit
git add .
git commit -m "feat: add new feature"

# Push to staging (runs local-docker tests)
git push origin staging

# Test on preview.cleanroom.website
# When ready, deploy to prod
yarn deploy
```

### Scenario 2: Hotfix Production

```bash
# On staging
git checkout staging

# Make fix, commit
git add .
git commit -m "fix: critical bug"

# Push to staging
git push origin staging

# Deploy immediately to prod
yarn deploy
```

### Scenario 3: Tests Failing on Staging

```bash
# Push blocked by pre-push hook
git push origin staging
# ❌ local-docker tests FAILED

# Fix the issue
# Re-run tests
yarn test tests/smoke.spec.ts

# Try push again
git push origin staging
```

### Scenario 4: Production Tests Fail After Deploy

```bash
yarn deploy

# ... deploys successfully ...
# ❌ PRODUCTION TESTS FAILED!
# 🔄 Rolling back to previous deployment...
# ✅ Rollback successful

# Now fix the issue before trying again
```

### Scenario 5: Can't Push Due to Docker Issues

```bash
# Docker won't start and you need to push urgently
git push --no-verify origin staging

# Or fix Docker
yarn docker:up
```

## Quality Gates Summary

| Action | Gate | What's Tested | On Failure |
|--------|------|---------------|------------|
| `git push origin staging` | Pre-push hook | Local-Docker | Push blocked |
| `yarn deploy` Step 2 | Deploy script | Local-Docker | Deploy cancelled |
| `yarn deploy` Step 3 | Deploy script | Staging | Deploy cancelled |
| `yarn deploy` Step 6 | Deploy script | Production | Auto-rollback |

## File Locations

- **Pre-push hook:** `.git/hooks/pre-push`
- **Deploy script:** `scripts/deploy-prod.sh`
- **Package.json command:** `yarn deploy`

## Best Practices

1. **Always work on staging branch**
   - Never commit directly to main

2. **Test locally before pushing**
   ```bash
   yarn test tests/smoke.spec.ts
   ```

3. **Verify staging before deploying to prod**
   - Visit https://preview.cleanroom.website
   - Click through critical flows

4. **Monitor production after deploy**
   - Check https://cleanroom.website
   - Watch Vercel dashboard for errors

5. **Don't bypass quality gates**
   - Use `--no-verify` sparingly
   - Always fix the root cause

6. **Keep staging and main in sync**
   - `yarn deploy` does this automatically
   - Don't manually merge unless necessary

## Troubleshooting

### "Must be on staging branch to deploy"
```bash
git checkout staging
```

### "Uncommitted changes detected"
```bash
git add .
git commit -m "message"
# or
git stash
```

### "local-docker tests FAILED"
```bash
# Check Docker is running
docker ps

# Restart Docker services
yarn docker:restart

# View logs
yarn docker:logs
```

### "staging tests FAILED"
```bash
# Verify preview URL is correct
curl https://preview.cleanroom.website

# Check if preview deployment succeeded in Vercel dashboard
```

### "Rollback FAILED"
```bash
# Manual rollback via Vercel CLI
vercel ls --prod
vercel alias set <previous-deployment-url> cleanroom.website

# Or use Vercel dashboard
# https://vercel.com/dashboard
# → Select project → Deployments → Promote previous deployment
```

### "Merge conflict detected"
```bash
# Resolve conflicts
git status
# Edit conflicting files
git add .
git commit

# Then push main manually
git push origin main
git checkout staging
```

## Metrics to Track

- **Deploy frequency:** How often you run `yarn deploy`
- **Rollback frequency:** How often production tests fail
- **Bypass frequency:** How often `--no-verify` is used
- **Test execution time:** Optimize if consistently > 15s

## Future Improvements

- Add Slack/Discord notifications for deployments
- Implement blue-green deployments
- Add performance budget checks
- Run visual regression tests
- Add deployment approval step
