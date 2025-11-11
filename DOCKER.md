# Docker Development Guide

## Quick Start

```bash
# Build Docker images
yarn docker:build

# Start all services (Next.js + Postgres + Mailpit)
yarn docker:up

# View logs
yarn docker:logs

# Stop all services
yarn docker:down
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| **web** | 3000 | Next.js application |
| **postgres** | 5432 | PostgreSQL database |
| **mailpit** | 8025 | Email testing UI (SMTP on 1025) |

## Development Workflow

### First Time Setup

1. Ensure `.env.local` exists with required environment variables
2. Build Docker images:
   ```bash
   yarn docker:build
   ```
3. Start services:
   ```bash
   yarn docker:up
   ```
4. App runs at http://localhost:3000

### Daily Development

```bash
# Start services (if not already running)
yarn docker:up

# Make code changes - they'll be reflected after rebuild
# Rebuild after code changes
yarn docker:build
yarn docker:restart

# Or rebuild and restart in one command
docker compose up -d --build
```

### Testing

```bash
# Run Playwright tests against Docker (localhost:3000)
yarn test

# Run against Vercel preview
yarn test:staging

# Run against Vercel production
yarn test:prod
```

### Viewing Services

- **App:** http://localhost:3000
- **Mailpit UI:** http://localhost:8025 (to view test emails)
- **Postgres:** localhost:5432 (use any SQL client)

### Logs

```bash
# Follow web service logs
yarn docker:logs

# All services
docker compose logs -f

# Specific service
docker compose logs -f postgres
```

### Cleanup

```bash
# Stop services (keeps data)
yarn docker:down

# Stop and remove volumes (deletes database data)
docker compose down -v
```

## Environment Variables

The Docker container uses `.env.local` for configuration. Ensure this file exists with:

```bash
# Supabase (cloud)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database (local Docker)
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/cleanroom_dev

# Email (Mailpit for dev, Resend for prod)
SMTP_HOST=mailpit
SMTP_PORT=1025
```

## Troubleshooting

### Port already in use
```bash
# Check what's using port 3000
lsof -i :3000

# Kill the process or change port in docker-compose.yml
```

### Container won't start
```bash
# View detailed logs
docker compose logs web

# Rebuild from scratch
docker compose build --no-cache
```

### Database connection issues
```bash
# Ensure postgres is healthy
docker compose ps

# Check postgres logs
docker compose logs postgres
```

### Code changes not reflecting
```bash
# Rebuild and restart
yarn docker:build
yarn docker:restart
```

## Architecture Notes

- **Local:** Docker containers (isolated, reproducible)
- **Vercel:** Serverless (their build system, connects to Supabase cloud)
- Docker is for local dev only; Vercel doesn't support Docker deployment
- Same Next.js code runs everywhere, just different infrastructure
