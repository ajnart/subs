# Rewrite architecture and authoritative sources

## Decision hierarchy

The [Private Collection specification](../../.scratch/rewrite/spec.md) defines release behavior. The [Execution map](../../.scratch/rewrite/map.md) records delegated decisions, dependencies, and evidence. [Domain terminology](../../GLOSSARY.md) is independent of implementation. ADRs record [Start/Nitro/SQLite](../adr/0001-start-nitro-sqlite.md), [Installation PIN protection](../adr/0002-single-installation-pin.md), and [design precedence](../adr/0003-design-authority.md).

The selected architecture is one TanStack Start React application, Nitro v3, embedded SQLite through Nitro's database abstraction, and Bun in one image with a persistent writable volume. One Installation contains one private server-owned Collection; no account system or separate backend service is intended. Exact package versions come from the implementation's lockfile, not these documents.

Nitro database support is opt-in and experimental. Explicitly select its Bun SQLite connector (`bun`/`bun-sqlite`); the default `sqlite` connector targets Node's built-in SQLite and must not be assumed compatible with Bun.

## Sources reviewed October 24, 2026

| Source                                                                                         | What it establishes                                                                             | Caveat                                                                                                     |
| ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [TanStack Start overview](https://tanstack.com/start/latest/docs/framework/react/overview)     | Full-document SSR, routing, server functions, and framework scope; Start is described as stable | Latest documentation can move beyond pinned dependencies                                                   |
| [TanStack Start hosting](https://tanstack.com/start/latest/docs/framework/react/guide/hosting) | Official Nitro Vite integration and Bun deployment guidance                                     | Nitro integration remains actively developed; Bun guidance requires React 19+                              |
| [Nitro](https://nitro.build)                                                                   | Current v3 documentation index and runtime/deployment concepts                                  | v3 is beta; do not mix nitropack v2 APIs with nitro v3                                                     |
| [Nitro database](https://nitro.build/raw/docs/database.md)                                     | Built-in lightweight SQL abstraction and connector configuration                                | Verify selected SQLite connector and volume behavior in the actual production runtime                      |
| [shadcn TanStack installation](https://ui.shadcn.com/docs/installation/tanstack)               | Official preset workflow using the Start template                                               | Our exact preset/base/pointer choices are user requirements, not generic defaults                          |
| [Bold Wikipedia theme](https://tweakcn.com/r/themes/cmlmpb3qp000004l5go47hzsv)                 | Actual registry style payload, light/dark tokens, font families, chart palette, 0.125rem radius | Theme owns tokens after preset generation; fetch the supplied URL, not a guessed theme with a similar name |

Context7 quota had already been exhausted in the coordinating research session, so this work used official documentation directly without repeating quota retries. These sources establish integration direction, not proof that the resulting application builds, persists, or meets a particular RAM target.

## Research disposition

- Astro was considered earlier but the user explicitly selected Start. Record that history; do not install an Astro framework or skill for this rewrite.
- The astrolicious candidate had an adoption signal but only about 13 repository stars and no established license in the prior research; it was not selected or vendored. Adoption counts alone do not establish permission to redistribute.
- Official TanStack/router and shadcn/ui sources were preferred over third-party repackaging. The Nitro skill is a clearly attributed community reference from antfu/skills, generated against v3 in September 2026, not an official Nitro endorsement.
- Prior research reported roughly 15k stars for TanStack/router, 271k skill installs for shadcn, and 2.6k skill installs/6k repository stars for antfu/skills. Those are non-authoritative discovery snapshots, not compatibility or security guarantees; repository contents, licenses, current docs, and runtime validation decide suitability.

## Verification boundaries

Production RSS must be measured after warmup on the actual production build with runtime, dataset, duration, and methodology recorded. Do not infer a memory figure from framework choice. Auth, migration, persistence, and startup protection must be exercised through HTTP and real SQLite; primary user flows use existing Playwright seams. The parent agent owns final integrated lint/typecheck once concurrent edits settle.
