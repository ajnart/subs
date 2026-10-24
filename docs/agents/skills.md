# Repository-local skills

## Selection and provenance

Seven focused skills are copied into `.agents/skills/` and tracked by `skills-lock.json`; they are ordinary files, not machine-local symlinks. Install commands used the project scope, OpenCode target, `--copy`, and `--yes`. Copied references travel with each skill; [third-party notices](../../.agents/skills/THIRD-PARTY-NOTICES.md) preserve full upstream MIT terms and attribution.

| Skill             | When to load                                                                        | Upstream and provenance                                                                                                         | License                                                                     |
| ----------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `start-core`      | Start project boundaries, entries, and build integration                            | [Official TanStack/router](https://github.com/TanStack/router), deeply nested under start-client-core                           | [MIT, Tanner Linsley](https://github.com/TanStack/router/blob/main/LICENSE) |
| `react-start`     | React-specific Start bindings and setup                                             | [Official TanStack/router](https://github.com/TanStack/router), deeply nested under react-start                                 | MIT, Tanner Linsley                                                         |
| `router-core`     | Typed route trees, matching, and router conventions                                 | [Official TanStack/router](https://github.com/TanStack/router), deeply nested under router-core                                 | MIT, Tanner Linsley                                                         |
| `shadcn`          | Presets, primitive regeneration, registry components, and design-system integration | [Official shadcn/ui](https://github.com/shadcn-ui/ui), skill's rules and references copied together                             | [MIT, shadcn](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md)         |
| `nitro`           | Nitro v3 configuration, database, server APIs, and deployment                       | [antfu/skills](https://github.com/antfu/skills), community-generated from Nitro, metadata version 2026.9.25, v3 beta 3.0.260903 | [MIT, Anthony Fu](https://github.com/antfu/skills/blob/main/LICENSE.md)     |
| `to-spec`         | Synthesize agreed scope into the repository issue tracker                           | [mattpocock/skills](https://github.com/mattpocock/skills), engineering workflow                                                 | [MIT, Matt Pocock](https://github.com/mattpocock/skills/blob/main/LICENSE)  |
| `domain-modeling` | Decide domain terminology or document consequential trade-offs                      | [mattpocock/skills](https://github.com/mattpocock/skills), glossary and ADR formats included                                    | MIT, Matt Pocock                                                            |

Installation succeeded on October 24, 2026. The lock records source, source path, and computed content hash, not an immutable source commit. The checked-in copies are the reproducible reviewed snapshot; reinstalling from upstream can change content. This selective set intentionally omits a giant workflow bundle and Astro skills. Some upstream skills point to additional optional skills; install one selectively only when the active task actually needs it.

## Restore

A normal Git checkout already restores the actual copied contents and notices. If rebuilding missing skills, run from the repository root:

```sh
bunx --bun skills@latest add TanStack/router --skill start-core react-start router-core --agent opencode --copy --yes --full-depth
bunx --bun skills@latest add shadcn/ui --skill shadcn --agent opencode --copy --yes
bunx --bun skills@latest add antfu/skills --skill nitro --agent opencode --copy --yes
bunx --bun skills@latest add mattpocock/skills --skill to-spec domain-modeling --agent opencode --copy --yes
```

The official TanStack skills are deeply nested. A prior shallow discovery attempt failed; `--full-depth` plus explicit names succeeded. Keep that flag rather than switching to an unofficial package because initial discovery missed them.

The CLI also exposes `experimental_install` for restoring a lockfile, but the explicit commands above make target and copy semantics visible. Neither route guarantees old upstream bytes when the lockfile lacks a source commit; prefer the committed copies for exact restoration.

## Updates and review

Use the same selective add commands to refresh a source, or `bunx --bun skills@latest update --project --yes` to request a project-wide update. Review both copied content and `skills-lock.json`, confirm the result still contains real files, and preserve/reconcile third-party notices before committing. The global `--global` scope is not part of repository setup.

Treat upstream content as privileged agent instructions requiring review, not application runtime dependencies. Check version-sensitive claims against the [official sources](architecture.md); the Nitro copy explicitly targets v3 beta, and current project APIs/lockfiles take precedence over stale examples. Existing issue-tracker triage and domain-doc conventions remain authoritative. This rewrite's explicit execution override is scoped to its [execution map](../../.scratch/rewrite/map.md), not a global change to workflow skills.

## Verification and failures

- All four selective install commands succeeded, producing seven skill entries in `skills-lock.json`.
- No application dependency installation was performed by the documentation/skills worker.
- An initial upstream license request at antfu/skills `LICENSE` returned 404; `LICENSE.md` succeeded and is the recorded source.
- Full application lint/typecheck is intentionally left to the coordinating agent after concurrent implementation changes settle.
