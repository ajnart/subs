# 12 — Search, filters, and sort

Status: ready-for-agent
Progress: claimed
Type: task
Blocked by: 11

## Outcome

Let users find the right commitments without obscuring the Collection's actual state.

## Acceptance criteria

- Search matches Service names and notes with documented normalization; Category and Lifecycle State filters combine predictably.
- Stable sorting supports practical name, Price, and Due Date choices with deterministic ties and explicit missing-date placement.
- Cross-currency Price sorting avoids suggesting an unconverted numeric comparison is economic value.
- Active filters, visible result count, and clear-all are accessible in both card/table modes.
- Collection-wide summaries remain labeled as such rather than silently switching scope with filters.
- Filtering an empty result never seeds records or hides the ability to clear filters.

## Comments

Keep presentation preferences non-sensitive; the server remains authoritative for records.
