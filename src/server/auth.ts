import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import type { Status } from '../lib/types'
import { type Database, getMeta, setMeta, transaction } from './database'
import { HttpError } from './validation'

const derive = promisify(scrypt)
const sessionTtl = 7 * 24 * 60 * 60 * 1000
const cookieName = 'subs_session'

export function authDisabled(): boolean {
  return process.env.DISABLE_AUTH === 'true'
}

function digest(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function equal(left: string, right: string): boolean {
  return timingSafeEqual(Buffer.from(digest(left), 'hex'), Buffer.from(digest(right), 'hex'))
}

function sessionToken(request: Request): string | undefined {
  const cookie = request.headers
    .get('cookie')
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`))
  const token = cookie?.slice(cookieName.length + 1)
  if (token && /^[a-f0-9]{64}$/.test(token)) return token
}

export function checkOrigin(request: Request): void {
  const origin = request.headers.get('origin')
  let expected = new URL(request.url).origin
  if (process.env.SUBS_ORIGIN) expected = new URL(process.env.SUBS_ORIGIN).origin
  if (!origin || origin !== expected) throw new HttpError(403, 'A matching Origin header is required')
  const site = request.headers.get('sec-fetch-site')
  if (site === 'cross-site') throw new HttpError(403, 'Cross-site requests are not allowed')
}

export async function authenticated(db: Database, request: Request): Promise<boolean> {
  if (authDisabled()) return true
  const token = sessionToken(request)
  if (!token) return false
  const { rows } =
    await db.sql`SELECT token_hash FROM sessions WHERE token_hash = ${digest(token)} AND expires_at > ${Date.now()}`
  return Boolean(rows?.length)
}

export async function requireAuth(db: Database, request: Request): Promise<void> {
  if (!(await authenticated(db, request))) throw new HttpError(401, 'Authentication required')
}

export async function status(db: Database, request: Request): Promise<Status> {
  const configured = Boolean(await getMeta(db, 'pin_hash'))
  if (!configured && !authDisabled() && !process.env.SUBS_SETUP_TOKEN) {
    await transaction(db, async () => {
      if (await getMeta(db, 'setup_token_hash')) return
      const token = randomBytes(32).toString('hex')
      await setMeta(db, 'setup_token_hash', digest(token))
      console.info(`Subs setup token: ${token}`)
    })
  }
  return {
    setupRequired: !configured && !authDisabled(),
    authenticated: await authenticated(db, request),
    authDisabled: authDisabled(),
  }
}

export async function throttle(db: Database, key: 'login' | 'setup'): Promise<void> {
  await transaction(db, async () => {
    const now = Date.now()
    const window = 15 * 60 * 1000
    const { rows } = await db.sql`SELECT started_at, attempts FROM rate_limits WHERE key = ${key}`
    const row = rows?.[0]
    if (!row || now - Number(row.started_at) >= window) {
      await db.sql`INSERT INTO rate_limits (key, started_at, attempts) VALUES (${key}, ${now}, 1) ON CONFLICT(key) DO UPDATE SET started_at=excluded.started_at, attempts=1`
    } else {
      if (Number(row.attempts) >= 10) throw new HttpError(429, 'Too many attempts; try again in 15 minutes')
      await db.sql`UPDATE rate_limits SET attempts=attempts+1 WHERE key = ${key}`
    }
  })
}

async function hashPin(pin: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const hash = (await derive(pin, salt, 64)) as Buffer
  return `${salt}:${hash.toString('hex')}`
}

function cookie(request: Request, token: string, seconds: number): string {
  let secure = new URL(request.url).protocol === 'https:'
  if (process.env.SUBS_ORIGIN && new URL(process.env.SUBS_ORIGIN).protocol === 'https:') secure = true
  if (process.env.SUBS_COOKIE_SECURE === 'false') secure = false
  if (process.env.SUBS_COOKIE_SECURE === 'true') secure = true
  let value = `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${seconds}`
  if (secure) value += '; Secure'
  return value
}

async function createSession(db: Database, request: Request): Promise<string> {
  const now = Date.now()
  await db.sql`DELETE FROM sessions WHERE expires_at <= ${now}`
  const oldToken = sessionToken(request)
  if (oldToken) await db.sql`DELETE FROM sessions WHERE token_hash = ${digest(oldToken)}`
  const token = randomBytes(32).toString('hex')
  await db.sql`INSERT INTO sessions (token_hash, expires_at) VALUES (${digest(token)}, ${now + sessionTtl})`
  return cookie(request, token, sessionTtl / 1000)
}

export async function setup(db: Database, request: Request, pin: string, setupToken: string): Promise<string> {
  const pinHash = await hashPin(pin)
  return transaction(db, async () => {
    if (await getMeta(db, 'pin_hash')) throw new HttpError(409, 'Setup is already complete')
    let expected = await getMeta(db, 'setup_token_hash')
    if (process.env.SUBS_SETUP_TOKEN) expected = digest(process.env.SUBS_SETUP_TOKEN)
    if (!expected || !equal(digest(setupToken), expected))
      throw new HttpError(403, 'Invalid setup token; use the operator token from the server logs or SUBS_SETUP_TOKEN')
    await setMeta(db, 'pin_hash', pinHash)
    await db.sql`DELETE FROM meta WHERE key = 'setup_token_hash'`
    const session = await createSession(db, request)
    await db.sql`DELETE FROM rate_limits WHERE key = 'setup'`
    return session
  })
}

export async function login(db: Database, request: Request, pin: string): Promise<string> {
  const encoded = await getMeta(db, 'pin_hash')
  if (!encoded) throw new HttpError(409, 'Complete instance setup first')
  const [salt, expected] = encoded.split(':')
  const actual = (await derive(pin, salt, 64)) as Buffer
  if (!timingSafeEqual(actual, Buffer.from(expected, 'hex'))) throw new HttpError(401, 'Incorrect PIN')
  return transaction(db, async () => {
    const session = await createSession(db, request)
    await db.sql`DELETE FROM rate_limits WHERE key = 'login'`
    return session
  })
}

export async function logout(db: Database, request: Request): Promise<string> {
  const token = sessionToken(request)
  if (token) await db.sql`DELETE FROM sessions WHERE token_hash = ${digest(token)}`
  return cookie(request, '', 0)
}
