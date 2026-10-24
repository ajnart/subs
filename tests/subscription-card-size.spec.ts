import { createSubscription, expect, test } from './helpers'

for (const viewport of [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
]) {
  test(`collection, calendar and entry fit a ${viewport.width}px viewport without horizontal overflow`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport)
    await createSubscription(page.request, {
      name: 'A deliberately long service name that should wrap or truncate instead of widening the page',
      price: 199.99,
    })
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    const navigation = page.getByRole('navigation', {
      name: viewport.width < 768 ? 'Mobile navigation' : 'Main navigation',
    })
    await navigation.getByRole('button', { name: 'Calendar' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Calendar')
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await page.getByRole('button', { name: /Add subscription/ }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    const box = await dialog.boundingBox()
    expect(box).not.toBeNull()
    if (!box) throw new Error('The subscription dialog has no visible bounds')
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width)
    await expect(dialog.getByRole('button', { name: 'Save subscription' })).toBeVisible()
  })
}
