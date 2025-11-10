# 010 — API health route — TEST FIRST

## Objective
Add failing test for `/api/healthz`. Initial contract:
```json
{ "ok": true }
```

## Test (write first → RED)
`tests/healthz.spec.ts`
```ts
import { test, expect } from '@playwright/test';

test('GET /api/healthz returns ok:true', async ({ request, baseURL }) => {
  if (!baseURL) throw new Error('No baseURL set');
  const res = await request.get(new URL('/api/healthz', baseURL).toString());
  expect(res.status()).toBe(200);
  const json = await res.json();
  expect(json).toMatchObject({ ok: true });
});
```

## Minimal implementation (make GREEN)

App Router route: `app/api/healthz/route.ts`
```ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}
```

Re-run tests for preview/prod/docker until GREEN.

## Note on auth and roles
`/api/healthz` is intentionally **unauthenticated**. Do **not** add role checks here.
- Purpose: external uptime checks + Playwright environment readiness tests.
- Role-based access control will be applied to application routes and admin UI, not to this health endpoint.
