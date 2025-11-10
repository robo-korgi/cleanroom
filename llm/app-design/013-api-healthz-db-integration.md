# 013 — `/api/healthz` + DB status — TEST FIRST

## Objective
Upgrade `/api/healthz` to include DB status after DB tests pass. New contract:
```json
{ "ok": true, "db": "up" }
```

## Test change (write first → RED)
Update `tests/healthz.spec.ts` to assert:
- status 200
- JSON includes `{ ok: true, db: 'up' }`

## Implementation (make GREEN)
Use App Router route handler and perform a lightweight DB check (e.g., `select 1`) via `pg` or your shared DB module. On success return `{ ok: true, db: 'up' }`; on failure return `{ ok: false, db: 'down' }` and a non-2xx status.

## Outcomes
- Playwright health checks verify backend and DB readiness across prod/preview/docker.
- Contract evolves strictly via RED → GREEN cycles.
