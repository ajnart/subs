# Subs private Collection rewrite

Status: ready-for-agent

## Problem Statement

Subs users need a trustworthy view of recurring service commitments across devices. The current application splits persistence between a browser store and a server JSON envelope, silently supplies demonstration Subscriptions, and lacks an adequate private-Installation boundary. A visual refresh alone cannot establish trustworthy dates, money, migration, or access protection.

## Solution

Replace the running application with a responsive, service-centered Subs experience backed by one durable private Collection. Preserve fast entry and recognizable Subs identity while making recurrence, currency limitations, lifecycle, imports, and access protection explicit. Deliver the release scope below completely; distinguish projections and tracking actions from actual payments or provider-side cancellation.

## User Stories

1. As an Operator, I want one Installation containing one private Collection, so that every device sees the same tracking data without accounts.
2. As an Operator, I want authentication enabled on a fresh Installation, so that my Collection is not public by accident.
3. As an Operator, I want an Operator setup token to authorize initial PIN creation, so that a random first visitor cannot claim my Installation.
4. As a user, I want a clear segmented PIN entry experience, so that I can unlock on a phone or keyboard.
5. As a user, I want my PIN protected on the server, so that stored tracking data does not reveal my access secret.
6. As a user, I want a persistent but expiring device session, so that routine access is convenient without permanently unlocking every device.
7. As a user, I want to lock or sign out of a device, so that someone using it later cannot browse my Collection.
8. As an Operator, I want bounded login attempts and safe mutation origins, so that basic guessing and cross-site attacks are resisted.
9. As an Operator, I want an explicit trusted-environment authentication escape hatch, so that I can intentionally operate without a PIN when appropriate.
10. As a returning user, I want to migrate a plain JSON Subscription array, so that existing exports remain useful.
11. As an Operator, I want to migrate the existing server persistence envelope, so that upgrading does not strand the Collection.
12. As a returning browser-storage user, I want an explicit local migration flow, so that my existing device data reaches the shared Collection safely.
13. As a new user, I want an actually empty Collection, so that example services are not mistaken for my own commitments.
14. As a user, I want optional Starter Templates, so that I can prefill common Services only when I choose them.
15. As a user, I want quick Subscription creation with name, Price, Currency, and Billing Cycle, so that tracking takes little effort.
16. As a user, I want optional Service links and safe local visual fallbacks, so that recognizable service cards do not disclose my interests to third parties.
17. As a user, I want to edit an existing Subscription, so that corrections do not require deleting and recreating it.
18. As a user, I want destructive actions confirmed with their scope, so that I do not lose records accidentally.
19. As a user, I want to pause a Subscription, so that I can retain it without counting ongoing cost.
20. As a user, I want to cancel a tracked Subscription, so that I can preserve its details without implying the provider was contacted.
21. As a user, I want to reactivate a paused or cancelled Subscription, so that restarting tracking is simple.
22. As a user, I want optional notes, so that plan details and personal context remain near the Service.
23. As a user, I want an optional Trial Deadline, so that I can see when to make a decision without pretending cancellation is automatic.
24. As a user, I want Due Dates stored as calendar dates, so that timezone changes do not move renewals to another day.
25. As a user, I want monthly and yearly recurrence to preserve the Billing Anchor after short months, so that January 31 does not permanently become February 28.
26. As a user, I want leap-year behavior that returns to the original anchor when possible, so that long-term projections remain predictable.
27. As a user, I want missing Due Dates called out rather than invented, so that upcoming charges remain honest.
28. As a user, I want amounts validated using each Currency's minor-unit precision, so that persisted prices remain exact.
29. As a user, I want Monthly and Annual Equivalents with their projection basis, so that I can compare different Billing Cycles.
30. As a user, I want separate totals when conversion is unavailable, so that mixed currencies are not silently added together.
31. As a user, I want any currency conversion labeled with source and freshness, so that stale or unavailable rates do not look authoritative.
32. As a user, I want active-only ongoing projections, so that paused and cancelled records do not inflate totals.
33. As a user, I want an upcoming list ordered by Due Date, so that near-term commitments are easy to inspect.
34. As a user, I want a calendar of projected Due Dates and Trial Deadlines, so that I can review a month visually.
35. As a user, I want service cards, so that I can recognize commitments at a glance.
36. As a user, I want a compact table alternative, so that I can compare many Subscriptions efficiently.
37. As a user, I want text search, so that I can locate a Service or note quickly.
38. As a user, I want Category and Lifecycle State filters, so that I can focus on the commitments relevant to me.
39. As a user, I want deterministic sorting, so that reloading does not unexpectedly reorder equal results.
40. As a user, I want a visible clear-filters action, so that an empty result set is not confused with an empty Collection.
41. As a user, I want bulk selection and lifecycle changes, so that maintaining many records does not require repeated dialogs.
42. As a user, I want bulk deletion with an exact selected count, so that I understand the impact before confirming.
43. As a user, I want Category spending insights, so that I can understand my projected commitments by purpose.
44. As a user, I want a monthly Budget, so that I can compare projected spending with a target in a meaningful Currency.
45. As a user, I want a non-destructive Savings Scenario, so that I can explore potential savings before editing anything.
46. As a user, I want available Price Changes shown as recorded changes rather than payments, so that history does not overstate what Subs knows.
47. As a user, I want a versioned Backup, so that my Collection remains portable across upgrades.
48. As a user, I want an Import Preview before committing, so that invalid rows and transformations are visible.
49. As a user, I want explicit duplicate decisions, so that an import never silently replaces my records.
50. As a user, I want an import to finish atomically, so that a failure does not leave half a Collection imported.
51. As a user, I want a Backup that excludes credentials, so that sharing a data file does not share my Installation access.
52. As a user, I want light, dark, and system appearance, so that Subs fits my device and accessibility needs.
53. As a user, I want keyboard actions that respect text inputs and dialogs, so that shortcuts do not interrupt editing.
54. As a screen-reader user, I want named controls, focus management, and announced results, so that the entire workflow is usable without sight.
55. As a phone user, I want responsive forms and navigation, so that adding and editing are practical on a narrow screen.
56. As a user, I want clear loading, failure, and retry states, so that slow or failed persistence is never presented as a successful save.
57. As a user, I want failed saves to preserve my input, so that a temporary outage does not destroy my work.
58. As a user on two devices, I want stale writes rejected or explicitly reconciled, so that one device does not unknowingly overwrite another.
59. As an Operator, I want a single image and writable volume deployment, so that self-hosting remains straightforward.
60. As an Operator, I want measured production memory and documented measurement conditions, so that capacity claims reflect real evidence.
61. As an Operator, I want a safe migration and restore procedure, so that replacing the old application is reversible through preserved data.
62. As a user, I want the old UI and storage path retired from the running product, so that there is only one truthful Subs experience.
63. As a user, I want concise labels without marketing or repeated explanations, so that tracking stays simple.
64. As a new user, I want a compact setup and quick-start experience, so that my first Subscription is easy to add.
65. As a user, I want purposeful motion and a carefully composed background, so that the app feels polished without distracting from my data.
66. As a user, I want the previous interactive link-preview experience restored, so that I can inspect a public Service link on demand.
67. As a visitor, I want a working public demo without a PIN or backend, so that I can try Subs immediately.
68. As a demo user, I want local edits, import/export, and an explicit reset, so that I can explore without affecting another visitor or private Installation.
69. As an Operator, I want the static demo deployed automatically to Cloudflare Pages with Wrangler at subs.ajnart.dev as its only canonical hostname, so that the public version follows successful release builds.
70. As a contributor, I want current application screenshots and a short README, so that setup and the product are clear without excessive documentation.

