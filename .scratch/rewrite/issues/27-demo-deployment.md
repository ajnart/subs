# 27 — Automatic demo deployment and screenshots

Status: ready-for-agent
Progress: claimed
Type: task
Blocked by: 23, 24, 26

## Outcome

Publish the validated static demo at subs.ajnart.dev and show the current app in a concise README.

## Acceptance criteria

- Wrangler deploys the static artifact at the requested domain without a backend.
- Successful release builds automatically deploy with scoped credentials kept out of Git; local and Docker builds do not publish.
- CI validates lint, typecheck, both builds, and relevant existing regression flows; Docker builds and persists data across restart.
- Current desktop/mobile screenshots accompany a short README with practical setup, migration, and demo instructions.
- Record actual deployment URL, CI outcome, runtime memory, and any credential blocker honestly.

## Evidence

October 24, 2026: Wrangler published the final static artifact to https://subs.ajnart.dev, version `b8d6886a-02ed-442c-8037-a6a6c97fc1d2`. HTTPS with a valid certificate returns 200, and the published JS/CSS names match the final local build. Public DNS answers are present; the local machine required explicit resolution while its negative cache caught up. README is concise and uses three refreshed real screenshots with the correct active count and no transient toasts.

Final local lint/typecheck, all 27 existing tests, both builds, Docker and Compose validation pass. CI checks both targets and Docker, then deploys successful `main` builds or an explicit manual request with Wrangler. Repository Actions secrets were empty at verification: automatic deployment remains blocked until the Operator adds a scoped `CLOUDFLARE_API_TOKEN`; local OAuth is deliberately not copied into CI. The user has been notified without requesting a secret in chat. This ticket is not marked resolved while automatic deployment remains unproven.

GitHub validated application commit `aa70c375fa7f486410439656460c58a99ac03d89`: both the [pull-request run](https://github.com/ajnart/subs/actions/runs/40097518928) and [push run](https://github.com/ajnart/subs/actions/runs/40097437178) succeeded for `check` and `docker`. Both were watched to completion using `gh run watch --compact --exit-status`. Deployment was intentionally skipped on the feature branch. [PR #50](https://github.com/ajnart/subs/pull/50) contains three successfully uploaded real screenshots; no merge or release tag has been created.

Final integration follow-up fixes the demo-development font 403 caused by Bun's linked package cache with a narrowly scoped Vite filesystem allowance. `vercel.json` disables the obsolete Vercel Git auto-deployment, which otherwise attempts the retired hosting target and reports a failed external check. This does not delete the Vercel project or replace application/Docker validation; supported release targets remain Docker and Cloudflare.

The final development browser confirms Inter loads with HTTP 200 and no backend requests; unrelated files outside the workspace/font package remain blocked with HTTP 403. Both production builds and lint/typecheck pass after this configuration change. CodeRabbit skipped its review because the broad rewrite exceeds its file-count limit; its passing status is not treated as a review approval.
