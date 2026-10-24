import { safeIconUrl } from './service-icons'
import type { SubscriptionInput } from './types'
import { assertMoneyPrecision, exponent, inputSchema } from './validation'

export const quickSetupLimit = 100

export type QuickSetupDraft = {
  key: string
  input: SubscriptionInput
  price: string
  selected: boolean
}

export type QuickSetupErrors = Partial<Record<keyof SubscriptionInput, string>>

export function quickSetupInput(
  currency: string,
  service?: { name: string; domain: string; category: string },
): SubscriptionInput {
  return {
    name: service?.name ?? '',
    domain: service?.domain ?? '',
    category: service?.category ?? 'Other',
    price: 0,
    currency,
    billingCycle: 'monthly',
    nextPaymentDate: '',
    status: 'active',
    trialEndsAt: null,
    notes: '',
  }
}

export function quickSetupHostname(value: string): string {
  const address = value.trim()
  if (!address) return ''
  try {
    const url = new URL(address.includes('://') ? address : `https://${address}`)
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return ''
    return url.hostname
      .toLowerCase()
      .replace(/^www\./, '')
      .replace(/\.$/, '')
  } catch {
    return ''
  }
}

export function sameQuickSetupService(
  first: Pick<SubscriptionInput, 'name' | 'domain'>,
  second: Pick<SubscriptionInput, 'name' | 'domain'>,
): boolean {
  const name = first.name.trim().toLowerCase().replace(/\s+/g, ' ')
  if (name && name === second.name.trim().toLowerCase().replace(/\s+/g, ' ')) return true
  const host = quickSetupHostname(first.domain)
  const otherHost = quickSetupHostname(second.domain)
  return Boolean(
    host && otherHost && (host === otherHost || host.endsWith(`.${otherHost}`) || otherHost.endsWith(`.${host}`)),
  )
}

export function validateQuickSetupDraft(
  draft: QuickSetupDraft,
): { success: true; input: SubscriptionInput } | { success: false; errors: QuickSetupErrors } {
  const errors: QuickSetupErrors = {}
  const rawPrice = draft.price.trim()
  const price = Number(rawPrice)
  if (!rawPrice) errors.price = 'Enter your price. Use 0 only for a free plan.'
  else if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(rawPrice) || !Number.isFinite(price))
    errors.price = 'Enter a non-negative number, using a dot for decimals.'

  const input = { ...draft.input, price }
  const parsed = inputSchema.safeParse(input)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const field = issue.path[0]
      if (typeof field === 'string' && field in input) {
        const key = field as keyof SubscriptionInput
        errors[key] ??= issue.message
      }
    }
    if (!Object.keys(errors).length) errors.name = 'Check this subscription for unsupported fields.'
  }
  if (!errors.price && !errors.currency) {
    try {
      assertMoneyPrecision(price, input.currency)
      const precision = exponent(input.currency)
      const fraction = rawPrice.split('.')[1] ?? ''
      if (/[1-9]/.test(fraction.slice(precision)))
        errors.price = `Price must use at most ${precision} decimal places for ${input.currency}`
    } catch (cause) {
      if (!(cause instanceof Error)) throw cause
      errors.price = cause.message
    }
  }

  if (input.icon !== undefined) {
    const icon = input.icon.trim()
    if (icon) {
      const safeIcon = safeIconUrl(icon)
      if (!safeIcon) errors.icon = 'Use a public HTTP(S) image URL without credentials or a private/local address.'
      else input.icon = safeIcon
    } else input.icon = ''
  }

  if (Object.keys(errors).length) return { success: false, errors }
  return { success: true, input }
}
