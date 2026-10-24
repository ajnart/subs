# Subs v3 release and Cloudflare demo

Status: ready-for-agent
Progress: claimed
Type: task

## Outcome

Publish the completed improvements as `v3.0.0`, validate the static demo using Wrangler, and make `https://sub.ajnart.dev` its primary address. Stop obsolete Vercel Git deployments. `v2.0.0` already exists; do not overwrite it.

## Constraints

- Preserve the accepted simple home, wider dialogs, atomic multi-service setup, safe custom icons, keyboard interactions and authoritative theme.
- Keep the private PIN-protected, single-container SQLite target separate from the backend-free browser demo. Ordinary local and Docker builds never publish.
- Retain `subs.ajnart.dev` as a Cloudflare compatibility alias; document the singular hostname as primary. Browser storage is origin-specific and is not silently transferred between hostnames.
- Preserve `vercel.json` with Git deployments disabled and bring it to main through PR #50. Do not delete the external Vercel project or unrelated integrations.
- Use only legitimately authorized Cloudflare credentials for the configured account/Worker. Local OAuth may deploy locally; CI requires a separate scoped `CLOUDFLARE_API_TOKEN` secret. Never print, commit or copy broad credentials into CI.
- Verify lint/typecheck, both release builds, Wrangler dry-run/static serving and representative real-browser demo flows with no backend requests. Reuse existing regressions; add no unit-test files or dependencies.
- Push conventional commits through the existing feature PR, await fresh CI, and merge through GitHub. No direct push to main, force push, retagging or destructive Git operations.
- Publish the major release against the exact merged commit after live HTTPS/asset/demo verification. Watch workflows to completion and report credential or external-access blockers honestly.

## Completion evidence

Pending. The accepted feature evidence is `.scratch/quick-setup/validation.md` and `.scratch/simple-home/validation.md`; release evidence will be recorded alongside this specification. Automatic deployment remains tracked by `.scratch/rewrite/issues/27-demo-deployment.md` until its credential path is proven.
