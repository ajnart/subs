import {
  ArrowClockwiseIcon,
  ArrowSquareOutIcon,
  CalendarDotsIcon,
  ChartBarIcon,
  FileArrowUpIcon,
  GearSixIcon,
  HouseIcon,
  KeyboardIcon,
  LockKeyIcon,
  PlusIcon,
  StackIcon,
} from '@phosphor-icons/react'
import { useEffect, useRef } from 'react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { playFeedback } from '@/lib/sounds'
import { templates } from '@/lib/templates'
import type { Subscription } from '@/lib/types'

export type AppPage = 'Overview' | 'Calendar' | 'Insights' | 'Settings'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscriptions: Subscription[]
  onNavigate: (page: AppPage) => void
  onAdd: () => void
  onTemplates: () => void
  onTemplate: (template: (typeof templates)[number]) => void
  onRefresh: () => void
  refreshing: boolean
  onLock?: () => void
  locking: boolean
  onImport: () => void
  onShortcuts: () => void
  onEdit: (id: string) => void
}

export function CommandPalette(props: CommandPaletteProps) {
  const previousFocus = useRef<HTMLElement | null>(null)
  const latest = useRef(props)
  latest.current = props
  const pending = useRef<((current: CommandPaletteProps) => void) | null>(null)
  const frame = useRef<number | null>(null)
  useEffect(() => {
    const cancel = () => {
      pending.current = null
      if (frame.current !== null) cancelAnimationFrame(frame.current)
      frame.current = null
    }
    window.addEventListener('subs:locked', cancel)
    window.addEventListener('subs:demo-reset', cancel)
    return () => {
      cancel()
      window.removeEventListener('subs:locked', cancel)
      window.removeEventListener('subs:demo-reset', cancel)
    }
  }, [])
  const run = (action: (current: CommandPaletteProps) => void) => {
    pending.current = action
    props.onOpenChange(false)
  }
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent
        className="gap-0 overflow-hidden p-0 sm:max-w-xl"
        showCloseButton={false}
        onOpenAutoFocus={() => {
          pending.current = null
          if (frame.current !== null) cancelAnimationFrame(frame.current)
          frame.current = null
          if (document.activeElement instanceof HTMLElement) previousFocus.current = document.activeElement
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          const action = pending.current
          pending.current = null
          if (action) {
            frame.current = requestAnimationFrame(() => {
              frame.current = null
              previousFocus.current?.focus({ preventScroll: true })
              playFeedback('open')
              action(latest.current)
            })
          } else if (previousFocus.current?.isConnected) previousFocus.current.focus({ preventScroll: true })
        }}
      >
        <DialogTitle className="sr-only">Search commands and subscriptions</DialogTitle>
        <DialogDescription className="sr-only">
          Search, use arrow keys to choose a result, and press Enter to open it. Escape closes this menu.
        </DialogDescription>
        <Command label="Commands and subscriptions" loop>
          <CommandInput
            aria-label="Search commands and subscriptions"
            placeholder="Search subscriptions or commands…"
          />
          <CommandList>
            <CommandEmpty>No matches. Try a service name, “add”, or “settings”.</CommandEmpty>
            <CommandGroup heading="Actions">
              <CommandItem value="Add subscription new plan" onSelect={() => run((current) => current.onAdd())}>
                <PlusIcon aria-hidden="true" /> Add subscription <CommandShortcut>N / A</CommandShortcut>
              </CommandItem>
              <CommandItem
                value="Quick setup add several subscriptions choose starter templates service"
                onSelect={() => run((current) => current.onTemplates())}
              >
                <StackIcon aria-hidden="true" /> Quick setup: add several <CommandShortcut>T</CommandShortcut>
              </CommandItem>
              <CommandItem value="Import backup collection" onSelect={() => run((current) => current.onImport())}>
                <FileArrowUpIcon aria-hidden="true" /> Import backup <CommandShortcut>I</CommandShortcut>
              </CommandItem>
              <CommandItem
                value="Refresh collection subscriptions"
                disabled={props.refreshing}
                onSelect={() => run((current) => current.onRefresh())}
              >
                <ArrowClockwiseIcon aria-hidden="true" /> Refresh collection <CommandShortcut>R</CommandShortcut>
              </CommandItem>
              <CommandItem value="Keyboard shortcuts help" onSelect={() => run((current) => current.onShortcuts())}>
                <KeyboardIcon aria-hidden="true" /> Keyboard shortcuts <CommandShortcut>?</CommandShortcut>
              </CommandItem>
              {props.onLock && (
                <CommandItem
                  value="Lock private collection"
                  disabled={props.locking}
                  onSelect={() => run((current) => current.onLock?.())}
                >
                  <LockKeyIcon aria-hidden="true" /> Lock collection <CommandShortcut>L</CommandShortcut>
                </CommandItem>
              )}
            </CommandGroup>
            <CommandGroup heading="Go to">
              {(
                [
                  { page: 'Overview', icon: HouseIcon },
                  { page: 'Calendar', icon: CalendarDotsIcon },
                  { page: 'Insights', icon: ChartBarIcon },
                  { page: 'Settings', icon: GearSixIcon },
                ] as const
              ).map((item, index) => (
                <CommandItem
                  key={item.page}
                  value={`Go to ${item.page}`}
                  onSelect={() => run((current) => current.onNavigate(item.page))}
                >
                  <item.icon aria-hidden="true" /> {item.page} <CommandShortcut>⌘/Ctrl {index + 1}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Subscriptions">
              {props.subscriptions.map((subscription) => (
                <CommandItem
                  key={subscription.id}
                  value={`subscription ${subscription.id}`}
                  keywords={[subscription.name, subscription.domain, subscription.category, subscription.status]}
                  onSelect={() => run((current) => current.onEdit(subscription.id))}
                >
                  <ArrowSquareOutIcon aria-hidden="true" />
                  <span className="min-w-0 truncate">{subscription.name}</span>
                  <CommandShortcut>Manage</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Starter templates">
              {templates.map((template) => (
                <CommandItem
                  key={template.name}
                  value={`Add ${template.name} starter template quick setup`}
                  onSelect={() => run((current) => current.onTemplate(template))}
                >
                  <PlusIcon aria-hidden="true" /> {template.name} <CommandShortcut>Quick setup</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t px-4 py-2 text-xs text-muted-foreground"
          aria-hidden="true"
        >
          <span>↑ ↓ to navigate</span>
          <span>↵ to open</span>
          <span className="ml-auto">Esc to close</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
