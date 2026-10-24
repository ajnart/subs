import { createSubscription, expect, test } from '../helpers'

test('category, lifecycle, cycle and text filters compose and can be cleared', async ({ page }) => {
  await createSubscription(page.request, { name: 'Streaming plan', category: 'Entertainment' })
  await createSubscription(page.request, {
    name: 'Work plan',
    category: 'Software',
    billingCycle: 'yearly',
    status: 'paused',
  })
  await page.goto('/')
  await page.getByRole('radio', { name: 'Table view' }).click()
  const rows = page.getByRole('row').filter({ has: page.getByRole('cell') })
  await expect(rows).toHaveCount(2)
  await page.getByRole('combobox', { name: 'Filter by category' }).click()
  await page.getByRole('option', { name: 'Software', exact: true }).click()
  await expect(rows).toHaveCount(1)
  await expect(rows).toContainText('Work plan')
  await page
    .getByRole('radiogroup', { name: 'Filter by status' })
    .getByRole('radio', { name: 'Paused', exact: true })
    .click()
  await page.getByRole('combobox', { name: 'Filter by billing cycle' }).click()
  await page.getByRole('option', { name: 'Yearly', exact: true }).click()
  await page.getByRole('textbox', { name: 'Search subscriptions' }).fill('no matches')
  await expect(page.getByText('No matching subscriptions', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Clear filters' }).click()
  await expect(rows).toHaveCount(2)
})
