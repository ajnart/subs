# 17 — Budget and Savings Scenarios

Status: ready-for-agent
Progress: open
Type: task
Blocked by: 16

## Outcome

Help users evaluate projected cost against a target without executing financial actions.

## Acceptance criteria

- A monthly Budget and its Currency save server-side and are visible across devices; clearing it removes the target deliberately.
- Comparison uses comparable Monthly Equivalents only and discloses excluded currencies or unavailable conversion.
- Savings Scenario selection shows projected monthly/annual reduction by Currency using active records only.
- Scenarios do not persist lifecycle edits, delete data, or contact providers; applying an actual lifecycle change is a separate explicit action.
- Invalid targets, zero target, empty Collection, unavailable FX, stale data, and failed saves have clear accessible states.
- Labels distinguish targets, estimates, and actual record changes.

## Comments

A Budget is not a spending cap and cannot prevent payments.
