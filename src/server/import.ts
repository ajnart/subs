import { randomUUID } from 'node:crypto'
import { mergeImportTargets, parseImport, subscriptionIdentity } from '../lib/import'
import type { ImportMode, Subscription } from '../lib/types'
import { assertMoneyPrecision, HttpError, preferencesSchema } from '../lib/validation'
import { type Database, readData, saveSubscription, setMeta } from './database'

export { parseImport } from '../lib/import'

export async function importData(db: Database, data: unknown, mode: ImportMode): Promise<{ imported: number }> {
  const current = await readData(db)
  const existing = current.subscriptions
  const parsed = parseImport(data, existing, current.preferences)
  let mergeTargets = new Map<number, string>()
  if (mode === 'merge') mergeTargets = mergeImportTargets(parsed)
  const target = new Map<string, Subscription>()
  const byIdentity = new Map<string, Subscription>()
  if (mode !== 'replace')
    for (const sub of existing) {
      target.set(sub.id, sub)
      byIdentity.set(subscriptionIdentity(sub), sub)
    }
  let imported = 0
  const changes: Array<{ sub: Subscription; previous?: Subscription }> = []
  for (const [index, incoming] of parsed.subscriptions.entries()) {
    let previous = target.get(incoming.id) ?? byIdentity.get(subscriptionIdentity(incoming))
    if (mode === 'merge') {
      previous = undefined
      const targetId = mergeTargets.get(index)
      if (targetId !== undefined) previous = target.get(targetId)
    }
    if (previous && mode === 'skip') continue
    let sub = incoming
    if (mode === 'new') {
      let id: string
      do {
        id = randomUUID()
      } while (target.has(id))
      sub = { ...incoming, id }
    }
    if (previous && mode === 'merge')
      sub = { ...incoming, id: previous.id, createdAt: previous.createdAt, updatedAt: new Date().toISOString() }
    if (target.has(sub.id) && mode === 'replace') sub = { ...sub, id: randomUUID() }
    if (previous && mode === 'merge') byIdentity.delete(subscriptionIdentity(previous))
    target.set(sub.id, sub)
    byIdentity.set(subscriptionIdentity(sub), sub)
    if (mode === 'replace' || mode === 'new') changes.push({ sub })
    else changes.push({ sub, previous })
    imported += 1
  }
  if (target.size > 10000) throw new HttpError(400, 'Collection cannot exceed 10000 subscriptions')
  if (mode === 'replace') await db.sql`DELETE FROM subscriptions`
  const recordedAt = new Date().toISOString()
  for (const { sub, previous } of changes) await saveSubscription(db, sub, previous, recordedAt)
  if (parsed.preferences) {
    if (mode === 'replace' || existing.length === 0) {
      const preferences = preferencesSchema.parse({ ...current.preferences, ...parsed.preferences })
      assertMoneyPrecision(preferences.monthlyBudget, preferences.currency)
      await setMeta(db, 'preferences', JSON.stringify(preferences))
    }
  }
  return { imported }
}
