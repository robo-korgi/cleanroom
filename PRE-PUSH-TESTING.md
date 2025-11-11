# Pre-Push Testing

## Overview

A git pre-push hook automatically runs local-docker tests when pushing to the **staging** branch. This provides fast feedback on code quality before code reaches the preview environment.

## How It Works

### When Pushing to Staging

```bash
git push origin staging
```

**What happens:**
1. Hook detects you're on the staging branch
2. **🐳 Local Docker** tests run (localhost:3000)
3. If tests pass → ✅ Push proceeds
4. If tests fail → ❌ Push is blocked

### When Pushing to Other Branches

```bash
git push origin feature/my-branch
git push origin main
```

**What happens:**
- 📝 Hook skips testing
- ✅ Push proceeds immediately
- Shows message: "Skipping pre-push tests. Tests only run when pushing to staging."

## Example Output

### When Pushing to Staging

```bash
$ git push origin staging

🧪 Pre-push tests for staging branch...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🐳 Testing local-docker (localhost:3000)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1 passed (728ms)
✅ local-docker PASSED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Push to staging allowed.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Enumerating objects: 5, done.
...
```

### When Pushing to Other Branches

```bash
$ git push origin feature/my-feature

📝 Branch: feature/my-feature (not staging)
   Skipping pre-push tests.
   Tests only run when pushing to staging.

Enumerating objects: 5, done.
...
```

## When Tests Fail

If local-docker tests fail, the push to staging is blocked:

```bash
❌ local-docker FAILED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ Push to staging blocked.

To bypass this check (emergencies only):
  git push --no-verify
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Bypassing the Hook

In emergencies (e.g., hotfix when remote environments are down), bypass with:

```bash
git push --no-verify
```

**⚠️ Use sparingly!** This skips all quality gates.

## When to Bypass

### ✅ Acceptable use cases:
- Docker is down and can't be started
- Emergency staging push needed immediately
- Working on infrastructure changes that break tests

### ❌ Do NOT bypass for:
- "Tests are slow and I'm in a hurry"
- "I'll fix it later"
- Avoiding writing/fixing tests

**Note:** The hook only runs on staging pushes. Feature branches and main don't trigger tests.

## Troubleshooting

### Docker not running
```
Error: Cannot connect to Docker
```

**Fix:** Start Docker services first
```bash
yarn docker:up
```

### Network timeout on remote tests
```
Error: page.goto: Timeout 30000ms exceeded
```

**Fix:** Check internet connection or bypass if environments are down
```bash
git push --no-verify
```

### Tests pass locally but fail in hook
```
❌ local-docker FAILED
```

**Debug:**
```bash
# Run tests manually to see full output
yarn test tests/smoke.spec.ts

# Check Docker logs
yarn docker:logs

# Restart Docker services
yarn docker:restart
```

## Test Execution Time

Typical timing:
- Local Docker: ~700ms

**Total:** < 1 second per staging push

**Note:** Full multi-environment testing (local + staging + prod) happens during `yarn deploy`, not on push.

## What Gets Tested

On staging pushes, runs `tests/smoke.spec.ts` against local-docker which verifies:
- Homepage loads successfully
- "Cleanroom" text is visible
- No critical rendering failures

**Full testing happens during deployment:**
- `yarn deploy` runs local-docker, staging, AND production tests
- See DEPLOYMENT-WORKFLOW.md for details

## Hook Location

The hook is installed at:
```
.git/hooks/pre-push
```

**Note:** Git hooks are **not** committed to the repository. Each team member needs to install them manually or use a tool like Husky.

## Future: Husky Integration

To automatically install hooks for all team members:

```bash
# Install Husky
yarn add -D husky

# Initialize
npx husky init

# Move hook to Husky
mv .git/hooks/pre-push .husky/pre-push
```

This ensures all developers have consistent pre-push testing.

## Philosophy

> **"Main should always be deployable."**

Pre-push testing enforces this by preventing broken code from entering the repository. It catches issues **before** they become someone else's problem.

## Metrics

Track these over time:
- Frequency of `--no-verify` usage (should be rare)
- Test failures caught by hook (prevented bad pushes)
- Average hook execution time (optimize if > 15s)

## Quality Gates Summary

| Action | Gate | What's Tested | On Failure |
|--------|------|---------------|------------|
| `git push origin staging` | Pre-push hook | Local-Docker | Push blocked |
| `git push origin <other>` | Pre-push hook | (skipped) | - |

For production deployment quality gates, see **DEPLOYMENT-WORKFLOW.md**:
- `yarn deploy` runs local + staging + prod tests
- Auto-rollback if production tests fail
