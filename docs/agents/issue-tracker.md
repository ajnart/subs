# Issue tracker: Local Markdown

Issues and specs live in `.scratch/` and are versioned with Git.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`.
- Spec: `.scratch/<feature-slug>/spec.md`.
- One file per implementation ticket: `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`.
- Triage state: a `Status:` line near the top of each issue, using `docs/agents/triage-labels.md`.
- Append conversation history under `## Comments`.
- Commit specs and ticket updates so they travel with the repository.

## Publishing and fetching

When a skill says to publish to the issue tracker, create the appropriate Markdown file.
When fetching a ticket, read its referenced path or locate its number within the feature directory.

## Wayfinding operations

- Map: `.scratch/<effort>/map.md`, containing Notes, Decisions-so-far, and Fog.
- Child ticket: `.scratch/<effort>/issues/<NN>-<slug>.md`, with the question in its body.
- Type: a `Type:` line containing `research`, `prototype`, `grilling`, or `task`.
- Lifecycle: wayfinding tickets use `Status: open`, `claimed`, or `resolved`.
- Blocking: `Blocked by: NN, NN`; a ticket is unblocked when every listed ticket is resolved.
- Frontier: choose the lowest-numbered open, unblocked, unclaimed ticket.
- Claim: save `Status: claimed` before working.
- Resolve: append the answer under `## Answer`, set `Status: resolved`, and append a summary and link to the map's Decisions-so-far.
