# Subs v3 release and Cloudflare demo

Status: ready-for-agent
Progress: claimed
Type: task

## Outcome

Publish the completed improvements as `v3.0.0`, validate the static demo on Cloudflare Pages using Wrangler, and make `https://sub.ajnart.dev` its primary address. Stop obsolete Vercel Git deployments. `v2.0.0` already exists; do not overwrite it.

## Constraints

- Preserve the accepted simple home, wider dialogs, atomic multi-service setup, safe custom icons, keyboard interactions and authoritative theme.
- Keep the private PIN-protected, single-container SQLite target separate from the PIN-free browser-only DEMO_MODE build. Publish only static assets to Cloudflare Pages, without Pages Functions, a Worker application, API, database or server bindings. Ordinary local and Docker builds never publish.
- Retain `subs.ajnart.dev` as a compatibility alias after the primary Pages domain is verified; document the singular hostname as primary. Browser storage is origin-specific and is not silently transferred between hostnames. Do not interrupt the old alias before the new primary works or claim custom-domain completion while DNS/certificates remain pending.
- Preserve `vercel.json` with Git deployments disabled and bring it to main through PR #50. Do not delete the external Vercel project or unrelated integrations.
- Use only legitimately authorized Cloudflare credentials for the configured account/Worker. Local OAuth may deploy locally; CI requires a separate scoped `CLOUDFLARE_API_TOKEN` secret. Never print, commit or copy broad credentials into CI.
- Verify lint/typecheck, all existing regressions, both release builds, Pages static serving and real-browser demo flows with no backend requests or PIN. Validate Docker health, protection and SQLite persistence on amd64 and arm64; ensure the build-stage platform optimization copies no build-host-native runtime dependencies. Add no speculative unit-test files or dependencies.
- Keep supported feature documentation concise in README and Markdown under docs, with no docs website. Explicitly separate private Installation protection from the public demo and describe limitations honestly.
- Push conventional commits through the existing feature PR, await fresh CI, and merge through GitHub. No direct push to main, force push, retagging or destructive Git operations.
- Publish the major release against the exact merged commit after live HTTPS/asset/demo verification. Watch workflows to completion and report credential or external-access blockers honestly.

## Completion evidence

PR #50 merged the accepted feature tree into main at `63dbaaf3cc8ff55c15e83742fbc2de07031fb63c`. The subsequent user request selects Pages and full Docker validation; this follow-up proceeds through its own focused PR before the final release. Accepted feature evidence is `.scratch/quick-setup/validation.md` and `.scratch/simple-home/validation.md`; release evidence is recorded alongside this specification and appended publicly to the PR/release after publication. Automatic deployment remains tracked by `.scratch/rewrite/issues/27-demo-deployment.md` until its credential path is proven.
