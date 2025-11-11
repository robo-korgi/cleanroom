import { test, expect } from '@playwright/test';

test('GET /api/healthz returns ok:true', async ({ request, baseURL }) => {
  if (!baseURL) throw new Error('No baseURL set');
  const res = await request.get(new URL('/api/healthz', baseURL).toString());
  expect(res.status()).toBe(200);
  const json = await res.json();
  expect(json).toMatchObject({ ok: true });
});
