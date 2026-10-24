import { nextPaymentDate } from '@/lib/subscriptions'
import type { Subscription } from '@/lib/types'

export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function projectedPayments(subscriptions: Subscription[], start: Date, end: Date) {
  const result: { date: string; subscription: Subscription }[] = []
  const last = dateKey(end)
  for (const subscription of subscriptions) {
    if (subscription.status !== 'active') continue
    let from = new Date(start)
    while (dateKey(from) <= last) {
      const date = nextPaymentDate(subscription, from)
      if (!date || date > last) break
      result.push({ date, subscription })
      from = new Date(`${date}T12:00:00`)
      from.setDate(from.getDate() + 1)
    }
  }
  return result.sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      a.subscription.name.localeCompare(b.subscription.name) ||
      a.subscription.id.localeCompare(b.subscription.id),
  )
}
