# Self-hosting

Run one Subs process against one writable SQLite volume. Horizontal replicas and shared network filesystems are not supported. The container runs as `bun`; ensure the mounted directory is writable by its user. Startup/storage failures must be fixed rather than replacing the database with an empty file.

## Protect the installation

Put exposed installations behind HTTPS. Add `SUBS_ORIGIN` with the exact public origin to the Compose service environment when using a reverse proxy. `SUBS_SETUP_TOKEN` can supply a first-use operator token; otherwise read the generated token from private server logs. Keep logs and the volume private.

Six-digit PINs are not accounts or enterprise authentication. Sessions are HttpOnly, SameSite Strict, Secure on HTTPS, and expire after seven days; persistent throttling limits guesses. Only exactly `DISABLE_AUTH=true` bypasses protection, exposing the whole collection. Keep origin checks even on trusted networks. The PIN recovery command in the [README](../README.md#lost-pin) requires operator filesystem access.

## Back up and restore

- **Settings → Export backup** creates a portable versioned JSON collection, including preferences but excluding PINs, sessions, throttles, and recorded price history. Canonical exports are bounded to 2 MiB. **Import backup** previews changes before confirmation; Replace removes the current collection and its history. Keep the original file.
- For full disaster recovery, stop the service and copy the entire mounted `data` directory, including SQLite sidecars if present. This snapshot contains credentials and sessions, so protect it like a secret. Never copy only a live SQLite main file while writes continue.
- To restore a volume snapshot, stop Subs, preserve the current volume elsewhere, place the snapshot in the mounted directory with the correct ownership, and start the matching application version. Confirm health, PIN access, and the collection before deleting any preserved data.

## Upgrade from Subs 2

1. Export the old collection if possible. Stop the old service and preserve its image/version and entire data directory, especially `data/config.json`. Do not run old and new writers together.
2. Start the new version with the preserved volume, complete PIN setup, and use **Settings → Import** for the old file. Startup does not silently import or overwrite a collection.
3. For browser-only data, use the same browser and origin to access the authorized legacy migration offer in Settings. Otherwise preserve/export the legacy localStorage value and import that file. Review precision/default warnings and duplicate choices. Source browser values are removed only after a successful import when explicitly requested.
4. Check record counts, currencies, dates, preferences, and a fresh export before accepting the upgrade. Keep the old volume snapshot unchanged until satisfied.

For rollback, stop the new version and restore the preserved old image and old data snapshot. The new SQLite file is not a backwards-compatible Subs 2 store. Preserve newer edits separately before rollback; never point both versions at one live directory.
