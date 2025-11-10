# 023 — User CRUD Pages (TEST FIRST)

Meta:
- created: 2025-11-10T06:35:22.246293Z
- depends-on: 005, 018, 020, 021, 022
- matrix: local-docker, vercel-preview, vercel-prod

## Routes & Permissions
- `/users` — **admin only** list (uses Info List + Pagination Block)
- `/u/[uuid]` — **public** profile (uses User Profile Card Block)
- `/account` — **self** edit (uses Form Block)
- `/admin/users/[uuid]/edit` — **admin** edit
- `/admin/users/new` — **admin** create

Auth/roles per `018-authorization-guards.md`. Users are referenced by **public UUID** from `021`.

## Forms — Fields
- Core fields: displayName, email (admin only edit), avatarUrl (via upload later), locale, timeZone
- Properties (JSONB) rendered from generated Zod schema:
  - text, int, float, bool, date, datetime, enum, multiselect, etc.
- Error surfacing:
  - Inline per-field error (from zod)
  - Error summary in `blk-form-error-summary`

## UI Composition
- Pages must strictly use **components** and **blocks** from `005`:
  - Inputs, Alerts (for top-level success/error), Toasts (on save/delete), Tables/InfoList, Pagination
- Admin list view (`/users`):
  - Search (optional), paginated info list table
  - Row actions: View (`/u/[uuid]`), Edit, Delete (confirm dialog)
- Profile view (`/u/[uuid]`):
  - Profile card + read-only properties
- Self-edit (`/account`):
  - Editable subset (no role, no email unless verified flow)

## TDD — Playwright
Tags: `@smoke`, `@auth`, `@admin`
1. `@admin` `/users` shows paginated list with actions; clicking “Edit” loads admin edit page.
2. `@auth` regular user cannot access `/users` or `/admin/...` (gets 403 or redirect).
3. `@smoke` `/u/[uuid]` renders profile card for seeded user.
4. `@auth` `/account` updates profile; success alert and toast appear; values persist on reload.
5. `@admin` create new user; validation errors render inline; success redirects to `/users` with toast.
6. `@admin` delete user; confirm; toast + row removed; pagination updates correctly.

## Edge Cases
- Invalid `uuid` → 404
- Concurrent update → optimistic error alert
- Large result sets → pagination UI stable across pages

## Exit Criteria
- All tests pass across environments with seeds from `022`.
