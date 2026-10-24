import { z } from 'zod'
import { mergeImportTargets, parseImport, subscriptionIdentity } from '@/lib/import'
import { MAX_BACKUP_BYTES } from '@/lib/limits'
import type { AppData, Backup, ExchangeRates, ImportMode, Subscription } from '@/lib/types'
import { assertMoneyPrecision, HttpError, inputSchema, preferencesSchema, readBody } from '@/lib/validation'
import { starterData } from './starter'

export const DEMO_STORAGE_KEY = 'subs-demo-v3'

const subscriptionSchema = inputSchema.extend({
  id: z.string().min(1).max(200),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
})
const historySchema = z.object({ date: z.string(), price: z.number().finite().nonnegative(), currency: z.string() })
const storeSchema = z.object({
  version: z.literal(3),
  revision: z
    .number()
    .int()
    .nonnegative()
    .max(Number.MAX_SAFE_INTEGER - 1),
  subscriptions: z.array(subscriptionSchema).max(10000),
  preferences: preferencesSchema,
  history: z.record(z.string(), z.array(historySchema)),
})
type Store = z.infer<typeof storeSchema>

const importSchema = z.object({ data: z.unknown() }).strict()
const importCommitSchema = importSchema.extend({ mode: z.enum(['skip', 'merge', 'replace', 'new']) })
const rates: ExchangeRates = {
  base: 'USD',
  rates: {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 150,
    CAD: 1.36,
    AUD: 1.52,
    CHF: 0.89,
    CNY: 7.2,
    INR: 83,
    BRL: 5,
    KRW: 1350,
    SEK: 10.4,
    NOK: 10.6,
    DKK: 6.86,
    NZD: 1.65,
    SGD: 1.34,
    HKD: 7.82,
    MXN: 17,
    PLN: 4,
    CZK: 23.3,
    HUF: 360,
    TRY: 32,
    ZAR: 18.5,
  },
  updatedAt: null,
  stale: true,
}

