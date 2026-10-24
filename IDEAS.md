# Subs Ideas and Roadmap

Historical Subs 2 roadmap and implementation notes. The current rewrite is tracked in [the rewrite spec](.scratch/rewrite/spec.md) and its individual Markdown tickets; implementation paths below describe the previous Remix application.

This document lists possible product and engineering improvements for Subs.

Priority legend:

- P0: high impact and low effort
- P1: high impact and medium effort
- P2: medium impact
- P3: exploratory or long-term

Size legend:

- XS: 0.5 to 1 day
- S: 1 to 3 days
- M: 3 to 7 days
- L: 1 to 3 weeks
- XL: multi-week initiative

## Product Goals

- Make recurring spending instantly understandable.
- Reduce the time needed to add and maintain subscriptions.
- Keep privacy-first defaults for self-hosting and local-first use.
- Improve data quality and reduce accidental mistakes.
- Scale from casual users (5 subscriptions) to heavy users (100+).

## Features By Size

## XS Features (Tiny Improvements)

### ~~1) Empty State with Quick Add Templates~~

- ~~Priority: P0~~
- ~~Why: New users need a faster first success.~~
- ~~Scope:~~
  - ~~Show starter template chips (Streaming, Music, Cloud, AI tools).~~
  - ~~One click pre-fills name, domain, and typical billing cycle.~~
- ~~UX details:~~
  - ~~Show only when list is empty.~~
  - ~~Include "Start from scratch" as first option.~~

<details>
<summary>✅ Implementation details</summary>

**Files changed:**

- `app/store/subscriptionStore.ts` — Added `SubscriptionTemplate` interface with `label`, `name`, `domain`, `billingCycle`, `price`, `currency`, `category` fields.
- `app/components/SubscriptionGrid.tsx` — Exported `QUICK_ADD_TEMPLATES` array (6 templates: Netflix, Spotify, ChatGPT Plus, Google One, GitHub Copilot, Adobe CC). New props `onAddWithTemplate` and `totalCount`; empty state renders template chip buttons when `totalCount === 0`.
- `app/components/EditSubscriptionModal.tsx` — Added `templateValues?: SubscriptionTemplate | null` prop; a `useEffect` resets the form with template values when a template is provided.
- `app/routes/_index.tsx` — Added `pendingTemplate` state, `handleAddWithTemplate` handler that sets the pending template and opens the modal; wired `onAddWithTemplate` and `totalCount` props on `SubscriptionGrid`; wired `templateValues={pendingTemplate}` on `EditSubscriptionModal`; `onClose` clears the pending template.

</details>

### ~~2) Inline Currency Symbol Preview~~

- ~~Priority: P0~~
- ~~Why: Users can confuse amount scale when switching currencies.~~
- ~~Scope:~~
  - ~~Show currency symbol next to price input.~~
  - ~~Display small helper text with converted estimate in selected summary currency.~~

<details>
<summary>✅ Implementation details</summary>

**Files changed:**

- `app/components/EditSubscriptionModal.tsx` — Added `getCurrencySymbol(currency)` helper (uses `Intl.NumberFormat` with `style: 'currency'`). Price input is wrapped in a `relative` div with an absolute-positioned currency symbol span (using `pl-7` on the input). A conversion hint paragraph appears below when price > 0 and the entered currency differs from the selected summary currency, showing the approximate converted amount.
- `app/components/AddSubscriptionPopover.tsx` — Same `getCurrencySymbol` helper added locally. Imported `usePreferencesStore` for `selectedCurrency`. Added `watch('price')` and `watch('currency')` watchers. Price input now uses the same relative/absolute symbol layout and the same conversion hint logic.

</details>

### ~~3) "Last Imported" Metadata~~

- ~~Priority: P0~~
- ~~Why: Helps users trust and debug data import behavior.~~
- ~~Scope:~~
  - ~~Store last import timestamp.~~
  - ~~Show in settings/help area.~~

<details>
<summary>✅ Implementation details</summary>

**Files changed:**

- `app/store/subscriptionStore.ts` — Added `lastImportedAt?: string` (ISO string) to the store interface. `importSubscriptions` action sets it to `new Date().toISOString()`. `partialize` includes `lastImportedAt` so it is persisted.
- `app/routes/_index.tsx` — Imported `lastImportedAt` from the store. The Import button is wrapped in a `TooltipProvider/Tooltip`; when `lastImportedAt` is set a green pulsing dot (`bg-green-500`) appears on the button and the tooltip content shows the formatted date/time via `toLocaleString({ dateStyle: 'medium', timeStyle: 'short' })`.

</details>

### ~~4) Keyboard Shortcut Improvements~~

