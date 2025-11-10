# 002a — Docker Compose for Local Development

Meta:
- created: 2025-11-10
- depends-on: 001 (overview)
- scope: Local development environment setup

## Objective
Provide a Docker Compose configuration for local development that mirrors production environment as closely as possible. Used by developers and CI/CD for running tests.

## Services

### 1. PostgreSQL (for Supabase local)
- Image: `supabase/postgres:15.1.0.117`
- Purpose: Local database for development and testing
- Port: `5432` (host) → `5432` (container)
- Test DB Port: `5433` (host) → `5432` (container) - separate instance for tests

### 2. Supabase Studio (Optional)
- Image: `supabase/studio:latest`
- Purpose: Local database management UI
- Port: `3001` (host)
- Connects to local postgres

### 3. Mailpit (Email Testing)
- Image: `axllent/mailpit:latest`
- Purpose: Local SMTP server with web UI to preview emails
- SMTP Port: `1025`
- Web UI Port: `8025` (host)
- Replaces Resend in development

## docker-compose.yml

**File:** `docker-compose.yml` (project root)

```yaml
version: '3.8'

services:
  # PostgreSQL for development
  postgres:
    image: supabase/postgres:15.1.0.117
    container_name: cleanroom-postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: cleanroom_dev
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  # PostgreSQL for testing (separate instance)
  postgres_test:
    image: supabase/postgres:15.1.0.117
    container_name: cleanroom-postgres-test
    ports:
      - "5433:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: cleanroom_test
    volumes:
      - postgres_test_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Mailpit for local email testing
  mailpit:
    image: axllent/mailpit:latest
    container_name: cleanroom-mailpit
    ports:
      - "1025:1025"  # SMTP
      - "8025:8025"  # Web UI
    environment:
      MP_SMTP_AUTH_ACCEPT_ANY: 1
      MP_SMTP_AUTH_ALLOW_INSECURE: 1

  # Supabase Studio (optional - for database UI)
  studio:
    image: supabase/studio:latest
    container_name: cleanroom-studio
    ports:
      - "3001:3000"
    environment:
      SUPABASE_URL: http://host.docker.internal:54321
      STUDIO_PG_META_URL: http://host.docker.internal:8080
    depends_on:
      - postgres

volumes:
  postgres_data:
    driver: local
  postgres_test_data:
    driver: local
```

## Docker Compose Profiles (Optional)

For minimal setup, use profiles:

```yaml
# Add to each service
  studio:
    profiles: ["studio"]
    # ... rest of config

  postgres_test:
    profiles: ["test"]
    # ... rest of config
```

Start services by profile:
```bash
# Dev only (postgres + mailpit)
docker compose up

# Include studio
docker compose --profile studio up

# Include test DB
docker compose --profile test up
```

## Environment Variables for Docker

**File:** `.env.docker` (not committed)

```bash
# PostgreSQL (Dev)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cleanroom_dev

# PostgreSQL (Test)
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5433/cleanroom_test

# Mailpit SMTP (Dev only)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
MAIL_FROM=no-reply@cleanroom.local

# Use Mailpit in dev, not Resend
USE_MAILPIT=true
```

Load in development:
```bash
# package.json scripts
"dev": "dotenv -e .env.docker -- next dev"
```

## Scripts

### Start Dev Environment

**File:** `scripts/dev-up.sh`

```bash
#!/bin/bash
set -e

echo "Starting Docker services..."
docker compose up -d postgres mailpit

echo "Waiting for postgres..."
until docker compose exec -T postgres pg_isready -U postgres; do
  sleep 1
done

echo "Running migrations..."
pnpm db:migrate

echo "✅ Dev environment ready!"
echo "  - Postgres: localhost:5432"
echo "  - Mailpit UI: http://localhost:8025"
echo ""
echo "Run 'pnpm dev' to start Next.js"
```

### Start Test Environment

**File:** `scripts/test-up.sh`

```bash
#!/bin/bash
set -e

echo "Starting test database..."
docker compose up -d postgres_test

echo "Waiting for test postgres..."
until docker compose exec -T postgres_test pg_isready -U postgres; do
  sleep 1
done

echo "Running migrations on test DB..."
DATABASE_URL=$TEST_DATABASE_URL pnpm db:migrate

echo "Running seeds..."
DATABASE_URL=$TEST_DATABASE_URL pnpm db:seed

echo "✅ Test environment ready!"
```

