# ✨ Cleanroom
### Opinionated App Scaffolding

Cleanroom is scaffolding for rapid app development for web, desktop, and mobile. Its core functionality is a starter app scaffolding for a SPA monorepo webapp built on Next.js/Supabase with Vercel deployment and Playwright tests. It supports full cross-platform development using Tauri for desktop apps and Capacitor for mobile apps.

Cleanroom contains libraries at various levels of detail:
1. **Component library** - Atomic UI pieces like buttons, inputs, alerts (built on shadcn/ui)
2. **Block library** - Prebuilt functional sections like forms, profile cards, tables
3. **Page library** - Ready-to-ship page types (coming soon)

---

## Current Status

**Completed Steps:**
- ✅ Step 001-003: Domain registration and DNS setup
- ✅ Step 004: Supabase project created
- ✅ Step 005: Component & block galleries
- ✅ Step 006: Vercel deployment with preview/production environments

**Live Deployments:**
- Production: https://cleanroom.website
- Preview: https://preview.cleanroom.website

---

## Architecture Overview

| Layer | Technology | Purpose |
|------|------------|---------|
| Web Frontend | **Next.js 16 (React 19, App Router)** | Main UI, routes, server actions |
| Components | **shadcn/ui** (Radix + Tailwind 4) | Accessible, customizable UI components |
| Auth | **Supabase Auth** | Email login, OAuth, session storage |
| Database | **Supabase Postgres** | Structured data (Drizzle ORM integration planned) |
| API / Server Logic | **Next.js Server Actions** | Backend functionality colocated with UI |
| Testing | **Playwright** | E2E tests across local, preview, production |
| Deployment | **Vercel** (web) + **Supabase** (db, auth, storage) | Simple, scalable hosting |
| Desktop | **Tauri** (planned) | Lightweight Rust-powered desktop app |
| Mobile | **Capacitor** (planned) | iOS/Android apps with native integrations |

---

## Quick Start

### Requirements
- Node 20+ (21.7.1 in use)
- Yarn 4.9.4 (managed via Corepack)

### Install Dependencies

```bash
yarn install
```

### Local Development

```bash
yarn dev
```

Open http://localhost:3000

**Gallery Pages:**
- http://localhost:3000/components - Component demos
- http://localhost:3000/blocks - Block demos

### Environment Variables

Create `.env.local` for local secrets (optional, only needed if using Vercel Deployment Protection):

```bash
cp .env.local.example .env.local
# Edit .env.local with your secrets
```

For Supabase configuration (when you start using the database), see `.env.example`.

---

## Testing

### Run All Tests (Local)

```bash
yarn test:e2e
```

### Run Tests Against Preview

```bash
yarn test:e2e:pre
```

This loads `.env.local` (for bypass secret if needed) and runs tests against https://preview.cleanroom.website

### Run Tests Against Production

```bash
yarn test:e2e:prod
```

### Run Specific Test File

```bash
yarn test:e2e tests/galleries.spec.ts
yarn test:e2e tests/deployment.spec.ts
```

### Interactive Test Mode

```bash
yarn test:e2e:ui
```

### Headed Mode (Watch Tests Run)

```bash
yarn test:e2e:headed
```

---

## Deployment

### Deploy to Production

```bash
yarn deploy
```

Or push to `main` branch on GitHub (auto-deploys to Vercel preview, manual promotion to production).

### Vercel Login

```bash
yarn login
```

See `DEPLOYMENT.md` for full deployment guide.

---

## Project Structure

```
cleanroom/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Home page
│   ├── components/
│   │   └── page.tsx        # Component gallery
│   └── blocks/
│       └── page.tsx        # Block gallery
├── components/
│   └── ui/                 # shadcn/ui components
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       └── ...
├── tests/
│   ├── galleries.spec.ts   # Component/block gallery tests
│   └── deployment.spec.ts  # Deployment verification tests
├── lib/
│   └── utils.ts            # Utility functions
├── public/                 # Static assets
├── playwright.config.ts    # Playwright configuration
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── components.json         # shadcn/ui configuration
```

---

## Component Library

Built on **shadcn/ui** with Radix UI primitives and Tailwind CSS.

