import { expect, test } from '../helpers'

test('global shortcuts add, search and show help outside text inputs', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.keyboard.press('n')
  await expect(page.getByRole('dialog')).toContainText('Add a subscription')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await page.keyboard.press('/')
  await expect(page.getByRole('textbox', { name: 'Search subscriptions' })).toBeFocused()
  await page.getByRole('heading', { level: 1 }).click()
  await page.keyboard.press('?')
  await expect(page.getByRole('dialog')).toContainText('Shortcuts work when you’re not typing in a field.')
})

test('typing shortcut characters in search and notes never opens another dialog', async ({ page }) => {
  await page.goto('/')
  const search = page.getByRole('textbox', { name: 'Search subscriptions' })
  await search.fill('')
  await search.pressSequentially('na/?')
  await expect(search).toHaveValue('na/?')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await page.getByRole('button', { name: /Add subscription/ }).click()
  const notes = page.getByRole('dialog').getByLabel('Notes', { exact: true })
  await notes.pressSequentially('na/?')
  await expect(notes).toHaveValue('na/?')
  await expect(page.getByRole('dialog')).toHaveCount(1)
})
