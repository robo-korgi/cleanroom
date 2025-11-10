# 021 — Authorization guards (requireRole)

## Objective
Centralize server-side authorization so all privileged code paths use the same guard. Pattern: `requireRole(session, role)`.

## Rationale
- Single source of truth for role checks.
- Prevents scattered ad‑hoc logic and drift.
- Works across App Router server components, route handlers, and server actions.

## Contract
- Input: `session` (loaded server-side, includes `userId`, `role`), `role` ∈ {`'admin'`,`'user'`}.
- Behavior: throws or returns a structured error when `session` missing, expired, or lower privilege than required.
- Side effects: none (pure check). Logging optional.

## Minimal API (TypeScript)
```ts
type Role = 'admin' | 'user';

interface Session {
  userId: string;
  role: Role;
  // issuedAt, expiresAt, etc.
}

class AuthzError extends Error {
  status = 403;
  code = 'AUTHZ_FORBIDDEN';
}

export function requireRole(session: Session | null | undefined, required: Role): Session {
  if (!session) {
    const e = new AuthzError('Not authenticated');
    (e as any).status = 401;
    (e as any).code = 'AUTHZ_UNAUTHENTICATED';
    throw e;
  }
  const ranks: Record<Role, number> = { user: 1, admin: 2 };
  if (ranks[session.role] < ranks[required]) {
    throw new AuthzError('Forbidden');
  }
  return session;
}
```

## Usage sites (server-only)
- **Route Handlers** (`app/api/**/route.ts`): call at top of handler.
- **Server Actions**: call before mutating operations.
- **RSC Loaders** (server components): call before fetching privileged data.
- **Middleware** (optional): route-gate entire admin subtree (e.g., `/admin/**`).

## Deny-by-default policy
- If guard is not called, the route is considered public.
- Mutating routes must call `requireRole` explicitly.
- Admin UI + APIs must require `'admin'`.

## Errors & UX
- Route handlers: map `AuthzError` to 401/403 with no sensitive details.
- UI: show generic “Not authorized” screen. Do not reveal required role.

## Tests (add to e2e + unit as applicable)
- Unauthenticated request → 401
- Authenticated `user` to admin route → 403
- Authenticated `admin` to admin route → 200
- Non-mutating public routes unaffected.

## Notes
- Session remains server-side (per 012/019). Do not trust client role.
- On role changes, invalidate sessions so `requireRole` uses current data.
- Future roles can be added by extending `Role` and `ranks` mapping.
