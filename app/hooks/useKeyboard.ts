import { useEffect } from 'react'

type KeyHandler = (event: KeyboardEvent) => void

interface KeyBinding {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  handler: KeyHandler
  description?: string
}

/**
 * Custom hook to handle keyboard shortcuts
 * @param bindings Array of key bindings with their handlers
 * @param enabled Whether the keyboard shortcuts are enabled
 */
export function useKeyboard(bindings: KeyBinding[], enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      for (const binding of bindings) {
        const keyMatches = event.key.toLowerCase() === binding.key.toLowerCase()
        const ctrlMatches = binding.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey
        const shiftMatches = binding.shift ? event.shiftKey : !event.shiftKey
        const altMatches = binding.alt ? event.altKey : !event.altKey
        const metaMatches = binding.meta ? event.metaKey : true

        if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
          event.preventDefault()
          binding.handler(event)
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [bindings, enabled])
}

/**
 * Hook to get all available keyboard shortcuts
 */
export function useKeyboardShortcuts() {
  return [
    { key: 'n', description: 'Add new subscription' },
    { key: '/', description: 'Focus search bar' },
    { key: 'e', description: 'Export subscriptions', ctrl: true },
    { key: 'i', description: 'Import subscriptions', ctrl: true },
    { key: '?', description: 'Show keyboard shortcuts' },
    { key: 'Escape', description: 'Close dialogs/modals' },
  ]
}
