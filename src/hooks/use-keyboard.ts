import { useEffect, useRef, useState } from 'react'

const editable = 'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="combobox"]'
const interactive =
  'button, a, input, textarea, select, [role="button"], [role="checkbox"], [role="switch"], [role="tab"]'

export interface KeyboardAction {
  key: string
  run: () => void
}

export function useKeyboard({
  enabled,
  modal,
  commandOpen,
  actions,
  onCommand,
}: {
  enabled: boolean
  modal: boolean
  commandOpen: boolean
  actions: KeyboardAction[]
  onCommand: () => void
}) {
  const [hints, setHints] = useState(false)
  const returnFocus = useRef<HTMLElement | null>(null)
  const wasModal = useRef(false)

  useEffect(() => {
    if (!enabled) setHints(false)
  }, [enabled])

  useEffect(() => {
    if (wasModal.current && !modal && enabled) {
      const frame = requestAnimationFrame(() => {
        if (!document.querySelector('[role="dialog"], [role="alertdialog"]')) {
          let target = document.getElementById('main')
          if (returnFocus.current?.isConnected) target = returnFocus.current
          target?.focus({ preventScroll: true })
        }
      })
      wasModal.current = modal
      return () => cancelAnimationFrame(frame)
    }
    wasModal.current = modal
  }, [modal, enabled])

  useEffect(() => {
    const clear = () => setHints(false)
    const focus = (event: FocusEvent) => {
      if (event.target instanceof HTMLElement && !event.target.closest('[role="dialog"], [role="alertdialog"]')) {
        returnFocus.current = event.target
      }
    }
    const keyup = (event: KeyboardEvent) => {
      setHints(enabled && !document.hidden && (event.metaKey || event.ctrlKey))
    }
    const keydown = (event: KeyboardEvent) => {
      if (!enabled || event.isComposing || event.keyCode === 229 || event.defaultPrevented) return
      setHints(event.metaKey || event.ctrlKey)
      const target = event.target
      const element = target instanceof HTMLElement ? target : null
      const inModal = modal || Boolean(document.querySelector('[role="dialog"], [role="alertdialog"]'))
      if (event.repeat || event.altKey) return
      if (
        (event.metaKey || event.ctrlKey) &&
        !event.shiftKey &&
        event.key.toLowerCase() === 'k' &&
        (!inModal || commandOpen)
      ) {
        event.preventDefault()
        onCommand()
        return
      }
      if (inModal) return
      if (element?.closest(editable)) return
      const modified = event.metaKey || event.ctrlKey
      const key = event.key.toLowerCase()
      const action = actions.find((item) => item.key === `${modified ? 'mod+' : ''}${key}`)
      if (action) {
        event.preventDefault()
        action.run()
        return
      }
      if (modified || element?.closest(interactive)) return
      const item = element?.closest<HTMLElement>('[data-subscription-item]')
      if (item && (key === 'enter' || key === ' ')) {
        const selector = key === 'enter' ? '[data-subscription-manage]' : '[data-subscription-select]'
        const control = item.querySelector<HTMLElement>(selector)
        if (control && !control.matches(':disabled, [aria-disabled="true"]')) {
          event.preventDefault()
          control.click()
        }
        return
      }
      if (!['arrowdown', 'arrowup', 'arrowleft', 'arrowright', 'j', 'k', 'home', 'end'].includes(key)) return
      if (!item && element !== document.body && element?.id !== 'main') return
      const items = Array.from(document.querySelectorAll<HTMLElement>('#main [data-subscription-item]')).filter(
        (candidate) => candidate.getClientRects().length > 0,
      )
      if (!items.length) return
      let index = -1
      if (item) index = items.indexOf(item)
      if (key === 'home') index = 0
      else if (key === 'end') index = items.length - 1
      else if (index < 0) index = 0
      else if (key === 'arrowup' || key === 'arrowdown') {
        const origin = items[index].getBoundingClientRect()
        const direction = key === 'arrowdown' ? 1 : -1
        const next = items
          .map((candidate, candidateIndex) => ({ index: candidateIndex, rect: candidate.getBoundingClientRect() }))
          .filter((candidate) => (candidate.rect.top - origin.top) * direction > 1)
          .sort((a, b) => {
            const distanceA = Math.abs(a.rect.top - origin.top) + Math.abs(a.rect.left - origin.left)
            const distanceB = Math.abs(b.rect.top - origin.top) + Math.abs(b.rect.left - origin.left)
            return distanceA - distanceB
          })[0]
        if (next) index = next.index
      } else if (key === 'arrowleft' || key === 'k') index = Math.max(0, index - 1)
      else index = Math.min(items.length - 1, index + 1)
      event.preventDefault()
      for (const candidate of items) candidate.tabIndex = -1
      items[index].tabIndex = 0
      items[index].focus({ preventScroll: true })
      items[index].scrollIntoView({ block: 'nearest', inline: 'nearest' })
    }
    window.addEventListener('keydown', keydown)
    window.addEventListener('keyup', keyup)
    window.addEventListener('blur', clear)
    document.addEventListener('visibilitychange', clear)
    document.addEventListener('focusin', focus)
    return () => {
      window.removeEventListener('keydown', keydown)
      window.removeEventListener('keyup', keyup)
      window.removeEventListener('blur', clear)
      document.removeEventListener('visibilitychange', clear)
      document.removeEventListener('focusin', focus)
    }
  }, [enabled, modal, commandOpen, actions, onCommand])

  useEffect(() => {
    if (!enabled) return
    const root = document.getElementById('main')
    if (!root) return
    const sync = () => {
      const items = Array.from(root.querySelectorAll<HTMLElement>('[data-subscription-item]'))
      const active = items.find((item) => item === document.activeElement || item.tabIndex === 0) ?? items[0]
      for (const item of items) item.tabIndex = item === active ? 0 : -1
    }
    const focus = (event: FocusEvent) => {
      if (event.target instanceof HTMLElement && event.target.matches('[data-subscription-item]')) {
        for (const item of root.querySelectorAll<HTMLElement>('[data-subscription-item]')) {
          item.tabIndex = item === event.target ? 0 : -1
        }
      }
    }
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(root, { childList: true, subtree: true })
    root.addEventListener('focusin', focus)
    return () => {
      observer.disconnect()
      root.removeEventListener('focusin', focus)
    }
  }, [enabled])

  return enabled && hints
}
