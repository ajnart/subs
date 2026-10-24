# 13 — Bulk management

Status: ready-for-agent
Progress: claimed
Type: task
Blocked by: 12

## Outcome

Maintain many records safely with explicit selection and atomic actions.

## Acceptance criteria

- Select individual visible records and select-all-visible with a clear selected count and keyboard-accessible controls.
- Bulk pause/reactivate/cancel and Category changes validate the complete selection and commit atomically.
- Bulk delete confirmation states exact count and scope and does not confuse hidden or previously filtered selections.
- Filter changes reconcile selection predictably; vanished/stale identifiers cause a visible conflict rather than partial silent writes.
- Success revalidates all affected summaries/views and failures preserve enough selection context to retry safely.
- No action claims to cancel or alter a Service at its provider.

## Comments

Prefer one small server bulk contract over repeated unreliable browser mutation loops.
