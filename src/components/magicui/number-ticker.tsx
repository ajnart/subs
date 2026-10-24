import { animate } from 'framer-motion'
import { type ComponentPropsWithoutRef, useEffect, useMemo, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useAnimationActivity } from './animation-activity'

export interface NumberTickerProps extends ComponentPropsWithoutRef<'span'> {
  value: number
  startValue?: number
  direction?: 'up' | 'down'
  delay?: number
  decimalPlaces?: number
  locale?: string
  formatOptions?: Intl.NumberFormatOptions
}

export function NumberTicker({
  value,
  startValue = 0,
  direction = 'up',
  delay = 0,
  decimalPlaces = 0,
  locale = 'en-US',
  formatOptions,
  className,
  ...props
}: NumberTickerProps) {
  const { ref, active } = useAnimationActivity<HTMLSpanElement>()
  const numberRef = useRef<HTMLSpanElement>(null)
  const animatedValue = useRef<number | null>(null)
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
        ...formatOptions,
      }),
    [locale, decimalPlaces, formatOptions],
  )
  const formatted = formatter.format(value)

  useEffect(() => {
    const element = numberRef.current
    if (!element) return
    if (!active || animatedValue.current === value) {
      element.textContent = formatted
      return
    }
    let from = animatedValue.current ?? startValue
    if (animatedValue.current === null && direction === 'down' && startValue <= value) from = value * 2
    animatedValue.current = value
    const animation = animate(from, value, {
      type: 'spring',
      damping: 60,
      stiffness: 100,
      delay,
      onUpdate: (latest) => {
        element.textContent = formatter.format(latest)
      },
    })
    return () => {
      animation.stop()
      element.textContent = formatted
    }
  }, [active, value, startValue, direction, delay, formatter, formatted])

  return (
    <span ref={ref} className={cn('inline-block tabular-nums', className)} {...props}>
      <span className="sr-only">{formatted}</span>
      <span aria-hidden="true" ref={numberRef}>
        {formatted}
      </span>
    </span>
  )
}
