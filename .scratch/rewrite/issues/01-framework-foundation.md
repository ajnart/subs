# 01 — Framework and runtime foundation

Status: ready-for-agent
Progress: claimed
Type: task
Blocked by: none

## Outcome

Replace the live Remix foundation with the selected TanStack Start and Nitro v3 architecture without disturbing legacy data.

## Acceptance criteria

- Latest mutually compatible Start, React, Vite, Nitro v3, and Bun versions are verified against current official guidance and pinned by the application lockfile.
- Production and development entry points use one Start application with Nitro, not a parallel Astro, Hono, Go, or oRPC server.
- A minimal route builds and runs; native dependencies required by the selected SQLite connector are checked on the production target.
- Existing data is preserved for migration; removed runtime paths are identified without deleting other agents' work.
- Integration blockers and actual commands/results are recorded; no production RAM claim is made yet.

## Comments

Read the Private Collection specification and architecture decision before choosing a workaround. Nitro v3 is beta; use v3 docs and explicit imports.
