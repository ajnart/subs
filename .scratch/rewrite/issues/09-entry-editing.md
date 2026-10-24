# 09 — Quick entry and editing

Status: ready-for-agent
Progress: open
Type: task
Blocked by: 08

## Outcome

Make adding and correcting a Subscription fast and dependable.

## Acceptance criteria

- Creation and editing expose Service name, Price, Currency, Billing Cycle, optional link, Category, and optional Due Date with server-consistent validation.
- Submission clearly distinguishes saving/success/failure, prevents repeated accidental writes, and preserves unsaved input on failure.
- Currency precision and date-only inputs work on mobile; unsafe links and invalid prices are rejected with field-level feedback.
- Existing values prefill without silently changing Currency, Billing Anchor, or an unset Due Date.
- Successful writes revalidate Collection views from the server; stale edits offer reload/reconcile rather than silent overwrite.
- Forms have accessible labels, keyboard submit/cancel, sensible initial focus, and focus restoration.

## Comments

New Collection defaults remain empty; optional templates arrive separately.
