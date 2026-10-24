import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import type { ImportMode, ImportPreview, Preferences, Subscription } from '../lib/types'
import { type Database, defaultPreferences, readData, saveSubscription, setMeta } from './database'
import { assertMoneyPrecision, exponent, HttpError, inputSchema, preferencesSchema, toMinor } from './validation'

const recordSchema = z.record(z.string(), z.unknown())
const identitySchema = z.string().min(1).max(200)
const timestampSchema = z.string().datetime({ offset: true })

function identity(sub: Subscription): string {
  return [
    sub.name.trim().toLowerCase(),
    sub.domain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, ''),
    sub.currency,
    sub.billingCycle,
  ].join('|')
}

function storageState(value: unknown): Record<string, unknown> {
  let decoded = value
  if (typeof decoded === 'string') {
    try {
      decoded = JSON.parse(decoded)
    } catch {
      throw new HttpError(400, 'Legacy storage is not valid JSON')
    }
  }
  const envelope = recordSchema.parse(decoded)
  if ('state' in envelope) return recordSchema.parse(envelope.state)
  return envelope
}

function legacyPreferences(value: unknown, warnings: string[], current: Preferences): Partial<Preferences> {
  const state = storageState(value)
  const allowed = new Set(['selectedCurrency', 'currency', 'monthlyBudget', 'theme'])
  const discarded = Object.keys(state).filter((key) => !allowed.has(key))
  if (discarded.length)
    warnings.push(`Unrecognized legacy preference fields are not restored: ${discarded.join(', ')}.`)
  const mapped: Record<string, unknown> = {}
  if ('currency' in state) mapped.currency = state.currency
  if ('selectedCurrency' in state) mapped.currency = state.selectedCurrency
  if (typeof mapped.currency === 'string') mapped.currency = mapped.currency.toUpperCase()
  if ('monthlyBudget' in state) mapped.monthlyBudget = state.monthlyBudget
  if ('theme' in state) mapped.theme = state.theme
  const preferences = preferencesSchema.partial().parse(mapped)
  if (preferences.monthlyBudget !== undefined) {
    const currency = preferences.currency ?? current.currency
    const rounded = toMinor(preferences.monthlyBudget, currency) / 10 ** exponent(currency)
    if (rounded !== preferences.monthlyBudget)
      warnings.push(
        `Legacy monthly budget ${preferences.monthlyBudget} ${currency} rounds to ${rounded} in currency minor units.`,
      )
    preferences.monthlyBudget = rounded
    assertMoneyPrecision(rounded, currency)
  }
  warnings.push('Only selected currency, monthly budget, and theme are eligible for legacy preference migration.')
  return preferences
}

