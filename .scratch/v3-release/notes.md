## Subs v3.0.0 (draft)

A new private Collection runtime, a simpler subscription-first home, and a browser-only public demo.

Subs 2 is already released; this is the next major version. v3 publication and the Pages custom-domain cutover are pending final verification.

### Highlights

- Home opens directly to your subscriptions. Collection tools reveals totals, filters, sorting, table layout, bulk actions and upcoming renewals when needed.
- Add several services from 32 price-free presets or pasted website links, enter your own prices and billing cycles, then save the batch atomically.
- Wider Add/Edit dialogs, custom icon URLs with safe browser-only loading, and preserved drafts when validation or saving fails.
- Search commands and subscriptions with ⌘/Ctrl K, navigate cards by keyboard, and use opt-in interaction sounds and best-effort open-browser reminders.
- Private self-hosting uses one Bun container and a durable SQLite volume, with six-digit PIN protection, expiring sessions, guarded writes and explicit import previews.
- Exact currency precision, anchored renewal dates, lifecycle tracking, calendar, budgets, savings scenarios and recorded price changes.
- The static demo uses only browser storage, with import/export and reset; Cloudflare Pages direct upload through Wrangler is the supported demo deployment path. Repository configuration disables legacy Vercel Git deployments without deleting the external project.

See the [feature overview, shortcuts, and limits](https://github.com/ajnart/subs/blob/v3.0.0/docs/features.md).

### Demo and deployment

The primary demo target is [sub.ajnart.dev](https://sub.ajnart.dev), with [subs.ajnart.dev](https://subs.ajnart.dev) intended to remain a compatibility alias after verified cutover. Pages publication and custom-domain HTTPS are not yet verified. Browser data is separate for each hostname; export/import a backup to move demo edits between them.

This PIN-free demo is a separate `DEMO_MODE` browser build, not a private installation with `DISABLE_AUTH`. `bun run deploy:demo` builds `dist/demo` and uses `wrangler pages deploy --branch main`; it needs no Pages Functions, backend, or bindings. Ordinary local and Docker builds never publish.

The Checks workflow gates `main`/manual Pages deployments on application and Docker checks. Automatic deployment remains blocked: the `CLOUDFLARE_API_TOKEN` Actions secret was absent at release preflight. Missing credentials fail explicitly before publishing. CI needs **Account → Cloudflare Pages → Edit** permission scoped to the configured account; local OAuth is not a CI credential.

### Upgrade from Subs 2

This is a breaking runtime and storage upgrade. Stop the old service and preserve its image and complete data directory, especially `data/config.json`, before updating. Complete the new PIN setup, then use Settings → Import to preview and restore the old export or supported legacy data. Existing data is never silently imported or overwritten on startup.

Run one instance per writable SQLite volume behind HTTPS. Portable JSON backups exclude credentials and recorded price history; protect a stopped full-volume snapshot for complete recovery. Rollback requires the preserved old image and old data snapshot—the new SQLite store is not backwards compatible.

See [self-hosting and recovery](https://github.com/ajnart/subs/blob/v3.0.0/docs/self-hosting.md) for the full procedure. Reminders are best effort while the browser is open and unlocked; currency projections and illustrative demo rates are not payment records or live provider prices.