## Implementation Decisions

### Architecture and ownership

- Use the latest mutually compatible TanStack Start and React releases with Nitro v3, Bun, and embedded SQLite through Nitro's database abstraction. Nitro v3 is a beta integration risk to verify, not a reason to use obsolete v2 APIs.
- Deploy one running instance and one writable persistent volume. All Collection data, shared preferences, Budget, and optional Price Changes are server-owned. Browser persistence is limited to non-sensitive appearance, view, and similar presentation preferences after migration.
- Prefer existing framework request and validation facilities. Introduce no Hono, Go server, oRPC, hosted database, account service, or distributed synchronization layer without a demonstrated integration blocker and recorded rationale.
- Validate inputs at the request boundary, use parameterized database access, bound import payloads, return structured failures, and acknowledge writes only after persistence succeeds. A Collection revision or equivalent optimistic concurrency guard protects stale-device mutation.

### Access boundary

- Default to PIN protection. First setup requires a high-entropy Operator setup token supplied through the environment or generated once and exposed only to Operator logs; never expose it through public setup-status responses. Setup is atomic and the token ceases authorizing setup after the PIN exists.
- Choose a six-digit numeric PIN entered with regenerated shadcn InputOTP. Hash it using a salted password-grade primitive; never log the PIN, include it in URLs, or expose its hash to the browser.
- Use high-entropy opaque server-validated HttpOnly SameSite sessions, Secure on HTTPS, with seven-day expiry and explicit logout invalidation. Keep credential/session state outside portable Collection Backups.
- Bound failed attempts per source and Installation, return a clear retry time, avoid username/account concepts, and validate Origin against the configured trusted origin for state-changing requests. A public status/health response reveals no Collection data.
- Only the exact explicit Operator setting DISABLE_AUTH=true bypasses the PIN. Document the exposure and retain input validation and same-origin mutation checks in that mode. PIN recovery is an Operator maintenance action, not an unauthenticated reset endpoint.

