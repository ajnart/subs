import { useEffect } from 'react'
import type { Subscription } from '~/store/subscriptionStore'
import { calculateNextPaymentDate } from '~/utils/nextPaymentDate'

const LAST_NOTIFIED_KEY = 'subs-last-notified'

/**
 * Returns the date string of the last time we sent notifications (stored in localStorage).
 */
function getLastNotifiedDate(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(LAST_NOTIFIED_KEY)
  } catch {
    return null
  }
}

function setLastNotifiedDate(date: string) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LAST_NOTIFIED_KEY, date)
  } catch {
    // ignore
  }
}

function sendNotification(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  try {
    // eslint-disable-next-line no-new
    new Notification(title, { body, icon: '/favicon.ico' })
  } catch {
    // Some browsers block Notification outside of service workers
  }
}

/**
 * Check subscriptions and fire browser notifications for those due within any
 * of the provided lead-time windows (in days).
 */
function checkAndNotify(subscriptions: Subscription[], leadTimes: number[], digestMode: boolean) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcomingPayments: { name: string; daysUntil: number; date: string }[] = []

  for (const sub of subscriptions) {
    if (!sub.showNextPayment || !sub.billingCycle) continue
    const nextDate = calculateNextPaymentDate(sub.billingCycle, sub.nextPaymentDate, sub.renewalDayOfMonth)
    if (!nextDate) continue
    const next = new Date(nextDate)
    next.setHours(0, 0, 0, 0)
    const daysUntil = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (leadTimes.includes(daysUntil)) {
      upcomingPayments.push({ name: sub.name, daysUntil, date: nextDate })
    }
  }

  if (upcomingPayments.length === 0) return

  if (digestMode) {
    const list = upcomingPayments
      .map((p) => `${p.name} (in ${p.daysUntil} day${p.daysUntil === 1 ? '' : 's'})`)
      .join(', ')
    sendNotification('Upcoming payments', list)
  } else {
    for (const payment of upcomingPayments) {
      const when =
        payment.daysUntil === 0 ? 'today' : payment.daysUntil === 1 ? 'tomorrow' : `in ${payment.daysUntil} days`
      sendNotification(`${payment.name} payment ${when}`, `Your ${payment.name} subscription renews ${when}.`)
    }
  }
}

/**
 * Hook that drives browser notifications for upcoming subscription payments.
 * Should be mounted once at the app root or top-level route.
 */
export function useSubscriptionNotifications(
  subscriptions: Subscription[],
  {
    enabled,
    leadTimes,
    digestMode,
  }: {
    enabled: boolean
    leadTimes: number[]
    digestMode: boolean
  },
) {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !('Notification' in window)) return
    if (Notification.permission !== 'granted') return

    // Only notify once per day
    const today = new Date().toISOString().split('T')[0]
    if (getLastNotifiedDate() === today) return

    checkAndNotify(subscriptions, leadTimes, digestMode)
    setLastNotifiedDate(today)
  }, [enabled, subscriptions, leadTimes, digestMode])
}
