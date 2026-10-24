# 27 — Demo deployment and screenshots

Status: resolved
Progress: claimed
Type: task
Blocked by: 23, 24, 26

Resolution: the demo is published manually through the supported Cloudflare MCP/Wrangler Pages flow. Automatic token-dependent CI deployment was removed as an obsolete publishing mode; Checks now validates only. Domain access and manual publication are verified.

## Outcome

Publish the validated static demo at subs.ajnart.dev as its only canonical hostname, and show the current app in a concise README.

## Acceptance criteria

- Wrangler or the Cloudflare MCP deploys the static artifact at the requested domain without a backend; publishing is a manual credentialed step and ordinary local and Docker builds do not publish.
- CI validates lint, typecheck, both builds, and relevant existing regression flows without deploying; Docker builds and persists data across restart.
- Current desktop/mobile screenshots accompany a short README with practical setup, migration, and demo instructions.
- Record actual deployment URL, CI outcome, runtime memory, and any credential blocker honestly.

## Evidence

Latest Pages evidence: `subs.ajnart.dev` is the only canonical hostname. Renewed MCP authentication enabled its verified cutover from the old Worker binding to proxied CNAME `subs-demo.pages.dev`. Pages reports the domain active, verification active and validation active; valid HTTPS and all static entry assets match the tested build. Live batch/persistence/export/import/reset and PIN-free/zero-backend checks pass. The mistaken singular Pages registration was removed. Earlier Worker/domain/authentication evidence below is retained as history; the only remaining deployment blocker is the scoped Actions token.

October 24, 2026: Wrangler published the final static artifact to https://subs.ajnart.dev, version `b8d6886a-02ed-442c-8037-a6a6c97fc1d2`. HTTPS with a valid certificate returns 200, and the published JS/CSS names match the final local build. Public DNS answers are present; the local machine required explicit resolution while its negative cache caught up. README is concise and uses three refreshed real screenshots with the correct active count and no transient toasts.

Final local lint/typecheck, all 27 existing tests, both builds, Docker and Compose validation pass. CI checks both targets and Docker, then deploys successful `main` builds or an explicit manual request with Wrangler. Repository Actions secrets were empty at verification: automatic deployment remains blocked until the Operator adds a scoped `CLOUDFLARE_API_TOKEN`; local OAuth is deliberately not copied into CI. The user has been notified without requesting a secret in chat. This ticket is not marked resolved while automatic deployment remains unproven.

GitHub validated application commit `aa70c375fa7f486410439656460c58a99ac03d89`: both the [pull-request run](https://github.com/ajnart/subs/actions/runs/40097518928) and [push run](https://github.com/ajnart/subs/actions/runs/40097437178) succeeded for `check` and `docker`. Both were watched to completion using `gh run watch --compact --exit-status`. Deployment was intentionally skipped on the feature branch. [PR #50](https://github.com/ajnart/subs/pull/50) contains three successfully uploaded real screenshots; no merge or release tag has been created.

Final integration follow-up fixes the demo-development font 403 caused by Bun's linked package cache with a narrowly scoped Vite filesystem allowance. `vercel.json` disables the obsolete Vercel Git auto-deployment, which otherwise attempts the retired hosting target and reports a failed external check. This does not delete the Vercel project or replace application/Docker validation; supported release targets remain Docker and Cloudflare.

The final development browser confirms Inter loads with HTTP 200 and no backend requests; unrelated files outside the workspace/font package remain blocked with HTTP 403. Both production builds and lint/typecheck pass after this configuration change. CodeRabbit skipped its review because the broad rewrite exceeds its file-count limit; its passing status is not treated as a review approval.

Subsequent user steering requests the singular primary hostname and a major release. `.scratch/v3-release/spec.md` tracks that publication. The earlier deployment URLs and version IDs above are historical evidence, not proof of the new release or automatic deployment. The credential blocker remains open until an actual Actions deployment succeeds.

PR #50 merged at `63dbaaf3cc8ff55c15e83742fbc2de07031fb63c`; fresh PR checks passed all 27 existing tests and Docker. Main application and Docker checks also passed, but the deploy job failed at the expected absent-token preflight in run `40112683090`, before upload. The user subsequently selected real Cloudflare Pages, not a Worker-hosted static application. The scoped CI credential now needs Account → Cloudflare Pages → Edit; custom-domain DNS access is separate. The existing plural Worker binding is retained until the primary Pages hostname is verified.

### Historical pre-cutover follow-up

Latest user correction supersedes the earlier singular-primary request: only `subs.ajnart.dev` is canonical, not a compatibility alias. Main `328902e` is live on Pages at https://subs-demo.pages.dev (deployment https://b2da0cfb.subs-demo.pages.dev), with nine cards, PIN-free access, zero API requests, batch creation, persistence, and reset verified. Main multiarch GHCR publication succeeded in 2m9s; all 27 existing tests, both builds, lint, and typecheck passed. The plural custom domain still points to the old Worker; no Pages cutover is complete. Reauthenticated MCP still fails with `requires login before it can register a client`, even after reconnecting and activating the credential. The scoped CI token remains absent, so automatic deployment is still unproven and this ticket remains claimed.

### Current canonical Pages verification

MCP authentication now works and verified account `71a8e70b7b1e301fca750fd6c6ae1f1d`, project `subs-demo`, main `328902e`, and deployment `b2da0cfb` returning HTTP 200. The Pages domain was registered, only its old Worker binding was detached, and a proxied CNAME with TTL 1 now points `subs.ajnart.dev` to `subs-demo.pages.dev`. Canonical HTTPS has a valid certificate; HTML, favicon, JS, CSS, and adapter bytes match the tested build. The browser showed nine cards, no PIN, and zero API requests. Adding two plans priced at zero and 12.34 produced eleven cards, and reload preserved them.

The 17:46 pending-validation snapshot is superseded: Pages domain status, verification and validation are now all active, with live HTTPS verified. Manual Pages publication is verified. This ticket is resolved by the user-directed publication-mode change: the supported flow is a manual Cloudflare MCP/Wrangler Pages deployment, the automatic token-dependent `deploy-demo` job and its `deploy_demo` input were removed from Checks, and no scoped Actions token is required. `v3.0.0` was published against the exact merged commit `76eb47ca7d5df8778b69d0f78cf479dc63da19d5`.
