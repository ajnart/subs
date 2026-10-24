import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { useDatabase as getDatabase } from 'nitro/database'
import type { AppData, Preferences, Subscription } from '../lib/types'
import { assertMoneyPrecision, exponent, HttpError, toMinor } from './validation'

export type Database = ReturnType<typeof getDatabase>

export const defaultPreferences: Preferences = { currency: 'USD', monthlyBudget: 0, theme: 'system' }

let initialized: Promise<Database> | undefined
let queue: Promise<void> = Promise.resolve()
let waiting = 0

async function initialize(): Promise<Database> {
  await mkdir(resolve(process.env.DATA_DIR || './data'), { recursive: true, mode: 0o700 })
  const db = getDatabase()
  await db.exec('PRAGMA busy_timeout = 5000')
  await db.exec('PRAGMA journal_mode = WAL')
  await db.exec('PRAGMA foreign_keys = ON')
  await db.exec(`CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)`)
  await db.exec(`CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, price_minor INTEGER NOT NULL, currency TEXT NOT NULL,
    domain TEXT NOT NULL, category TEXT NOT NULL, billing_cycle TEXT NOT NULL, next_payment_date TEXT NOT NULL,
    status TEXT NOT NULL, trial_ends_at TEXT, notes TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, icon TEXT
  )`)
  await db.exec(`CREATE TABLE IF NOT EXISTS price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT, subscription_id TEXT NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    date TEXT NOT NULL, price_minor INTEGER NOT NULL, currency TEXT NOT NULL
  )`)
  await db.exec('CREATE INDEX IF NOT EXISTS history_subscription ON price_history(subscription_id)')
  await db.exec('CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, expires_at INTEGER NOT NULL)')
  await db.exec(
    'CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, started_at INTEGER NOT NULL, attempts INTEGER NOT NULL)',
  )
  await db.sql`INSERT OR IGNORE INTO meta (key, value) VALUES ('preferences', ${JSON.stringify(defaultPreferences)})`
  await db.sql`INSERT OR IGNORE INTO meta (key, value) VALUES ('schema_version', '1')`
  await db.sql`INSERT OR IGNORE INTO meta (key, value) VALUES ('collection_revision', '0')`
  return db
}

export async function withDatabase<T>(operation: (db: Database) => Promise<T>): Promise<T> {
  if (waiting >= 32) throw new HttpError(503, 'Server is busy; try again shortly')
  waiting += 1
  const previous = queue
  let release: () => void = () => {}
  queue = new Promise<void>((resolveQueue) => {
    release = resolveQueue
  })
  await previous
  try {
    if (!initialized)
      initialized = initialize().catch((error: unknown) => {
        initialized = undefined
        throw error
      })
    const db = await initialized
    return await operation(db)
  } finally {
    waiting -= 1
    release()
  }
}

export async function transaction<T>(db: Database, operation: () => Promise<T>): Promise<T> {
  await db.exec('BEGIN IMMEDIATE')
  try {
    const value = await operation()
    await db.exec('COMMIT')
    return value
  } catch (error) {
    await db.exec('ROLLBACK')
    throw error
  }
}

export async function getMeta(db: Database, key: string): Promise<string | undefined> {
  const result = await db.sql`SELECT value FROM meta WHERE key = ${key}`
  const value = result.rows?.[0]?.value
  if (typeof value === 'string') return value
}

export async function setMeta(db: Database, key: string, value: string): Promise<void> {
  await db.sql`INSERT INTO meta (key, value) VALUES (${key}, ${value}) ON CONFLICT(key) DO UPDATE SET value = excluded.value`
}

export async function revisionTag(db: Database): Promise<string> {
  return `"subs-${(await getMeta(db, 'collection_revision')) ?? '0'}"`
}

export async function mutate(db: Database, request: Request, operation: () => Promise<Response>): Promise<Response> {
  return transaction(db, async () => {
    const expected = request.headers.get('if-match')
    if (!expected) throw new HttpError(428, 'Reload the collection before saving; an If-Match revision is required')
    if (expected !== (await revisionTag(db)))
      throw new HttpError(409, 'The collection changed on another device. Reload before saving.')
    const response = await operation()
    await setMeta(db, 'collection_revision', String(Number((await getMeta(db, 'collection_revision')) ?? '0') + 1))
    response.headers.set('ETag', await revisionTag(db))
    return response
  })
}

function subscriptionFromRow(row: Record<string, unknown>): Subscription {
  const currency = String(row.currency)
  const sub: Subscription = {
    id: String(row.id),
    name: String(row.name),
    price: Number(row.price_minor) / 10 ** exponent(currency),
    currency,
    domain: String(row.domain),
    category: String(row.category),
    billingCycle: row.billing_cycle as Subscription['billingCycle'],
    nextPaymentDate: String(row.next_payment_date),
    status: row.status as Subscription['status'],
    trialEndsAt: null,
    notes: String(row.notes),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }
  if (typeof row.trial_ends_at === 'string') sub.trialEndsAt = row.trial_ends_at
  if (typeof row.icon === 'string') sub.icon = row.icon
  return sub
}

export async function listSubscriptions(db: Database): Promise<Subscription[]> {
  const { rows } = await db.sql`SELECT * FROM subscriptions ORDER BY created_at, id`
  return (rows ?? []).map(subscriptionFromRow)
}

export async function getSubscription(db: Database, id: string): Promise<Subscription> {
  const { rows } = await db.sql`SELECT * FROM subscriptions WHERE id = ${id}`
  const row = rows?.[0]
  if (!row) throw new HttpError(404, 'Subscription not found')
  return subscriptionFromRow(row)
}

export async function saveSubscription(
  db: Database,
  sub: Subscription,
  previous?: Subscription,
  recordedAt = sub.updatedAt,
): Promise<Subscription> {
  assertMoneyPrecision(sub.price, sub.currency)
  const minor = toMinor(sub.price, sub.currency)
  await db.sql`INSERT INTO subscriptions
    (id, name, price_minor, currency, domain, category, billing_cycle, next_payment_date, status, trial_ends_at, notes, created_at, updated_at, icon)
    VALUES (${sub.id}, ${sub.name}, ${minor}, ${sub.currency}, ${sub.domain}, ${sub.category}, ${sub.billingCycle}, ${sub.nextPaymentDate}, ${sub.status}, ${sub.trialEndsAt}, ${sub.notes}, ${sub.createdAt}, ${sub.updatedAt}, ${sub.icon ?? null})
    ON CONFLICT(id) DO UPDATE SET name=excluded.name, price_minor=excluded.price_minor, currency=excluded.currency,
    domain=excluded.domain, category=excluded.category, billing_cycle=excluded.billing_cycle, next_payment_date=excluded.next_payment_date,
    status=excluded.status, trial_ends_at=excluded.trial_ends_at, notes=excluded.notes, updated_at=excluded.updated_at, icon=excluded.icon`
  if (!previous || toMinor(previous.price, previous.currency) !== minor || previous.currency !== sub.currency) {
    await db.sql`INSERT INTO price_history (subscription_id, date, price_minor, currency) VALUES (${sub.id}, ${recordedAt}, ${minor}, ${sub.currency})`
  }
  return { ...sub, price: minor / 10 ** exponent(sub.currency) }
}

export async function readData(db: Database): Promise<AppData> {
  const value = await getMeta(db, 'preferences')
  let preferences = defaultPreferences
  if (value) preferences = JSON.parse(value) as Preferences
  return { subscriptions: await listSubscriptions(db), preferences }
}
