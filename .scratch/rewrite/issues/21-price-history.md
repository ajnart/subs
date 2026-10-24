# 21 — Price Change support decision

Status: ready-for-agent
Progress: claimed
Type: task
Blocked by: 07, 10

## Outcome

Expose genuine Price Changes only if the delivered backend can support them honestly.

## Acceptance criteria

- Inspect actual persistence/API support and explicitly resolve this ticket as implemented or deferred with a reason.
- If implemented, edits record old/new Price/Currency and effective recorded date durably, with authorized retrieval and portable export/import behavior defined.
- Initial creation/import does not fabricate an earlier Price; same-value edits do not invent changes; deleting a Subscription handles related changes consistently.
- UI labels distinguish recorded Price Changes from provider monitoring and historical payment transactions.
- If deferred, omit history controls, remove functioning-feature claims, and record the future candidate in the release report.
- No conditional feature is reported shipped merely because a design or placeholder exists.

## Comments

This conditional enhancement is the only explicit core-scope deferral allowed by the user-selected release.
