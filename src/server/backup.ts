import type { AppData, Backup } from '../lib/types'

export function serializeBackup(data: AppData, exportedAt = new Date().toISOString()): string {
  const backup: Backup = { version: 3, exportedAt, subscriptions: data.subscriptions, preferences: data.preferences }
  return JSON.stringify(backup, null, 2)
}
