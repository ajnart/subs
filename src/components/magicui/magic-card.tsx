import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/utils'
import { useAnimationActivity } from './animation-activity'

export interface MagicCardProps extends ComponentPropsWithoutRef<'div'> {
  gradientSize?: number
  gradientColor?: string
  gradientOpacity?: number
  gradientFrom?: string
  gradientTo?: string
}

export function MagicCard({
  children,
  className,
  gradientSize = 200,
  gradientColor = 'var(--primary)',
  gradientOpacity = 0.06,
  gradientFrom = 'var(--primary)',
  gradientTo = 'var(--border)',
  onPointerMove,
  onPointerLeave,
  ...props
}: MagicCardProps) {
  const { ref, active } = useAnimationActivity<HTMLDivElement>()
  const mouseX = useMotionValue(-gradientSize)
  const mouseY = useMotionValue(-gradientSize)
  const background = useMotionTemplate`radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientColor}, transparent 100%)`
  const border = useMotionTemplate`radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientFrom}, ${gradientTo} 100%)`

  return (
    <div
      ref={ref}
      className={cn(
        'group relative isolate overflow-hidden rounded-[inherit] border bg-card text-card-foreground',
        className,
      )}
      {...props}
      onPointerMove={(event) => {
        if (active && event.pointerType !== 'touch') {
          const rect = event.currentTarget.getBoundingClientRect()
          mouseX.set(event.clientX - rect.left)
          mouseY.set(event.clientY - rect.top)
        }
        onPointerMove?.(event)
      }}
      onPointerLeave={(event) => {
        mouseX.set(-gradientSize)
        mouseY.set(-gradientSize)
        onPointerLeave?.(event)
      }}
    >
      {active && (
        <>
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[inherit]"
            style={{ background: border }}
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-px rounded-[inherit] bg-card" />
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-px rounded-[inherit]"
            style={{ background, opacity: gradientOpacity }}
          />
        </>
      )}
      <div className="relative">{children}</div>
    </div>
  )
}
