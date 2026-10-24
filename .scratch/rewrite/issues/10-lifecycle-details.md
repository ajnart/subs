# 10 — Lifecycle, notes, and trials

Status: ready-for-agent
Progress: resolved
Type: task
Blocked by: 09

## Outcome

Track the real state of each commitment without implying actions at its provider.

## Acceptance criteria

- Active, paused, and cancelled transitions persist, remain editable, and immediately update ongoing projections.
- Reactivation lets the user review stale Due Dates instead of inventing a renewal or losing Billing Anchor.
- Optional notes and Trial Deadline can be added, changed, and cleared and are preserved through restart.
- Trial/overdue badges distinguish tracked dates from automatic actions; no trial expiry cancels a Service.
- Delete confirmation names the Subscription and explains record removal, with no provider-cancellation claim.
- Contextual labels, pending states, and failures are accessible in card and detail contexts.

## Comments

Lifecycle State is tracking state, not a payment status.

## Completion evidence — October 24, 2026

Active/paused/cancelled status, notes and optional trial dates persist through the standard form and API. Existing lifecycle/trial tests verify that deadlines are advisory and inactive records do not contribute ongoing spending; browser editing preserves notes and dates. Delete confirmations and failed-delete recovery pass. No action contacts a provider or automatically cancels a trial.
