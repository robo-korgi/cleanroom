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
- ✅ Step 007: Docker development environment + Playwright test matrix
- ✅ Step 008-010: Test-gated deployment workflow with auto-rollback
- ✅ Step 011: Health check API endpoint
- ✅ Step 012: Auth-aware navigation UI (logged-out state)

**Live Deployments:**
- Production: https://cleanroom.website
- Preview: https://preview.cleanroom.website
- Local Docker: http://localhost:3000

**Health Check:**
- Local: http://localhost:3000/api/healthz
- Preview: https://preview.cleanroom.website/api/healthz
- Production: https://cleanroom.website/api/healthz

---

## Architecture Overview

| Layer | Technology | Purpose |
|------|------------|---------|
| Web Frontend | **Next.js 16 (React 19, App Router)** | Main UI, routes, server actions |
| Components | **shadcn/ui** (Radix + Tailwind 4) | Accessible, customizable UI components |
| Auth | **Supabase Auth** | Email login, OAuth, session storage |
| Database | **Supabase Postgres** | Structured data (Drizzle ORM integration planned) |
| API / Server Logic | **Next.js Server Actions** | Backend functionality colocated with UI |
| Testing | **Playwright** | E2E tests across local-docker, preview, production |
| Local Dev | **Docker Compose** | Containerized Next.js + Postgres + Mailpit |
| Deployment | **Vercel** (web) + **Supabase** (db, auth, storage) | Simple, scalable hosting |
| Release Flow | **Test-gated workflow** | Pre-push tests, multi-env validation, auto-rollback |
| Desktop | **Tauri** (planned) | Lightweight Rust-powered desktop app |
| Mobile | **Capacitor** (planned) | iOS/Android apps with native integrations |

---

## Quick Start

### Requirements
- Node 20+ (21.7.1 in use)
- Yarn 4.9.4 (managed via Corepack)
- Docker Desktop (for local development)

### Install Dependencies

```bash
yarn install
```

### Local Development (Docker)

**First time setup:**
```bash
# Build Docker images
yarn docker:build

# Start services (Next.js + Postgres + Mailpit)
yarn docker:up
```

**Access services:**
- App: http://localhost:3000
- Mailpit (email testing): http://localhost:8025
- Postgres: localhost:5432

**Gallery Pages:**
- http://localhost:3000 - Homepage
- http://localhost:3000/components - Component demos
- http://localhost:3000/blocks - Block demos

**View logs:**
```bash
yarn docker:logs
```

**Stop services:**
```bash
yarn docker:down
```

See `DOCKER.md` for complete Docker documentation.

### Environment Variables

Create `.env.local` for local secrets (optional, only needed if using Vercel Deployment Protection):

```bash
cp .env.local.example .env.local
# Edit .env.local with your secrets
```

For Supabase configuration (when you start using the database), see `.env.example`.

---

## Testing

### Run Tests Against Local Docker

```bash
yarn test
```

Automatically starts Docker and runs smoke tests.

### Run Tests Against Staging (Preview)

```bash
yarn test:staging
```

Tests against https://preview.cleanroom.website

### Run Tests Against Production

```bash
yarn test:prod
```

Tests against https://cleanroom.website

### Run Specific Test File

```bash
yarn test tests/smoke.spec.ts
yarn test:staging tests/galleries.spec.ts
yarn test:prod tests/deployment.spec.ts
```

### Interactive Test Mode

```bash
yarn test:ui
```

### Headed Mode (Watch Tests Run)

```bash
yarn test:headed
```

### Pre-Push Testing

When you push to the `staging` branch, a git hook automatically runs local-docker tests:

```bash
git push origin staging
# 🧪 Pre-push tests for staging branch...
# 🐳 Testing local-docker (localhost:3000)
# ✅ local-docker PASSED
# ✅ Push to staging allowed.
```

See `PRE-PUSH-TESTING.md` for details.

---

## Deployment

### Production Deployment Workflow

Cleanroom uses a **test-gated deployment workflow** with automatic rollback:

```bash
# 1. Work on staging branch
git checkout staging

# 2. Make changes, commit
git add .
git commit -m "feat: new feature"

# 3. Push to staging (triggers pre-push tests + auto-deploys to preview)
git push origin staging
# ✅ Local-docker tests run automatically
# ✅ Vercel deploys to preview.cleanroom.website

# 4. Deploy to production (full test suite + rollback protection)
yarn deploy
```

**What `yarn deploy` does (7 steps):**
1. ✅ Checks git status (no uncommitted changes)
2. 🐳 Tests local-docker
3. 🔍 Tests staging (preview.cleanroom.website)
4. 💾 Saves current production deployment
5. 🚀 Deploys to production
6. 🧪 Tests production → **Auto-rollback if tests fail**
7. 🔀 Merges staging → main and pushes

### Vercel Login

```bash
yarn login
```

### Emergency Bypass

```bash
# Skip pre-push hook (emergencies only)
git push --no-verify

# Manual rollback
vercel ls --prod
vercel alias set <deployment-url> cleanroom.website
```

See `DEPLOYMENT-WORKFLOW.md` for complete deployment guide.

---

## Project Structure