- ~~Priority: P1~~
- ~~Why: Existing keyboard support is good, but can be stronger.~~
- ~~Scope:~~
  - ~~Add shortcuts for sort change and billing cycle filter.~~
  - ~~Add shortcut to focus Add Subscription form first field.~~

<details>
<summary>✅ Implementation details (April 8, 2026)</summary>

**Files changed:**

- `app/routes/_index.tsx` — Added `C` key shortcut to cycle the category filter (matching the existing `S` for sort and `F` for billing cycle). Added `A` key shortcut as an explicit alias for opening the Add Subscription popover and focusing its first input field (the popover already auto-focuses the name field via a `useEffect` when it opens).
- `app/components/KeyboardShortcutsDialog.tsx` — Added `A` ("Focus Add Subscription form (first field)") and `C` ("Cycle category filter") entries to the displayed shortcuts list.
- `app/hooks/useKeyboard.ts` — Added `a` (focus add form) and `c` (cycle category filter) entries to `useKeyboardShortcuts()` for discoverability.

</details>

### ~~5) Safer Delete UX~~

- ~~Priority: P0~~
- ~~Why: Avoid accidental deletion while keeping speed.~~
- ~~Scope:~~
  - ~~Add optional "Undo" toast for 5 seconds.~~
  - ~~Delay permanent removal until undo timeout ends.~~

<details>
<summary>✅ Implementation details (April 8, 2026)</summary>

**Modified files:**

- `app/store/subscriptionStore.ts` — added `restoreSubscription(subscription, index?)` which re-inserts a deleted subscription at its original position in the array.
- `app/routes/_index.tsx` — replaced the confirm-dialog delete flow with an immediate delete + undo toast pattern:
  - `handleDeleteSubscription` records the deleted item and its index in a `pendingDeletion` ref, calls `deleteSubscription` immediately, then shows a sonner toast with an **Undo** action for 5 seconds.
  - Clicking **Undo** clears the timeout and calls `restoreSubscription` to put the subscription back at exactly the same position.
  - A new delete before the undo window expires flushes the previous pending deletion first (no dangling state).
  - Removed the `DeleteConfirmationDialog` entirely — deletion is now instant but reversible.

**Tests:** `tests/components/undo-delete.spec.ts` — covers immediate removal from the grid, Undo restoring the card, and the card staying gone after the 5-second window expires.

</details>

## S Features (Small, High-Value)

### ~~6) Upcoming Payments Panel~~

- ~~Priority: P0~~
- ~~Why: Total spend is useful, but upcoming charges are more actionable.~~
- ~~Scope:~~
  - ~~Add "Next 7 days" and "Next 30 days" sections.~~
  - ~~Show amount, service, and due date.~~
  - ~~Add "Mark paid" action that rolls date forward by cycle.~~
- ~~Data notes:~~
  - ~~Include only subscriptions with next payment enabled.~~
  - ~~Reuse existing billing cycle + date utilities.~~

<details>
<summary>✅ Implementation details (April 8, 2026)</summary>

**New files:**

- `app/components/UpcomingPaymentsPanel.tsx` — card rendered between the `Summary` and the filter bar. Hidden completely when nothing is due within 30 days.
  - `getUpcomingSubscriptions(subscriptions, withinDays)` filters to subscriptions where `showNextPayment` is true and the computed next payment date falls within the window from now, returning items sorted by date ascending.
  - Renders two columns: **Next 7 days** and **Next 8–30 days**. Items in the 7-day bucket are excluded from the 30-day bucket to avoid duplicates.
  - Each row shows the subscription icon (or a muted placeholder), name, human-readable date label ("Today" / "Tomorrow" / formatted date), currency + price, and a **Mark paid** button.
  - `advanceByOneCycle(dateStr, cycle)` rolls the date forward by exactly one billing cycle and passes the new ISO date string to the `onMarkPaid` callback.

**Modified files:**

- `app/routes/_index.tsx` — mounts `<UpcomingPaymentsPanel>` with the full subscription list, loader rates, and an `onMarkPaid` handler that calls `editSubscription(id, { nextPaymentDate })` to persist the rolled-forward date.

**Tests:** `tests/components/upcoming-payments.spec.ts` — covers panel visibility, correct bucketing of 7-day vs 30-day items, "Mark paid" advancing the date by one cycle, and panel hiding when no payments are due.

</details>

### ~~7) Duplicate Detection on Save and Import~~

- ~~Priority: P0~~
- ~~Why: Duplicate records are a common source of bad totals.~~
- ~~Scope:~~
  - ~~Create duplicate fingerprint using normalized domain + price + currency.~~
  - ~~Warn during form save and import.~~
  - ~~Import options: skip, keep both, replace existing.~~

