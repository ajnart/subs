# 12 — Search, filters, and sort

Status: ready-for-agent
Progress: resolved
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

## Completion evidence — October 24, 2026

Overview composes name/notes search, category, lifecycle and cycle filters, explicit result counts and clear-filter recovery. Shared sorting has deterministic ties and currency-aware cost grouping. The existing composed-filter test passes, and the reviewer exercised search-empty recovery and table view. Summary data remains collection-wide rather than silently following filtered rows.
