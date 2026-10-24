# Features

Subs tracks recurring commitments, not payments or provider accounts.

## Collection and setup

- Home opens with service cards. Optional **Collection tools** exposes totals, search, category/lifecycle filters, sorting, table layout, bulk lifecycle changes/deletion, and upcoming renewals.
- Quick setup combines 32 price-free service presets and multiple pasted websites. Enter each plan's own price and billing cycle, including zero-cost plans; one confirmation saves the batch atomically. Possible duplicates remain visible rather than being silently merged.
- Wider Add/Edit dialogs support service links, notes, trial deadlines, and custom public HTTP(S) icon URLs. Validation and failed saves preserve input; a new Add draft can move into quick setup without losing details.
- Responsive layouts support light, dark, and system appearance. Known service marks are bundled; public icons/favicons load in the browser, and hover/focus previews use Microlink. See [URL safety and privacy limits](../README.md#existing-data).

## Prices, dates, and planning

- Prices respect each currency's precision. Daily, weekly, monthly, quarterly, and yearly cycles produce monthly/annual projections, with native-currency totals and visible conversion limitations rather than silently adding unlike currencies.
- Active, paused, and cancelled records remain manageable; only active plans contribute ongoing projected cost. Monthly/yearly renewals preserve their original calendar anchor after short months. Trial deadlines and Calendar show expected dates, not completed payments or automatic cancellations.
- **Insights** shows category projections. Monthly budgets compare a target with comparable spending; savings scenarios estimate removing selected active plans without changing the Collection or contacting providers.
- Recorded price history contains genuine prices/changes entered in Subs, not fabricated payments or monitored provider prices. Portable JSON backups do not include this history.

## Keyboard, sounds, and reminders

| Shortcut                           | Action                                                |
| ---------------------------------- | ----------------------------------------------------- |
| **⌘/Ctrl K**                       | Search subscriptions, starter templates, and commands |
| **/**                              | Open Collection search                                |
| **Arrows / J / K**, then **Enter** | Navigate subscriptions and open management            |
| Hold **⌘ or Ctrl**                 | Reveal shortcut hints                                 |
| **?**                              | Show the full shortcut list                           |

The speaker button controls TIKS interaction sounds on this device. **Settings → Browser reminders** enables opt-in renewal/trial notifications with permission on HTTPS or localhost. Delivery is best effort while Subs is open and unlocked, not after the browser closes. Sound and reminder preferences stay local and are excluded from backups.

## Backup and import

- Versioned JSON backups include subscriptions, portable preferences, and custom icon URLs, not PINs, sessions, or recorded price history. Imports and restorable Collection backups are bounded to **2 MiB**.
- Import Preview shows validation problems, assumptions, and duplicate candidates before an atomic save. Review skip, add-as-new, or replace decisions explicitly; replacing the Collection also removes its existing price history.
- Subs 2 arrays and supported browser/server storage envelopes can be imported. Startup never silently migrates or overwrites old data. Keep the original files and follow [upgrade, backup, and rollback](self-hosting.md).

## Private installation and public demo

- **Private:** one Bun Docker process and writable SQLite volume, initially empty and protected by a six-digit PIN. An Operator setup token authorizes first-use PIN setup; the same private Collection is available across devices. Use HTTPS and protect full-volume snapshots for complete recovery.
- **Demo:** a separate browser-only `DEMO_MODE` build targeting [sub.ajnart.dev](https://sub.ajnart.dev), with sample data, illustrative rates, local edits/import/export/reset, and no backend or PIN. This is not private-server `DISABLE_AUTH`; browser data is isolated by hostname and is not synced between devices. The Pages domain cutover is still pending live verification.

Subs does not connect to banks, execute payments or provider cancellations, monitor provider pricing, or provide background sync/closed-browser alarms.
