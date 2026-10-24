# 09 — Quick entry and editing

Status: ready-for-agent
Progress: resolved
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

## Completion evidence — October 24, 2026

`subscription-form.tsx` uses one validated manual/template/edit form with optional dates and disclosed link/trial/notes fields. Save failures retain drafts and their original revision. The existing create/edit/reload test passes, as do rejected unsafe-link, money and date cases. At 320px the payment field spans 256px in one column; keyboard dialog flows, cancel and focus restoration were exercised in the UI review and existing tests.
