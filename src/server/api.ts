import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { authDisabled, checkOrigin, login, logout, requireAuth, setup, status, throttle } from './auth'
import { getSubscription, mutate, readData, revisionTag, saveSubscription, setMeta, withDatabase } from './database'
import { importData, parseImport } from './import'
import { getRates } from './rates'
import { assertMoneyPrecision, exponent, HttpError, inputSchema, preferencesSchema, readBody } from './validation'

const pinSchema = z.string().regex(/^\d{6}$/, 'PIN must contain exactly six digits')
const importSchema = z.object({ data: z.unknown() }).strict()
const importCommitSchema = z.object({ data: z.unknown(), mode: z.enum(['merge', 'replace', 'skip', 'new']) }).strict()

function json(data: unknown, statusCode = 200, headers?: HeadersInit): Response {
  const response = Response.json(data, { status: statusCode, headers })
  response.headers.set('Cache-Control', 'no-store')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  return response
}

export async function handleApiRequest(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url)
    const path = url.pathname.replace(/\/$/, '')
    const method = request.method
    if (method === 'GET' && path === '/api/health') return json({ ok: true })
    if (!['GET', 'POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) throw new HttpError(405, 'Method not allowed')
    if (method !== 'GET') checkOrigin(request)
    return await withDatabase(async (db) => {
      if (method === 'GET' && path === '/api/status') return json(await status(db, request))
      if (method === 'POST' && (path === '/api/setup' || path === '/api/login')) {
        if (authDisabled()) throw new HttpError(409, 'Authentication is explicitly disabled by the operator')
        if (path === '/api/setup') {
          await throttle(db, 'setup')
          const body = z
            .object({ pin: pinSchema, setupToken: z.string().min(1).max(512) })
            .strict()
            .parse(await readBody(request))
          const session = await setup(db, request, body.pin, body.setupToken)
          return json({ ok: true }, 200, { 'Set-Cookie': session })
        }
        await throttle(db, 'login')
        const body = z
          .object({ pin: pinSchema })
          .strict()
          .parse(await readBody(request))
        const session = await login(db, request, body.pin)
        return json({ ok: true }, 200, { 'Set-Cookie': session })
      }
      await requireAuth(db, request)
      if (method === 'POST' && path === '/api/logout')
        return json({ ok: true }, 200, { 'Set-Cookie': await logout(db, request) })
      if (method === 'GET' && path === '/api/data')
        return json(await readData(db), 200, { ETag: await revisionTag(db) })
      if (method === 'GET' && path === '/api/export') {
        return json({ version: 3, exportedAt: new Date().toISOString(), ...(await readData(db)) }, 200, {
          'Content-Disposition': 'attachment; filename="subs-backup.json"',
        })
      }
      if (method === 'GET' && path === '/api/rates') return json(await getRates(db))
      if (method === 'POST' && path === '/api/subscriptions') {
        const input = inputSchema.parse(await readBody(request))
        return mutate(db, request, async () => {
          const { rows } = await db.sql`SELECT COUNT(*) AS count FROM subscriptions`
          if (Number(rows?.[0]?.count) >= 10000)
            throw new HttpError(409, 'Collection cannot exceed 10000 subscriptions')
          const now = new Date().toISOString()
          return json(await saveSubscription(db, { ...input, id: randomUUID(), createdAt: now, updatedAt: now }), 201)
        })
      }
      const subscriptionMatch = path.match(/^\/api\/subscriptions\/([^/]+)$/)
      if (subscriptionMatch && method === 'PATCH') {
        const raw = z.record(z.string(), z.unknown()).parse(await readBody(request))
        const validated = inputSchema.partial().parse(raw)
        const input = Object.fromEntries(Object.entries(validated).filter(([key]) => key in raw))
        return mutate(db, request, async () => {
          const previous = await getSubscription(db, subscriptionMatch[1])
          const previousInput = Object.fromEntries(Object.entries(previous).filter(([key]) => key in inputSchema.shape))
          const merged = inputSchema.parse({
            ...previousInput,
            ...input,
          })
          return json(
            await saveSubscription(
              db,
              { ...merged, id: previous.id, createdAt: previous.createdAt, updatedAt: new Date().toISOString() },
              previous,
            ),
          )
        })
      }
      if (subscriptionMatch && method === 'DELETE') {
        return mutate(db, request, async () => {
          await getSubscription(db, subscriptionMatch[1])
          await db.sql`DELETE FROM subscriptions WHERE id = ${subscriptionMatch[1]}`
          return json({ ok: true })
        })
      }
      if (method === 'PATCH' && path === '/api/preferences') {
        const input = preferencesSchema.partial().parse(await readBody(request))
        return mutate(db, request, async () => {
          const { preferences } = await readData(db)
          const updated = preferencesSchema.parse({ ...preferences, ...input })
          assertMoneyPrecision(updated.monthlyBudget, updated.currency)
          await setMeta(db, 'preferences', JSON.stringify(updated))
          return json(updated)
        })
      }
      if (method === 'POST' && path === '/api/import/preview') {
        const body = importSchema.parse(await readBody(request))
        const current = await readData(db)
        const { subscriptions, warnings, duplicates } = parseImport(
          body.data,
          current.subscriptions,
          current.preferences,
        )
        return json({ subscriptions, warnings, duplicates }, 200, { ETag: await revisionTag(db) })
      }
      if (method === 'POST' && path === '/api/import') {
        const body = importCommitSchema.parse(await readBody(request))
        return mutate(db, request, async () => json(await importData(db, body.data, body.mode)))
      }
      const historyMatch = path.match(/^\/api\/history\/([^/]+)$/)
      if (method === 'GET' && historyMatch) {
        await getSubscription(db, historyMatch[1])
        const { rows } =
          await db.sql`SELECT date, price_minor, currency FROM price_history WHERE subscription_id = ${historyMatch[1]} ORDER BY date, id`
        return json(
          (rows ?? []).map((row) => ({
            date: String(row.date).slice(0, 10),
            price: Number(row.price_minor) / 10 ** exponent(String(row.currency)),
            currency: String(row.currency),
          })),
        )
      }
      throw new HttpError(404, 'API endpoint not found')
    })
  } catch (error) {
    if (error instanceof HttpError) {
      const headers = new Headers()
      if (error.status === 429) headers.set('Retry-After', '900')
      return json({ error: error.message }, error.status, headers)
    }
    if (error instanceof z.ZodError)
      return json({ error: error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ') }, 400)
    console.error('API request failed', error instanceof Error ? error.message : 'Unknown server error')
    return json({ error: 'The server could not complete the request' }, 500)
  }
}
