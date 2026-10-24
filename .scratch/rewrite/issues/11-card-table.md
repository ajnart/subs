# 11 — Service cards and table

Status: ready-for-agent
Progress: resolved
Type: task
Blocked by: 08, 10

## Outcome

Show the same Collection as recognizable cards or a comparable compact table.

## Acceptance criteria

- Card and table show consistent Service, Price/Currency/cycle, lifecycle, Category, and available Due Date/trial information.
- View switching preserves the Collection and persists only non-sensitive presentation preference locally.
- Narrow screens remain usable; long names, large amounts, many records, and missing optional fields do not break layout.
- Service imagery uses local/bundled assets or accessible initial/neutral fallbacks; no default favicon/preview telemetry occurs.
- Service links open safely on deliberate user action; edit and lifecycle controls remain keyboard reachable.
- Empty Collection, loading, request failure, and filtered-empty states are distinguishable.

## Comments

Every displayed primitive must come from the replacement design system.

## Completion evidence — October 24, 2026

`overview.tsx` renders the same records as local-branded service cards or a table, with native prices, lifecycle and recurrence details. The real-browser reviewer exercised both layouts, filters, editing and empty-state recovery. Mobile/desktop overflow tests pass; the 320px follow-up confirms visible actions and navigation. No external assets load before a service link is activated. Footer alignment was corrected and recaptured.
