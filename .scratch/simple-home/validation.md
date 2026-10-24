# Display-first home validation

Status: verified locally

## Acceptance checks

- [x] Fresh populated home shows subscriptions without expanded summaries, toolbar or upcoming preview.
- [x] Collection tools intentionally exposes the richer view; closing it leaves filtered state evident.
- [x] `/` opens and focuses search from Overview and other pages; typing remains safe.
- [x] Card keyboard navigation, Enter management, command palette, manual add and quick setup remain available.
- [x] Empty Collection onboarding stays prominent; no automatic blocking wizard.
- [x] Desktop/mobile light/dark layouts and screenshots are verified with no horizontal overflow.
- [x] Demo still makes zero backend requests; presentation adds no data/schema/preference change.
- [x] Lint/typecheck and the affected existing regressions pass; no new test files.
- [x] Final integrated review accepts the home change and preserved quick-setup contracts.

## Related evidence

The wider editor, batch onboarding, custom icons, atomic/revision/error handling and private SSR evidence remains in `.scratch/quick-setup/validation.md`. Its final optional-details native-input probe now passes both Category and Icon correction with expansion and focus preserved and no data written. Do not repeat completed backend validation for this presentation-only change.

## Evidence

- `bun run lint`, `bun run typecheck`, and `git diff --check` pass.
- `bun run test tests/components tests/subscription-card-size.spec.ts --grep-invert 'private reads|mutations require|login uses' --retries=0 --reporter=line`: 19 existing tests passed in 33.0s. Six existing specs were updated only to enter Collection tools intentionally; assertions are retained. No new test files were added.
- Fresh desktop/light/mobile loads have the native disclosure closed and nine service cards visible. Native closed-details descendants can retain layout rectangles, so visual/AX results—not `getClientRects()` alone—verify their hidden state.
- `/` opens/focuses search both from home and Calendar. Searching Netflix then collapsing tools leaves one card and the visible `1 of 9 shown · filtered` indicator. Clear filters restores all cards.
- Arrow navigation/Enter opens an editor from the default view; the command palette opens quick setup with 32 presets and exactly one dialog.
- An isolated browser-storage empty fixture exposes the prominent quick-setup action; it opens all 32 presets. The original sample store is restored afterward. Resource inspection reports zero `/api/` requests throughout.
- Desktop 1440px and mobile 390px/360px views have no horizontal overflow. Real screenshots were reviewed in dark/light modes; expanded tools retain totals, filters, layout controls and upcoming previews.
- Focused main-view axe reports zero violations, with one incomplete contrast rule on the existing layered cards. The separate pre-existing light primary-button hover contrast limitation remains documented; no full WCAG claim is made.

Screenshots under `/private/var/folders/kx/hccbvbyd6sb61s6lrr2jyt2m0000gn/T/opencode/`: `subs-simple-home-desktop.png`, `subs-simple-home-light.png`, `subs-simple-home-mobile.png`, and `subs-simple-home-tools.png`. README overview/mobile captures are updated to the new default.

Final combined oracle review accepted with no findings; previous quick-setup findings are resolved. Changes are local, with no commit, deployment or new CI claim.
