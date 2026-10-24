# 08 — Private responsive shell

Status: ready-for-agent
Progress: open
Type: task
Blocked by: 02, 04, 07

## Outcome

Provide a recognizable Subs home, protected entry, and working navigation on phones and desktops.

## Acceptance criteria

- First setup, locked, unlocked, and explicit auth-disabled states are distinct and appropriate controls are shown for each.
- Regenerated InputOTP provides labeled six-digit entry, paste/keyboard support, pending/error/retry feedback, and no PIN logging.
- Subs branding and service-centered quick entry remain recognizable without copying the old layout pixel for pixel.
- Navigation reaches Collection, calendar/insights, imports, and settings; logout immediately clears protected UI.
- Light/dark/system follows the exact theme precedence with non-sensitive local preference only and no confusing hydration flash.
- Protected data does not leak in unauthenticated HTML, loading placeholders, or client bootstrap payloads.

## Comments

Do not advertise planned provider automation in navigation or onboarding.
