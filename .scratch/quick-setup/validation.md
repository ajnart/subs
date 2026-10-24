# Quick setup validation

Status: verified locally

## Scope

Multi-select Starter Templates, pasted website links, batch prices and atomic save, Add/Edit dialog, safe custom icon URLs, and preserved keyboard/mobile/private/demo behavior. Existing icon storage and version-3 import are unchanged; no database migration or new dependencies are planned.

## Checks

- [x] Integrated lint and typecheck
- [x] Focused existing editor, keyboard, responsive entry, import/revision and backup tests
- [x] Select several presets with keyboard; enter independent prices and billing cycles; one save, no writes while drafting
- [x] Empty price rejected, explicit zero accepted, unsupported currency precision rejected without partial writes
- [x] Paste multiple full website links; retain invalid lines for correction; remove rows and enforce the 100-row limit
- [x] Deselect/reselect retains drafts; single-to-batch handoff preserves raw price and optional fields with one dialog
- [x] Duplicate candidates are visible against selected rows and the current Collection, including after explicit conflict review
- [x] Frozen create/edit/batch revisions reject stale writes; review preserves drafts and enables intentional retry
- [x] A confirmed commit remains successful if its display refresh fails; no accidental second batch
- [x] Custom icon save/edit/clear and fallback in cards, table, Calendar and preview
- [x] Unchanged legacy icons survive editor save; icons round-trip through version-3 backup/import
- [x] Unsafe schemes/credentials/private-local image targets rejected; remote images client-only with no referrer
- [x] Desktop and small-mobile layouts; footer reachable, keyboard focus retained and no horizontal overflow
- [x] Demo remains browser-only with zero `/api` requests through these flows
- [x] Private SSR/auth remains safe, with no remote icon request in server markup
- [x] Final integrated review and concrete findings resolved

## Evidence

Before screenshot: `/private/var/folders/kx/hccbvbyd6sb61s6lrr2jyt2m0000gn/T/opencode/subs-quick-setup-form-before.png`.

No publication, CI completion, broad accessibility certification, or deployment is claimed for this feature. No dependencies, database migration, new endpoint, or new test files were added.

### Integrated checks

- `bun run lint`, `bun run typecheck`, and `git diff --check` pass.
- Ten focused existing Chromium tests passed without retries: editor create/edit, shortcut/palette/focus behavior, 390/1440px entry sizing, atomic/revision validation and version-3/legacy backup handling.
- Both existing delete confirmation/failure tests passed separately. Total: 12 focused existing tests; no Docker or broad suite rerun.
- A reviewed four-row demo save added all four records once, retaining explicit zero, JPY price precision, full path/query/fragment links and unset dates; drafting/invalid submissions changed nothing. Resource inspection reported zero `/api/` requests.
- A 101-line paste selected exactly 100 rows and retained the last line with an actionable limit message.
- Keyboard Space deselect/reselect retained raw prices. Handoff retained raw invalid price, currency, cycle, status, category, dates, notes, full website and icon URL with one dialog.
- New, edit and batch drafts retained their frozen If-Match even after a live refresh advanced the store. Explicit review retained drafts; edit load-latest replaced details only on request. Batch review exposed a newly added duplicate and saved intentional separate plans.
- An acknowledged import followed by an injected 503 read failure closed successfully and added one record. A subsequent stale draft was rejected with the old paired revision until review exposed that saved service; no second commit occurred.
- A held successful batch response released after lock/unlock left a later editor and its draft intact.
- The final disclosure correction preserves native expanded state: invalid Category opens the section, the first valid character keeps it open and focused; correcting an invalid icon to a minimally valid public hostname also keeps it open and focused. Neither invalid save wrote data. Native input events and two animation frames provided a conclusive check after CLI fill/wait limitations.

### Layout and accessibility

- Add/Edit measures 896×600 at 1440×900 and 1280×720, with visible Save. At 360×640 its footer stays within the viewport and the body scrolls.
- Compact desktop review measures 1024×600 and shows three ordinary plan prices at once. Chooser uses three wide-screen columns.
- Focused normal-state chooser/review axe 4.12 checks report zero violations and zero incomplete checks after explicit checkbox labels were added, including settled light mode. This is scoped evidence, not a complete accessibility certification.
- The implicit mobile column defect is fixed. At 390px, Name/Website are each 300px wide and Price/Currency are 144px each; at 360px, the two price/currency tracks are 129px. The settled 360×640 dialog is 328×588.8 at x=16/y=25.6, with its footer inside the viewport. Resizing/theme captures wait for dialog transitions to settle.
- Known pre-existing limitation: the unchanged primary button's light-mode hover opacity produces a measured 3.71:1 text contrast, while its normal state passes. Exact authoritative theme/preset tokens were preserved; no broad WCAG claim is made.
- Native date/empty input events were used where the browser CLI did not update React-controlled state; no application workaround was added for the tooling limitation.

### Reused server contract

An isolated local Installation on port 4194 exercised the exact `{data:{version:3,subscriptions:inputs},mode:'new'}` envelope using real SQLite. A two-row batch containing invalid USD precision returned 400 with no Collection/revision changes; a valid batch retained zero price and unset dates; a stale retry returned 409 without changes. Current preferences remained unchanged. Both a public custom icon URL and a legacy free-form icon survived export, replacement, and restoration.

### Icon boundary

Runtime URL probe rejected 19 unsafe/local cases, including executable/data/protocol-relative URLs, credentials, nonstandard numeric loopback forms, private/link-local IPv4, IPv6 loopback/private/mapped forms, and a loopback DNS wildcard. Four public HTTP(S) cases passed. Static React rendering of known and unknown services with custom URLs produced only a bundled mark or initials, with zero remote image sources. New transferred unsafe icons are rejected rather than treated as legacy values.

Real browser checks exercised a public custom image, replacement, broken-image fallback, recovery to a new valid source, reload, explicit clearing, and display in cards/table/Calendar. Images use no-referrer. Existing free-form icons survive ordinary saves and explicit load-latest. Authenticated HTML contains no remote image sources; anonymous HTML excludes the private fixture.

Hostname checks cannot prevent a public host from resolving or redirecting to a private target. No server proxy or image-fetch endpoint exists.

### Screenshots

Final combined oracle gate accepted with no findings after the native optional-details fix and display-first home change. See `.scratch/simple-home/validation.md` for the latest 19-test presentation regression run. Existing contrast limitations remain separate from feature completion.

All are real browser captures under `/private/var/folders/kx/hccbvbyd6sb61s6lrr2jyt2m0000gn/T/opencode/`:

- `subs-quick-setup-form-desktop.png` and `subs-quick-setup-form-mobile.png`
- `subs-quick-setup-choose-desktop.png`
- `subs-quick-setup-review-desktop.png`, `subs-quick-setup-review-mobile.png`, and `subs-quick-setup-review-light.png`
