import { ArrowSquareOutIcon } from '@phosphor-icons/react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { HoverCard } from 'radix-ui'
import { type ComponentPropsWithoutRef, useEffect, useState } from 'react'
import { useAnimationActivity } from '@/components/magicui/animation-activity'
import { cn } from '@/lib/utils'

export type LinkPreviewProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & {
  url: string
  width?: number
  height?: number
  title?: string
} & ({ isStatic: true; imageSrc: string } | { isStatic?: false; imageSrc?: never })

function publicUrl(value: string) {
  try {
    const parsed = new URL(value)
    if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password) return null
    return parsed
  } catch {
    return null
  }
}

export function LinkPreview({
  children,
  url,
  className,
  width = 280,
  height = 175,
  title,
  isStatic = false,
  imageSrc,
  target = '_blank',
  rel = 'noopener noreferrer',
  onPointerMove,
  onFocus,
  onBlur,
  ...props
}: LinkPreviewProps) {
  const parsed = publicUrl(url)
  const [open, setOpen] = useState(false)
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const reducedMotion = useReducedMotion()
  const { ref, active } = useAnimationActivity<HTMLAnchorElement>()
  const x = useMotionValue(0)
  const translateX = useSpring(x, { stiffness: 100, damping: 20 })
  useEffect(() => {
    if (!active || !open) {
      x.jump(0)
      translateX.jump(0)
    }
  }, [active, open, x, translateX])
  const hostname = parsed?.hostname.replace(/\.$/, '') ?? 'Website'
  const label = title ?? hostname
  let src = imageSrc
  if (
    !isStatic &&
    parsed &&
    !/^(localhost|0\.|127\.|10\.|169\.254\.|192\.168\.|192\.0\.|172\.(1[6-9]|2\d|3[01])\.|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.|198\.(18|19)\.|2(2[4-9]|[3-5]\d)\.|\[)/.test(
      hostname,
    ) &&
    !/\.(localhost|local|lan|internal|home|test|invalid|example)$/.test(hostname) &&
    hostname.includes('.')
  ) {
    const params = new URLSearchParams({
      url: parsed.origin,
      screenshot: 'true',
      meta: 'false',
      embed: 'screenshot.url',
      'viewport.width': '1280',
      'viewport.height': '800',
    })
    src = `https://api.microlink.io/?${params}`
  }

  useEffect(() => {
    const close = () => {
      if (document.hidden) setOpen(false)
    }
    document.addEventListener('visibilitychange', close)
    return () => document.removeEventListener('visibilitychange', close)
  }, [])

  if (!parsed) return <span className={className}>{children}</span>

  return (
    <HoverCard.Root open={open} onOpenChange={setOpen} openDelay={250} closeDelay={100}>
      <HoverCard.Trigger
        {...props}
        ref={ref}
        href={parsed.href}
        target={target}
        rel={rel}
        className={cn('rounded-xs outline-offset-4 focus-visible:outline-2 focus-visible:outline-ring', className)}
        onFocus={(event) => {
          setOpen(true)
          onFocus?.(event)
        }}
        onBlur={(event) => {
          setOpen(false)
          onBlur?.(event)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false)
          props.onKeyDown?.(event)
        }}
        onPointerMove={(event) => {
          if (active && event.pointerType !== 'touch') {
            const rect = event.currentTarget.getBoundingClientRect()
            x.set(Math.max(-10, Math.min(10, (event.clientX - rect.left - rect.width / 2) / 4)))
          }
          onPointerMove?.(event)
        }}
      >
        {children}
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          side="top"
          align="center"
          sideOffset={10}
          collisionPadding={16}
          className="w-max max-w-[calc(100vw-2rem)] [transform-origin:var(--radix-hover-card-content-transform-origin)]"
        >
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            style={{ x: reducedMotion ? 0 : translateX }}
            className="overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg"
            transition={{ duration: reducedMotion ? 0 : 0.18 }}
          >
            {open && src && failedUrl !== url && (
              <img
                src={src}
                width={width}
                height={height}
                alt={`Preview of ${label}`}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                onError={() => setFailedUrl(url)}
                className="max-w-full border-b object-cover"
                style={{ width, height }}
              />
            )}
            <div className="flex items-center justify-between gap-4 px-3 py-2 text-xs" style={{ maxWidth: width }}>
              <span className="truncate">{label}</span>
              <ArrowSquareOutIcon aria-hidden="true" className="shrink-0" />
            </div>
          </motion.div>
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  )
}
