import { collection, createSubscription, expect, revisionHeaders, test } from '../helpers'

test('trial deadlines and lifecycle details remain visible without treating trials as automatic cancellations', async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date('2030-02-01T12:00:00Z'))
  await createSubscription(page.request, { name: 'Trial plan', trialEndsAt: '2030-02-01', status: 'active' })
  await createSubscription(page.request, { name: 'Paused trial plan', trialEndsAt: '2030-02-01', status: 'paused' })
  await page.goto('/')
  await expect(page.getByText('Trial ends Feb 1, 2030', { exact: true })).toHaveCount(2)
  await expect(page.getByText('Not included in spending', { exact: true })).toBeVisible()
  const records = (await collection(page.request)).subscriptions
  expect(records.find((item) => item.name === 'Trial plan')?.status).toBe('active')
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'Calendar' }).click()
  await page.getByRole('button', { name: 'Feb 1, 2030, 1 payments and trial deadlines', exact: true }).click()
  await expect(
    page.getByRole('button').filter({ hasText: 'Trial plan' }).filter({ hasText: 'Trial ends' }),
  ).toHaveCount(1)
  await expect(page.getByText('Paused trial plan', { exact: true })).not.toBeVisible()
})

test('invalid money, unsafe links and dates reject writes without changing committed state', async ({ context }) => {
  const saved = await createSubscription(context.request)
  for (const data of [
    { price: -1 },
    { price: 1.234 },
    { price: 1.1, currency: 'JPY' },
    { price: 1.2345, currency: 'KWD' },
    { currency: 'ZZZ' },
    { domain: 'javascript:alert(1)' },
    { nextPaymentDate: '2030-02-30' },
    { status: 'deleted' },
  ]) {
    const response = await context.request.patch(`/api/subscriptions/${saved.id}`, {
      headers: await revisionHeaders(context.request),
      data,
    })
    expect(response.status()).toBe(400)
    expect(await response.json()).toEqual({ error: expect.any(String) })
    expect((await collection(context.request)).subscriptions).toEqual([saved])
  }
})

test('zero- and three-decimal currencies retain exact supported prices in exports', async ({ context }) => {
  await createSubscription(context.request, { name: 'Yen plan', currency: 'JPY', price: 500 })
  await createSubscription(context.request, { name: 'Dinar plan', currency: 'KWD', price: 1.234 })
  await createSubscription(context.request, { name: 'Free plan', price: 0 })
  const response = await context.request.get('/api/export')
  expect((await response.json()).subscriptions).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ currency: 'JPY', price: 500 }),
      expect.objectContaining({ currency: 'KWD', price: 1.234 }),
      expect.objectContaining({ name: 'Free plan', price: 0 }),
    ]),
  )
})
