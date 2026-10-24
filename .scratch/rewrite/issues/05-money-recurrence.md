# 05 — Money and recurrence rules

Status: ready-for-agent
Progress: open
Type: task
Blocked by: 03

## Outcome

Give every view the same trustworthy Price and calendar calculations.

## Acceptance criteria

- Prices persist as safe integer minor units using correct Currency precision; invalid/non-finite/negative/over-precision inputs are rejected and zero is allowed.
- Monthly/Annual Equivalents use the spec's daily, weekly, monthly, and yearly factors, retain calculation precision, and describe estimates honestly.
- Monthly/yearly recurrence preserves Billing Anchor, clamps short months, restores January 31 and February 29 when possible, and never drifts via a previous clamp.
- Daily/weekly recurrence and all Due Dates operate on calendar dates across timezones and DST.
- Missing Due Dates stay unset; paused/cancelled records are excluded from ongoing projections; Trial Deadlines do not automatically change lifecycle.
- Currency groups remain distinct when real exchange rates are unavailable.

## Comments

Exercise edge cases through existing external seams rather than inventing a separate calculation-test framework.
