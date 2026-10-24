# 17 — Budget and Savings Scenarios

Status: ready-for-agent
Progress: resolved
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

## Completion evidence — October 24, 2026

Settings saves the monthly target/currency as shared preferences. Insights compares only convertible amounts, disables unavailable scenario inputs and labels monthly/yearly savings as estimates. Existing budget/scenario and unavailable-FX tests pass and confirm that scenarios leave subscriptions unchanged. Preferences survive reload; no scenario executes lifecycle or provider changes.
