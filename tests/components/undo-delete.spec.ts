import { collection, createSubscription, expect, test } from '../helpers'

test('cancel deletion keeps the record and confirmed deletion persists an empty collection', async ({ page }) => {
  await createSubscription(page.request, { name: 'Last remaining plan' })
  await page.goto('/')
  await page.locator('summary').filter({ hasText: 'Collection tools' }).click()
  await page.getByRole('radio', { name: 'Table view' }).click()
  await page.getByRole('button', { name: 'Delete Last remaining plan' }).click()
  const confirmation = page.getByRole('alertdialog')
  await expect(confirmation).toContainText('does not cancel your plans')
  await confirmation.getByRole('button', { name: 'Keep subscriptions' }).click()
  expect((await collection(page.request)).subscriptions).toHaveLength(1)
  await page.getByRole('button', { name: 'Delete Last remaining plan' }).click()
  await confirmation.getByRole('button', { name: 'Delete permanently' }).click()
  await expect(confirmation).not.toBeVisible()
  await expect(page.getByText('Add your first subscription', { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByText('Add your first subscription', { exact: true })).toBeVisible()
  expect((await collection(page.request)).subscriptions).toEqual([])
})

test('failed deletion leaves the server record intact and exposes a retryable error', async ({ page }) => {
  const saved = await createSubscription(page.request)
  await page.goto('/')
  await page.locator('summary').filter({ hasText: 'Collection tools' }).click()
  await page.getByRole('radio', { name: 'Table view' }).click()
  await page.route(`**/api/subscriptions/${saved.id}`, (route) =>
    route.fulfill({ status: 503, json: { error: 'Temporary storage failure' } }),
  )
  await page.getByRole('button', { name: `Delete ${saved.name}` }).click()
  const confirmation = page.getByRole('alertdialog')
  await confirmation.getByRole('button', { name: 'Delete permanently' }).click()
  await expect(confirmation).toContainText('Temporary storage failure')
  expect((await collection(page.request)).subscriptions).toEqual([saved])
})
