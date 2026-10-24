# 02 — Regenerated design system

Status: ready-for-agent
Progress: resolved
Type: task
Blocked by: 01

## Outcome

Establish one freshly generated design vocabulary for the whole replacement UI.

## Acceptance criteria

- Exact shadcn preset b3rmZdYMye is used with Start template, pointer behavior, Radix base, and preset Phosphor icons.
- Every retained primitive is regenerated; legacy primitives do not remain in the live import graph.
- Bold Wikipedia is applied afterward and owns supplied colors, fonts, radius, charts, and ancillary tokens in light and dark modes.
- InputOTP, forms, dialogs, tables, menus, calendar controls, and accessible focus styles share that foundation.
- Generation provenance and any preset/theme conflict are documented without substituting a visually similar preset.

## Comments

Preset owns structure/APIs/icons; Bold Wikipedia owns theme tokens. Preserve Subs identity, not the old screen geometry.

## Completion evidence — October 24, 2026

The framework/design lane generated retained primitives from exact preset b3rmZdYMye with Start, pointer behavior, Radix Nova and Phosphor. `components.json` records the resulting registry configuration; `src/styles.css` retains the supplied Bold Wikipedia light/dark tokens. Real desktop/mobile captures were inspected in both modes. Hallmark's token-parser false positives and stamp exception remain disclosed in `.hallmark/qa.json`, not reported as a clean tool pass.
