#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Production Deployment Workflow"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Ensure we're in the repo root
cd "$(git rev-parse --show-toplevel)"

# Check current branch
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [[ "$current_branch" != "staging" ]]; then
  echo "❌ Error: Must be on staging branch to deploy to production"
  echo "   Current branch: $current_branch"
  echo ""
  echo "   Switch to staging first:"
  echo "   git checkout staging"
  exit 1
fi

echo "✅ On staging branch"
echo ""

# Step 1: Check for uncommitted changes
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 1/7: Checking git status..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [[ -n $(git status --porcelain) ]]; then
  echo "❌ Error: Uncommitted changes detected"
  echo ""
  git status --short
  echo ""
  echo "   Commit or stash your changes first:"
  echo "   git add . && git commit -m \"message\""
  exit 1
fi

echo "✅ No uncommitted changes"
echo ""

# Step 2: Test local-docker
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 2/7: Testing local-docker..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ! yarn test tests/smoke.spec.ts; then
  echo ""
  echo "❌ local-docker tests FAILED"
  echo "   Fix tests before deploying to production"
  exit 1
fi

echo "✅ local-docker tests PASSED"
echo ""

# Step 3: Test staging
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 3/7: Testing staging environment..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ! yarn test:staging tests/smoke.spec.ts; then
  echo ""
  echo "❌ staging tests FAILED"
  echo "   Fix staging before deploying to production"
  exit 1
fi

echo "✅ staging tests PASSED"
echo ""

# Step 4: Save current production deployment (for rollback)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 4/7: Saving current production state..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Get current production deployment URL
# Use '|| true' to prevent pipefail from exiting if no deployment found
PREV_DEPLOYMENT=$(vercel ls cleanroom.website --prod 2>/dev/null | head -2 | tail -1 || true)

if [[ -z "$PREV_DEPLOYMENT" || "$PREV_DEPLOYMENT" == "Vercel CLI"* ]]; then
  echo "⚠️  Warning: Could not find previous production deployment"
  echo "   Rollback will not be available if deployment fails"
  PREV_DEPLOYMENT="none"
else
  echo "✅ Saved previous deployment: $PREV_DEPLOYMENT"
fi
echo ""

# Step 5: Deploy to production
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 5/7: Deploying to production..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if ! npx vercel --prod; then
  echo ""
  echo "❌ Deployment to production FAILED"
  exit 1
fi

echo ""
echo "✅ Deployment to production completed"
echo ""

# Wait for deployment to be fully live
echo "⏳ Waiting 10 seconds for deployment to stabilize..."
sleep 10
echo ""

# Step 6: Test production
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 6/7: Testing production environment..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ! yarn test:prod tests/smoke.spec.ts; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "❌ PRODUCTION TESTS FAILED!"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  # Attempt rollback
  if [[ "$PREV_DEPLOYMENT" != "none" ]]; then
    echo "🔄 Rolling back to previous deployment..."
    echo "   Previous: $PREV_DEPLOYMENT"
    echo ""

    if vercel alias set "$PREV_DEPLOYMENT" cleanroom.website; then
      echo "✅ Rollback successful"
      echo "   Production restored to: $PREV_DEPLOYMENT"
    else
      echo "❌ Rollback FAILED!"
      echo "   Manual intervention required via Vercel dashboard"
    fi
  else
    echo "⚠️  No previous deployment found - cannot auto-rollback"
    echo "   Manual intervention required via Vercel dashboard"
  fi

  echo ""
  exit 1
fi

echo "✅ production tests PASSED"
echo ""

# Step 7: Merge staging → main and push
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 7/7: Merging staging → main..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Checkout main
git checkout main

# Merge staging into main
if ! git merge staging -m "chore: merge staging to main after successful production deployment"; then
  echo "❌ Merge conflict detected"
  echo "   Resolve conflicts manually, then:"
  echo "   git push origin main"
  exit 1
fi

# Push main
if ! git push origin main; then
  echo "❌ Failed to push main"
  echo "   Push manually with: git push origin main"
  exit 1
fi

echo "✅ Merged staging → main and pushed"
echo ""

# Return to staging branch
git checkout staging

# Final summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 PRODUCTION DEPLOYMENT SUCCESSFUL!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Summary:"
echo "  ✅ All tests passed (local, staging, production)"
echo "  ✅ Deployed to: https://cleanroom.website"
echo "  ✅ Merged staging → main"
echo "  ✅ Returned to staging branch"
echo ""
echo "Next steps:"
echo "  - Monitor production: https://cleanroom.website"
echo "  - Check Vercel dashboard for metrics"
echo "  - Continue development on staging branch"
echo ""