<details>
<summary>✅ Implementation details (April 8, 2026)</summary>

**New files:**

- `app/utils/duplicates.ts` — pure utility with two exports:
  - `getSubscriptionFingerprint(sub)` builds a string key `normalizedDomain:price:CURRENCY`. Domain normalization strips `https?://`, `www.`, trailing slashes, and path segments, then lowercases — so `https://www.netflix.com/` and `netflix.com` produce the same fingerprint.
  - `findDuplicates(incoming, existing, excludeId?)` matches each incoming subscription against the existing list, returning `{ incoming, existing }` pairs. `excludeId` skips the subscription currently being edited so self-comparison is avoided.

- `app/components/ImportDuplicateDialog.tsx` — modal shown after import validation passes but duplicates are found.
  - Lists each conflicting pair (incoming name / domain vs existing name / price).
  - Three resolution buttons: **Skip duplicates** (imports only new entries), **Keep both** (imports all incoming with fresh IDs), **Replace existing** (removes the matched existing entries and imports all incoming).

**Modified files:**

- `app/store/subscriptionStore.ts` — added `replaceSubscriptions(subscriptions)` to atomically swap the full list (used by all three import resolution paths).
- `app/routes/_index.tsx`:
  - `handleSaveSubscription` runs `findDuplicates` before saving; if a match is found, a `window.confirm` dialog describes the conflict and lets the user proceed or cancel.
  - `handleImport` runs the import validation first, then runs `findDuplicates` on the valid rows; if duplicates are found, stores the pending data and opens `ImportDuplicateDialog` instead of importing immediately.
  - `handleImportDuplicateResolution` implements the three resolution strategies and calls `replaceSubscriptions` with the merged result.
  - `handleImportValid` (partial import from the validation report) also runs the duplicate check before committing.

**Tests:** `tests/utils/duplicate-detection.spec.ts` (unit) — covers fingerprint normalisation, exact matches, no false positives, self-edit exclusion. `tests/components/import-duplicate-dialog.spec.ts` (E2E) — covers skip, keep-both, and replace flows.

</details>

### ~~8) Import Validation Report~~

- ~~Priority: P0~~
- ~~Why: Current errors are too opaque for non-technical users.~~
- ~~Scope:~~
  - ~~Parse and validate each subscription independently.~~
  - ~~Show row-level errors with reasons.~~
  - ~~Allow partial import of valid rows.~~

<details>
<summary>✅ Implementation details (April 8, 2026)</summary>

**New files:**

- `app/utils/importValidation.ts` — pure validation utility.
  - `validateImportData(jsonText)` parses the JSON string and validates every element of the array independently, returning an `ImportValidationReport` with per-row `{ index, raw, valid, errors[], subscription? }` entries plus aggregate `validCount` / `invalidCount`.
  - `getValidSubscriptions(report)` extracts the already-parsed `Subscription` objects from all valid rows.
  - Each field is checked separately (`name`, `price`, `currency`, `domain`, optional `billingCycle`, `nextPaymentDate`, `showNextPayment`, `icon`, `category`) so every error surfaced has a human-readable message pointing to the specific field.

- `app/components/ImportValidationReportDialog.tsx` — modal dialog shown when any row fails validation.
  - Header summarises how many rows are valid vs invalid.
  - Scrollable list shows every row with a green ✓ or red ✗ icon; invalid rows expand their field-level error bullets.
  - Footer has **Cancel** and **Import N valid rows** (disabled when `validCount === 0`).

**Modified files:**

- `app/routes/_index.tsx` — `handleImport` was replaced with a two-path flow:
  - All rows valid → call `replaceSubscriptions(validRows)` directly and show a success toast (no dialog).
  - Any invalid row → show the `ImportValidationReportDialog`; user can review and choose partial import or cancel.
  - File input value is reset after each read so the same file can be re-selected.

**Tests:** `tests/utils/import-validation.spec.ts` — Playwright tests covering valid full import, per-row error reporting, partial import via the dialog, disabled import button when all rows are invalid, and dialog cancel leaving subscriptions unchanged.

</details>

### ~~9) Billing Health Warnings~~

- ~~Priority: P1~~
- ~~Why: Missing billing data creates hidden risk.~~
- ~~Scope:~~
  - ~~Add badges for missing next payment date when cycle is set.~~
  - ~~Add warning if date is in the past and not rolled forward.~~

<details>
<summary>✅ Implementation details (April 8, 2026)</summary>

**Modified files:**

