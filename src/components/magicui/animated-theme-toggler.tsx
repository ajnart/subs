import { MoonIcon, SunIcon } from '@phosphor-icons/react'
import { useReducedMotion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { type ComponentPropsWithoutRef, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { cn } from '@/lib/utils'

export interface AnimatedThemeTogglerProps extends ComponentPropsWithoutRef<'button'> {
  duration?: number
  fromCenter?: boolean
  theme?: 'light' | 'dark'
  onThemeChange?: (theme: 'light' | 'dark') => void
}

export function AnimatedThemeToggler({
  duration = 350,
  fromCenter = false,
  theme,
  onThemeChange,
  className,
  onClick,
  children,
  ...props
}: AnimatedThemeTogglerProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const transitionRef = useRef<ViewTransition | null>(null)
  const animationRef = useRef<Animation | null>(null)
  const reducedMotion = useReducedMotion()
  const dark = mounted && (theme ?? resolvedTheme) === 'dark'

  useEffect(() => {
    setMounted(true)
    const cancel = () => {
      if (document.hidden) {
        animationRef.current?.cancel()
        transitionRef.current?.skipTransition()
      }
    }
    document.addEventListener('visibilitychange', cancel)
    return () => {
      animationRef.current?.cancel()
      transitionRef.current?.skipTransition()
      document.removeEventListener('visibilitychange', cancel)
    }
  }, [])

  return (
    <>
      <style>{`html[data-magicui-theme-vt]::view-transition-old(root),html[data-magicui-theme-vt]::view-transition-new(root){animation:none;mix-blend-mode:normal}`}</style>
      <button
        {...props}
        ref={buttonRef}
        type="button"
        aria-label="Toggle theme"
        className={cn(
          'inline-flex size-9 items-center justify-center rounded-md border bg-background text-foreground outline-offset-4 hover:bg-muted active:bg-muted focus-visible:outline-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4',
          className,
        )}
        onClick={(event) => {
          onClick?.(event)
          if (event.defaultPrevented || transitionRef.current) return
          const applyTheme = () => {
            let next: 'light' | 'dark' = 'dark'
            if (dark) next = 'light'
            if (theme === undefined) setTheme(next)
            onThemeChange?.(next)
          }
          const button = buttonRef.current
          if (!button || reducedMotion !== false || !document.startViewTransition) {
            applyTheme()
            return
          }
          const bounds = button.getBoundingClientRect()
          let x = bounds.left + bounds.width / 2
          let y = bounds.top + bounds.height / 2
          if (fromCenter) {
            x = innerWidth / 2
            y = innerHeight / 2
          }
          const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
          const point = `${(x / innerWidth) * 100}% ${(y / innerHeight) * 100}%`
          const percent = (radius / (Math.hypot(innerWidth, innerHeight) / Math.SQRT2)) * 100
          const root = document.documentElement
          root.dataset.magicuiThemeVt = 'active'
          const transition = document.startViewTransition(() => flushSync(applyTheme))
          transitionRef.current = transition
          const cleanup = () => {
            delete root.dataset.magicuiThemeVt
            animationRef.current?.cancel()
            animationRef.current = null
            transitionRef.current = null
          }
          void transition.finished.then(cleanup, cleanup)
          void transition.ready.then(
            () => {
              animationRef.current = root.animate(
                { clipPath: [`circle(0% at ${point})`, `circle(${percent}% at ${point})`] },
                { duration, easing: 'ease-in-out', fill: 'forwards', pseudoElement: '::view-transition-new(root)' },
              )
            },
            () => transition.skipTransition(),
          )
        }}
      >
        {children ?? (dark ? <SunIcon aria-hidden="true" /> : <MoonIcon aria-hidden="true" />)}
      </button>
    </>
  )
}
