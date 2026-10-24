import { WarningCircleIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { LinkPreview } from '@/components/ui/link-preview'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { serviceIcon } from '@/lib/service-icons'
import { cn } from '@/lib/utils'
import './service-cards.css'

export const currencies = [
  'USD',
  'EUR',
  'GBP',
  'CAD',
  'AUD',
  'CHF',
  'JPY',
  'INR',
  'BRL',
  'SEK',
  'NOK',
  'DKK',
  'NZD',
  'SGD',
  'CNY',
  'KRW',
  'MXN',
  'PLN',
]
export const categories = [
  'Entertainment',
  'Productivity',
  'Software',
  'Cloud & hosting',
  'Health & fitness',
  'Education',
  'News & reading',
  'Shopping',
  'Other',
]
export const cycles = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'] as const
export const statuses = ['active', 'paused', 'cancelled'] as const

export function serviceUrl(domain: string): string | null {
  if (!domain.trim()) return null
  try {
    const url = new URL(domain.includes('://') ? domain : `https://${domain}`)
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null
    return url.href
  } catch {
    return null
  }
}

function canPreview(url: string): boolean {
  const hostname = new URL(url).hostname.toLowerCase().replace(/\.$/, '')
  if (!hostname.includes('.') || hostname.includes(':') || hostname.includes('[') || /^[\d.]+$/.test(hostname))
    return false
  return !/(^|\.)(localhost|local|localdomain|internal|lan|home|corp|test|invalid|onion|arpa|example)$|\.(nip\.io|sslip\.io)$/.test(
    hostname,
  )
}

export function ServiceLink({ name, domain, className }: { name: string; domain: string; className?: string }) {
  const url = serviceUrl(domain)
  const classes = cn('subs-service-link rounded-xs focus-visible:outline-2 focus-visible:outline-ring', className)
  if (!url) return <span className={className}>{name}</span>
  if (!canPreview(url))
    return (
      <a href={url} className={classes} target="_blank" rel="noopener noreferrer">
        {name}
      </a>
    )
  return (
    <LinkPreview url={url} title={name} width={280} height={175} className={classes}>
      {name}
    </LinkPreview>
  )
}

export function Choice({
  value,
  onChange,
  options,
  label,
  id,
  optionLabels,
}: {
  value: string
  onChange: (value: string) => void
  options: readonly string[]
  label: string
  id?: string
  optionLabels?: Record<string, string>
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} aria-label={label} className="w-full">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {optionLabels?.[option] ?? option.charAt(0).toUpperCase() + option.slice(1)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export function Notice({
  title = 'Something needs your attention',
  children,
}: {
  title?: string
  children: React.ReactNode
}) {
  return (
    <Alert>
      <WarningCircleIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  )
}

export function ServiceMark({
  name,
  domain = '',
  size = 'default',
}: {
  name: string
  domain?: string
  size?: 'default' | 'large'
}) {
  const [failedSource, setFailedSource] = useState('')
  const localIcon = serviceIcon(name, domain)
  const url = serviceUrl(domain)
  let source = localIcon
  if (!source && url && canPreview(url)) source = `${new URL(url).origin}/favicon.ico`
  const initials = name.trim().slice(0, 2).toUpperCase()
  return (
    <span aria-hidden="true" className="subs-service-mark" data-size={size} data-branded={Boolean(localIcon)}>
      {source && source !== failedSource ? (
        <img
          src={source}
          alt=""
          width={32}
          height={32}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailedSource(source)}
        />
      ) : (
        initials
      )}
    </span>
  )
}
