# 23 — Container persistence and operations

Status: ready-for-agent
Progress: claimed
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