```
cleanroom/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Home page
│   ├── api/
│   │   └── healthz/
│   │       └── route.ts    # Health check endpoint
│   ├── components/
│   │   └── page.tsx        # Component gallery
│   └── blocks/
│       └── page.tsx        # Block gallery
├── components/
│   ├── ui/                 # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   └── blocks/             # Reusable block components
│       ├── simple-nav.tsx
│       └── simple-hero.tsx
├── tests/
│   ├── smoke.spec.ts       # Smoke tests (homepage)
│   ├── healthz.spec.ts     # Health check API test
│   ├── galleries.spec.ts   # Component/block gallery tests
│   └── deployment.spec.ts  # Deployment verification tests
├── scripts/
│   └── deploy-prod.sh      # Production deployment script
├── lib/
│   └── utils.ts            # Utility functions
├── public/                 # Static assets
├── .git/hooks/
│   └── pre-push            # Pre-push test hook (staging only)
├── Dockerfile              # Next.js Docker image
├── docker-compose.yml      # Local dev services (web + postgres + mailpit)
├── playwright.config.ts    # Playwright configuration
├── next.config.ts          # Next.js configuration
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

### Development
| Script | Description |
|--------|-------------|
| `yarn dev` | Start Next.js dev server (no Docker) |
| `yarn docker:build` | Build Docker images |
| `yarn docker:up` | Start Docker services (web + postgres + mailpit) |
| `yarn docker:down` | Stop Docker services |
| `yarn docker:logs` | View app logs |
| `yarn docker:restart` | Restart web container |

### Testing
| Script | Description |
|--------|-------------|
| `yarn test` | Test local-docker (auto-starts Docker) |
| `yarn test:staging` | Test preview.cleanroom.website |
| `yarn test:prod` | Test cleanroom.website |
| `yarn test:ui` | Interactive test mode |
| `yarn test:headed` | Watch tests run in browser |

### Deployment
| Script | Description |
|--------|-------------|
| `yarn login` | Login to Vercel CLI |
| `yarn deploy` | Deploy to production (7-step workflow with rollback) |

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

- **`DOCKER.md`** - Complete Docker development guide
- **`DEPLOYMENT-WORKFLOW.md`** - Test-gated deployment workflow with rollback
- **`PRE-PUSH-TESTING.md`** - Git hook testing documentation
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
- E2E tests across 3 environments (local-docker, preview, production)
- Pre-push hooks for staging branch
- Smoke tests, gallery tests, deployment verification
- Visual regression testing (planned)

**Deployment:**
- Vercel for hosting
- Supabase for backend services
- Automatic HTTPS via Let's Encrypt
- Preview deployments for staging branch (preview.cleanroom.website)
- Test-gated production deployments with auto-rollback
- Zero CI dependency (all tests run locally)

---

## Data & Auth Flow (When Implemented)

1. User logs in via Supabase (email, password, or OAuth)
2. Supabase issues secure HTTP-only session cookies
3. Next.js server actions automatically receive user context
4. Database access through Supabase client or Drizzle ORM

This avoids custom session middleware and reduces auth complexity.

---

## API Endpoints

### Health Check

**Endpoint:** `GET /api/healthz`

**Purpose:** Unauthenticated health check for uptime monitoring and deployment verification.

**Response:**
```json
{
  "ok": true
}
```

**Usage:**
```bash
# Check local Docker
curl http://localhost:3000/api/healthz

# Check preview
curl https://preview.cleanroom.website/api/healthz

# Check production
curl https://cleanroom.website/api/healthz
```

**Use Cases:**
- Uptime monitoring (UptimeRobot, Pingdom)
- Load balancer health checks
- Deployment verification in CI/CD
- Playwright test environment readiness

---

## Coming Soon

- **Authentication UI** (step 012-013)
- **Mobile Navigation** (step 014)
- **Drizzle ORM** integration (step 016)
- **Authentication flows** (step 016a, 018, 019)
- **Admin panel** (step 020-022)
- **User CRUD** (step 024-026)
- **Desktop app** (Tauri wrapper)
- **Mobile apps** (Capacitor wrapper)
- **Email integration** (Postmark/Resend)
- **Analytics** (Vercel Analytics, PostHog)
- **Database health checks** (`/api/healthz/db`)

---

## Development Workflow

### Modern Test-First Approach

```bash
# 1. Start on staging branch
git checkout staging

# 2. Start Docker services
yarn docker:up

# 3. Write tests first (TDD)
# Edit tests/smoke.spec.ts

# 4. Run tests (they should fail)
yarn test

# 5. Implement feature (components → blocks → pages)
# Make changes to components/blocks

# 6. Run tests until they pass
yarn test

# 7. Commit changes
git add .
git commit -m "feat: new feature"

# 8. Push to staging (auto-tests + deploys to preview)
git push origin staging
# ✅ Pre-push hook tests local-docker
# ✅ Vercel deploys to preview.cleanroom.website

# 9. Verify on preview
open https://preview.cleanroom.website

# 10. Deploy to production (full test suite + rollback)
yarn deploy
# ✅ Tests local-docker
# ✅ Tests staging
# ✅ Deploys to production
# ✅ Tests production (auto-rollback if fail)
# ✅ Merges staging → main
```

### Quality Gates

| Action | Gate | Blocks On Failure |
|--------|------|-------------------|
| Push to staging | Pre-push hook (local-docker tests) | ✅ Yes |
| `yarn deploy` | Local + staging + prod tests | ✅ Yes |
| Production deploy failure | Production tests | ✅ Auto-rollback |

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
