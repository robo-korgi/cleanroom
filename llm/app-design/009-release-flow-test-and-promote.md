# 009 — Release flow: preview → test → promote → rollback

## Objective
Promote to prod only when tests pass. Prod remains pinned to last good build by default.

## Flow
1. Create a new Preview deployment.
2. Point stable preview alias `https://preview.cleanroom.website` to that Preview deployment.
3. Run Playwright tests locally against:
   - `local-docker`
   - `vercel-prod`
   - `vercel-preview` (stable alias)
4. If all pass, manually promote Preview to Production OR point the prod domain to the chosen deployment.
5. To roll back, reassign the prod domain to a previous deployment.

## Outcomes
- Preview deployments do not impact prod until explicitly promoted.
- Stable preview alias eliminates dependence on hash URLs.
## Reminder: Stable Preview Alias Update (Manual)
Before running the preview Playwright tests:
- Identify the latest Preview deployment in Vercel.
- Point `https://preview.cleanroom.website` to that deployment.
- Then run the test matrix (docker, prod, preview).

This keeps preview testing consistent without auto-promotion or automation.

## Authorization guard cross‑reference
If deployment promotion or rollback actions are ever exposed via HTTP or server actions,
they must be protected with the centralized guard from **017**:

```
requireRole(session, 'admin')
```

Promotion and rollback are **admin-only** operations. Public users must never trigger them.
