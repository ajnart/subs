# 04 — Installation access boundary

Status: ready-for-agent
Progress: resolved
Type: task
Blocked by: 03

## Outcome

Protect one Collection by default without introducing accounts.

## Acceptance criteria

- Initial six-digit PIN setup requires a high-entropy Operator token from environment or Operator-only logs; public status responses expose neither token nor data.
- Setup is atomic under concurrent requests and stops accepting setup authorization once configured.
- PIN is salted/password-hashed server-side and never logged, exported, returned, or placed in URLs.
- Opaque HttpOnly SameSite sessions expire after seven days, use Secure over HTTPS, and invalidate on logout.
- Collection reads and writes require authorization; mutations validate trusted Origin and login attempts have bounded per-source and Installation controls with retry feedback.
- Only explicit DISABLE_AUTH=true bypasses auth; validation and mutation-origin protections remain. Recovery is Operator maintenance, not public PIN reset.

## Comments

Validate through HTTP behavior and real persistence. Do not create new unit-test files.

## Completion evidence — October 24, 2026

`src/server/auth.ts` supplies salted scrypt PIN hashes, opaque hashed sessions, expiry, revocation, persistent throttling and trusted-Origin checks. Existing HTTP regressions pass for protected reads, CSRF, cookie flags and logout; container checks verify expiry and throttling after restart. A fresh-image race permits exactly one setup request (200/409), rejects a wrong operator token, and keeps `DISABLE_AUTH=1` protected. Exactly `true` bypasses PIN protection while retaining Origin checks. Recovery is filesystem maintenance only.
