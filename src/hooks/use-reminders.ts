import { useEffect, useState } from 'react'
import {
  defaultReminderPreferences,
  deliverReminders,
  type ReminderPreferences,
  readReminderPreferences,
  reminderAvailability,
  reminderChangeEvent,
  reminderDeliveryError,
  reminderErrorEvent,
  reminderOccurrences,
  reminderPreferencesKey,
  reportReminderError,
  saveReminderPreferences,
} from '@/lib/reminders'
import type { Subscription } from '@/lib/types'

export function useReminderPreferences() {
  const [preferences, setPreferences] = useState(defaultReminderPreferences)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(reminderDeliveryError)
  const [unavailable, setUnavailable] = useState('Checking browser support…')
  const [permission, setPermission] = useState<NotificationPermission>('default')
  useEffect(() => {
    const refresh = () => {
      setUnavailable(reminderAvailability())
      if ('Notification' in window) setPermission(Notification.permission)
      try {
        setPreferences(readReminderPreferences())
        setReady(true)
      } catch (cause) {
        setError(String(cause))
        setReady(false)
      }
    }
    const storage = (event: StorageEvent) => {
      if (event.key === reminderPreferencesKey || event.key === null) refresh()
    }
    const failure = (event: Event) => {
      if (event instanceof CustomEvent && typeof event.detail === 'string') setError(event.detail)
    }
    refresh()
    window.addEventListener(reminderChangeEvent, refresh)
    window.addEventListener(reminderErrorEvent, failure)
    window.addEventListener('storage', storage)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.removeEventListener(reminderChangeEvent, refresh)
      window.removeEventListener(reminderErrorEvent, failure)
      window.removeEventListener('storage', storage)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])
  const save = (value: ReminderPreferences) => {
    try {
      saveReminderPreferences(value)
      setError('')
      return true
    } catch (cause) {
      setError(`Reminders were not saved: ${String(cause)}`)
      return false
    }
  }
  return { preferences, ready, error, setError, unavailable, permission, save }
}

export function useReminders(subscriptions: Subscription[]) {
  const { preferences, ready, unavailable, permission } = useReminderPreferences()
  useEffect(() => {
    if (!ready || unavailable || !preferences.enabled || permission !== 'granted') return
    let active = true
    let running = false
    let failed = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const refresh = async () => {
      if (!active || running || failed) return
      clearTimeout(timer)
      running = true
      try {
        if (Notification.permission !== 'granted' || !readReminderPreferences().enabled) return
        const occurrences = reminderOccurrences(subscriptions, preferences)
        await deliverReminders(occurrences, () => active)
      } catch (cause) {
        failed = true
        if (active)
          reportReminderError(`Reminder delivery stopped: ${String(cause)} Disable and enable reminders to retry.`)
      } finally {
        running = false
        if (active && !failed) timer = setTimeout(() => void refresh(), 30000)
      }
    }
    const wake = () => void refresh()
    void refresh()
    window.addEventListener('focus', wake)
    window.addEventListener('pageshow', wake)
    document.addEventListener('visibilitychange', wake)
    return () => {
      active = false
      clearTimeout(timer)
      window.removeEventListener('focus', wake)
      window.removeEventListener('pageshow', wake)
      document.removeEventListener('visibilitychange', wake)
    }
  }, [subscriptions, preferences, ready, unavailable, permission])
}
