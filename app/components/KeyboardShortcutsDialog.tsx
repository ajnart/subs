import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog'

interface KeyboardShortcutsDialogProps {
  isOpen: boolean
  onClose: () => void
}

interface Shortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  description: string
}

const shortcuts: Shortcut[] = [
  { key: 'N', description: 'Add new subscription' },
  { key: '/', description: 'Focus search bar' },
  { key: 'E', ctrl: true, description: 'Export subscriptions' },
  { key: 'I', ctrl: true, description: 'Import subscriptions' },
  { key: '?', description: 'Show this help dialog' },
  { key: 'Esc', description: 'Close dialogs/modals' },
]

const KeyboardShortcutsDialog: React.FC<KeyboardShortcutsDialogProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>Use these keyboard shortcuts to navigate the app faster</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 mt-4">
          {shortcuts.map((shortcut) => (
            <div key={shortcut.key} className="flex justify-between items-center py-2 border-b last:border-b-0">
              <span className="text-sm text-muted-foreground">{shortcut.description}</span>
              <div className="flex gap-1">
                {shortcut.ctrl && (
                  <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded">
                    Ctrl
                  </kbd>
                )}
                {shortcut.shift && (
                  <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded">
                    Shift
                  </kbd>
                )}
                {shortcut.alt && (
                  <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded">
                    Alt
                  </kbd>
                )}
                {shortcut.ctrl && <span className="text-muted-foreground">+</span>}
                <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded">
                  {shortcut.key}
                </kbd>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default KeyboardShortcutsDialog
