# 07 — Authenticated Collection contract

Status: ready-for-agent
Progress: resolved
Type: task
Blocked by: 04, 05

## Outcome

Expose a small validated server boundary that all UI features can rely on.

## Acceptance criteria

- Authorized reads and single/bulk mutations cover CRUD, lifecycle, preferences, and Budget without whole-store client overwrite.
- Boundary validation rejects unknown/invalid values and returns actionable structured errors without exposing internal secrets.
- Revision or equivalent concurrency guards reject stale updates and destructive actions with clear reconciliation behavior.
- Mutations acknowledge only committed state; transactions and foreign-key relationships preserve Collection integrity.
- Sensitive Collection responses are not publicly cached and server-only database/auth code stays out of client bundles.
- UI consumers have a consistent loading/error/revalidation contract and no browser Subscription store remains authoritative.

## Comments

Use framework-native facilities; add another RPC/backend layer only for a documented necessary blocker.

## Completion evidence — October 24, 2026

`src/server/api.ts` exposes authenticated validated CRUD, bulk actions, preferences, export/import and history with no-store responses. Mutations require `If-Match`; missing and stale revisions return 428/409, including stale destructive import previews. Transactions acknowledge committed state only. Existing HTTP tests and container rollback checks pass, and both client builds keep server persistence/auth modules outside the browser boundary.
