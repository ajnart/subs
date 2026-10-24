import { collection, createSubscription, expect, mockRates, revisionHeaders, test } from '../helpers'

test('budget and savings use active normalized costs without mutating subscriptions', async ({ page }) => {
  await createSubscription(page.request, { name: 'Monthly plan', price: 10 })
  await createSubscription(page.request, { name: 'Yearly plan', price: 120, billingCycle: 'yearly' })
  await createSubscription(page.request, { name: 'Paused expensive plan', price: 999, status: 'paused' })
  await createSubscription(page.request, { name: 'Cancelled expensive plan', price: 999, status: 'cancelled' })
  const preferences = await page.request.patch('/api/preferences', {
    headers: await revisionHeaders(page.request),
    data: { monthlyBudget: 50 },
  })
  expect(preferences.ok(), await preferences.text()).toBeTruthy()
  expect(preferences.headers().etag).toBeTruthy()
  const before = await collection(page.request)
  await page.goto('/')
  await page.locator('summary').filter({ hasText: 'Collection tools' }).click()
  const summary = page.getByRole('region', { name: 'Spending summary' })
  await expect(summary).toContainText('$20.00')
  await expect(summary).toContainText('$240.00')
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'Insights' }).click()
  await expect(page.getByText('$30.00 remaining', { exact: true })).toBeVisible()
  await expect(page.getByText('of $50.00', { exact: true })).toBeVisible()
  await page.getByRole('checkbox', { name: /Monthly plan/ }).check()
  await expect(page.getByText('New monthly estimate: $10.00', { exact: true })).toBeVisible()
  await expect(page.getByRole('checkbox', { name: /Paused expensive plan/ })).not.toBeVisible()
  expect(await collection(page.request)).toEqual(before)
})

test('missing exchange rates explicitly mark partial totals and disable unconvertible savings', async ({
  page,
  context,
}) => {
  await mockRates(context, { USD: 1 })
  await createSubscription(page.request, { name: 'Dollar plan', price: 10 })
  await createSubscription(page.request, { name: 'Euro plan', currency: 'EUR', price: 20 })
  await page.goto('/')
  await page.locator('summary').filter({ hasText: 'Collection tools' }).click()
  await expect(page.getByText('Some currencies cannot be converted', { exact: true })).toBeVisible()
  const summary = page.getByRole('region', { name: 'Spending summary' })
  await expect(summary).toContainText('€20.00')
  await expect(summary).toContainText('$10.00')
  await expect(summary).toContainText('$10.00 + converted estimate (partial)')
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'Insights' }).click()
  await expect(page.getByText('Partial currency conversion', { exact: true })).toBeVisible()
  await expect(page.getByRole('checkbox', { name: /Euro plan/ })).toBeDisabled()
  expect((await collection(page.request)).subscriptions.find((item) => item.name === 'Euro plan')?.price).toBe(20)
})

test('daily, weekly and quarterly costs use displayed estimates rather than binary float assertions', async ({
  page,
}) => {
  await createSubscription(page.request, { name: 'Daily plan', price: 1, billingCycle: 'daily' })
  await createSubscription(page.request, { name: 'Weekly plan', price: 3, billingCycle: 'weekly' })
  await createSubscription(page.request, { name: 'Quarterly plan', price: 30, billingCycle: 'quarterly' })
  await page.goto('/')
  await page.locator('summary').filter({ hasText: 'Collection tools' }).click()
  const summary = page.getByRole('region', { name: 'Spending summary' })
  await expect(summary).toContainText('$53.42')
  await expect(summary).toContainText('$641.00')
})
