# 21 — Price Change support decision

Status: ready-for-agent
Progress: resolved
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

## Completion evidence — October 24, 2026

Implemented, not deferred. SQLite records a known-price baseline and subsequent real price/currency changes; authenticated history is shown through the recorded-prices disclosure. Same-value edits do not create changes, and related rows follow subscription deletion. Container checks retained the two known entries through restart and final-image replacement. Portable JSON explicitly excludes history: new/replace imports begin new baselines, merge keeps existing history, and full-volume snapshots preserve everything. The demo implements the same disclosed behavior without inventing pre-import history.
