# Subs v3 release and Cloudflare demo

Status: ready-for-agent
Progress: claimed
Type: task

## Outcome

Publish the completed improvements as `v3.0.0`, validate the static demo on Cloudflare Pages using Wrangler, and make `https://subs.ajnart.dev` its only canonical address. Stop obsolete Vercel Git deployments. `v2.0.0` already exists; do not overwrite it.

## Constraints

- Preserve the accepted simple home, wider dialogs, atomic multi-service setup, safe custom icons, keyboard interactions and authoritative theme.
- Keep the private PIN-protected, single-container SQLite target separate from the PIN-free browser-only DEMO_MODE build. Publish only static assets to Cloudflare Pages, without Pages Functions, a Worker application, API, database or server bindings. Ordinary local and Docker builds never publish.
- Use only `subs.ajnart.dev` as the canonical Pages domain; the singular hostname is not a target or alias. Browser storage is origin-specific and is not silently transferred between hostnames. Limit the cutover to this domain's old Worker binding and Pages/DNS records; preserve unrelated resources. Verify both live HTTPS and Pages control-plane activation.
- Preserve `vercel.json` with Git deployments disabled and bring it to main through PR #50. Do not delete the external Vercel project or unrelated integrations.
- Use only legitimately authorized Cloudflare credentials for the configured account/Worker. Local OAuth may deploy locally; CI requires a separate scoped `CLOUDFLARE_API_TOKEN` secret. Never print, commit or copy broad credentials into CI.
- Verify lint/typecheck, all existing regressions, both release builds, Pages static serving and real-browser demo flows with no backend requests or PIN. Validate Docker health, protection and SQLite persistence on amd64 and arm64; ensure the build-stage platform optimization copies no build-host-native runtime dependencies. Add no speculative unit-test files or dependencies.
- Keep supported feature documentation concise in README and Markdown under docs, with no docs website. Explicitly separate private Installation protection from the public demo and describe limitations honestly.
- Push conventional commits through the existing feature PR, await fresh CI, and merge through GitHub. No direct push to main, force push, retagging or destructive Git operations.
- Publish the major release against the exact merged commit after the final PR merges and live HTTPS/asset/demo verification. Watch workflows to completion and report credential or external-access blockers honestly. The missing Pages CI credential blocks automation, not the verified manual publication or the user's requested release after merge.

## Completion evidence

PR #50 merged the accepted feature tree into main at `63dbaaf3cc8ff55c15e83742fbc2de07031fb63c`. The subsequent user request selects Pages and full Docker validation; this follow-up proceeds through its own focused PR before the final release. Accepted feature evidence is `.scratch/quick-setup/validation.md` and `.scratch/simple-home/validation.md`; release evidence is recorded alongside this specification and appended publicly to the PR/release after publication. Automatic deployment remains tracked by `.scratch/rewrite/issues/27-demo-deployment.md` until its credential path is proven.

Latest correction: the user selected only `subs.ajnart.dev`, not the singular hostname. Main `328902e` is deployed at https://subs-demo.pages.dev (deployment https://b2da0cfb.subs-demo.pages.dev), with nine cards, no PIN or API requests, batch creation, persistence, and reset verified. Main multiarch GHCR publication succeeded in 2m9s; all 27 existing tests, both builds, lint, and typecheck passed.

Cloudflare MCP authentication works for account `71a8e70b7b1e301fca750fd6c6ae1f1d`. Only the old Worker domain binding was detached; proxied CNAME `subs.ajnart.dev` now points to `subs-demo.pages.dev`, TTL 1. Pages domain status, verification and validation are all active, superseding the earlier 17:46 pending snapshot. Valid canonical HTTPS and HTML/favicon/JS/CSS/adapter bytes match the tested build. Live batch prices zero and 12.34, reload persistence, real export/import/reset, no PIN or API requests and mobile fit are verified. Repository Actions secrets remain empty; automatic Pages deployment is independently blocked by the scoped token. Publish `v3.0.0` after the final PR merges, as requested.