function json(value: unknown, status = 200, store?: Store): Response {
  const headers = new Headers({ 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' })
  if (store) headers.set('ETag', `"subs-${store.revision}"`)
  return Response.json(value, { status, headers })
}

function backup(data: AppData): Backup {
  return {
    version: 3,
    exportedAt: new Date().toISOString(),
    subscriptions: data.subscriptions,
    preferences: data.preferences,
  }
}

function createStore(): Store {
  const data = starterData()
  return {
    ...data,
    version: 3,
    revision: Date.now(),
    history: Object.fromEntries(
      data.subscriptions.map((sub) => [
        sub.id,
        [{ date: sub.createdAt.slice(0, 10), price: sub.price, currency: sub.currency }],
      ]),
    ),
  }
}

function storage(): Storage {
  if (typeof window === 'undefined') throw new HttpError(503, 'The demo is available only in a browser.')
  try {
    return window.localStorage
  } catch {
    throw new HttpError(
      503,
      'Browser storage is blocked. Allow local storage for this site to use the demo; nothing was saved.',
    )
  }
}

function persist(store: Store): void {
  if (new TextEncoder().encode(JSON.stringify(backup(store), null, 2)).byteLength > MAX_BACKUP_BYTES)
    throw new HttpError(
      413,
      'The collection exceeds the 2 MiB portable backup limit. Shorten notes or remove records. Nothing was saved.',
    )
  try {
    storage().setItem(DEMO_STORAGE_KEY, JSON.stringify(store))
  } catch (error) {
    if (error instanceof HttpError) throw error
    throw new HttpError(
      507,
      'Browser storage is full or blocked. Free space or allow local storage, then retry. Nothing was saved.',
    )
  }
}

function readStore(): Store {
  let raw: string | null
  try {
    raw = storage().getItem(DEMO_STORAGE_KEY)
  } catch (error) {
    if (error instanceof HttpError) throw error
    throw new HttpError(503, 'Browser storage cannot be read. Allow local storage for this site to use the demo.')
  }
  if (raw === null) {
    const store = createStore()
    persist(store)
    return store
  }
  try {
    const store = storeSchema.parse(JSON.parse(raw))
    if (new Set(store.subscriptions.map((sub) => sub.id)).size !== store.subscriptions.length)
      throw new Error('Duplicate stored IDs')
    for (const sub of store.subscriptions) assertMoneyPrecision(sub.price, sub.currency)
    assertMoneyPrecision(store.preferences.monthlyBudget, store.preferences.currency)
    return store
  } catch {
    throw new HttpError(
      500,
      'The saved demo collection is unreadable. Reset the demo to restore sample subscriptions; only demo data will be cleared.',
    )
  }
}

function recordPrice(store: Store, sub: Subscription, previous?: Subscription): void {
  if (previous && previous.price === sub.price && previous.currency === sub.currency) return
  const history = Object.hasOwn(store.history, sub.id) ? store.history[sub.id] : []
  history.push({ date: new Date().toISOString().slice(0, 10), price: sub.price, currency: sub.currency })
  Object.defineProperty(store.history, sub.id, { value: history, enumerable: true, configurable: true, writable: true })
}

function commit(store: Store, value: unknown, status = 200): Response {
  store.revision += 1
  persist(store)
  return json(value, status, store)
}

function requireRevision(store: Store, headers: Headers): void {
  const expected = headers.get('If-Match')
  if (!expected) throw new HttpError(428, 'Reload the collection before saving; an If-Match revision is required')
  if (expected !== `"subs-${store.revision}"`)
    throw new HttpError(409, 'The demo collection changed in another tab. Refresh and review before saving.')
}

function subscriptionInput(sub: Subscription): Record<string, unknown> {
  return Object.fromEntries(Object.entries(sub).filter(([key]) => key in inputSchema.shape))
}

function importCollection(store: Store, data: unknown, mode: ImportMode): { imported: number } {
  const existing = store.subscriptions
  const parsed = parseImport(data, existing, store.preferences)
  let mergeTargets = new Map<number, string>()
  if (mode === 'merge') mergeTargets = mergeImportTargets(parsed)
  const target = new Map<string, Subscription>()
  const byIdentity = new Map<string, Subscription>()
  if (mode !== 'replace') {
    for (const sub of existing) {
      target.set(sub.id, sub)
      byIdentity.set(subscriptionIdentity(sub), sub)
    }
  } else store.history = {}
  let imported = 0
  for (const [index, incoming] of parsed.subscriptions.entries()) {
    let previous = target.get(incoming.id) ?? byIdentity.get(subscriptionIdentity(incoming))
    if (mode === 'merge') {
      previous = undefined
      const targetId = mergeTargets.get(index)
      if (targetId !== undefined) previous = target.get(targetId)
    }
    if (previous && mode === 'skip') continue
    let sub = incoming
    if (mode === 'new' || (mode === 'replace' && target.has(sub.id))) {
      let id: string
      do {
        id = crypto.randomUUID()
      } while (target.has(id))
      sub = { ...incoming, id }
    }
    if (previous && mode === 'merge') {
      sub = { ...incoming, id: previous.id, createdAt: previous.createdAt, updatedAt: new Date().toISOString() }
      byIdentity.delete(subscriptionIdentity(previous))
    }
    target.set(sub.id, sub)
    byIdentity.set(subscriptionIdentity(sub), sub)
    if (mode === 'new' || mode === 'replace') recordPrice(store, sub)
    else recordPrice(store, sub, previous)
    imported += 1
  }
  if (target.size > 10000) throw new HttpError(400, 'Collection cannot exceed 10000 subscriptions')
  store.subscriptions = [...target.values()]
  if (parsed.preferences && (mode === 'replace' || existing.length === 0)) {
    store.preferences = preferencesSchema.parse({ ...store.preferences, ...parsed.preferences })
    assertMoneyPrecision(store.preferences.monthlyBudget, store.preferences.currency)
  }
  return { imported }
}

function handle(path: string, method: string, headers: Headers, body: unknown): Response {
  if (method === 'GET' && path === '/health') return json({ ok: true, demo: true })
  if (method === 'GET' && path === '/status')
    return json({ setupRequired: false, authenticated: true, authDisabled: true })
  if (method === 'GET' && path === '/rates') return json(rates)
  if (method === 'POST' && path === '/demo/reset') {
    const store = createStore()
    try {
      const previous = readStore()
      requireRevision(previous, headers)
      store.revision = Math.max(store.revision, previous.revision + 1)
    } catch (error) {
      if (!(error instanceof HttpError) || error.status !== 500) throw error
    }
    persist(store)
    return json({ ok: true }, 200, store)
  }
  if (['/setup', '/login', '/logout'].includes(path))
    throw new HttpError(
      409,
      'The public demo has no PIN or server session. Your collection exists only in this browser.',
    )
  const store = readStore()
  if (method === 'GET' && path === '/data')
    return json({ subscriptions: store.subscriptions, preferences: store.preferences }, 200, store)
  if (method === 'GET' && path === '/export') return json(backup(store))
  const historyMatch = path.match(/^\/history\/([^/]+)$/)
  if (method === 'GET' && historyMatch) {
    const id = decodeURIComponent(historyMatch[1])
    if (!store.subscriptions.some((sub) => sub.id === id)) throw new HttpError(404, 'Subscription not found')
    return json(Object.hasOwn(store.history, id) ? store.history[id] : [])
  }
  if (method === 'POST' && path === '/import/preview') {
    const input = importSchema.parse(body)
    const { subscriptions, warnings, duplicates, matches } = parseImport(
      input.data,
      store.subscriptions,
      store.preferences,
    )
    return json({ subscriptions, warnings, duplicates, matches }, 200, store)
  }
  const subscriptionMatch = path.match(/^\/subscriptions\/([^/]+)$/)
  const mutation =
    (method === 'POST' && ['/subscriptions', '/import'].includes(path)) ||
    (method === 'PATCH' && (path === '/preferences' || subscriptionMatch !== null)) ||
    (method === 'DELETE' && subscriptionMatch !== null)
  if (!mutation) throw new HttpError(404, 'Demo API endpoint not found')
  requireRevision(store, headers)
  if (method === 'POST' && path === '/subscriptions') {
    if (store.subscriptions.length >= 10000) throw new HttpError(409, 'Collection cannot exceed 10000 subscriptions')
    const input = inputSchema.parse(body)
    assertMoneyPrecision(input.price, input.currency)
    const now = new Date().toISOString()
    const sub = { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now }
    store.subscriptions.push(sub)
    recordPrice(store, sub)
    return commit(store, sub, 201)
  }
  if (subscriptionMatch) {
    const id = decodeURIComponent(subscriptionMatch[1])
    const previous = store.subscriptions.find((sub) => sub.id === id)
    if (!previous) throw new HttpError(404, 'Subscription not found')
    if (method === 'DELETE') {
      store.subscriptions = store.subscriptions.filter((sub) => sub.id !== id)
      delete store.history[id]
      return commit(store, { ok: true })
    }
    const raw = z.record(z.string(), z.unknown()).parse(body)
    const validated = inputSchema.partial().parse(raw)
    const patch = Object.fromEntries(Object.entries(validated).filter(([key]) => key in raw))
    const input = inputSchema.parse({ ...subscriptionInput(previous), ...patch })
    assertMoneyPrecision(input.price, input.currency)
    const sub = { ...input, id, createdAt: previous.createdAt, updatedAt: new Date().toISOString() }
    store.subscriptions = store.subscriptions.map((item) => (item.id === id ? sub : item))
    recordPrice(store, sub, previous)
    return commit(store, sub)
  }
  if (path === '/preferences') {
    const input = preferencesSchema.partial().parse(body)
    store.preferences = preferencesSchema.parse({ ...store.preferences, ...input })
    assertMoneyPrecision(store.preferences.monthlyBudget, store.preferences.currency)
    return commit(store, store.preferences)
  }
  const input = importCommitSchema.parse(body)
  return commit(store, importCollection(store, input.data, input.mode))
}

export async function demoResponse(path: string, options: RequestInit = {}): Promise<Response> {
  try {
    options.signal?.throwIfAborted()
    const method = (options.method ?? 'GET').toUpperCase()
    if (!['GET', 'POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) throw new HttpError(405, 'Method not allowed')
    const headers = new Headers(options.headers)
    let body: unknown
    if (options.body !== undefined && options.body !== null)
      body = await readBody(new Request('https://demo.invalid/api', { method, headers, body: options.body }))
    const operation = () => {
      options.signal?.throwIfAborted()
      return handle(path.replace(/^\/api(?=\/)/, '').replace(/\/$/, ''), method, headers, body)
    }
    if (typeof navigator !== 'undefined' && navigator.locks)
      return await navigator.locks.request(DEMO_STORAGE_KEY, operation)
    return operation()
  } catch (error) {
    if (options.signal?.aborted) throw error
    if (error instanceof HttpError) return json({ error: error.message }, error.status)
    if (error instanceof z.ZodError)
      return json({ error: error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ') }, 400)
    return json(
      { error: 'The browser could not complete this demo action. Refresh or reset the demo and try again.' },
      500,
    )
  }
}
