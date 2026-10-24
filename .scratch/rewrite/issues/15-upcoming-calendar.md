# 15 — Upcoming commitments and calendar

Status: ready-for-agent
Progress: open
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