### Money, lifecycle, and recurrence

- Persist Price as integer minor units plus Currency; reject invalid precision, negative or non-finite values, unsupported currencies, and unsafe integer ranges. Zero-cost Subscriptions are allowed. Currency metadata handles zero-, two-, and three-decimal denominations correctly.
- Daily and weekly Monthly Equivalents use 365/12 and 52/12; quarterly uses 1/3, yearly uses 1/12, and monthly uses 1. Annual Equivalents use 365, 52, 4, 1, and 12 respectively. Retain precision during calculation and round only at the displayed/exported denomination boundary; label these as estimates, not actual transactions.
- Ongoing projections include active records only. Paused and cancelled records remain searchable and editable; lifecycle changes do not contact providers or execute payments. Trial Deadline is optional and does not implicitly advance lifecycle.
- Due Dates are date-only values. Monthly and yearly recurrence retain the original Billing Anchor and clamp invalid dates to the last day of the target month, restoring the anchor when possible. Daily and weekly recurrence advances calendar days, not elapsed UTC milliseconds. Missing dates remain missing.
- Distinguish overdue tracked dates from upcoming projections; display recurrence-derived dates honestly and use the same recurrence rules for cards, upcoming lists, and calendar.
- Default to per-currency totals. A converted aggregate is available only when actual validated rates exist, accompanied by source/as-of information; missing or stale rates produce an explicit unavailable/partial state, never fabricated rates or a successful zero total. A new FX integration is not required for release.
- Budget is a server-owned monthly target in one Currency. Compare only comparable spending and explain excluded currencies. Savings Scenarios use the same normalization, have no persistent side effects, and keep per-currency uncertainty visible.

### Experience and visual authority

- Generate from exact shadcn preset b3rmZdYMye using the Start template, pointer behavior, and Radix base. Keep preset-provided Phosphor icons. Regenerate every retained primitive; the old UI must not remain a live route or runtime dependency path.
- Apply the Bold Wikipedia theme after the preset, with its tokens authoritative over colors, fonts, radius, charts, and supplied ancillary tokens in both modes. Retain preset structure and APIs. Keep the Subs name and service-centered quick entry, not the old layout pixel for pixel.
- Provide cards/table, search, Category/Lifecycle State filters, stable sort, bulk selection, upcoming list, calendar, insights, Budget, and Savings Scenarios. Clearly distinguish Collection-wide summaries from filtered results; selections track visible identifiers and destructive actions name their scope.
- Build keyboard-accessible dialogs, focus restoration, meaningful empty/loading/error states, retryable failed saves, and narrow-screen layouts. Shortcuts ignore editable controls and respect modal focus.
- Start empty. Starter Templates are explicitly opted into and always reviewed before save; the user supplies their own price rather than relying on an unverified current provider price.
- Use bundled/local assets, initials, or neutral fallbacks by default. Service URLs are user-activated safe external links. The later [keyboard-first request](../keyboard-first/spec.md) explicitly permits verified service marks and safe public-origin favicon fallbacks; lazy URL previews remain separate and no server arbitrary-URL fetcher is introduced.

### Migration, imports, and history

- Accept the existing plain exported array, persisted Zustand state envelope, server key-wrapped envelope, and legacy browser localStorage value through a shared validated migration boundary. Preserve original migration inputs; never silently seed examples or overwrite a non-empty Collection at startup.
- Existing legacy decimal prices convert explicitly to minor units with precision warnings where necessary. Missing legacy lifecycle defaults to active; missing Billing Cycle defaults to monthly with that assumption shown in preview. Missing Due Dates stay unset. Legacy preference values transfer only through an allowlisted mapping.
- Preview invalid rows, assumptions, and duplicate candidates. Exact identifier collisions and likely matches by normalized Service name, domain, Currency, and Billing Cycle are review candidates, not evidence that two Subscriptions must be merged.
- Default duplicate action is skip. Offer explicit add-as-new or replace choices; replace-all is a distinct destructive confirmation. The server revalidates preview decisions and applies accepted rows atomically against the previewed Collection revision.
- Versioned exports contain Collection records and portable shared preferences, with schema version and export timestamp. Exclude PIN material, setup tokens, sessions, rate-limit records, and server secrets.
- Price Change history is a conditional release enhancement only if the backend actually records and exposes it. Show genuine recorded changes; never fabricate past prices from today's values or claim historical payments. If absent, omit its controls and list it as deferred rather than blocking the core release dishonestly.

### Visual polish and static demonstration

