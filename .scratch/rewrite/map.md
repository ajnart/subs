# Subs rewrite execution map

Status: ready-for-agent

## Notes

The [Private Collection specification](spec.md) defines the target release, not a list of shipped capabilities. The [Domain glossary](../../GLOSSARY.md) names the concepts; the [Architecture decisions](../../docs/adr/0001-start-nitro-sqlite.md), [Installation access decision](../../docs/adr/0002-single-installation-pin.md), and [Visual authority decision](../../docs/adr/0003-design-authority.md) capture the major trade-offs.

## Explicit execution override

The user delegated remaining product details, testing seams, planning, implementation, and eventual commit to the coordinating agent. They explicitly requested no further interview: write the spec, then fully implement. This overrides the to-spec seam-approval pause and any planning workflow's interview/approval gates for this effort; it does not authorize weakening the selected release or reporting unfinished behavior as shipped.

These are implementation tickets, not unresolved wayfinding questions. Preserve `Status: ready-for-agent` as triage; use `Progress: open`, `claimed`, or `resolved` for execution. `Blocked by` references ticket numbers below; a dependency is satisfied only when its Progress is resolved with evidence. Claim before editing, append evidence and a summary when resolving, and keep unrelated concurrent work intact. Choose the lowest-numbered unblocked open ticket, or coordinate independent lanes explicitly. Existing issue-tracker conventions remain unchanged for other efforts.

The documentation/skills worker owns planning, domain docs, and copied skills only; the coordinating and implementation agents own application changes, final validation, staging, and commits. No full lint/typecheck run is expected from the documentation worker while those application edits are concurrent.

The coordinator claims this release through completion. GPT-6.1 Sol implementation lanes cover framework/design-system integration, server/domain behavior, frontend workflows, and existing regression flows; the coordinator owns container operations, integration review, and final validation. Parallel implementation is coordinated against the shared HTTP contract; tickets remain claimed until their acceptance evidence is recorded.

## Decisions-so-far

- One Installation, one private Collection, no account system or cloud synchronization. PIN protection defaults on; initial setup requires an Operator token.
- Six-digit PIN; password-grade server hash; opaque HttpOnly SameSite session with seven-day expiry; logout invalidation; bounded attempts; trusted same-origin mutations. DISABLE_AUTH=true is explicit and documented.
- Compatible TanStack Start + Nitro v3 + embedded SQLite through Nitro, Bun runtime, one image and persistent volume. The final builds and real-container verification pass; measured RSS and conditions are recorded in ticket 23, not inferred from framework choice.
- Exact shadcn preset b3rmZdYMye, Start template, pointer behavior, Radix base, Phosphor icons; Bold Wikipedia applied last owns supplied theme tokens. Every retained primitive is regenerated.
- Daily/weekly estimates use 365 days/52 weeks per year; projections are not transaction history. Billing Anchors survive calendar clamping. Missing dates stay missing.
- Integer-minor-unit money; per-currency totals are the safe release fallback. No invented FX rate, no required new provider dependency.
- Data-only versioned Backups, explicit Import Preview and duplicate choices, all three legacy storage sources supported. Empty means empty; templates are opt-in.
- Highest existing seams are HTTP/auth/persistence and Playwright user flows; no new unit-test files. Parent owns final lint/typecheck and baseline reporting.
- Latest user scope adds Hallmark-led UI polish, purposeful Magic UI/Aceternity components, lazy link previews, and a browser-only static demo deployed with Wrangler at subs.ajnart.dev. The private Docker target remains separate and protected by default.

## Execution order

| Ticket                                      | Human-readable work item                  | Depends on             |
| ------------------------------------------- | ----------------------------------------- | ---------------------- |
| [01](issues/01-framework-foundation.md)     | Framework and runtime foundation          | None                   |
| [02](issues/02-design-system.md)            | Regenerated design system                 | 01                     |
| [03](issues/03-durable-collection.md)       | Durable Collection schema                 | 01                     |
| [04](issues/04-access-boundary.md)          | Installation access boundary              | 03                     |
| [05](issues/05-money-recurrence.md)         | Money and recurrence rules                | 03                     |
| [06](issues/06-legacy-migration.md)         | Legacy migration boundary                 | 04, 05                 |
| [07](issues/07-collection-contract.md)      | Authenticated Collection contract         | 04, 05                 |
| [08](issues/08-private-shell.md)            | Private responsive shell                  | 02, 04, 07             |
| [09](issues/09-entry-editing.md)            | Quick entry and editing                   | 08                     |
| [10](issues/10-lifecycle-details.md)        | Lifecycle, notes, and trials              | 09                     |
| [11](issues/11-card-table.md)               | Service cards and table                   | 08, 10                 |
| [12](issues/12-find-organize.md)            | Search, filters, and sort                 | 11                     |
| [13](issues/13-bulk-management.md)          | Bulk management                           | 12                     |
| [14](issues/14-summary-currency.md)         | Spending summary and Currency honesty     | 05, 11                 |
| [15](issues/15-upcoming-calendar.md)        | Upcoming commitments and calendar         | 10, 14                 |
| [16](issues/16-insights.md)                 | Spending and Category insights            | 12, 14                 |
| [17](issues/17-budget-scenarios.md)         | Budget and Savings Scenarios              | 16                     |
| [18](issues/18-portable-backups.md)         | Portable versioned Backups                | 06, 07                 |
| [19](issues/19-import-preview.md)           | Import Preview and duplicate decisions    | 08, 18                 |
| [20](issues/20-opt-in-templates.md)         | Opt-in Starter Templates                  | 09, 19                 |
| [21](issues/21-price-history.md)            | Price Change support decision             | 07, 10                 |
| [22](issues/22-accessibility-resilience.md) | Accessibility, keyboard, and resilience   | 13, 15, 17, 19, 20, 21 |
| [23](issues/23-container-operations.md)     | Container persistence and operations      | 06, 18, 22             |
| [24](issues/24-release-verification.md)     | Release verification and retirement       | 23                     |
| [25](issues/25-visual-polish.md)            | Concise polished UI and link previews     | 22                     |
| [26](issues/26-static-demo.md)              | Backend-free browser demo                 | 18, 19, 25             |
| [27](issues/27-demo-deployment.md)          | Automatic demo deployment and screenshots | 23, 24, 26             |

