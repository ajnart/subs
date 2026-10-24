# Subs

A private home for your recurring spending. See what you pay, what renews next, and what you could save—without connecting a bank account.

Subs is a single-instance subscription tracker built with TanStack Start, React, shadcn/ui, Nitro, and an embedded SQLite database. One Bun process serves the application and its API; there is no separate database service.

## Run locally

Install [Bun](https://bun.sh/) 1.4.3 or newer, then:

```sh
bun install
bun run dev
```

Open http://localhost:5173. On first use, copy the setup token from the server terminal and choose a six-digit PIN. The setup token proves that you control the server; it is not a default PIN. Subsequent visits use your PIN.

Data is stored under `./data`. Never expose that directory as static files or commit its database to Git.

## Docker

Build this branch locally until the rewrite is published:

```sh
docker compose up --build -d
docker compose logs subs
```

Open http://localhost:7574 and complete setup with the token in the logs. The Compose file mounts `./data` at `/data`, keeping the database across container updates. The runtime runs as an unprivileged user and supports amd64 and arm64.

To build and run without Compose:

```sh
docker build -t subs:local .
docker run -d --name subs -p 7574:7574 -v "$(pwd)/data:/data" subs:local
docker logs subs
```

Use HTTPS through a reverse proxy before exposing Subs outside your trusted network. A short PIN is a lightweight access barrier, not a replacement for transport security or network access controls.

## Your subscriptions

- Add and edit subscriptions, billing cycles, renewal dates, categories, notes, and trial deadlines.
- Pause or cancel tracking without deleting your records.
- Search, filter, sort, and switch between cards and a table.
- See upcoming renewals, a calendar, spending breakdowns, and a monthly budget.
- Explore potential savings without changing your real subscriptions.
- Export a portable backup and preview an import before changing existing data.
- Choose a light, dark, or system theme.

Starter services are optional shortcuts, not automatically added demo subscriptions. Their prices are yours to enter; Subs does not claim to know live service pricing.

Monthly and yearly figures are normalized estimates, not a payment ledger. Paused and cancelled subscriptions are excluded from active spending. Currency conversion depends on public exchange-rate data; unavailable conversion must not be mistaken for zero spending.

## Upgrade from Remix / Subs 2

Back up your data before upgrading. This is a framework and persistence rewrite, not an in-place change to the old JSON storage service.

1. Export JSON from the old application, or keep a copy of `data/config.json` from its mounted volume.
2. Build and start the new application with a persistent data volume.
3. Set your PIN, then use the import workflow to preview and restore your subscriptions.
4. Verify your subscriptions, currency, and budget before removing the old installation.

The importer accepts legacy subscription arrays and Zustand storage envelopes as well as the new versioned backup format. Browser-only data belongs to the old browser and origin; export it before changing domains or ports. The new server cannot reach another browser's local storage.

The old `USE_LOCAL_STORAGE` setting and unrestricted `/api/storage/:key` endpoint are replaced by authenticated server persistence. New backups do not contain your PIN or login sessions. Retain your original backup until you have verified the migration.

## Configuration

| Variable           | Default                                  | Purpose                                                                     |
| ------------------ | ---------------------------------------- | --------------------------------------------------------------------------- |
| `DATA_DIR`         | `./data` (`/data` in Docker)             | Database directory, resolved when starting development or building Nitro    |
| `PORT`             | `5173` in development, `7574` in Docker  | HTTP listening port                                                         |
| `SUBS_SETUP_TOKEN` | Generated and logged for first-use setup | Optional operator-supplied setup token                                      |
| `SUBS_ORIGIN`      | Request origin                           | Explicit public origin when required behind a proxy                         |
| `DISABLE_AUTH`     | `false`                                  | Set to exactly `true` to disable PIN authentication on a trusted deployment |

Authentication is enabled by default and applies to private API reads, writes, and backups—not just the interface. Treat setup tokens, session cookies, backups, and the database volume as sensitive. Do not put a real setup token into a committed Compose file.

The supplied image uses `/data/subs.sqlite`. Mount your chosen host directory at `/data`; a runtime `DATA_DIR` or `SQLITE_PATH` override can select another writable database location.

Set `SUBS_ORIGIN` to your public HTTPS origin when using a reverse proxy. Session cookies are HttpOnly and SameSite Strict, with Secure enabled for HTTPS; `SUBS_COOKIE_SECURE=true` explicitly enforces Secure cookies.

## Recover a lost PIN

PIN recovery is an operator-only maintenance command, not a public reset endpoint. Stop Subs and back up the entire data directory first. This clears access credentials and sessions, but leaves subscriptions and preferences intact:

```sh
docker compose stop subs
docker compose run --rm --no-deps subs bun scripts/reset-pin.ts --confirm
docker compose up -d subs
docker compose logs subs
```

Complete setup again using the operator token and choose a new PIN. For a local installation, stop the server and use `bun run reset-pin --confirm` with the same database environment settings as the server.

## Privacy

Subs does not connect to banks, scan email, execute payments, or send your subscription list to an AI service. The application does not automatically send subscription URLs to screenshot or favicon services. Public exchange-rate requests do not contain your subscription data.

## Development

```sh
bun run lint
bun run typecheck
bun run build
bun run test
```

The existing Playwright flows exercise the authenticated application and API against an isolated temporary database. They do not use your `data` directory. The production build starts with:

```sh
bun run start
```

The exact shadcn preset is `b3rmZdYMye` (Nova, Phosphor icons, pointer cursors). The [Bold Wikipedia tweakcn theme](https://tweakcn.com/r/themes/cmlmpb3qp000004l5go47hzsv) is authoritative for the final colors, typography, radius, and chart tokens. Retained UI primitives are regenerated for this design system rather than copied from the old Remix application.

The rewrite spec and individual tickets live in [`.scratch/rewrite/`](.scratch/rewrite/). Agent workflow configuration lives in [`docs/agents/`](docs/agents/), with project instructions in [`AGENTS.md`](AGENTS.md).
