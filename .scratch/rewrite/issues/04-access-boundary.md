# 04 — Installation access boundary

Status: ready-for-agent
Progress: open
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
