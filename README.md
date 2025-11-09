# ✨ Cleanroom
### Opinionated App Scaffolding

Cleanroom is scaffolding for rapid app development for web, desktop, and mobile. Its core functionality is starter app scaffolding for SPA webapps built on Next/Supabase in Docker for Vercel deployment and Playwright tests. It supports full cross-platform development using Tauri for desktop apps and Capacitor for mobile apps. The Cleanroom CLI lets you fire up as many or as few of the features you need using simple checkbox options.

Cleanroom contains libraries at various levels of detail:
1. You can start building at the component level with Cleanroom **component library**, which has things like buttons, titles and paginations.
2. If you prefer to not worry about components, you can just use the Cleanroom **block library**, made of prebuilt UI components blocks like navs, forms, etc.
3. If that level of detail still sounds intimidating or time-consuming, you can just start with the Cleanroom **page library**, with ready-to-ship page types like blog page, leaderboard, chat lobby, social feed, etc.

---

## Core Goals

- **Ship fast** using prebuilt, preconfigured app building blocks.
- **Reuse parts** across web, mobile, desktop.
- **Simple stack** Typescript for frontend and backend.
- **Robust apps**: with auth, stores, billing, mailers, analytics, real-time video, chat, uploads, etc.

---

## Architecture Overview

| Layer | Technology | Purpose |
|------|------------|---------|
| Web Frontend | **Next.js (React, App Router)** | Main UI, routes, server actions |
| Auth | **Supabase Auth** | Email login, OAuth, session storage |
| Database | **Supabase Postgres** with Drizzle ORM | Structured data w/ migrations |
| API / Server Logic | **Next.js Server Actions / Route Handlers** | Backend functionality colocated with UI |
| Local Development | **Docker Compose** | Consistent, isolated dev environment |
| Deployment | **Vercel** (web) + **Supabase** (db, auth, file storage) | Simple, scalable hosting |
| Desktop | **Tauri** | Lightweight Rust‑powered desktop app that loads the web UI |
| Mobile | **Capacitor** | Ship web UI as iOS/Android apps with native integrations |

---

## Data & Auth Flow

1. User logs in via Supabase (email code, password, or OAuth).
2. Supabase issues secure HTTP‑only session cookies.
3. Next.js server actions and RSC automatically receive user context.
4. Database access occurs through Supabase client or Drizzle ORM.

This avoids custom session middleware and reduces auth complexity.

---

## Local Development Setup

### Requirements
- Docker
- pnpm
- Node 20+

### Start Dev Stack

```sh
docker compose up --build
pnpm dev
```

### Running E2E Tests

Use **Playwright** against the **Docker env** to ensure parity with prod:

```sh
pnpm test:e2e
```

---

## Deployment Workflow

1. Merge to `main` triggers **Vercel deploy** straight to prod.
2. Database changes are applied via Supabase migrations.
3. Playwright tests confirm core flows remain intact.

CI Pipeline (future):
```
docker compose up → seed → run server → run e2e → deploy
```

---

## Desktop & Mobile Strategy

| Platform | Tech | Approach |
|---------|------|----------|
| Desktop | **Tauri** | Wrap browser UI, add system APIs when needed |
| Mobile | **Capacitor** | Web UI wrapped in native shell, can add camera, notifications, etc |

This allows maximum reuse without rebuilding UI per platform.

---

## Mailers

- **Mailpit** in development (local preview inbox)
- **Postmark** in production

Use Supabase’s built‑in email auth OR custom transactional emails for onboarding, invites, etc.

---

## Analytics

- **Vercel Analytics** for simple performance + page tracking
- Optional upgrade: **PostHog** for product analytics

```tsx
import { Analytics } from "@vercel/analytics/react";
<Analytics />
```

---

```
pnpm create cleanroom-app
✔ Add blog?  ✔ Add user profiles?  ✔ Add billing?
```
