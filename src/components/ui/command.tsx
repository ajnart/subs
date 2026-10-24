import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import { Command as CommandPrimitive } from 'cmdk'
import { cn } from 'cn'
import type { ComponentProps } from 'react'

export function Command({ className, ...props }: ComponentProps<typeof CommandPrimitive>) {
  return <CommandPrimitive data-slot="command" className={cn('subs-command', className)} {...props} />
}

export function CommandInput({ className, ...props }: ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div className="subs-command-search">
      <MagnifyingGlassIcon aria-hidden="true" />
      <CommandPrimitive.Input className={cn('subs-command-input', className)} {...props} />
    </div>
  )
}

export function CommandList({ className, ...props }: ComponentProps<typeof CommandPrimitive.List>) {
  return <CommandPrimitive.List className={cn('subs-command-list', className)} {...props} />
}

export function CommandEmpty(props: ComponentProps<typeof CommandPrimitive.Empty>) {
  return <CommandPrimitive.Empty className="subs-command-empty" {...props} />
}

export function CommandGroup(props: ComponentProps<typeof CommandPrimitive.Group>) {
  return <CommandPrimitive.Group className="subs-command-group" {...props} />
}

export function CommandItem({ className, ...props }: ComponentProps<typeof CommandPrimitive.Item>) {
  return <CommandPrimitive.Item className={cn('subs-command-item', className)} {...props} />
}

export function CommandShortcut(props: ComponentProps<'kbd'>) {
  return <kbd className="subs-command-shortcut" {...props} />
}
