# 24 — Release verification and retirement

Status: ready-for-agent
Progress: resolved
Type: task
Blocked by: 23

## Outcome

Ship only capabilities supported by integrated runtime and validation evidence.

## Acceptance criteria

- Existing HTTP/auth/persistence and focused Playwright flows verify setup, login/logout, protected CRUD, lifecycle, money/dates, migration, import/export, and restart durability.
- Capture responsive light/dark screens and manually verify the exact preset/theme authority and lack of old live UI.
- Run final lint and typecheck after concurrent edits settle; report inherited baseline failures separately from new regressions and record unrun checks.
- Retire old live routes/components/client store behavior without discarding original migration data or unrelated agent changes.
- Reconcile every ticket with actual evidence, mark the conditional Price Change decision honestly, and leave future exploration outside shipped feature claims.
- Final release handoff lists deployment/migration steps, measured memory or blocked measurement, security limitations, validation results, and changed paths; coordinating agent alone owns staging/commit.

## Comments

Ready-for-agent means ready to implement. Completion requires observable behavior, not a populated checklist alone.

## Completion evidence — October 24, 2026

Final integrated lint and typecheck pass with no inherited failure exemption. All 27 existing Playwright tests pass; both production builds, final Docker build and Compose validation pass. The Chromium extraction blocker was repaired before claiming browser results. Container evidence is in ticket 23; real light/dark/mobile screenshots and review dispositions are in `.hallmark/qa.json`. The final safety review's duplicate-candidate restore finding was reproduced and fixed, with the 101-record round trip added to the existing external test seam.

The old runtime/store paths are retired and migration preserves original inputs. Tickets 01–26 record completed implementation evidence, including real price history; ticket 27 separately retains the external automatic-deployment credential blocker and GitHub CI outcome. No release tag or merge is implied by a local build. Upstream use-client warnings and the approximately 868 kB static entry chunk remain non-blocking build warnings.
