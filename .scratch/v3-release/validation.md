# Subs v3 release validation

Status: in progress

## Baseline

- Completed feature validation and accepted integrated review: `.scratch/quick-setup/validation.md` and `.scratch/simple-home/validation.md`.
- Version decision: existing published `v2.0.0` and tagged `v2.0.1`; package already declares `3.0.0`. No existing release/tag will be replaced.
- Wrangler OAuth can access the configured account and assets-only Worker. Scoped GitHub Actions token is absent; local OAuth is not copied to CI.
- Vercel external project cannot be disconnected without authentication. The existing branch disable-config must reach main through PR #50.

## Release checks

- [x] Primary singular and compatibility custom-domain configuration reviewed.
- [x] Lint, typecheck and diff checks pass.
- [x] Private and demo production builds pass.
- [x] Wrangler dry-run validates the static artifact.
- [x] Local Wrangler serves the production demo; real-browser persistence, batch setup, reset, import/export and mobile checks pass with no backend requests.
- [ ] Fresh PR workflows are watched to completion and merged through GitHub.
- [ ] Exact merged commit is deployed; live HTTPS, assets and representative browser flows verified.
- [ ] `v3.0.0` is published against that merged commit and tag image workflow completes.
- [ ] Automatic deployment and external Vercel connection status reported accurately.

## Evidence

### Local release artifact

- `bun run lint`, `bun run typecheck`, `git diff --check`, and `bun run build` pass. Existing RollDown dependency directive and large-chunk warnings are nonfatal and unchanged.
- `bun run deploy:demo --dry-run` uses the committed script and exact Wrangler config, builds the demo, reads 35 static files, reports no bindings and exits successfully without publishing.
- Exact-config local Wrangler serves at `http://127.0.0.1:8795`, using Node for Wrangler and Bun for the custom Vite build. Its pinned workerd supports compatibility date `2026-10-19`; the initially ahead-of-runtime date was corrected rather than updating dependencies or weakening runtime validation.
- Real browser with `**/api/**` blocked: nine starter records load with Collection tools closed, then a two-plan Cloudflare/Figma batch saves zero and 12.34 prices correctly. Eleven records survive reload.
- The UI downloads a real version-3 JSON backup with eleven records and only `version`, `exportedAt`, `subscriptions`, and `preferences` at the top level. Reset restores nine starter records. UI import previews the downloaded file; explicit Replace confirmation restores all eleven records and the zero-cost plan through reload.
- Final reset restores nine records and retains an unrelated localStorage key. Browser network capture reports no `/api/` requests; resource inspection also reports zero backend resources. No page errors are logged.
- Real desktop 1440×1000 and mobile 390×844 screenshots were inspected. No mobile horizontal overflow; default tools remain closed. Captures: `subs-v3-wrangler-desktop.png` and `subs-v3-wrangler-mobile.png` under the approved OpenCode temporary directory.
- HTTP 200 and byte identity to local output were verified for HTML, favicon, JavaScript and CSS. Demo entry assets are `index-sqgxfS-Z.js`, `index-DesWVy0z.css`, and browser adapter `adapter-M13MnFui.js`.
- SHA-256: HTML `1be0213c3e399ac00c8838a759a5c3505fdbf8e4f8d020765f93fc1bb568fca5`; entry JS `729aa2e29ed35edc7926317682bec18ea8342477bbe5bf4353bcfa04f40fe219`; CSS `ecf411a8f035c8edeea127994e0f7e54b12304cd7ba6c09e22d79394431cce08`.

Remote CI, live domain attachment and release publication remain pending. Earlier feature regressions are not presented as fresh live-release validation.

### Pages follow-up

- PR #50 merged to main at `63dbaaf3cc8ff55c15e83742fbc2de07031fb63c`. Main application and Docker checks passed; upload failed only at the missing-token preflight. The old multi-platform image run was canceled after its ARM64 Vite transform stalled for over 25 minutes; no successful image publication is claimed for it.
- Full local existing suite: 27 passed, 29.4 seconds, zero retries. Lint/typecheck and both production builds pass with the Pages configuration.
- Pages project `subs-demo` was created as a real direct-upload Pages project, production branch main, `subs-demo.pages.dev`. Wrangler's new-project Worker delegation was explicitly opted out during creation; subsequent uploads target the established Pages project normally.
- Root `wrangler.jsonc` contains only Pages-compatible static-output settings; no Functions, Worker script, database or service bindings. CI uploads the validated artifact rather than rebuilding it.
- Both ARM64 and AMD64 images build successfully with the native build-stage fix. On each architecture: health 200, anonymous Collection read 401, native target Bun/SQLite available, a 12.34-price record and session persist through restart and container replacement with the same volume. All 90 runtime artifact files were inspected by path, with no native extensions or executable/bin payloads; both real architecture runtimes execute the portable server successfully.
- Pages local serving verifies nine sample cards with no PIN; zero-cost batch saves survive reload, reset returns nine samples, API requests are blocked and none captured. Mobile 390px has no overflow. An initial browser probe reloaded before save acknowledgement; repeating with the committed-save condition passes.
- `sub.ajnart.dev` is registered on Pages but pending DNS verification. Local OAuth cannot edit DNS and the dashboard is signed out. The Operator was asked to add CNAME `sub` → `subs-demo.pages.dev` and a scoped Pages Edit Actions token, without sharing secrets in chat. The old plural Worker domain is not detached while primary verification is pending.
