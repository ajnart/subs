import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useReminderPreferences, useReminders } from '@/hooks/use-reminders'
import { defaultReminderPreferences, testReminder } from '@/lib/reminders'
import type { Subscription } from '@/lib/types'
import { Choice, Notice } from './shared'

export function ReminderController({ subscriptions }: { subscriptions: Subscription[] }) {
  useReminders(subscriptions)
  return null
}

export function ReminderSettings({ subscriptions = [] }: { subscriptions?: Subscription[] }) {
  const { preferences, ready, error, setError, unavailable, permission, save } = useReminderPreferences()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const enable = async () => {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const result = await Notification.requestPermission()
      if (result !== 'granted') {
        setError('Notifications were not allowed. Change this site’s notification permission in your browser to retry.')
        return
      }
      if (save({ ...preferences, enabled: true })) setMessage('Reminders enabled on this device.')
    } catch (cause) {
      setError(`Reminders could not be enabled: ${String(cause)}`)
    } finally {
      setBusy(false)
    }
  }
  const test = async () => {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await testReminder()
      setMessage('Test sent to your browser. If it is not visible, check system notification and Focus settings.')
    } catch (cause) {
      setError(`Test could not be sent: ${String(cause)}`)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Browser reminders</CardTitle>
        <CardDescription>Optional notifications on this device, not shared settings or backup data.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <p className="text-sm text-muted-foreground">
          Keep Subs open and unlocked. Sleeping devices and background tabs can delay reminders; Subs checks again on
          return. No alarms run after closing the app. Reminders never cancel subscriptions.
        </p>
        <p className="text-sm text-muted-foreground">
          Notifications hide service names and prices. Permission is per browser and device. Only active renewals and
          trial deadlines are included. Missed reminders can arrive on return, until the due date has passed.
        </p>
        {unavailable && <Notice title="Reminders unavailable">{unavailable}</Notice>}
        {!unavailable && permission === 'denied' && (
          <Notice title="Notifications blocked">
            Allow notifications in this site’s browser settings to enable reminders.
          </Notice>
        )}
        {error && <Notice title="Reminders need attention">{error}</Notice>}
        <FieldGroup className="grid gap-5 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="reminder-lead">Remind me</FieldLabel>
            <Choice
              id="reminder-lead"
              label="Reminder lead time"
              value={String(preferences.leadDays)}
              options={['0', '1', '3', '7']}
              optionLabels={{ '0': 'On the day', '1': '1 day before', '3': '3 days before', '7': '7 days before' }}
              onChange={(value) => save({ ...preferences, leadDays: Number(value) })}
            />
            <FieldDescription>Applies immediately, including trial deadlines.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="reminder-time">Preferred time</FieldLabel>
            <Input
              id="reminder-time"
              type="time"
              value={preferences.time}
              disabled={!ready || busy}
              onChange={(event) => {
                if (/^([01]\d|2[0-3]):[0-5]\d$/.test(event.target.value))
                  save({ ...preferences, time: event.target.value })
              }}
            />
            <FieldDescription>Device local time; delivery is best effort, not an exact alarm.</FieldDescription>
          </Field>
        </FieldGroup>
        <p role="status" className="text-sm text-muted-foreground">
          {message || (preferences.enabled ? 'Reminders are enabled on this device.' : 'Reminders are off.')}
          {preferences.enabled &&
            ` ${subscriptions.filter((item) => item.status === 'active').length} active subscriptions.`}
        </p>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-3">
        <Button
          disabled={busy || !ready || Boolean(unavailable) || permission === 'denied' || preferences.enabled}
          onClick={() => void enable()}
        >
          Enable reminders
        </Button>
        <Button
          variant="outline"
          disabled={busy || (!preferences.enabled && ready)}
          onClick={() => {
            if (save({ ...defaultReminderPreferences, ...preferences, enabled: false }))
              setMessage('Reminders disabled on this device.')
          }}
        >
          Disable reminders
        </Button>
        {!unavailable && permission === 'granted' && (
          <Button variant="outline" disabled={busy || !ready} onClick={() => void test()}>
            Send test notification
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
