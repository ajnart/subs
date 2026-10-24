import { motion } from 'framer-motion'
import { type SVGProps, useId } from 'react'
import { cn } from '@/lib/utils'
import { useAnimationActivity } from './animation-activity'

export interface DotPatternProps extends SVGProps<SVGSVGElement> {
  width?: number
  height?: number
  x?: number
  y?: number
  cx?: number
  cy?: number
  cr?: number
  glow?: boolean
}

export function DotPattern({
  width = 16,
  height = 16,
  x = 0,
  y = 0,
  cx = 1,
  cy = 1,
  cr = 1,
  glow = false,
  className,
  ...props
}: DotPatternProps) {
  const id = useId()
  const { ref, active } = useAnimationActivity<SVGSVGElement>()
  const pulsing = glow && active
  return (
    <svg
      ref={ref}
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 size-full text-border', className)}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={Math.max(1, width)}
          height={Math.max(1, height)}
          x={x}
          y={y}
          patternUnits="userSpaceOnUse"
        >
          <circle cx={cx} cy={cy} r={cr} fill="currentColor" />
        </pattern>
      </defs>
      <motion.rect
        width="100%"
        height="100%"
        fill={`url(#${id})`}
        initial={false}
        animate={{ opacity: pulsing ? [0.4, 1, 0.4] : 1 }}
        transition={{ duration: 4, repeat: pulsing ? Infinity : 0, ease: 'easeInOut' }}
      />
    </svg>
  )
}
