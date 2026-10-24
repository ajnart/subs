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

test('duplicate preview, skip and merge preserve a stable record identity', async ({ context }) => {
  const original = await createSubscription(context.request)
  const incoming = [
    { ...original, id: 'different-id', name: ' EXAMPLE SERVICE ', domain: 'https://EXAMPLE.COM/', price: 20 },
  ]
  const preview = await context.request.post('/api/import/preview', { headers, data: { data: incoming } })
  expect(await preview.json()).toMatchObject({ duplicates: 1 })
  expect((await collection(context.request)).subscriptions).toEqual([original])
  const skipped = await context.request.post('/api/import', {
    headers: await revisionHeaders(context.request, preview),
    data: { data: incoming, mode: 'skip' },
  })
  expect(skipped.ok(), await skipped.text()).toBeTruthy()
  expect(skipped.headers().etag).toBeTruthy()
  expect(await skipped.json()).toEqual({ imported: 0 })
  expect((await collection(context.request)).subscriptions).toEqual([original])
  const merged = await importCollection(context.request, incoming, 'merge')
  expect(await merged.json()).toEqual({ imported: 1 })
  expect((await collection(context.request)).subscriptions).toEqual([
    expect.objectContaining({ id: original.id, createdAt: original.createdAt, price: 20 }),
  ])
  const added = await importCollection(context.request, incoming, 'new')
  expect(await added.json()).toEqual({ imported: 1 })
  const kept = (await collection(context.request)).subscriptions
  expect(kept).toHaveLength(2)
  expect(new Set(kept.map((item) => item.id)).size).toBe(2)
  expect(kept.some((item) => item.id === original.id)).toBe(true)
})

test('replace removes unrelated records and skip detects duplicates inside a file', async ({ context }) => {
  await createSubscription(context.request, { name: 'Remove me' })
  const repeated = subscription({ name: 'Imported plan' })
  const preview = await context.request.post('/api/import/preview', { headers, data: { data: [repeated, repeated] } })
  expect(await preview.json()).toMatchObject({ duplicates: 1 })
  const skipped = await context.request.post('/api/import', {
    headers: await revisionHeaders(context.request, preview),
    data: { data: [repeated, repeated], mode: 'skip' },
  })
  expect(skipped.ok(), await skipped.text()).toBeTruthy()
  expect(skipped.headers().etag).toBeTruthy()
  expect(await skipped.json()).toEqual({ imported: 1 })
  const replaced = await importCollection(context.request, [subscription({ name: 'Replacement' })], 'replace')
  expect(await replaced.json()).toEqual({ imported: 1 })
  expect((await collection(context.request)).subscriptions).toEqual([expect.objectContaining({ name: 'Replacement' })])
})
