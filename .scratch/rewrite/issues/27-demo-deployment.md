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

Final local lint/typecheck, all 27 existing tests, both builds, Docker and Compose validation pass. CI checks both targets and Docker, then deploys successful `main` builds or an explicit manual request with Wrangler. Repository Actions secrets were empty at verification: automatic deployment remains blocked until the Operator adds a scoped `CLOUDFLARE_API_TOKEN`; local OAuth is deliberately not copied into CI. The user has been notified without requesting a secret in chat. GitHub CI results will be appended after push; this ticket is not marked resolved while automatic deployment remains unproven.
