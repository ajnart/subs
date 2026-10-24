import { flushSync } from 'react-dom'

let active: { transition: ViewTransition; commit: () => void } | undefined

export function transitionView(update: () => void): void {
  if (typeof document === 'undefined') {
    update()
    return
  }

  if (active) {
    active.transition.skipTransition()
    active.commit()
    active = undefined
  }

  if (
    !document.startViewTransition ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    document.documentElement.dataset.magicuiThemeVt ||
    document.hidden
  ) {
    flushSync(update)
    return
  }

  let committed = false
  const commit = () => {
    if (committed) return
    committed = true
    flushSync(update)
  }
  let transition: ViewTransition
  try {
    transition = document.startViewTransition(commit)
  } catch (error) {
    if (committed) throw error
    commit()
    return
  }

  const current = { transition, commit }
  active = current
  const cleanup = () => {
    if (active === current) active = undefined
  }
  void transition.ready.catch(() => undefined)
  void transition.finished.then(cleanup, cleanup)
  void transition.updateCallbackDone.catch((error: unknown) => {
    queueMicrotask(() => {
      throw error
    })
  })
}
