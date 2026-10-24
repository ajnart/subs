# 14 — Spending summary and Currency honesty

Status: ready-for-agent
Progress: open
Type: task
Blocked by: 05, 11

## Outcome

Present useful projected spending without false arithmetic or fabricated conversion.

## Acceptance criteria

- Active count, Monthly Equivalent, and Annual Equivalent reflect the server Collection using shared normalization rules.
- Paused/cancelled records and zero-cost records behave consistently with the specification.
- Totals are grouped by Currency when no valid rates exist; mixed currencies are never silently summed or treated as one symbol.
- Any actual converted aggregate includes real source/as-of context and explicit partial/unavailable/stale status.
- Summary labels distinguish normalized projections from actual payments and Collection scope from filtered results.
- Empty/failure/loading states do not present a failed load as a valid zero total.

## Comments

No new FX feed is required for release; honest unavailable behavior is complete behavior.
