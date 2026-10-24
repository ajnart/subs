# 15 — Upcoming commitments and calendar

Status: ready-for-agent
Progress: resolved
Type: task
Blocked by: 10, 14

## Outcome

Give users one consistent view of upcoming Due Dates and Trial Deadlines.

## Acceptance criteria

- Upcoming list orders known commitments by calendar date and distinguishes overdue tracked dates, projected renewals, and Trial Deadlines.
- Calendar navigates months, shows accessible day details, and shares anchored/clamped recurrence with the list and cards.
- Short months, leap years, multiple events per day, and timezone changes preserve correct dates and readable mobile layout.
- Paused/cancelled Subscriptions do not appear as active projected charges; missing Due Dates have a separate honest state.
- User can reach the relevant Subscription from either view and return without losing useful navigation context.
- No background notification or automated cancellation is implied by a displayed deadline.

## Comments

Use date-only semantics rather than machine-local timestamp arithmetic.

## Completion evidence — October 24, 2026

`projections.ts`, the overview and `calendar-view.tsx` share anchored date-only recurrence and distinguish charges from trial deadlines. All three existing upcoming/calendar tests pass, covering today, inactive exclusions, January 31 and leap-year restoration. The reviewer exercised month/day navigation and event selection at narrow widths; date-caption contrast was corrected using an existing foreground token.
