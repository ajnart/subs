# 18 — Portable versioned Backups

Status: ready-for-agent
Progress: open
Type: task
Blocked by: 06, 07

## Outcome

Make the Collection portable while keeping Installation access private.

## Acceptance criteria

- Export contains a schema version, timestamp, Subscriptions, and portable shared preferences/Budget using unambiguous money and date representations.
- PIN/hash, setup token, sessions, rate limits, environment secrets, and infrastructure-specific paths are excluded.
- All three legacy sources and the new format normalize through the shared validated boundary; unknown versions fail with actionable feedback.
- Export is authorized, uncached, downloadable, and restorable without requiring the original Installation's credentials.
- Payload size/count bounds, malformed JSON, duplicate identifiers, and unsupported money precision are diagnosed before any write.
- Round-trip verification uses the HTTP/persistence seam and records actual results.

## Comments

Portable data Backup differs from an Operator-controlled full volume snapshot.
