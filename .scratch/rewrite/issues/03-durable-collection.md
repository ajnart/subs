# 03 — Durable Collection schema

Status: ready-for-agent
Progress: open
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
