import { SpeakerHighIcon, SpeakerSlashIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { useInteractionFeedback } from '@/lib/sounds'

export function SoundToggle({ className }: { className?: string }) {
  const { muted, toggleMuted } = useInteractionFeedback()
  const Icon = muted ? SpeakerSlashIcon : SpeakerHighIcon
  let title = 'Mute interaction sounds'
  if (muted) title = 'Enable interaction sounds'

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={className}
      aria-label="Interaction sounds"
      aria-pressed={!muted}
      title={title}
      onClick={toggleMuted}
    >
      <Icon aria-hidden="true" />
    </Button>
  )
}
