# 14 — Spending summary and Currency honesty

Status: ready-for-agent
Progress: resolved
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

## Completion evidence — October 24, 2026

The summary always shows active-only native-currency monthly totals and yearly estimates. Any converted aggregate is secondary and marked partial/stale when applicable; demo rates are explicitly illustrative. Existing spending tests pass for mixed/missing FX and the $53.42 monthly / $641.00 yearly normalization case. The final ticker stays at the real count through visibility changes and reduced motion; screenshots correctly show 7 active of 9 demo records.