**Available Components:**
- Inputs (text, textarea, email, url, password with toggle, number, date, datetime)
- Select, Checkbox, Radio Group, Switch
- Button (primary, secondary, ghost, destructive)
- Card
- Alert (error, success, warning, info)
- Toast notifications (via Sonner)
- Table (standard and info-list styles)
- Pagination

**Add New Components:**
```bash
npx shadcn@latest add <component-name>
```

View all components at: http://localhost:3000/components

---

## Block Library

Composable UI sections built from shadcn components.

**Available Blocks:**
- Form Block (with validation, error summary, help text)
- User Profile Card Block (avatar, name, email, actions)
- Info List + Pagination Block
- Table + Pagination Block

View all blocks at: http://localhost:3000/blocks

---

## Scripts Reference

| Script | Description |
|--------|-------------|
| `yarn dev` | Start development server |
| `yarn build` | Build production bundle |
| `yarn start` | Start production server |
| `yarn test:e2e` | Run Playwright tests locally |
| `yarn test:e2e:pre` | Test preview.cleanroom.website |
| `yarn test:e2e:prod` | Test cleanroom.website |
| `yarn test:e2e:ui` | Interactive test mode |
| `yarn test:e2e:headed` | Watch tests run in browser |
| `yarn login` | Login to Vercel CLI |
| `yarn deploy` | Deploy to production |

---

## Environment Variables

**Production (Vercel Dashboard):**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (production only)

**Local Development (`.env.local`):**
- `VERCEL_AUTOMATION_BYPASS_SECRET` - For testing with Vercel Deployment Protection

See `.env.example` and `.env.local.example` for templates.

---

## Documentation

- **`DEPLOYMENT.md`** - Complete Vercel deployment guide
- **`VERCEL_SETUP_CHECKLIST.md`** - Quick setup checklist for step 006
- **`VERCEL_AUTH_FIX.md`** - Fix Vercel authentication issues for testing
- **`ENV_SETUP.md`** - Environment variables setup guide
- **`llm/app-design/`** - Step-by-step implementation guides

---

## Tech Stack Details

**Frontend:**
- Next.js 16.0.1 with App Router
- React 19.2.0
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui components

**Backend (Planned):**
- Supabase Auth for authentication
- Supabase Postgres for database
- Drizzle ORM for type-safe queries
- Next.js Server Actions for API

**Testing:**
- Playwright 1.56.1
- E2E tests across environments
- Visual regression testing (planned)

**Deployment:**
- Vercel for hosting
- Supabase for backend services
- Automatic HTTPS via Let's Encrypt
- Preview deployments for every branch

---

## Data & Auth Flow (When Implemented)

1. User logs in via Supabase (email, password, or OAuth)
2. Supabase issues secure HTTP-only session cookies
3. Next.js server actions automatically receive user context
4. Database access through Supabase client or Drizzle ORM

This avoids custom session middleware and reduces auth complexity.

---

## Coming Soon

- **Docker Compose** for local development (step 002a)
- **Drizzle ORM** integration (step 016)
- **Authentication flows** (step 016a, 018, 019)
- **Admin panel** (step 020-022)
- **User CRUD** (step 024-026)
- **Desktop app** (Tauri wrapper)
- **Mobile apps** (Capacitor wrapper)
- **Email integration** (Postmark/Resend)
- **Analytics** (Vercel Analytics, PostHog)

---

## Development Workflow

1. **Write tests first** (TDD with Playwright)
2. **Implement feature** (components → blocks → pages)
3. **Run tests locally** (`yarn test:e2e`)
4. **Push to GitHub** (triggers preview deployment)
5. **Test preview** (`yarn test:e2e:pre`)
6. **Promote to production** (manual in Vercel dashboard)
7. **Verify production** (`yarn test:e2e:prod`)

---

## Contributing

Cleanroom follows a multi-persona development pipeline:
1. **Architect** - Design system architecture
2. **Spec-Writer** - Write Playwright TDD specs
3. **Designer** - Create visual specifications
4. **Developer** - Implement features
5. **QA Tester** - Verify and validate

See `llm/personas/` for detailed persona guidelines.

---

## Support

- Issues: https://github.com/robo-korgi/cleanroom/issues
- Documentation: See `/llm/app-design/` for step-by-step guides

---

## License

MIT
