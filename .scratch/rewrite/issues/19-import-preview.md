# 19 — Import Preview and duplicate decisions

Status: ready-for-agent
Progress: claimed
Type: task
Blocked by: 08, 18

## Outcome

Let users inspect migration/import consequences before changing the Collection.

## Acceptance criteria

- Preview shows valid/invalid counts, row errors, migration assumptions, and probable duplicates without altering persisted state.
- Duplicate matching distinguishes identifier collisions from likely Service/domain/Currency/cycle matches and never assumes every same-name Service is identical.
- Default is skip; add-as-new and replace require explicit choices; replace-all has its own destructive confirmation.
- Confirmed import is revalidated server-side and commits atomically against the previewed revision or returns a clear stale-preview conflict.
- Browser localStorage migration follows this same consent/preview contract and preserves its original value until success is acknowledged.
- Failure leaves the Collection intact and keeps sufficient preview/input state for correction or retry.

## Comments

Existing import-validation and duplicate-detection Playwright coverage is prior art, not permission to preserve silent replacement behavior.
