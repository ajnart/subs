# 22 — Accessibility, keyboard, and resilience

Status: ready-for-agent
Progress: resolved
Type: task
Blocked by: 13, 15, 17, 19, 20, 21

## Outcome

Complete the primary workflows without mouse-only controls, misleading success, or fragile mobile states.

## Acceptance criteria

- Forms/dialogs/menus/calendar/table are keyboard navigable with names, visible focus, logical order, focus trapping/restoration, and announced outcomes.
- Keyboard actions support quick entry/search and visible help, ignore editable targets, and do not escape active modal intent.
- Loading, empty Collection, filtered-empty, unauthorized, failed load, failed save, retry, and stale-write states remain distinct.
- Failed writes preserve input and never show success before persistence; logout removes protected view state.
- Phone and desktop flows cover long content, many records, dark/light/system, reduced motion where relevant, and no horizontal page overflow.
- No remote favicon/URL-preview requests or accidental Collection-sensitive browser persistence remain.

## Comments

Use existing Playwright flow coverage and focused manual checks; no new unit-test files.

## Completion evidence — October 24, 2026

Existing shortcut, dialog, failed-delete, preferences, import, mobile and desktop flows pass in the final 27-test suite. A fresh-context browser review covered focus, disclosures, reduced motion, validation, empty recovery and narrow layouts; its three P2 findings plus footer nit were fixed and recaptured. Demo corrupt-storage recovery and API-blocked persistence were checked separately, as was the private 320px PIN screen. `.hallmark/qa.json` discloses tool false positives and review limitations; this is not a blanket WCAG certification. No new unit-test files were added.
