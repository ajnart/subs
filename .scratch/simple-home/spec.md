# Display-first home

Status: ready-for-agent
Progress: completed

## Outcome

The default home shows the subscriptions, not a dashboard. Preserve the service-centered cards and make management an intentional action rather than the first thing presented.

OpenChamber feature todo: `41592ba8-364d-49b6-846f-a161a770697c`.

## Constraints

- Hide spending summary, the full search/filter/sort/layout/bulk toolbar and upcoming-payment preview from the default populated Overview.
- Keep the existing richer view available through one compact, explicit Collection tools disclosure. Retain the Calendar, Insights, Settings, command palette, manual entry and quick setup.
- Search shortcut `/` opens the collection tools and focuses search; preserve typing safeguards, card navigation, modifier hints, TIKS, focus return and native transitions.
- Do not leave active filters invisible when the tools are closed: indicate filtered results or reset them deliberately. Do not silently change tracked records.
- Keep empty-Collection quick setup prominent; no forced onboarding wizard. Display-first is a presentation default, not a new access-control or read-only API boundary.
- Reuse native disclosure and existing components; no new preference field, database migration, dependencies or separate rendering system.
- Preserve the exact theme/preset, private SSR and browser-only demo. Validate desktop/mobile and adapt only affected existing tests to intentional management entry; add no new test files.

## Completion evidence

Implemented and validated; the final combined oracle gate accepted with no findings. Evidence is in `.scratch/simple-home/validation.md`; README captures show the new default. Wider editor, multi-service setup and custom icons remain governed by `.scratch/quick-setup/spec.md`. Changes are local and not deployed.
