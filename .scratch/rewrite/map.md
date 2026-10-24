# Subs rewrite execution map

Status: ready-for-agent

## Notes

The [Private Collection specification](spec.md) defines the target release, not a list of shipped capabilities. The [Domain glossary](../../GLOSSARY.md) names the concepts; the [Architecture decisions](../../docs/adr/0001-start-nitro-sqlite.md), [Installation access decision](../../docs/adr/0002-single-installation-pin.md), and [Visual authority decision](../../docs/adr/0003-design-authority.md) capture the major trade-offs.

## Explicit execution override

The user delegated remaining product details, testing seams, planning, implementation, and eventual commit to the coordinating agent. They explicitly requested no further interview: write the spec, then fully implement. This overrides the to-spec seam-approval pause and any planning workflow's interview/approval gates for this effort; it does not authorize weakening the selected release or reporting unfinished behavior as shipped.

These are implementation tickets, not unresolved wayfinding questions. Preserve `Status: ready-for-agent` as triage; use `Progress: open`, `claimed`, or `resolved` for execution. `Blocked by` references ticket numbers below; a dependency is satisfied only when its Progress is resolved with evidence. Claim before editing, append evidence and a summary when resolving, and keep unrelated concurrent work intact. Choose the lowest-numbered unblocked open ticket, or coordinate independent lanes explicitly. Existing issue-tracker conventions remain unchanged for other efforts.

The documentation/skills worker owns planning, domain docs, and copied skills only; the coordinating and implementation agents own application changes, final validation, staging, and commits. No full lint/typecheck run is expected from the documentation worker while those application edits are concurrent.

## Decisions-so-far

- One Installation, one private Collection, no account system or cloud synchronization. PIN protection defaults on; initial setup requires an Operator token.
- Six-digit PIN; password-grade server hash; opaque HttpOnly SameSite session with seven-day expiry; logout invalidation; bounded attempts; trusted same-origin mutations. DISABLE_AUTH=true is explicit and documented.
- Latest compatible TanStack Start + Nitro v3 + embedded SQLite through Nitro, Bun runtime, one image and persistent volume. Nitro v3 beta integration must be verified; production RSS remains unmeasured until runtime evidence exists.
- Exact shadcn preset b3rmZdYMye, Start template, pointer behavior, Radix base, Phosphor icons; Bold Wikipedia applied last owns supplied theme tokens. Every retained primitive is regenerated.
- Daily/weekly estimates use 365 days/52 weeks per year; projections are not transaction history. Billing Anchors survive calendar clamping. Missing dates stay missing.
- Integer-minor-unit money; per-currency totals are the safe release fallback. No invented FX rate, no required new provider dependency.
- Data-only versioned Backups, explicit Import Preview and duplicate choices, all three legacy storage sources supported. Empty means empty; templates are opt-in.
- Highest existing seams are HTTP/auth/persistence and Playwright user flows; no new unit-test files. Parent owns final lint/typecheck and baseline reporting.

## Execution order

| Ticket                                      | Human-readable work item                | Depends on             |
| ------------------------------------------- | --------------------------------------- | ---------------------- |
| [01](issues/01-framework-foundation.md)     | Framework and runtime foundation        | None                   |
| [02](issues/02-design-system.md)            | Regenerated design system               | 01                     |
| [03](issues/03-durable-collection.md)       | Durable Collection schema               | 01                     |
| [04](issues/04-access-boundary.md)          | Installation access boundary            | 03                     |
| [05](issues/05-money-recurrence.md)         | Money and recurrence rules              | 03                     |
| [06](issues/06-legacy-migration.md)         | Legacy migration boundary               | 04, 05                 |
| [07](issues/07-collection-contract.md)      | Authenticated Collection contract       | 04, 05                 |
| [08](issues/08-private-shell.md)            | Private responsive shell                | 02, 04, 07             |
| [09](issues/09-entry-editing.md)            | Quick entry and editing                 | 08                     |
| [10](issues/10-lifecycle-details.md)        | Lifecycle, notes, and trials            | 09                     |
| [11](issues/11-card-table.md)               | Service cards and table                 | 08, 10                 |
| [12](issues/12-find-organize.md)            | Search, filters, and sort               | 11                     |
| [13](issues/13-bulk-management.md)          | Bulk management                         | 12                     |
| [14](issues/14-summary-currency.md)         | Spending summary and Currency honesty   | 05, 11                 |
| [15](issues/15-upcoming-calendar.md)        | Upcoming commitments and calendar       | 10, 14                 |
| [16](issues/16-insights.md)                 | Spending and Category insights          | 12, 14                 |
| [17](issues/17-budget-scenarios.md)         | Budget and Savings Scenarios            | 16                     |
| [18](issues/18-portable-backups.md)         | Portable versioned Backups              | 06, 07                 |
| [19](issues/19-import-preview.md)           | Import Preview and duplicate decisions  | 08, 18                 |
| [20](issues/20-opt-in-templates.md)         | Opt-in Starter Templates                | 09, 19                 |
| [21](issues/21-price-history.md)            | Price Change support decision           | 07, 10                 |
| [22](issues/22-accessibility-resilience.md) | Accessibility, keyboard, and resilience | 13, 15, 17, 19, 20, 21 |
| [23](issues/23-container-operations.md)     | Container persistence and operations    | 06, 18, 22             |
| [24](issues/24-release-verification.md)     | Release verification and retirement     | 23                     |

## Release versus exploration

Mandatory release work is tickets 01–20 and 22–24. Ticket 21 resolves the conditional Price Change enhancement: ship it only with actual persisted backend support, otherwise document deferral and omit its controls. None of the tickets is marked shipped by this planning pass; executing agents must reconcile implemented evidence with these records.

Future exploratory candidates, not release commitments: provider price monitoring, a verified FX feed, background reminders/push, offline mutation synchronization, bank/email integration, multiple Collections or users, and distributed deployment. These require separate scoping and security decisions. Marketing and empty states must not imply they run today.

## Fog

- Exact compatible package versions and Nitro v3 production SQLite behavior require implementation validation.
- Production RSS, restart durability, and container filesystem permissions require measured evidence; no RAM number has been promised.
- Existing lint/typecheck baseline is broken; final report must distinguish inherited failures from rewrite regressions.
- Historical legacy records can contain ambiguous money precision or missing dates. Preview rather than silently infer unsupported history.
- Price Change availability depends on the actual backend delivered, not this plan's existence.
- Theme endpoint and upstream guidance are live documents; record selected package versions and retain reviewed skill contents rather than treating latest as a reproducible build.

## Completion evidence

Append a concise dated summary here after each resolved ticket, with its human-readable link and actual checks. Until then, the table is a dependency map only.
