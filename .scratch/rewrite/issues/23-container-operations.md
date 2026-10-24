# 23 — Container persistence and operations

Status: ready-for-agent
Progress: resolved
Type: task
Blocked by: 06, 18, 22

## Outcome

Make the replacement safe to self-host, restart, and recover as one Bun service.

## Acceptance criteria

- One production image serves Start/Nitro with a documented writable SQLite volume, permissions, port, and trusted-origin configuration.
- Auth defaults on; Operator setup-token provisioning, explicit auth bypass, PIN recovery maintenance, and log redaction are documented.
- Restart/redeploy preserves Collection and credential state; database writes fail visibly for missing/unwritable storage.
- Migration instructions preserve the old JSON volume, describe browser-data migration, and distinguish portable Backups from full volume snapshots.
- Restore and rollback guidance avoids concurrent old/new writers and explains single-instance SQLite limitations.
- Actual warmed production RSS is measured with runtime, dataset, observation duration, and methodology; if measurement cannot run, report blocked rather than invent a number.

## Comments

Coordinate runtime verification with the parent; documentation worker does not run builds while app agents edit.

## Completion evidence — October 24, 2026

Final Docker image `19ef4abf926e6f5c001c251d232711bf2870db03c90c46c4d1c362a60d24fe7e` and Compose validation pass. Runtime `/data/runtime-check` holds 100 fixture records, history and sessions across restart and image replacement. Real HTTP checks cover auth, Origin, revisions, precision, size rollback, expiry, persistent throttling, setup races and exact auth bypass. `docs/self-hosting.md` documents permissions, single-instance limits, migration, protected snapshots and rollback; README retains PIN recovery.

After 30 authenticated collection reads and 166 seconds of observation on Linux arm64/Bun 1.4.3, `/proc/1/status` reported RSS 39184 kB and high-water RSS 83668 kB; Docker reported 30.86 MiB and 0% CPU. These are conditions-specific observations, not a capacity guarantee. The coordinator's temporary validation report is `subs-container-validation.json` in the approved OpenCode temporary directory.
