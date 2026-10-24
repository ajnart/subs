# 24 — Release verification and retirement

Status: ready-for-agent
Progress: claimed
Type: task
Blocked by: 23

## Outcome

Ship only capabilities supported by integrated runtime and validation evidence.

## Acceptance criteria

- Existing HTTP/auth/persistence and focused Playwright flows verify setup, login/logout, protected CRUD, lifecycle, money/dates, migration, import/export, and restart durability.
- Capture responsive light/dark screens and manually verify the exact preset/theme authority and lack of old live UI.
- Run final lint and typecheck after concurrent edits settle; report inherited baseline failures separately from new regressions and record unrun checks.
- Retire old live routes/components/client store behavior without discarding original migration data or unrelated agent changes.
- Reconcile every ticket with actual evidence, mark the conditional Price Change decision honestly, and leave future exploration outside shipped feature claims.
- Final release handoff lists deployment/migration steps, measured memory or blocked measurement, security limitations, validation results, and changed paths; coordinating agent alone owns staging/commit.

## Comments

Ready-for-agent means ready to implement. Completion requires observable behavior, not a populated checklist alone.