### Teardown

**File:** `scripts/dev-down.sh`

```bash
#!/bin/bash
docker compose down
```

### Reset Database

**File:** `scripts/db-reset.sh`

```bash
#!/bin/bash
set -e

echo "⚠️  This will DELETE all data!"
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  exit 1
fi

docker compose down -v
docker compose up -d postgres mailpit

echo "Waiting for postgres..."
until docker compose exec -T postgres pg_isready -U postgres; do
  sleep 1
done

pnpm db:migrate
pnpm db:seed

echo "✅ Database reset complete!"
```

## Package.json Scripts

```json
{
  "scripts": {
    "docker:up": "./scripts/dev-up.sh",
    "docker:down": "./scripts/dev-down.sh",
    "docker:reset": "./scripts/db-reset.sh",
    "test:up": "./scripts/test-up.sh",

    "dev": "dotenv -e .env.docker -- next dev",
    "db:migrate": "drizzle-kit migrate",
    "db:seed": "tsx scripts/seed.ts",

    "test:e2e": "./scripts/test-up.sh && playwright test",
    "test:e2e:local": "BASE_URL=http://localhost:3000 playwright test -c playwright.local.ts"
  }
}
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 20

      - name: Install dependencies
        run: pnpm install

      - name: Start Docker services
        run: docker compose up -d postgres_test mailpit

      - name: Wait for postgres
        run: |
          until docker compose exec -T postgres_test pg_isready; do
            sleep 1
          done

      - name: Run migrations
        run: DATABASE_URL=$TEST_DATABASE_URL pnpm db:migrate

      - name: Run seeds
        run: DATABASE_URL=$TEST_DATABASE_URL pnpm db:seed

      - name: Install Playwright
        run: pnpm exec playwright install --with-deps

      - name: Run tests
        run: pnpm test:e2e:local

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Local Development Workflow

### First Time Setup
```bash
# 1. Clone repo
git clone https://github.com/yourorg/yourapp

# 2. Install dependencies
pnpm install

# 3. Copy env file
cp .env.example .env.docker

# 4. Start Docker services + migrate
pnpm docker:up

# 5. Start Next.js
pnpm dev
```

### Daily Development
```bash
# Start services (if not already running)
docker compose up -d

# Start Next.js
pnpm dev
```

### Running Tests
```bash
# Start test environment
pnpm test:up

# Run Playwright tests
pnpm test:e2e:local
```

### Viewing Emails
```bash
# Open Mailpit UI
open http://localhost:8025
```

### Resetting Database
```bash
# Nuclear option - deletes all data
pnpm docker:reset
```

## Troubleshooting

### Port Already in Use
```bash
# Check what's using port 5432
lsof -i :5432

# Kill the process or change docker-compose.yml port mapping
# "5434:5432" instead of "5432:5432"
```

### Permission Denied on Scripts
```bash
chmod +x scripts/*.sh
```

### Cannot Connect to Docker from Next.js
- If using Docker Desktop on Mac, use `host.docker.internal` instead of `localhost` in some contexts
- Or: Run Next.js inside Docker too (add to docker-compose.yml)

### Test Database Not Isolated
- Ensure `TEST_DATABASE_URL` points to separate port (5433)
- Use different database name (`cleanroom_test` vs `cleanroom_dev`)

## Supabase Local Alternative

For full Supabase local dev (Auth, Storage, Realtime):

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Initialize
supabase init

# Start all Supabase services
supabase start

# This starts:
# - Postgres (port 54322)
# - Studio (port 54323)
# - Auth (port 54324)
# - Storage (port 54325)
# - Realtime (port 54326)
```

Update `.env.docker`:
```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase start output>
```

## Exit Criteria
- Docker Compose file starts all services successfully
- PostgreSQL accessible on 5432 (dev) and 5433 (test)
- Mailpit captures emails and shows UI on port 8025
- Scripts for up/down/reset work correctly
- Migrations run successfully against local DB
- Tests can connect to test database
- Development workflow documented
