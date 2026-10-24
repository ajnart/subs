'use client'

import { animate } from 'framer-motion'
import { memo, useCallback, useEffect, useRef } from 'react'
import { useAnimationActivity } from '@/components/magicui/animation-activity'
import { cn } from '@/lib/utils'

export interface GlowingEffectProps {
  blur?: number
  inactiveZone?: number
  proximity?: number
  spread?: number
  variant?: 'default' | 'white'
  glow?: boolean
  className?: string
  disabled?: boolean
  movementDuration?: number
  borderWidth?: number
}
const GlowingEffect = memo(
  ({
    blur = 0,
    inactiveZone = 0.7,
    proximity = 0,
    spread = 20,
    variant = 'default',
    glow = false,
    className,
    movementDuration = 2,
    borderWidth = 1,
    disabled = false,
  }: GlowingEffectProps) => {
    const { ref: containerRef, active } = useAnimationActivity<HTMLDivElement>()
    const animationRef = useRef<ReturnType<typeof animate> | null>(null)
    const lastPosition = useRef({ x: 0, y: 0 })
    const animationFrameRef = useRef<number>(0)

    const handleMove = useCallback(
      (e?: MouseEvent | { x: number; y: number }) => {
        if (!containerRef.current) return

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }

        animationFrameRef.current = requestAnimationFrame(() => {
          const element = containerRef.current
          if (!element) return

          const { left, top, width, height } = element.getBoundingClientRect()
          const mouseX = e?.x ?? lastPosition.current.x
          const mouseY = e?.y ?? lastPosition.current.y

          if (e) {
            lastPosition.current = { x: mouseX, y: mouseY }
          }

          const center = [left + width * 0.5, top + height * 0.5]
          const distanceFromCenter = Math.hypot(mouseX - center[0], mouseY - center[1])
          const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone

          if (distanceFromCenter < inactiveRadius) {
            element.style.setProperty('--active', '0')
            return
          }

          const isActive =
            mouseX > left - proximity &&
            mouseX < left + width + proximity &&
            mouseY > top - proximity &&
            mouseY < top + height + proximity

          element.style.setProperty('--active', isActive ? '1' : '0')

          if (!isActive) return

          const currentAngle = parseFloat(element.style.getPropertyValue('--start')) || 0
          const targetAngle = (180 * Math.atan2(mouseY - center[1], mouseX - center[0])) / Math.PI + 90

          const angleDiff = ((targetAngle - currentAngle + 180) % 360) - 180
          const newAngle = currentAngle + angleDiff

          animationRef.current?.stop()
          animationRef.current = animate(currentAngle, newAngle, {
            duration: movementDuration,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (value) => {
              element.style.setProperty('--start', String(value))
            },
          })
        })
      },
      [inactiveZone, proximity, movementDuration, containerRef],
    )

    useEffect(() => {
      if (disabled || !active) return

      const handleScroll = () => handleMove()
      const handlePointerMove = (e: PointerEvent) => handleMove(e)

      window.addEventListener('scroll', handleScroll, { passive: true })
      document.body.addEventListener('pointermove', handlePointerMove, {
        passive: true,
      })

      return () => {
        animationRef.current?.stop()
        containerRef.current?.style.setProperty('--active', '0')
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        window.removeEventListener('scroll', handleScroll)
        document.body.removeEventListener('pointermove', handlePointerMove)
      }
    }, [handleMove, disabled, active, containerRef])

    return (
      <>
        <div
          className={cn(
            'pointer-events-none absolute -inset-px hidden rounded-[inherit] border opacity-0 transition-opacity',
            glow && 'opacity-100',
            variant === 'white' && 'border-foreground',
            disabled && '!block',
          )}
        />
        <div
          ref={containerRef}
          style={
            {
              '--blur': `${blur}px`,
              '--spread': spread,
              '--start': '0',
              '--active': '0',
              '--glowingeffect-border-width': `${borderWidth}px`,
              '--repeating-conic-gradient-times': '5',
              '--gradient':
                variant === 'white'
                  ? `repeating-conic-gradient(
                  from 236.84deg at 50% 50%,
                  var(--foreground),
                  var(--foreground) calc(25% / var(--repeating-conic-gradient-times))
                )`
                  : `repeating-conic-gradient(
                  from 236.84deg at 50% 50%,
                  var(--primary) 0%,
                  var(--border) calc(50% / var(--repeating-conic-gradient-times)),
                  var(--primary) calc(100% / var(--repeating-conic-gradient-times))
                )`,
            } as React.CSSProperties
          }
          className={cn(
            'pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity',
            glow && 'opacity-100',
            blur > 0 && 'blur-[var(--blur)] ',
            className,
            disabled && '!hidden',
          )}
        >
          <div
            className={cn(
              'glow',
              'rounded-[inherit]',
              'after:content-[""] after:rounded-[inherit] after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))]',
              'after:[border:var(--glowingeffect-border-width)_solid_transparent]',
              'after:[background:var(--gradient)] after:[background-attachment:fixed]',
              'after:opacity-[var(--active)] after:transition-opacity after:duration-300',
              'after:[mask-clip:padding-box,border-box]',
              'after:[mask-composite:intersect]',
              'after:[mask-image:linear-gradient(transparent,transparent),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),transparent_0deg,var(--foreground),transparent_calc(var(--spread)*2deg))]',
            )}
          />
        </div>
      </>
    )
  },
)

GlowingEffect.displayName = 'GlowingEffect'

export { GlowingEffect }
