# 20 — Opt-in Starter Templates

Status: ready-for-agent
Progress: open
Type: task
Blocked by: 09, 19

## Outcome

Offer quick Service entry without populating the Collection on the user's behalf.

## Acceptance criteria

- Fresh Installation and intentionally emptied Collection remain empty across reload/restart.
- User deliberately opens Starter Templates and chooses a Service to prefill the standard editable form.
- Saving is explicit and uses the same validation, duplicate feedback, and authenticated persistence as manual entry.
- Suggested prices are labeled as editable starting values, not live verified regional offers.
- Template assets do not trigger third-party service previews or telemetry by default.
- Cancel/dismiss leaves no record and no automatic demo-seeding path survives in the live UI.

## Comments

Preserve quick entry and Subs service identity, not the prior mandatory demonstration Collection.
