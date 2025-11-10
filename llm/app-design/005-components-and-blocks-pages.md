# 005 — Components & Blocks Gallery Pages (TEST FIRST)

Meta:
- updated: 2025-11-10T06:35:22.246293Z
- scope: Next.js App Router (or SvelteKit analog), Tailwind, Radix primitives
- no-code: design/spec only for LLM → dev handoff

## Objective
Establish **component** and **block** galleries before wiring CRUD. These pages are the single source of truth for UI primitives used by Users CRUD.

Routes:
- `/components` — atomic UI pieces
- `/blocks` — composable UI sections

## TDD (Playwright) — RED first
- `@smoke` `/components` renders heading “Components”.
- `@smoke` `/blocks` renders heading “Blocks”.

### Components (must exist before CRUD)
- **Inputs** (with labels, help text, and error text):
  - text, textarea, email, url, password (with show/hide), number (int/float), select, multiselect, checkbox, radio, switch, date, datetime
  - data-testids: `cmp-input-{type}`
- **Alerts**: error, success, warning, info  
  - data-testids: `cmp-alert-error|success|warning|info`
- **Toasts**: error, success, warning, info (programmatic trigger demo)  
  - `cmp-toast-{variant}` and a trigger button `cmp-toast-trigger-{variant}`
- **Button** (primary) — `ui-button`
- **Card** — `ui-card`
- **Table (info-list style)** — optimized for user index; no row dividers, two-column label/value layout; `cmp-table-infolist`
- **Pagination** — numeric + prev/next with disabled states; `cmp-pagination`

### Blocks (built after components)
- **Form Block** with:
  - label, help/information text, inline error messages
  - submit + cancel action row
  - data-testids: `blk-form`, `blk-form-error-summary`
- **User Profile Card Block** — avatar, display name, email, actions slot; `blk-user-profile-card`
- **Info List + Pagination Block** — wraps the info-list table + `cmp-pagination`; `blk-info-list`
- **Table + Pagination Block** — standard table + `cmp-pagination`; `blk-table`

### Existing Block
- **Nav (public)**: logo + spacer + Sign In button (`nav`, `nav-logo`, `nav-signin`)

## Exit Criteria
- All above components/blocks demonstrated on their respective gallery pages and covered with simple rendering assertions.
