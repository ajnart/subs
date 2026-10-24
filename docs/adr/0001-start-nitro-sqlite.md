# TanStack Start with Nitro and embedded SQLite

The user explicitly replaced the earlier Astro proposal with TanStack Start, preserving a React application model and the required shadcn Start template. Use the latest compatible TanStack Start release with Nitro v3 and Nitro's embedded SQLite database layer, deployed as one Bun image with a writable persistent volume; this replaces competing browser/server JSON stores without introducing an extra Hono, Go, oRPC, database service, or sync system.

This deliberately trades horizontal scaling and Nitro v3 beta/experimental database stability for a small, single-instance operational footprint. Pin actual compatible versions after integration, explicitly select Nitro's Bun SQLite connector rather than its Node-default connector, measure production memory instead of promising a RAM figure, and verify volume persistence and migration before calling the release deployable.
