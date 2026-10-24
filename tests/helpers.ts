import { type APIRequestContext, type APIResponse, type BrowserContext, test as base, expect } from '@playwright/test'
import type { AppData, Subscription, SubscriptionInput } from '../src/lib/types'

export const origin = 'http://127.0.0.1:4173'
export const pin = '246810'
export const headers = { Origin: origin }
type StorageState = Awaited<ReturnType<APIRequestContext['storageState']>>

export async function revisionHeaders(request: APIRequestContext, response?: APIResponse) {
  const current = response ?? (await request.get('/api/data'))
  expect(current.ok(), await current.text()).toBeTruthy()
  const revision = current.headers().etag
  expect(revision).toBeTruthy()
  return { ...headers, 'If-Match': revision }
}

export async function importCollection(
  request: APIRequestContext,
  data: unknown,
  mode: 'merge' | 'replace' | 'skip' | 'new',
) {
  const preview = await request.post('/api/import/preview', { headers, data: { data } })
  const response = await request.post('/api/import', {
    headers: await revisionHeaders(request, preview),
    data: { data, mode },
  })
  expect(response.ok(), await response.text()).toBeTruthy()
  expect(response.headers().etag).toBeTruthy()
  return response
}

export async function authenticate(request: APIRequestContext) {
  const response = await request.get('/api/status')
  expect(response.ok()).toBeTruthy()
  const status = await response.json()
  if (status.authenticated) return
  const endpoint = status.setupRequired ? '/api/setup' : '/api/login'
  const data = status.setupRequired ? { pin, setupToken: 'known-test-token' } : { pin }
  const authenticated = await request.post(endpoint, { headers, data })
  expect(authenticated.ok(), await authenticated.text()).toBeTruthy()
}

export async function mockRates(context: BrowserContext, rates: Record<string, number> = { USD: 1, EUR: 0.8 }) {
  await context.route('**/api/rates', (route) =>
    route.fulfill({ json: { base: 'USD', rates, updatedAt: new Date().toISOString(), stale: false } }),
  )
}

export const test = base.extend<{ resetCollection: undefined }, { authenticatedState: StorageState }>({
  authenticatedState: [
    async ({ playwright }, use) => {
      const request = await playwright.request.newContext({
        baseURL: origin,
        storageState: { cookies: [], origins: [] },
      })
      await authenticate(request)
      await use(await request.storageState())
      await request.dispose()
    },
    { scope: 'worker' },
  ],
  storageState: async ({ authenticatedState }, use) => use(authenticatedState),
  resetCollection: [
    async ({ context }, use) => {
      const reset = await importCollection(context.request, [], 'replace')
      const preferences = await context.request.patch('/api/preferences', {
        headers: await revisionHeaders(context.request, reset),
        data: { currency: 'USD', monthlyBudget: 0, theme: 'light' },
      })
      expect(preferences.ok(), await preferences.text()).toBeTruthy()
      expect(preferences.headers().etag).toBeTruthy()
      await mockRates(context)
      await use(undefined)
    },
    { auto: true },
  ],
})

export { expect }

export function subscription(overrides: Partial<SubscriptionInput> = {}): SubscriptionInput {
  return {
    name: 'Example service',
    price: 12,
    currency: 'USD',
    domain: 'example.com',
    category: 'Software',
    billingCycle: 'monthly',
    nextPaymentDate: '2030-01-15',
    status: 'active',
    trialEndsAt: null,
    notes: '',
    ...overrides,
  }
}

export async function createSubscription(
  request: APIRequestContext,
  overrides: Partial<SubscriptionInput> = {},
): Promise<Subscription> {
  const response = await request.post('/api/subscriptions', {
    headers: await revisionHeaders(request),
    data: subscription(overrides),
  })
  expect(response.status(), await response.text()).toBe(201)
  expect(response.headers().etag).toBeTruthy()
  return response.json()
}

export async function collection(request: APIRequestContext): Promise<AppData> {
  const response = await request.get('/api/data')
  expect(response.ok(), await response.text()).toBeTruthy()
  expect(response.headers().etag).toBeTruthy()
  return response.json()
}

export function dateAfter(days: number) {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}
