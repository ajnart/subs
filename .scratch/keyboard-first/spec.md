# Subs keyboard-first experience

Status: ready-for-agent
Progress: completed

## Outcome

Make Subs feel immediate and keyboard-led like Raycast while retaining one private Collection, the exact existing preset/theme, the browser-only demo, and a single self-hosted Docker container.

The user explicitly requested parallel sub-agents and the OpenChamber todo feature. The live todos are the execution checklist; this file preserves the behavior and verification constraints with the repository.

## Todo contracts

| OpenChamber todo                       | Outcome                                                                                                |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `3b895912-d89d-4283-8b64-f4d9d794285d` | Cmd/Ctrl+K command palette, keyboard navigation/actions and hold-modifier interaction hints            |
| `fce91e1a-adcb-4a72-b9f4-a4a8eb6d2eaa` | Beautiful service cards with verified Dashboard Icons assets and safe favicon fallbacks                |
| `ef40094a-0744-4ff0-94bb-4f8483c934e5` | Centered, dominant PIN entry; unlock digits masked, setup/confirmation readable                        |
| `fdf9bf49-be27-4fd3-ad8e-1a51c656ab08` | Actual TIKS feedback, gesture activation and an accessible device mute control                         |
| `19fca6d6-c839-43bb-ab6b-65a62f30ecb1` | Native CSS View Transitions with focus preservation and reduced-motion/fallback behavior               |
| `0ccae253-b92f-44e5-af18-8ab4dac32e82` | Secure private SSR bootstrap and critical-resource preloading without a backend dependency in the demo |
| `cbabe0e4-4f1d-4246-98d5-d9809f4c4f6f` | Opt-in browser reminders with honest scheduling, permissions, deduplication and click-through          |
| `eebfb201-8df9-45b9-b126-56562dcff55a` | Integrated keyboard/browser/security/build validation and simple one-container operation               |

## Interaction

- The command palette searches application actions and actual subscriptions. Opening a subscription leads to its standard editor, not a second editing implementation.
- Holding either Cmd or Ctrl reveals interaction hints. Releasing it, blurring the window or hiding the document clears them. Browser shortcuts, text composition, native form controls and active dialogs retain appropriate behavior.
- Cards and table rows support predictable keyboard focus and navigation; Enter opens management, and selection/destructive actions remain explicit and confirmed.
- Existing money, recurrence, lifecycle, import-preview and frozen-revision protections remain intact. A faster interface never acknowledges a write before persistence succeeds.
- Keep functional labels concise, service icons real and keyboard focus visible. Raycast is an interaction reference, not permission to replace the locked theme or add accounts.

## Assets, sounds and motion

- Resolve the requested service marks through the Dashboard Icons catalog, recording the actual returned sources, variants and licenses. Bundle known marks where practical for private, fast self-hosting.
- The latest user request permits website favicon fallbacks for otherwise unknown public origins. Exclude local/private/IP targets and credentials, strip paths/query strings, send no referrer, retain an image-error fallback, and add no server arbitrary-URL fetcher.
- TIKS is the real `@rexa-developer/tiks` dependency, not custom audio synthesis relabeled as TIKS. Sounds supplement visual feedback, start only after a user gesture, are restrained, and have a device mute control. No mount/autoplay sound or audio download waterfall.
- Use the native View Transition API with CSS pseudo-element animation, not only a JavaScript animation substitute. Preserve updates under rapid navigation, keep focus correct, and render immediately when unsupported or reduced motion is requested.

## Rendering and persistence

- Private initial HTML may include authenticated Collection data only after existing server authorization. Bootstrap status/data/revision must be coherent, no-store and cookie-scoped; never serialize PIN material, setup tokens or sessions.
- Hydration retains the initial data/revision without a skeleton flash or discarded drafts. Do not block initial HTML on an external exchange-rate fetch. Keep date-only recurrence deterministic across server and client.
- Preload critical fonts and useful application assets, and warm interaction resources without pre-fetching private/public previews indiscriminately. The demo still performs zero backend requests.
- Notifications are explicitly opt-in per browser/device. Request permission only on a user action, handle denied/unsupported/insecure environments, and avoid storing private Collection data in an offline cache.
- Browser-only timers are best effort while Subs is open and must recompute after wake or changes. Do not promise reliable alarms after the browser is closed. No second required service, background-push infrastructure or automatic provider cancellation is added.

## Parallel ownership

- Keyboard lane: application shell, command palette, keyboard hook/styles.
- Visual lane: cards/table, shared service marks/assets and unlock/setup UI.
- Feedback lane: TIKS module, mute control, native transition helper/styles.
- SSR lane: private route/bootstrap/context, loading hook, coherent database state and deterministic date helpers.
- Reminder lane: Settings integration, browser reminder module/controller and optional notification-click worker.
- Coordinator: dependencies, shared stylesheet imports, docs, existing test adaptations, real-browser/container checks, todo evidence and release integration.

## Completion evidence

All eight feature todos have integrated acceptance evidence in [validation.md](validation.md). Five implementation lanes and a read-only review/fix/review cycle were completed. The feature remains on [PR #50](https://github.com/ajnart/subs/pull/50), not merged into the default branch.

The existing Cloudflare deployment-token blocker is separate: repository Actions secrets were still empty at final local verification. Local OAuth deployment does not enable automatic CI deployment.
