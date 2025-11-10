# Cleanroom — LLM Prompt Context Document

(This document is for LLMs. It is not user-facing. It provides architectural guardrails.)

## Purpose
Cleanroom is an opinionated scaffolding framework for:
- Web apps (Next.js + Supabase)
- Desktop apps (Tauri)
- Mobile apps (Capacitor)

This document ensures consistent reasoning and code generation.

## Core Stack

| Area | Technology | Notes |
|------|------------|-------|
| Web UI | Next.js 14+ (App Router) | Uses RSC + Server Actions |
| Components | shadcn/ui | Built on Radix UI + Tailwind; copy-paste approach |
| Auth | Supabase Auth | Uses HTTP-only cookies, no custom JWTs |
| Database | Supabase Postgres | Access via Drizzle ORM |
| Migrations | drizzle-kit | Schema lives in /packages/db |
| UI Structure | Components → Blocks → Pages | shadcn components → composite blocks → full pages |
| Dev | Docker Compose | Local env parity |
| Deploy | Vercel (web) + Supabase (db/storage) | Minimal ops |
| Desktop | Tauri | Loads same UI + optional native calls |
| Mobile | Capacitor | Wrap UI for iOS/Android |

## Architectural Principles
- Keep logic on the server via Server Actions.
- Avoid client state complexity; minimize use of Redux/Zustand/etc unless required.
- Data access always flows:
  Server Action → Drizzle Model → Supabase DB.

## Project Structure Convention
```
cleanroom/
  apps/
    web/        # Next.js app
    desktop/    # Tauri wrapper
    mobile/     # Capacitor wrapper
  packages/
    ui/         # Component, Block, and Page libraries
    db/         # Schema + migrations + db client
```

## UI Layering Definitions
- **Components**: Small reusable UI parts from **shadcn/ui** (buttons, inputs, cards, dialogs, etc.). Use `npx shadcn@latest add <component>` to add components.
- **Blocks**: Larger functional sections composed from shadcn components (headers, account forms, feed lists).
- **Pages**: Full routes with data wiring + block orchestration.

LLMs should generate UI following this hierarchy and always use shadcn/ui components as the foundation.

## Auth Rules
- Always rely on Supabase Auth.
- Use server actions + `createServerClient` helpers.
- Never re-implement cookie parsing manually.

## DB Rules
- All tables and relations live in `/packages/db/src/schema/*.ts`
- Migrations must be generated with drizzle-kit.
- Do not introduce Prisma or client-side SQL.

## Testing Rules
- Playwright tests run against Docker environment.
- Tests must assume cold start: no implicit state.

## When Generating Code:
✅ Use `async function action()` server actions  
✅ Import DB via:  
```ts
import { db } from "@cleanroom/db";
```
✅ Return typed objects  
✅ Co-locate logic with UI route when possible  

❌ Do not introduce custom session stores  
❌ Do not use JWT manually  
❌ Do not change project folder structure without confirmation  

## Future Add-ons (placeholders)
- Realtime feeds
- WebRTC shared meditation rooms
- Notifications
- Billing/subscriptions (Stripe or Lemon Squeezy later)

This document should be included in every context window where LLM contributes code.