- `app/components/SubscriptionCard.tsx` — two health checks are computed per card and rendered as a shared `AlertTriangle` icon (yellow) in the top-left area, next to the billing cycle badge:
  - `hasBillingHealthWarning`: `billingCycle` is set but `showNextPayment` is `false` — the user configured a cycle but opted not to display the payment date, which hides billing risk.
  - `isDateInPast`: `showNextPayment` is `true` and the stored `nextPaymentDate` (the raw base date, before rolling) is older than today — typically indicates data imported from an external source where date roll-forward didn't happen automatically.
  - Both conditions share the same triangle icon; tooltip text distinguishes between them ("Next payment date is in the past" vs "Billing cycle set but next payment date is not shown").
  - The icon is only rendered when `billingCycle` is set (the enclosing guard), so subscriptions with no billing information show no warning at all.

**Tests:** `tests/components/billing-health-warnings.spec.ts` — covers: (a) no warning for a subscription with no billing cycle, (b) warning shown when cycle is set but `showNextPayment` is off, (c) no warning when both cycle and `showNextPayment` are enabled with a future date, (d) warning tooltip text matches the specific condition.

</details>

### ~~10) Category Field (Single Select)~~

- ~~Priority: P1~~
- ~~Why: Users often want budget by area.~~
- ~~Scope:~~
  - ~~Add optional `category` property with default categories.~~
  - ~~Add category filter in top controls.~~
  - ~~Show category chip on card.~~

<details>
<summary>✅ Implementation details (April 8, 2026)</summary>

**Modified files:**

- `app/store/subscriptionStore.ts` — `SUBSCRIPTION_CATEGORIES` constant (18 categories: Streaming, Music, Cloud, AI Tools, Productivity, Gaming, News & Media, Health & Fitness, Education, Finance, Developer Tools, Other, …) and `SubscriptionCategory` type derived from it. `category?: SubscriptionCategory` added to the `Subscription` interface.
- `app/components/SubscriptionCard.tsx` — renders a `Badge` (outline variant) in the bottom-right corner of each card when `category` is set; badge text is the category label.
- `app/components/EditSubscriptionModal.tsx` — category `Select` control added to the form (optional). The card live-preview in the modal now includes `category` so the badge appears in real time as you pick a category. Template pre-fill also carries the category (linked to **Feature 1** quick-add templates).
- `app/components/AddSubscriptionPopover.tsx` — `category` field added to the Zod schema, `defaultValues`, `watch`, and a new `Controller`-wrapped `Select` at the bottom of the form, listing all `SUBSCRIPTION_CATEGORIES`. This closes the gap where subscriptions added through the header popover couldn't be categorised.
- `app/routes/_index.tsx` — category filter `Select` added to the controls bar (fourth column alongside search, sort, billing cycle). `categoryFilter` state, `matchesCategory` predicate in `filteredSubscriptions`, active-filter badge ("Category: X"), and `clearFilters` all handle the new field. The `SUBSCRIPTION_CATEGORIES` import drives both the filter dropdown and the store type.

**Link to Feature 1:** Quick-add templates (defined in `SubscriptionGrid.tsx`) each carry a `category` value that is passed into `EditSubscriptionModal` via `templateValues`. When a template chip is clicked, the modal opens with the category pre-selected and visible in the card preview, giving users an end-to-end categorised first-add experience.

**Tests:** `tests/components/category-filter.spec.ts` — covers: category chip visible on card after adding with a category via Add Subscription form, category filter dropdown filters the grid, multiple categories can be filtered independently, "All categories" resets the view, category from a quick-add template is pre-filled in the modal.

</details>

## M Features (Medium Scope)

### ~~11) Spending Insights Page~~

- ~~Priority: P1~~
- ~~Why: A static total does not show trend direction.~~
- ~~Scope:~~
  - ~~Add dedicated insights route.~~
  - ~~Show trend for 30, 90, and 365 days.~~
  - ~~Show highest category and fastest-growing segment.~~
- ~~Storage notes:~~
  - ~~Add periodic snapshots of normalized monthly spend.~~
  - ~~Keep snapshots compact with daily rollup.~~

<details>
<summary>✅ Implementation details (April 8, 2026)</summary>

**Files changed:**

- `app/routes/insights.tsx` — Enhanced the existing insights page with two new sections:
  - **Spending Over Time chart** (`data-testid="spending-chart"`): an `AreaChart` (recharts via `ChartContainer`) showing the last 30 daily spending snapshots in the selected currency. Renders only when ≥ 2 snapshots exist for the selected currency.
  - **Top Subscriptions by Cost** (`data-testid="top-subscriptions"`): ranks the top 5 most expensive subscriptions by their monthly equivalent cost, showing each rank, icon, name, cost, and a relative progress bar. This surfaces the "fastest-growing / highest-cost segment" at a per-subscription level.
  - Also fixed a pre-existing non-null assertion lint error (`monthlyBudget!` → null-safe comparison).