## Release versus exploration

Mandatory release work is tickets 01–20 and 22–27. Ticket 21 resolves the conditional Price Change enhancement: ship it only with actual persisted backend support, otherwise document deferral and omit its controls. Tickets 01–26 are now resolved with implementation evidence; 21 is implemented, not deferred. Ticket 27 remains claimed because automatic production deployment needs an external Actions secret. The dependency map alone is never proof of completion.

Future exploratory candidates, not release commitments: provider price monitoring, a verified FX feed, background reminders/push, offline mutation synchronization, bank/email integration, multiple Collections or users, and distributed deployment. These require separate scoping and security decisions. Marketing and empty states must not imply they run today.

## Fog

- Exact locked packages and Nitro v3 production SQLite have passed integrated builds and HTTP persistence checks; beta-runtime risk remains a deployment consideration.
- RSS, restart/image-replacement durability and container permissions were measured; ticket 23 records conditions rather than a RAM guarantee.
- The inherited lint/typecheck baseline was broken. Both final rewritten checks pass without exemptions.
- Historical legacy records can contain ambiguous money precision or missing dates. Preview rather than silently infer unsupported history.
- Actual recorded Price Changes are delivered and survive restart; portable JSON excludes that history and full-volume snapshots retain it.
- Theme endpoint and upstream guidance are live documents; record selected package versions and retain reviewed skill contents rather than treating latest as a reproducible build.
- Automatic demo deployment is configured but not activated: `CLOUDFLARE_API_TOKEN` was absent from repository Actions secrets at final verification. Local OAuth successfully publishes, but is not suitable as a durable CI secret.

## Completion evidence

### October 24, 2026

- [01 — Framework foundation](issues/01-framework-foundation.md): private/static production builds and the real Bun container pass.
- [02 — Design system](issues/02-design-system.md): exact preset/theme preserved; real light/dark/mobile captures inspected.
- [03 — Durable Collection](issues/03-durable-collection.md): 100 records, history and session retained through restart and final-image replacement.
- [04 — Access boundary](issues/04-access-boundary.md): HTTP protection, setup race, expiry, persistent throttling and exact auth bypass verified.
- [05 — Money and recurrence](issues/05-money-recurrence.md): precision, estimate and anchored-calendar external regressions pass.
- [06 — Legacy migration](issues/06-legacy-migration.md): shared parser and existing legacy-input/rollback tests pass; preserved-source procedure documented.
- [07 — Collection contract](issues/07-collection-contract.md): authenticated writes, Origin and mandatory ETag checks pass.
- [08 — Responsive shell](issues/08-private-shell.md): protected PIN browser flow and four visible destinations at 320px verified.
- [09 — Entry/editing](issues/09-entry-editing.md): browser CRUD/reload, validation, keyboard and narrow field checks pass.
- [10 — Lifecycle/details](issues/10-lifecycle-details.md): trial/lifecycle exclusions and destructive-action recovery pass.
- [11 — Cards/table](issues/11-card-table.md): both layouts reviewed; no default external asset requests.
- [12 — Find/organize](issues/12-find-organize.md): composed filtering and empty-result recovery pass.
- [13 — Bulk management](issues/13-bulk-management.md): revision-guarded transactional contract and confirmed demo bulk deletion reviewed.
- [14 — Summary/currency](issues/14-summary-currency.md): native totals, annual equivalents, partial FX and stable real counts verified.
- [15 — Upcoming/calendar](issues/15-upcoming-calendar.md): all three existing upcoming/calendar tests pass.
- [16 — Insights](issues/16-insights.md): derived category/projection views reviewed with textual amounts and FX limitations.
- [17 — Budget/scenarios](issues/17-budget-scenarios.md): budget persistence and non-mutating savings regressions pass.
- [18 — Backups](issues/18-portable-backups.md): HTTP round trips and 2 MiB rollback guard pass, including 101 repeated-service records.
- [19 — Import preview](issues/19-import-preview.md): real bounded candidates, ambiguity rejection and stale-preview safety pass.
- [20 — Templates](issues/20-opt-in-templates.md): deliberate draft-only picker, user-entered prices and empty private defaults verified.
- [21 — Price history](issues/21-price-history.md): implemented real baselines/changes with durable retrieval and explicit backup limitations.
- [22 — Accessibility/resilience](issues/22-accessibility-resilience.md): focused browser review, keyboard/failure regressions and 320px/reduced-motion follow-up complete; limitations disclosed.
- [23 — Container operations](issues/23-container-operations.md): final image, Compose, runtime guards, recovery docs and measured 100-record RSS recorded.
- [24 — Release verification](issues/24-release-verification.md): final lint/typecheck, 27/27 existing tests and both builds pass; review findings fixed.
- [25 — Visual polish](issues/25-visual-polish.md): all three P2 review findings plus footer nit fixed and recaptured; Hallmark static exceptions remain explicit.
- [26 — Static demo](issues/26-static-demo.md): API-blocked persistence, isolated reset/corrupt recovery and static build pass.
- [27 — Deployment/screenshots](issues/27-demo-deployment.md): final demo published and HTTPS assets verified; automatic deployment remains blocked on the scoped Actions secret. CI outcome follows after push.