- Apply the installed Hallmark skill to the existing app, preserving the exact preset and Bold Wikipedia theme. Use real Magic UI and Aceternity registry components where they improve interaction, not a wholesale landing-page component showcase.
- Remove promotional language and redundant explanation. Keep short functional labels, essential validation, financial uncertainty, destructive confirmations, and security guidance where needed.
- Motion respects reduced-motion preferences, uses bounded transform/opacity transitions, preserves focus, and never hides usable content permanently. Review desktop/mobile and light/dark states in a real browser.
- Restore lazy, user-activated link previews for safe public HTTP(S) URLs. Never request previews on page mount, preview local/private addresses, or add server-side arbitrary URL fetching.
- The static demo reuses the app UI with isolated browser persistence and clearly identified sample data. No API, database, PIN, or live exchange-rate service is required. Demo rates are explicitly illustrative, not current market rates.
- Private Docker installations still start empty with authentication enabled. Demo flags must not change the private runtime's defaults or include server modules and secrets in static assets.
- Build and validate both targets. Deploy the static artifact to Cloudflare Pages using Wrangler at subs.ajnart.dev as its only canonical hostname after successful checks; limit custom-domain cutover changes to its old Worker binding and Pages/DNS records. Distinguish verified HTTPS serving from Pages control-plane validation. Do not make ordinary local builds or Docker builds publish remotely. Keep automated deployment credentials scoped and outside the repository. Pages serves no backend, Functions or PIN challenge; private Docker installations retain PIN protection by default.
- Refresh real application screenshots and keep the public README short. Detailed release evidence belongs in these internal tickets rather than lengthy product copy.

## Testing Decisions

- The user delegated test-seam selection and remaining product decisions; proceed without another interview or approval gate.
- Prefer the existing highest seams: authenticated HTTP boundaries against real temporary SQLite persistence, plus existing Playwright browser flows for complete user behavior. Avoid new unit-test files and implementation-detail mocks.
- Good checks assert externally visible protection, committed state after restart, atomic migration/import, exact exported amounts, recurrence output, and what a person can actually complete with a keyboard or phone.
- Reuse and adapt existing Playwright coverage for entry, Category filtering, upcoming payments, spending insights, shortcuts, import validation, duplicate detection, and destructive actions where behavior is retained. Retire obsolete expectations of forced sample data rather than preserving the bug.
- Exercise unauthorized Collection reads/writes, Operator-token setup, setup races, failed PIN attempts, session expiry/logout, cross-origin mutation refusal, explicit auth bypass, stale writes, malformed imports, and unavailable FX at the HTTP seam.
- Exercise January 31, February 29, short months, daily/weekly rollover, missing dates, paused/cancelled exclusions, and zero-/three-decimal currencies through those same external seams.
- Parent implementation validates focused flows and final lint/typecheck after concurrent app edits settle. Existing lint/typecheck failures are a reported baseline, not an excuse to declare a passing result. Record unexecuted checks explicitly.
- Measure production runtime RSS after warmup and representative interactions; record runtime, data size, elapsed observation, and methodology. Never substitute a framework marketing number or development-server reading for production evidence.

## Out of Scope

- Bank or email scraping, credential harvesting, provider-side cancellation, payment execution, invoices, SaaS billing, account registration, multiple users/Collections, hosted cloud sync, or horizontal scaling.
- Background push, reliable alarms after the browser is closed, automatic trial cancellation and provider price monitoring. The later [keyboard-first request](../keyboard-first/spec.md) adds opt-in open-browser reminders and safe service-icon fallbacks; URL previews still require user activation.
- New FX-provider infrastructure, invented historical transactions, forced demo data, speculative new unit-test suites, or an Astro runtime.

## Further Notes

This document specifies the target release; ready-for-agent is triage readiness, not evidence anything has shipped. Completion and deferral evidence belong in the execution map and individual tickets. Exploratory candidates such as provider price monitoring, notifications, offline writes, multi-Collection support, or a future FX feed remain proposals requiring a separate decision and do not appear as functioning controls or release promises.

The Pages demo is live at https://subs.ajnart.dev with verified HTTPS, matching build assets, no PIN or API requests, and batch persistence after reload. MCP authentication works. Pages domain status, verification and validation are all active, superseding the earlier 17:46 pending snapshot. Manual publication is verified, while automated Pages deployment remains blocked by the absent scoped Actions token. The requested `v3.0.0` publication follows the final PR merge.

The authoritative supporting sources are TanStack Start's official overview and hosting guidance, Nitro's current v3 documentation, shadcn's official TanStack installation guide, and the supplied Bold Wikipedia registry theme. Source links, repository-local skill provenance, and restore instructions are maintained in the agent documentation.
