# 016 — Local Release Workflow (No CI)

## Objective
Release new code safely without GitHub Actions or CI pipelines, using:
- Preview deployments
- Stable preview alias
- Local testing gates
- Manual production promotion

## Flow Summary
1. Deploy to preview (this happens automatically when you push).
2. Set or update:
   **https://preview.cleanroom.website** → the new preview deployment.
3. Run tests locally:
   - Docker environment
   - Production environment
   - Stable Preview environment
4. If tests pass:
   - Promote the preview to production.
5. If anything goes wrong:
   - Roll back by reassigning the production domain to a previous deployment.

## Benefits
- Fully controlled local development workflow.
- Zero dependence on CI services.
- Production remains stable until explicitly promoted.
