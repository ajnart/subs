import { nextPaymentDate } from './subscriptions'
import type { Subscription } from './types'

export const reminderPreferencesKey = 'subs-reminders-v1'
export const reminderChangeEvent = 'subs-reminders-change'
export const reminderErrorEvent = 'subs-reminders-error'
const deliveredKey = 'subs-reminders-delivered-v1'
let deliveryError = ''

export function reminderDeliveryError() {
  return deliveryError
}

export function reportReminderError(message: string) {
  deliveryError = message
  window.dispatchEvent(new CustomEvent(reminderErrorEvent, { detail: message }))
}

export type ReminderPreferences = { enabled: boolean; leadDays: number; time: string }
export const defaultReminderPreferences: ReminderPreferences = { enabled: false, leadDays: 3, time: '09:00' }
export type ReminderOccurrence = { key: string; remindAt: number; expiresAt: number }

export function reminderAvailability(): string {
  if (typeof window === 'undefined') return 'Checking browser support…'
  if (!window.isSecureContext) return 'Reminders need HTTPS or localhost. They are unavailable on this connection.'
  if (
    !('Notification' in window) ||
    !('serviceWorker' in navigator) ||
    !('ServiceWorkerRegistration' in window) ||
    !('showNotification' in ServiceWorkerRegistration.prototype)
  )
    return 'This browser does not support notification delivery. On iPhone or iPad, try installing Subs to your Home Screen.'
  return ''
}

export function readReminderPreferences(): ReminderPreferences {
  const raw = localStorage.getItem(reminderPreferencesKey)
  if (!raw) return { ...defaultReminderPreferences }
  const value: unknown = JSON.parse(raw)
  if (
    typeof value !== 'object' ||
    value === null ||
    !('enabled' in value) ||
    typeof value.enabled !== 'boolean' ||
    !('leadDays' in value) ||
    typeof value.leadDays !== 'number' ||
    ![0, 1, 3, 7].includes(value.leadDays) ||
    !('time' in value) ||
    typeof value.time !== 'string' ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(value.time)
  )
    throw new Error('Saved reminder settings are invalid. Disable reminders to reset them.')
  return { enabled: value.enabled, leadDays: value.leadDays, time: value.time }
}

export function saveReminderPreferences(preferences: ReminderPreferences) {
  localStorage.setItem(reminderPreferencesKey, JSON.stringify(preferences))
  reportReminderError('')
  window.dispatchEvent(new Event(reminderChangeEvent))
}

export function reminderOccurrences(
  subscriptions: Subscription[],
  preferences: ReminderPreferences,
  now = new Date(),
): ReminderOccurrence[] {
  const [hour, minute] = preferences.time.split(':').map(Number)
  const occurrences: ReminderOccurrence[] = []
  const horizon = new Date(now.getFullYear(), now.getMonth(), now.getDate() + preferences.leadDays + 1)
  for (const subscription of subscriptions) {
    if (subscription.status !== 'active') continue
    const dates = [{ kind: 'trial', date: subscription.trialEndsAt }]
    let cursor = new Date(now)
    for (let index = 0; index <= preferences.leadDays; index += 1) {
      const date = nextPaymentDate(subscription, cursor)
      if (!date) break
      const [year, month, day] = date.split('-').map(Number)
      if (new Date(year, month - 1, day).getTime() >= horizon.getTime()) break
      dates.push({ kind: 'renewal', date })
      cursor = new Date(year, month - 1, day + 1, 12)
    }
    for (const { kind, date } of dates) {
      if (!date) continue
      const [year, month, day] = date.split('-').map(Number)
      const expires = new Date(year, month - 1, day + 1)
      if (expires.getTime() <= now.getTime()) continue
      const remind = new Date(year, month - 1, day, hour, minute)
      remind.setDate(remind.getDate() - preferences.leadDays)
      occurrences.push({
        key: `${subscription.id}:${kind}:${date}`,
        remindAt: remind.getTime(),
        expiresAt: expires.getTime(),
      })
    }
  }
  return occurrences
}

async function notificationRegistration(): Promise<ServiceWorkerRegistration> {
  const registration = await navigator.serviceWorker.register('/reminders-sw.js', { scope: '/reminders/' })
  if (registration.active) return registration
  const worker = registration.installing ?? registration.waiting
  if (!worker) throw new Error('Notification delivery could not start. Try again.')
  await new Promise<void>((resolve, reject) => {
    const finish = () => {
      if (worker.state === 'activated') {
        clearTimeout(timeout)
        worker.removeEventListener('statechange', finish)
        resolve()
      } else if (worker.state === 'redundant') {
        clearTimeout(timeout)
        worker.removeEventListener('statechange', finish)
        reject(new Error('Notification delivery could not start. Try again.'))
      }
    }
    const timeout = window.setTimeout(() => {
      worker.removeEventListener('statechange', finish)
      reject(new Error('Notification delivery timed out. Try again.'))
    }, 10000)
    worker.addEventListener('statechange', finish)
    finish()
  })
  return registration
}

export async function testReminder() {
  const unavailable = reminderAvailability()
  if (unavailable) throw new Error(unavailable)
  if (Notification.permission !== 'granted') throw new Error('Allow notifications before sending a test.')
  const registration = await notificationRegistration()
  await registration.showNotification('Subs reminder test', {
    body: 'Reminders are ready on this device. Keep Subs open and unlocked for scheduling.',
    tag: 'subs-reminder-test',
  })
}

function readDelivered(): Record<string, number> {
  const raw = localStorage.getItem(deliveredKey)
  if (!raw) return {}
  const value: unknown = JSON.parse(raw)
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    throw new Error('Reminder delivery history is invalid. Clear site data to reset it.')
  const entries = Object.entries(value)
  if (entries.some(([key, expiry]) => !/^[a-f0-9]{64}$/.test(key) || typeof expiry !== 'number'))
    throw new Error('Reminder delivery history is invalid. Clear site data to reset it.')
  return Object.fromEntries(entries.filter(([, expiry]) => typeof expiry === 'number' && expiry > Date.now()))
}

export async function deliverReminders(occurrences: ReminderOccurrence[], isCurrent: () => boolean) {
  const due = occurrences.filter((item) => item.remindAt <= Date.now() && item.expiresAt > Date.now())
  if (!due.length || !isCurrent()) return
  const registration = await notificationRegistration()
  const hashed = await Promise.all(
    due.map(async (item) => {
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(item.key))
      const key = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
      return { ...item, key }
    }),
  )
  const deliver = async () => {
    if (!isCurrent() || !readReminderPreferences().enabled || Notification.permission !== 'granted') return
    const delivered = readDelivered()
    const pending = hashed.filter((item) => !delivered[item.key] && item.expiresAt > Date.now())
    if (!pending.length) return
    const updated = { ...delivered }
    for (const item of pending) updated[item.key] = item.expiresAt
    localStorage.setItem(deliveredKey, JSON.stringify(updated))
    try {
      await registration.showNotification('Subs reminder', {
        body: 'A renewal or trial deadline is approaching. Open Subs to review your collection.',
        tag: 'subs-reminder',
      })
    } catch (cause) {
      localStorage.setItem(deliveredKey, JSON.stringify(delivered))
      throw cause
    }
  }
  if (navigator.locks) await navigator.locks.request('subs-reminder-delivery', deliver)
  else await deliver()
}
