# Rewrite architecture and authoritative sources

## Decision hierarchy

The [Private Collection specification](../../.scratch/rewrite/spec.md) defines release behavior, with the later [keyboard-first requirements](../../.scratch/keyboard-first/spec.md) covering interactions, SSR, assets, and reminders. The [Execution map](../../.scratch/rewrite/map.md) records delegated decisions, dependencies, and evidence. [Domain terminology](../../GLOSSARY.md) is independent of implementation. ADRs record [Start/Nitro/SQLite](../adr/0001-start-nitro-sqlite.md), [Installation PIN protection](../adr/0002-single-installation-pin.md), and [design precedence](../adr/0003-design-authority.md).

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

The Pages follow-up uses Cloudflare's [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/), [CI/token permissions](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/), [Wrangler configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/), and [custom-domain](https://developers.cloudflare.com/pages/configuration/custom-domains/) documentation. The configuration reference also covers Functions; Subs deploys static assets only and needs none of its backend bindings.

## Research disposition

- Astro was considered earlier but the user explicitly selected Start. Record that history; do not install an Astro framework or skill for this rewrite.
- The astrolicious candidate had an adoption signal but only about 13 repository stars and no established license in the prior research; it was not selected or vendored. Adoption counts alone do not establish permission to redistribute.
- Official TanStack/router and shadcn/ui sources were preferred over third-party repackaging. The Nitro skill is a clearly attributed community reference from antfu/skills, generated against v3 in September 2026, not an official Nitro endorsement.
- Prior research reported roughly 15k stars for TanStack/router, 271k skill installs for shadcn, and 2.6k skill installs/6k repository stars for antfu/skills. Those are non-authoritative discovery snapshots, not compatibility or security guarantees; repository contents, licenses, current docs, and runtime validation decide suitability.

## Verification boundaries

Production RSS must be measured after warmup on the actual production build with runtime, dataset, duration, and methodology recorded. Do not infer a memory figure from framework choice. Auth, migration, persistence, and startup protection must be exercised through HTTP and real SQLite; primary user flows use existing Playwright seams. The parent agent owns final integrated lint/typecheck once concurrent edits settle.

## Private and static build boundary

The private target uses `vite.config.ts`, Start/Nitro, and SQLite. Docker builds only that target; it starts empty and protected unless the Operator sets exactly `DISABLE_AUTH=true`. `VITE_DEMO_MODE` does not come from the Docker environment.

The separate `vite.demo.config.ts` builds `demo/main.tsx` with React and Tailwind only, disables environment-file loading, and defines the demo flag for that bundle. Shared UI selects the browser adapter through `src/lib/api.ts`; import parsing, validation, and limits are browser-safe modules. This `DEMO_MODE` adapter skips PIN without using private-server `DISABLE_AUTH`. `src/server/` remains server-only. Demo records use `subs-demo-v3`; reset and import never migrate or remove legacy storage. Non-sensitive appearance/layout preferences may use their existing browser keys.

`bun run build` builds both artifacts without publishing. `bun run build:demo` produces `dist/demo`; `bun run preview:demo` serves that built output through local Wrangler Pages on `127.0.0.1:4174`. `bun run dev:demo` remains the separate Vite development server on port 5174. Neither ordinary local builds nor Docker builds publish.

Publishing the demo is a manual, credentialed operation. The supported flow is the Cloudflare MCP Pages deployment against the `subs-demo` project; `bun run deploy:demo` remains a local Wrangler fallback that first builds the browser demo, then uses `wrangler pages deploy --branch main` for direct upload. Default root `wrangler.jsonc` selects the project and `pages_build_output_dir: ./dist/demo`; the deploy script pins the account through `CLOUDFLARE_ACCOUNT_ID`. Explicit `main` targets production rather than inferring a local feature branch. The demo has no Pages Functions, Worker entrypoint, backend, or bindings. Do not carry over Worker `assets`, `routes`, `workers_dev`, `preview_urls`, or custom `build`/`main` fields.

`subs.ajnart.dev` is the only canonical Pages hostname; the singular hostname is not a target or alias. The verified Pages deployment of main `328902e` is live at https://subs.ajnart.dev and https://subs-demo.pages.dev (deployment https://b2da0cfb.subs-demo.pages.dev). The domain is registered on `subs-demo`; only its old Worker custom-domain binding was detached, and a proxied CNAME now targets `subs-demo.pages.dev` with TTL 1. Canonical HTTPS has a valid certificate; HTML, favicon, JS, CSS, and adapter bytes match the tested build. Browser verification confirmed nine cards, no PIN or API requests, and a two-plan batch priced at zero and 12.34 that produced eleven cards and persisted after reload. Browser data remains isolated per hostname.

The Checks workflow validates application and Docker checks on every push, pull request, and manual dispatch. It does not deploy the demo. Publishing is a manual, credentialed Cloudflare MCP Pages operation against `subs-demo`, so no automatic upload job and no `CLOUDFLARE_API_TOKEN` Actions secret are configured; local Wrangler OAuth and MCP authentication are the supported publishing credentials.

Cloudflare MCP authentication works for the configured account. Pages reports `subs.ajnart.dev` active, with verification and validation both active. The unused singular-domain registration was removed after the canonical hostname passed verification.

`vercel.json` disables the legacy Vercel Git auto-deployment: neither the persistent Bun/SQLite installation nor the Cloudflare demo targets Vercel. The external project is not deleted. Demo development keeps Vite filesystem restrictions enabled and adds only the resolved font package directory alongside the workspace, so linked Bun installs can serve their fonts without exposing the entire package cache.

Magic UI and Aceternity were installed through their real shadcn registries, recorded in `components.json`. Their adapted files retain separate license notices. Previews activate on hover/focus, send only a public origin to Microlink, and exclude local/private addresses; there is no server URL-fetching endpoint. This is opt-in disclosure to a third party, not private provider monitoring.

The private route obtains an independently authorized server-function snapshot of status, Collection, revision, and a serialized initial date. It forwards no arbitrary self-fetch origin, excludes access secrets, and retains no-store/Vary Cookie. Hydration reuses the snapshot and loads FX afterward. Production inspection verified one shared database initialization/queue across SSR and API chunks; no process-global database workaround is used. Initial date labels and sorting use explicit en-US; the local clock refreshes at midnight and wake.

Known service marks are bundled with source/license provenance under `public/service-icons/`. Unknown safe public origins may receive a no-referrer favicon request, as explicitly requested; private/local targets and server-side fetching remain excluded. TIKS synthesizes interaction sounds without audio downloads. Native View Transitions retain immediate/reduced-motion fallbacks. Device sound/reminder settings and hashed notification deduplication keys are outside the Collection/backup schema. Browser reminders schedule only while unlocked; their worker supports notification click-through without private-data caching or closed-browser alarm claims.
