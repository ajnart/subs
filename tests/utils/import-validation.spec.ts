import {
  collection,
  createSubscription,
  expect,
  headers,
  importCollection,
  revisionHeaders,
  subscription,
  test,
} from '../helpers'

test('invalid JSON, envelopes and rows fail without replacing records or preferences', async ({ context }) => {
  await createSubscription(context.request)
  const before = await collection(context.request)
  for (const data of [
    '{invalid',
    { version: 999, subscriptions: [] },
    [subscription(), subscription({ price: -1 })],
    [subscription({ nextPaymentDate: '2030-02-30' })],
  ]) {
    const response = await context.request.post('/api/import', {
      headers: await revisionHeaders(context.request),
      data: { data, mode: 'replace' },
    })
    expect(response.status()).toBe(400)
    expect(await response.json()).toEqual({ error: expect.any(String) })
    expect(await collection(context.request)).toEqual(before)
  }
  const malformed = await context.request.post('/api/import/preview', {
    headers: { ...headers, 'Content-Type': 'application/json' },
    data: '{',
  })
  expect(malformed.status()).toBe(400)
})

test('legacy arrays and persisted envelopes preview without side effects', async ({ context }) => {
  const legacy = {
    id: 'legacy',
    name: 'Old plan',
    price: 9.99,
    currency: 'usd',
    billingCycle: 'monthly',
    nextPaymentDate: '2030-01-31T00:00:00.000Z',
  }
  const sources = [
    [legacy],
    { state: { subscriptions: [legacy] } },
    { 'subscription-storage': JSON.stringify({ state: { subscriptions: [legacy] } }), unrelated: 'not restored' },
  ]
  for (const data of sources) {
    const preview = await context.request.post('/api/import/preview', { headers, data: { data } })
    expect(preview.ok(), await preview.text()).toBeTruthy()
    expect(await preview.json()).toMatchObject({
      subscriptions: [
        { id: 'legacy', currency: 'USD', nextPaymentDate: '2030-01-31', status: 'active', category: 'Other' },
      ],
      warnings: expect.any(Array),
      duplicates: 0,
    })
    expect((await collection(context.request)).subscriptions).toEqual([])
  }
  const imported = await importCollection(context.request, sources[2], 'replace')
  expect(await imported.json()).toEqual({ imported: 1 })
  expect((await collection(context.request)).subscriptions[0]).toMatchObject({
    name: 'Old plan',
    notes: '',
    trialEndsAt: null,
  })
  await importCollection(context.request, [{ name: 'Undated legacy plan', price: 5, currency: 'USD' }], 'replace')
  expect((await collection(context.request)).subscriptions[0]).toMatchObject({
    name: 'Undated legacy plan',
    nextPaymentDate: '',
  })
})

test('versioned backups round-trip records and preferences but never credentials', async ({ context }) => {
  await createSubscription(context.request, { notes: 'Portable notes', billingCycle: 'quarterly' })
  const preferences = await context.request.patch('/api/preferences', {
    headers: await revisionHeaders(context.request),
    data: { monthlyBudget: 120, theme: 'dark' },
  })
  expect(preferences.ok(), await preferences.text()).toBeTruthy()
  expect(preferences.headers().etag).toBeTruthy()
  const original = await collection(context.request)
  const exported = await context.request.get('/api/export')
  expect(exported.headers()['content-disposition']).toContain('attachment')
  const backup = await exported.json()
  expect(backup).toEqual({ version: 3, exportedAt: expect.any(String), ...original })
  await importCollection(context.request, [], 'replace')
  const restored = await importCollection(context.request, backup, 'replace')
  expect(restored.ok(), await restored.text()).toBeTruthy()
  expect(await collection(context.request)).toEqual(original)
})
