import { WarningCircleIcon } from '@phosphor-icons/react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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

export function ServiceMark({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted text-sm font-semibold tracking-tight"
    >
      {name.trim().slice(0, 2).toUpperCase()}
    </span>
  )
}