export function parseImport(
  data: unknown,
  existing: Subscription[],
  currentPreferences = defaultPreferences,
): ImportPreview & { preferences?: Partial<Preferences> } {
  let source = data
  if (typeof source === 'string') {
    try {
      source = JSON.parse(source)
    } catch {
      throw new HttpError(400, 'Backup does not contain valid JSON')
    }
  }
  const warnings: string[] = []
  let preferences: Partial<Preferences> | undefined
  let modern = false
  if (!Array.isArray(source)) {
    const root = recordSchema.parse(source)
    let envelope = root
    if ('subscription-storage' in root || 'preferences-storage' in root) {
      if ('preferences-storage' in root)
        preferences = legacyPreferences(root['preferences-storage'], warnings, currentPreferences)
      if ('subscription-storage' in root) envelope = storageState(root['subscription-storage'])
      else envelope = { subscriptions: [] }
      const discarded = Object.keys(root).filter(
        (key) => !['subscription-storage', 'preferences-storage'].includes(key),
      )
      if (discarded.length) warnings.push(`Unrelated legacy config fields are not restored: ${discarded.join(', ')}.`)
    }
    if ('state' in envelope) envelope = recordSchema.parse(envelope.state)
    if ('version' in envelope) {
      if (envelope.version === 3) modern = true
      else if (envelope.version !== 0) throw new HttpError(400, 'Unsupported backup version')
    }
    if ('preferences' in envelope) {
      if (modern) {
        const parsed = preferencesSchema.parse(envelope.preferences)
        assertMoneyPrecision(parsed.monthlyBudget, parsed.currency)
        preferences = parsed
      } else preferences = legacyPreferences(envelope.preferences, warnings, currentPreferences)
    }
    if (
      !modern &&
      !('subscriptions' in envelope) &&
      ['selectedCurrency', 'currency', 'monthlyBudget', 'theme'].some((key) => key in envelope)
    ) {
      preferences = legacyPreferences(envelope, warnings, currentPreferences)
      envelope = { subscriptions: [] }
    }
    source = envelope.subscriptions
  }
  const items = z.array(z.unknown()).max(10000).parse(source)
  if (preferences && existing.length > 0)
    warnings.push(
      'Merge, skip, and add-as-new keep current preferences; replace restores imported preferences. An empty collection accepts imported preferences in any mode.',
    )
  warnings.push(
    'Backups contain subscription details and preferences, not price history. New imported records start a known-price baseline at import time; merge keeps existing history, while replace discards it.',
  )
  const now = new Date().toISOString()
  const subscriptions = items.map((item, index): Subscription => {
    const row = recordSchema.parse(item)
    const candidate = { ...row }
    const allowed = new Set([...Object.keys(inputSchema.shape), 'id', 'createdAt', 'updatedAt', 'showNextPayment'])
    const ignored = Object.keys(row).filter((key) => !allowed.has(key))
    if (ignored.length) warnings.push(`Row ${index + 1}: unrecognized fields are not restored: ${ignored.join(', ')}.`)
    if ('showNextPayment' in row)
      warnings.push(`Row ${index + 1}: the legacy showNextPayment display setting is not restored.`)
    if (!modern) {
      if (!candidate.nextPaymentDate) {
        candidate.nextPaymentDate = ''
        warnings.push(`Row ${index + 1}: missing payment date remains unset and is excluded from upcoming projections.`)
      } else if (typeof candidate.nextPaymentDate === 'string' && candidate.nextPaymentDate.includes('T')) {
        candidate.nextPaymentDate = candidate.nextPaymentDate.slice(0, 10)
        warnings.push(`Row ${index + 1}: legacy payment timestamp converted to its calendar date.`)
      }
      if (!candidate.domain) candidate.domain = ''
      if (!candidate.category) candidate.category = 'Other'
      if (!candidate.billingCycle) {
        candidate.billingCycle = 'monthly'
        warnings.push(`Row ${index + 1}: missing billing cycle defaults to monthly.`)
      }
      if (typeof candidate.currency === 'string') candidate.currency = candidate.currency.toUpperCase()
    }
    const input: Record<string, unknown> = {}
    for (const key of Object.keys(inputSchema.shape)) {
      if (key in candidate) input[key] = candidate[key]
    }
    const parsed = inputSchema.safeParse(input)
    if (!parsed.success)
      throw new HttpError(
        400,
        `Row ${index + 1}: ${parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`,
      )
    if (modern) assertMoneyPrecision(parsed.data.price, parsed.data.currency)
    else {
      const rounded = toMinor(parsed.data.price, parsed.data.currency) / 10 ** exponent(parsed.data.currency)
      if (rounded !== parsed.data.price)
        warnings.push(
          `Row ${index + 1}: ${parsed.data.price} ${parsed.data.currency} rounds to ${rounded} in currency minor units.`,
        )
      parsed.data.price = rounded
    }
    let id = randomUUID() as string
    if (row.id !== undefined) id = identitySchema.parse(row.id)
    let createdAt = now
    let updatedAt = now
    if (row.createdAt !== undefined) createdAt = timestampSchema.parse(row.createdAt)
    if (row.updatedAt !== undefined) updatedAt = timestampSchema.parse(row.updatedAt)
    return { ...parsed.data, id, createdAt, updatedAt }
  })
  if (!modern)
    warnings.push(
      'Legacy data has been normalized. Missing status, notes, trial, and timestamps use defaults. The original file is unchanged.',
    )
  const ids = new Set(existing.map((sub) => sub.id))
  const identities = new Set(existing.map(identity))
  let duplicates = 0
  for (const sub of subscriptions) {
    if (ids.has(sub.id) || identities.has(identity(sub))) duplicates += 1
    ids.add(sub.id)
    identities.add(identity(sub))
  }
  return { subscriptions, warnings, duplicates, preferences }
}

export async function importData(db: Database, data: unknown, mode: ImportMode): Promise<{ imported: number }> {
  const current = await readData(db)
  const existing = current.subscriptions
  const parsed = parseImport(data, existing, current.preferences)
  const target = new Map<string, Subscription>()
  const byIdentity = new Map<string, Subscription>()
  if (mode !== 'replace')
    for (const sub of existing) {
      target.set(sub.id, sub)
      byIdentity.set(identity(sub), sub)
    }
  let imported = 0
  const changes: Array<{ sub: Subscription; previous?: Subscription }> = []
  for (const incoming of parsed.subscriptions) {
    const previous = target.get(incoming.id) ?? byIdentity.get(identity(incoming))
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
    if (previous && mode === 'merge') byIdentity.delete(identity(previous))
    target.set(sub.id, sub)
    byIdentity.set(identity(sub), sub)
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
