# 005 — Components & Blocks Gallery Pages (TEST FIRST)

Meta:
- updated: 2025-11-10T06:35:22.246293Z
- scope: Next.js App Router, shadcn/ui (Radix + Tailwind)
- no-code: design/spec only for LLM → dev handoff

## Objective
Establish **component** and **block** galleries before wiring CRUD. These pages are the single source of truth for UI primitives used by Users CRUD.

All components must use **shadcn/ui**. Install components via:
```bash
npx shadcn@latest add <component-name>
```

Routes:
- `/components` — atomic UI pieces
- `/blocks` — composable UI sections

## TDD (Playwright) — RED first
- `@smoke` `/components` renders heading “Components”.
- `@smoke` `/blocks` renders heading “Blocks”.

### Components (must exist before CRUD)
All components below use **shadcn/ui**. Install required shadcn components first:
```bash
npx shadcn@latest add input label textarea select checkbox radio-group switch button card alert toast table
```

- **Inputs** (with labels, help text, and error text):
  - text, textarea, email, url, password (with show/hide), number (int/float), select, multiselect, checkbox, radio, switch, date, datetime
  - Use shadcn `<Input>`, `<Textarea>`, `<Select>`, `<Checkbox>`, `<RadioGroup>`, `<Switch>` components
  - Wrap with shadcn `<Label>` component
  - data-testids: `cmp-input-{type}`
- **Alerts**: error, success, warning, info
  - Use shadcn `<Alert>` component with variants
  - data-testids: `cmp-alert-error|success|warning|info`
- **Toasts**: error, success, warning, info (programmatic trigger demo)
  - Use shadcn `<Toast>` component with `useToast` hook
  - `cmp-toast-{variant}` and a trigger button `cmp-toast-trigger-{variant}`
- **Button** (primary) — Use shadcn `<Button>` component — `ui-button`
- **Card** — Use shadcn `<Card>` component — `ui-card`
- **Table (info-list style)** — Use shadcn `<Table>` component; optimized for user index; no row dividers, two-column label/value layout; `cmp-table-infolist`
- **Pagination** — numeric + prev/next with disabled states; build using shadcn `<Button>` components; `cmp-pagination`

### Blocks (built after components)
Blocks compose shadcn components into larger functional units:

- **Form Block** with:
  - shadcn `<Label>`, help text, inline error messages
  - submit + cancel action row using shadcn `<Button>`
  - data-testids: `blk-form`, `blk-form-error-summary`
- **User Profile Card Block** — Uses shadcn `<Card>`, `<Avatar>` components; display name, email, actions slot; `blk-user-profile-card`
- **Info List + Pagination Block** — wraps the info-list table + `cmp-pagination`; `blk-info-list`
- **Table + Pagination Block** — standard shadcn `<Table>` + `cmp-pagination`; `blk-table`

### Existing Block
- **Nav (public)**: logo + spacer + Sign In button using shadcn `<Button>` (`nav`, `nav-logo`, `nav-signin`)

## Exit Criteria
- All above components/blocks demonstrated on their respective gallery pages and covered with simple rendering assertions.
