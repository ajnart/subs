# Fast subscription setup

Status: ready-for-agent
Progress: completed

## Outcome

Make Starter Templates useful for setting up a whole Collection, not just opening one prefilled form. Preserve the keyboard-first experience, authoritative shadcn/Phosphor/theme configuration, private SSR, single-container storage, and browser-only demo.

## Feature checklist

| OpenChamber todo                       | Acceptance                                                                                                                                                                                     |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `df2f4f7e-a112-4d5b-95d0-95d9bbcf8579` | Search and select multiple presets; paste several website URLs; review/edit per-service prices, billing, names and links; save the selection atomically with a frozen revision                 |
| `afc17a69-2106-40a6-8dca-c1ae86d9f27f` | Clearer Add/Edit dialog, service preview, prominent price/billing, visible website/icon controls, and access to multi-service setup; keyboard/focus/history/delete/conflict behavior preserved |
| `5dae07fd-4865-4f02-ac46-649143825413` | Custom icon URLs preview, save, edit, clear, display and round-trip using the existing icon field; safe client-only loading and graceful fallback; legacy records remain readable              |

## Constraints

- Selection and draft editing never write. Review and save are explicit; missing prices are not silently replaced with zero. Zero is valid when deliberately entered. No provider prices are invented or fetched.
- URLs can be added together, with validation and a chance to correct names/links before saving. Preserve full safe website links, not just hostnames. Optional dates remain unset unless supplied.
- Surface previously tracked services without silently merging or overwriting them. Add-as-new creates separate Subscription records; currency/billing/date defaults must be visible.
- Use the existing version-3 atomic add-as-new import path, strict modern money precision, frozen If-Match, and existing backup/body limits. Do not add an unnecessary bulk service or database migration.
- Preserve drafts on invalid input, failed writes and revision conflicts. A successful commit followed by a read failure is still saved, never an invitation to retry the write blindly.
- Custom image URLs use browser requests only, never a server proxy. Reject executable/inline schemes, credentials, and unsafe private/local automatic image targets. Retain readable legacy free-form icon values, rather than tightening the shared backup schema incompatibly.
- Preserve the old editor's explicit conflict review/load-latest flow and genuine price history. New/edit icon changes must not erase an existing override accidentally.
- Use installed UI primitives and dependencies; keep exact theme tokens. Verify desktop/mobile, keyboard selection/entry, draft retention, rejected batches, icon fallbacks and backup round trips. Do not add new unit-test files.

## Completion evidence

Implemented and validated; final combined oracle review accepted with no findings. Evidence is in `.scratch/quick-setup/validation.md` and the later display-first home checks in `.scratch/simple-home/validation.md`. Wider desktop dialogs, mobile layouts, multi-service onboarding and custom icons are complete. Changes remain local; no commit, PR publication or deployment is implied.