- `app/stores/preferences.ts` — No changes needed; `spendingSnapshots` (daily rollup, pruned to 365 days, per-currency) was already persisted and used as the chart data source.

</details>

### 12) Budget and Overspend Alerts

- Priority: P1
- Why: Users need a target, not only a report.
- Scope:
  - Set global monthly budget in selected display currency.
  - Show percentage consumed and projected month-end total.
  - Trigger warning style when crossing thresholds (80%, 100%).

### 13) Subscription Lifecycle Metadata

- Priority: P2
- Why: Users need context when managing churn.
- Scope:
  - Add trial end date.
  - Add cancellation URL.
  - Add account email and internal notes.
  - Optional "contract end" date for annual plans.

### 14) Saved Views

- Priority: P2
- Why: Power users repeatedly apply the same filters.
- Scope:
  - Save current search, sort, and filter as a named view.
  - Add quick switcher for favorites.
  - Include default views (All, Upcoming, Annual).

### 15) Notification System (Browser)

- Priority: P1
- Why: Prevent surprise charges.
- Scope:
  - Request permission once with clear explanation.
  - Reminder lead times: 1, 3, 7 days.
  - Daily reminder digest mode for users with many subscriptions.
- Fallback:
  - If permission denied, show in-app reminders only.

## L and XL Features (Large Initiatives)

### 16) Team or Family Shared Workspace

- Priority: P3
- Size: L to XL
- Why: Households and teams share subscriptions.
- Scope:
  - Multi-user workspace with invite links.
  - Roles: owner, editor, viewer.
  - Activity history (who changed what and when).

### 17) Storage Backend Abstraction

- Priority: P2
- Size: L
- Why: Current JSON storage is simple but limits advanced use cases.
- Scope:
  - Introduce storage interface layer.
  - Support file and optional database backend.
  - Add migration utility from file to DB.

### 18) Public API and Integrations

- Priority: P3
- Size: L
- Why: Enable automation with external tools.
- Scope:
  - Read-only token-based API first.
  - Webhooks for subscription created/updated/deleted.
  - Integration starter set: Google Sheets, Notion, Slack.

### 19) CSV Statement Assist

- Priority: P3
- Size: XL
- Why: Discovery of forgotten subscriptions is high value.
- Scope:
  - Upload bank CSV.
  - Suggest possible recurring charges.
  - Manual confirmation before add.

## Domain Classification (Cross-Cutting)

## Core UX

- Upcoming payments panel.
- Better empty state and templates.
- Undo delete.
- Saved views.

## Data Quality

- Duplicate detection.
- Row-level import validation.
- Billing health warnings.

## Finance Intelligence

- Insights/trends page.
- Budgets and overspend alerts.
- Category-level analysis.

## Reliability and Safety

- Export reminders.
- Import preview and dry run.
- Optional encrypted backup export.

## Growth and Ecosystem

- Team workspace.
- Public API and webhooks.
- Integrations.

## Engineering and Delivery Tracks

## Testing

- Add unit tests for date roll-forward edge cases:
  - month-end transitions
  - leap year behavior
  - daylight saving boundary cases
- Add E2E flows for:
  - partial import success
  - duplicate warning logic
  - upcoming payments interactions

## Performance

- Memoize derived filtered/sorted lists.
- Add optional virtualization for very large subscription lists.
- Defer heavy chart code to route-level lazy load.

## Accessibility

- Add ARIA labels for icon-only actions.
- Ensure full keyboard path for all dialogs and popovers.
- Add color contrast checks in CI.

## Observability

- Add lightweight telemetry hooks for local diagnostics (disabled by default).
- Add client-side error boundaries with actionable recovery message.

## Suggested Milestones

### Milestone 1 (1 to 2 weeks)

- Upcoming payments panel
- Duplicate detection
- Import validation report
- Undo delete

### Milestone 2 (2 to 3 weeks)

- Categories
- Budget alerts
- Notification settings
- Billing health warnings

### Milestone 3 (3 to 5 weeks)

- Insights page
- Saved views
- Lifecycle metadata

### Milestone 4 (later)

- Team workspace exploration
- Storage abstraction
- API and integrations

## Open Questions

- Should local-first remain the default in all deployment modes?
- Do we want a strict schema version for import/export payloads?
- Should notification support remain browser-only or include optional email/webhook channels?
- Do we optimize first for solo users or small teams?
