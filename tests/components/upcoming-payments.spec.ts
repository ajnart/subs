import { createSubscription, expect, test } from '../helpers'

test('upcoming charges are ordered, include today and exclude paused and cancelled plans', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2030-01-30T12:00:00Z'))
  await createSubscription(page.request, { name: 'Tomorrow plan', nextPaymentDate: '2030-01-31' })
  await createSubscription(page.request, { name: 'Today plan', nextPaymentDate: '2030-01-30' })
  await createSubscription(page.request, { name: 'Paused plan', status: 'paused', nextPaymentDate: '2030-01-30' })
  await createSubscription(page.request, { name: 'Cancelled plan', status: 'cancelled', nextPaymentDate: '2030-01-30' })
  await createSubscription(page.request, { name: 'Undated plan', nextPaymentDate: '' })
  await page.goto('/')
  await page.locator('summary').filter({ hasText: 'Collection tools' }).click()
  const upcoming = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Coming up next' }) })
  const payments = upcoming.getByRole('button')
  await expect(payments).toHaveCount(2)
  await expect(payments.nth(0)).toContainText('Today plan')
  await expect(payments.nth(0)).toContainText('Today')
  await expect(payments.nth(1)).toContainText('Tomorrow plan')
  await expect(payments.nth(1)).toContainText('in 1d')
})

test('calendar clamps January 31 in February and restores March 31 without inactive plans', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2030-01-30T12:00:00Z'))
  await createSubscription(page.request, { name: 'Month end plan', nextPaymentDate: '2030-01-31' })
  await createSubscription(page.request, {
    name: 'Paused calendar plan',
    status: 'paused',
    nextPaymentDate: '2030-01-31',
  })
  await page.goto('/')
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'Calendar' }).click()
  await expect(
    page.getByRole('button', { name: 'Jan 31, 2030, 1 payments and trial deadlines', exact: true }),
  ).toBeVisible()
  await expect(page.getByText('Paused calendar plan', { exact: true })).not.toBeVisible()
  await page.getByRole('button', { name: 'Next month', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Feb 28, 2030, 1 payments and trial deadlines', exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Next month', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Mar 31, 2030, 1 payments and trial deadlines', exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Mar 31, 2030, 1 payments and trial deadlines', exact: true }).click()
  await expect(page.getByText('Click the date again to see the full month.')).toBeVisible()
})

test('yearly leap-day recurrence returns to February 29 in the next leap year', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2031-02-01T12:00:00Z'))
  await createSubscription(page.request, { name: 'Leap plan', billingCycle: 'yearly', nextPaymentDate: '2028-02-29' })
  await page.goto('/')
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'Calendar' }).click()
  await expect(
    page.getByRole('button', { name: 'Feb 28, 2031, 1 payments and trial deadlines', exact: true }),
  ).toBeVisible()
  for (let month = 0; month < 12; month += 1)
    await page.getByRole('button', { name: 'Next month', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Feb 29, 2032, 1 payments and trial deadlines', exact: true }),
  ).toBeVisible()
})
