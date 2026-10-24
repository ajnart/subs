# 26 — Backend-free browser demo

Status: ready-for-agent
Progress: resolved
Type: task
Blocked by: 18, 19, 25

## Outcome

Reuse the tracker UI in a truly static demo with isolated local data.

## Acceptance criteria

- Separate static artifact builds without Nitro/server/database modules or private data.
- No backend/API requests or PIN are required for normal demo workflows.
- CRUD, settings, calendar, insights, import/export, price history, revision conflicts, and reset work with browser persistence.
- Sample data and illustrative rates are identified; private Docker defaults remain protected and empty.
- Browser refresh preserves demo edits; reset affects only the demo storage key.

## Evidence

October 24, 2026: `demo/main.tsx` and `vite.demo.config.ts` build an isolated static artifact with no Start/Nitro server plugin or environment-file loading. Shared UI uses the browser adapter for CRUD, imports, preferences, revisions, history and reset, with explicitly illustrative rates. Browser create/save/reload succeeds with API routes blocked; reset retains legacy-storage canaries and corrupt storage recovers without a backend. Private image checks still require PIN setup and start empty. Both builds and the shared import regressions pass; build-boundary details are in `docs/agents/architecture.md`.
