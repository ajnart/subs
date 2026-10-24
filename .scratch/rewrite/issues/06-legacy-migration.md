# 06 — Legacy migration boundary

Status: ready-for-agent
Progress: open
Type: task
Blocked by: 04, 05

## Outcome

Move existing users to the server Collection without data loss or forced sample records.

## Acceptance criteria

- Shared validation accepts plain exported JSON arrays, persisted Zustand state envelopes, server key-wrapped envelopes, and legacy browser localStorage values.
- Original input is preserved; startup migration is idempotent and never silently overwrites a non-empty Collection.
- Browser migration is explicitly offered after authorization, never silently uploads unrelated storage, and leaves the source intact until confirmed success.
- Decimal legacy money is converted with precision diagnostics; missing lifecycle/monthly-cycle defaults are previewed and missing dates remain missing.
- Only allowlisted non-sensitive preferences migrate; errors remain visible and invalid data is not replaced with examples.
- Operator procedure explains how to preserve the old JSON data before upgrade and retry failed migration.

## Comments

The existing server persisted the subscription-storage key containing a Zustand state wrapper; file exports were plain arrays.
