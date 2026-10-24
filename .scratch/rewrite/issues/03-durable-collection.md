# 03 — Durable Collection schema

Status: ready-for-agent
Progress: resolved
Type: task
Blocked by: 01

## Outcome

Make embedded SQLite the single durable source of Collection truth.

## Acceptance criteria

- Nitro's opt-in experimental database layer explicitly uses its Bun SQLite connector, connects on the writable volume, and initializes a versioned schema safely; the Node-default sqlite connector is not assumed compatible with Bun.
- Subscription identity, Price minor units, Currency, Billing Cycle, Billing Anchor, optional Due Date, lifecycle, Category, notes, Trial Deadline, shared preferences, and Budget are representable.
- Credential/session data is distinct from portable Collection data; revisions support stale-write protection.
- Reads and writes are parameterized, transactions support atomic imports/bulk changes, and persistence failures surface rather than masquerade as successful saves.
- Empty initialization creates no demo Subscriptions and restart does not recreate deleted data.

## Comments

Optional Price Changes may use a separate related record if implemented; do not infer past values.

## Completion evidence — October 24, 2026

`src/server/database.ts` owns parameterized SQLite persistence, separate credential/session state, collection revisions, price baselines and transactional mutations. Nitro explicitly selects `bun-sqlite`; runtime `DATA_DIR` is applied by `database-path.ts`. HTTP checks retained 100 records, recorded history and an existing session across restart and replacement with the final image. Oversized collection writes roll back without advancing the revision. Fresh private installations remain empty.
