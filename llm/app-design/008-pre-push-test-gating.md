# 008 — Local pre-push test gate (concept)

## Objective
Prevent pushes if tests fail, enforced locally. No external CI required.

## Behavior
- On `git push`, run the Playwright matrix:
  - `vercel-preview` (stable alias host)
  - `vercel-prod` (live prod domain)
  - `local-docker` (local app)
- If any fail, block the push.
- To bypass during emergencies, use `--no-verify`.

## Notes
- This ensures main is always green without any CI system.
- No hook code content in this document by design.
