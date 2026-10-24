# Keyboard-first validation

Verified October 24, 2026 on `feat/improve-codebase`. This evidence covers the integrated feature, not just individual lane checks. CI and publication status are tracked in [PR #50](https://github.com/ajnart/subs/pull/50).

## Automated checks

- `bun run lint`, `bun run typecheck`, and `git diff --check` pass.
- `bun run build` passes for private SSR and the static demo. Existing upstream `use client` bundling warnings and the large eager demo bundle warning remain disclosed; no performance score is inferred from the build.
- Ten targeted existing Playwright flows pass with retries disabled: `tests/components/keyboard-shortcuts.spec.ts`, `tests/components/p0-features.spec.ts`, and `tests/subscription-card-size.spec.ts`.
- The keyboard flows now wait for real hydration and cover modifier hints, roving focus/Enter, palette search/Manage, focus restoration, and typing guards. No new unit-test files were added.
- `docker compose config --quiet` and the final `docker build --progress=plain -t subs:keyboard-first .` pass.

## Browser acceptance

| Contract           | Verified evidence                                                                                                                                                                                                                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keyboard workflow  | Real Control/Meta hold/release and blur cleanup; searchable cmdk palette; keyboard creation/save; card navigation, management, focus restoration, text-entry guards; ordinary browser T/L/R shortcuts remain unbound by Subs                                                                             |
| Cards and identity | Seventeen source-verified bundled service marks with provenance/licenses; all demo card images load locally; desktop/mobile layouts fit without horizontal overflow; safe public-origin favicon fallback remains client-only                                                                             |
| Unlock             | Actual password input and six bullet slots on unlock; setup/confirmation remain text inputs; paste/Enter works; mobile PIN group is horizontally centered within 0.01px and does not overflow                                                                                                            |
| TIKS               | Real 0.3.0 synthesis runs in a running AudioContext after a keyboard gesture; no context or playback on mount; mute suppresses playback and survives reload; reduced motion suppresses feedback                                                                                                          |
| Native transitions | Browser-generated `subs-page-in`/`subs-page-out` animations use 220ms/150ms; rapid Calendar→Overview returns to Overview; unsupported API and reduced motion navigate immediately                                                                                                                        |
| SSR and preloading | Authorized HTML contains actual Collection/revision rather than skeletons; anonymous/post-logout HTML does not contain the private marker; setup token and session material are absent; no-store/Vary Cookie retained; font/module preloads load successfully                                            |
| Hydration          | French/Honolulu and Swedish/Kiritimati browser contexts report no hydration/page errors; initial browser requests include only `/api/rates`, not `/api/status` or `/api/data`; local day refreshes at midnight and wake                                                                                  |
| Reminders          | Actual Chromium service-worker notification delivery, generic text, two due occurrence hashes, test delivery, reload/focus deduplication, and cancellation of a deliberately delayed registration after locking; denied permission plus simulated unsupported/insecure contexts disable delivery clearly |
| Static demo        | Overview/Calendar/Insights/Settings, keyboard creation/save, reset, and bundled service icons complete with zero backend requests or page errors                                                                                                                                                         |

The notification worker click handler was executed with controlled clients: it closes the notification and focuses the same-origin app, or opens its safe root when no app window exists. Native operating-system notification clicks were not automated. Notifications remain best effort while open and unlocked, not closed-browser alarms.

The local clock harness also verified 23/25-hour DST days, wake recovery, same-day identity preservation, and listener/timer cleanup. Anchored recurrence remains unchanged.

## Review fixes

The first integration review identified five concrete issues, all resolved and cleared by a second read-only review:

1. Deferred Manage actions now resolve subscription IDs against current data, and editors retain their paired revision. A delayed-refresh browser probe verifies that a remote name/price update is not overwritten.
2. Palette animation-frame actions cancel on unmount and `subs:locked`. A delayed-logout browser probe verifies no stale editor reopens after unlock.
3. The Collection date refreshes at local midnight, focus, pageshow, and visibility return.
4. Initially rendered month labels, FX date labels, and sorting use explicit locales/timezones.
5. Navigation tracks the latest requested page, so returning to a pending transition's origin is not discarded.

SSR also exposed an interaction-readiness race in the old tests. The visible HTML is now inert until hydration; the keyboard listeners and existing keyboard tests use that readiness boundary. Private data still renders in the initial HTML.

## Visual and accessibility evidence

Refreshed real screenshots are under `docs/screenshots/`: light/dark overview, mobile, command palette, and masked unlock. The exact shadcn preset, Phosphor icons, and Bold Wikipedia tokens are retained.

Focused axe checks report zero violations on the final light overview and private unlock, with contrast checks still marked incomplete where layered decoration prevents automated background detection. This is not a complete WCAG or clean Hallmark certification. A measured 4.25:1 transient success-toast contrast issue was removed by using the existing theme-aware Toaster colors instead of Sonner's separate rich-color palette.

## One-container verification

The production image runs as `bun` with one writable `/data` volume. HTTP setup, protected cookie access, actual SSR, API/export cache headers, anonymous isolation, logout revocation, collection/session persistence after restart, and collection persistence after replacing the container with the final image were exercised against real SQLite. No database, push, or other companion service was added.

Disposable validation artifacts live in the approved OpenCode temporary directory, including `subs-keyboard-build.log`, `subs-keyboard-docker-build.log`, `subs-keyboard-regressions.log`, and `subs-keyboard-a11y-overview.json`.

## Remaining external prerequisite

Automatic demo deployment still needs the repository `CLOUDFLARE_API_TOKEN` Actions secret. `gh secret list --repo ajnart/subs --json name` returned an empty list. The existing OpenChamber todo `7e649a52-0cbb-4d23-b06a-d9c4e702f8a1` remains open; local Wrangler OAuth is not copied into CI. See [rewrite issue 27](../rewrite/issues/27-demo-deployment.md).
