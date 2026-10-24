import type { Subscription } from './types'

function localDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day, 12)
}

function dateOnly(value: Date): string {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
}

function dayNumber(value: Date): number {
  return Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()) / 86400000
}

function anchoredMonth(anchor: Date, months: number): Date {
  const target = new Date(anchor.getFullYear(), anchor.getMonth() + months, 1, 12)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0, 12).getDate()
  target.setDate(Math.min(anchor.getDate(), lastDay))
  return target
}

export function formatMoney(price: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price)
}

export function monthlyAmount(sub: Subscription): number {
  if (sub.status !== 'active') return 0
  switch (sub.billingCycle) {
    case 'daily':
      return (sub.price * 365) / 12
    case 'weekly':
      return (sub.price * 52) / 12
    case 'monthly':
      return sub.price
    case 'quarterly':
      return sub.price / 3
    case 'yearly':
      return sub.price / 12
  }
}

export function nextPaymentDate(sub: Subscription, from = new Date()): string {
  if (!sub.nextPaymentDate) return ''
  const anchor = localDate(sub.nextPaymentDate)
  const remaining = dayNumber(from) - dayNumber(anchor)
  if (remaining <= 0) return sub.nextPaymentDate
  if (sub.billingCycle === 'daily' || sub.billingCycle === 'weekly') {
    let interval = 1
    if (sub.billingCycle === 'weekly') interval = 7
    anchor.setDate(anchor.getDate() + Math.ceil(remaining / interval) * interval)
    return dateOnly(anchor)
  }
  let interval = 1
  if (sub.billingCycle === 'quarterly') interval = 3
  if (sub.billingCycle === 'yearly') interval = 12
  const months = (from.getFullYear() - anchor.getFullYear()) * 12 + from.getMonth() - anchor.getMonth()
  let step = Math.max(0, Math.floor(months / interval))
  let target = anchoredMonth(anchor, step * interval)
  if (dayNumber(target) < dayNumber(from)) {
    step += 1
    target = anchoredMonth(anchor, step * interval)
  }
  return dateOnly(target)
}

export function upcomingPayments(
  subs: Subscription[],
  days: number,
  from = new Date(),
): Array<Subscription & { dueDate: string; daysUntil: number }> {
  const result: Array<Subscription & { dueDate: string; daysUntil: number }> = []
  for (const sub of subs) {
    if (sub.status !== 'active') continue
    const dueDate = nextPaymentDate(sub, from)
    if (!dueDate) continue
    const daysUntil = dayNumber(localDate(dueDate)) - dayNumber(from)
    if (daysUntil >= 0 && daysUntil <= days) result.push({ ...sub, dueDate, daysUntil })
  }
  return result.sort((a, b) => a.daysUntil - b.daysUntil || a.name.localeCompare(b.name))
}

export function convertAmount(
  amount: number,
  from: string,
  to: string,
  rates?: { base: string; rates: Record<string, number> },
): number | null {
  if (from === to) return amount
  if (!rates) return null
  let source = rates.rates[from]
  let target = rates.rates[to]
  if (from === rates.base) source = 1
  if (to === rates.base) target = 1
  if (!Number.isFinite(source) || !Number.isFinite(target) || source <= 0 || target <= 0) return null
  return (amount / source) * target
}

export function dateLabel(date: string): string {
  if (!date) return 'No date set'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(localDate(date))
}
