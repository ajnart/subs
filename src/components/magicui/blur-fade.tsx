import { type HTMLMotionProps, motion, type UseInViewOptions, useInView } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { useAnimationActivity } from './animation-activity'

export interface BlurFadeProps extends HTMLMotionProps<'div'> {
  duration?: number
  delay?: number
  offset?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  inView?: boolean
  inViewMargin?: UseInViewOptions['margin']
  blur?: string
}

export function BlurFade({
  children,
  duration = 0.35,
  delay = 0,
  offset = 6,
  direction = 'down',
  inView = false,
  inViewMargin = '0px',
  blur = '4px',
  ...props
}: BlurFadeProps) {
  const { ref, active } = useAnimationActivity<HTMLDivElement>()
  const visible = useInView(ref, { once: true, margin: inViewMargin })
  const played = useRef(false)

  useEffect(() => {
    const element = ref.current
    if (!element || !active || played.current || (inView && !visible)) return
    played.current = true
    let transform = `translateY(${-offset}px)`
    if (direction === 'up') transform = `translateY(${offset}px)`
    if (direction === 'left') transform = `translateX(${offset}px)`
    if (direction === 'right') transform = `translateX(${-offset}px)`
    const animation = element.animate(
      [
        { opacity: 0, filter: `blur(${blur})`, transform },
        { opacity: 1, filter: 'blur(0px)', transform: 'none' },
      ],
      { duration: duration * 1000, delay: delay * 1000, easing: 'ease-out', fill: 'backwards' },
    )
    return () => animation.cancel()
  }, [active, visible, inView, offset, direction, blur, duration, delay, ref])

  return (
    <motion.div ref={ref} {...props} initial={false}>
      {children}
    </motion.div>
  )
}
