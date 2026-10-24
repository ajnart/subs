import {
  collection,
  createSubscription,
  expect,
  headers,
  origin,
  pin,
  revisionHeaders,
  subscription,
  test,
} from '../helpers'

test('create and edit through the browser persist on the server without browser storage', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Add your first subscription', { exact: true })).toBeVisible()
  expect((await collection(page.request)).subscriptions).toEqual([])
  await page.getByRole('button', { name: /Add subscription/ }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Service name').fill('My real plan')
  await dialog.getByLabel('Price per billing cycle').fill('19.99')
  await dialog.getByLabel('Next payment (optional)', { exact: true }).fill('2030-01-31')
  await dialog.locator('summary').click()
  await dialog.getByLabel('Notes', { exact: true }).fill('Annual review reminder')
  await dialog.getByRole('button', { name: 'Save subscription' }).click()
  await expect(dialog).not.toBeVisible()
  const saved = (await collection(page.request)).subscriptions[0]
  expect(saved).toMatchObject({ name: 'My real plan', price: 19.99, notes: 'Annual review reminder' })
  await page.getByRole('button', { name: 'Manage', exact: true }).click()
  await dialog.getByLabel('Service name').fill('Renamed plan')
  await dialog.getByLabel('Price per billing cycle').fill('24.99')
  await dialog.getByRole('button', { name: 'Save subscription' }).click()
  await expect(dialog).not.toBeVisible()
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await expect(page.getByText('Renamed plan', { exact: true })).toBeVisible()
  expect((await collection(page.request)).subscriptions).toEqual([
    expect.objectContaining({ id: saved.id, name: 'Renamed plan', price: 24.99 }),
  ])
})

test('preferences save from the UI and survive a reload', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'Settings' }).click()
  await page.getByLabel('Monthly budget', { exact: true }).fill('150')
  await page.getByRole('button', { name: 'Save preferences' }).click()
  await expect(page.getByText('Preferences saved', { exact: true })).toBeVisible()
  await page.reload()
  expect((await collection(page.request)).preferences).toMatchObject({ currency: 'USD', monthlyBudget: 150 })
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'Settings' }).click()
  await expect(page.getByLabel('Monthly budget', { exact: true })).toHaveValue('150')
})

test('backup upload is preview-only until explicit confirmation', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name: 'Settings' }).click()
  await page.getByLabel('Choose backup file').setInputFiles({
    name: 'legacy.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify([{ name: 'Imported from browser', price: 8, currency: 'USD' }])),
  })
  await expect(page.getByRole('dialog')).toBeVisible()
  expect((await collection(page.request)).subscriptions).toEqual([])
  await page.getByRole('button', { name: 'Confirm import' }).click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  expect((await collection(page.request)).subscriptions).toEqual([
    expect.objectContaining({ name: 'Imported from browser', price: 8 }),
  ])
})

test('private reads reject anonymous clients and cross-origin mutations cannot change data', async ({
  playwright,
  context,
}) => {
  const saved = await createSubscription(context.request)
  const anonymous = await playwright.request.newContext({ baseURL: origin, storageState: { cookies: [], origins: [] } })
  try {
    for (const endpoint of ['/api/data', '/api/export', '/api/rates']) {
      const response = await anonymous.get(endpoint)
      expect(response.status()).toBe(401)
      expect(await response.json()).toEqual({ error: expect.any(String) })
    }
    const status = await anonymous.get('/api/status')
    expect(await status.json()).toEqual({ setupRequired: false, authenticated: false, authDisabled: false })
    const before = await collection(context.request)
    const mutationHeaders = await revisionHeaders(context.request)
    const attempts = [
      context.request.patch(`/api/subscriptions/${saved.id}`, {
        headers: { ...mutationHeaders, Origin: 'https://attacker.example' },
        data: { price: 0 },
      }),
      context.request.delete(`/api/subscriptions/${saved.id}`, {
        headers: { 'If-Match': mutationHeaders['If-Match'] },
      }),
      context.request.post('/api/import', {
        headers: { ...mutationHeaders, 'Sec-Fetch-Site': 'cross-site' },
        data: { data: [], mode: 'replace' },
      }),
    ]
    for (const response of await Promise.all(attempts)) expect(response.status()).toBe(403)
    expect(await collection(context.request)).toEqual(before)
  } finally {
    await anonymous.dispose()
  }
})

test('mutations require revisions and stale writes or destructive previews cannot overwrite newer data', async ({
  context,
}) => {
  const saved = await createSubscription(context.request)
  const before = await collection(context.request)
  const unguarded = [
    await context.request.post('/api/subscriptions', { headers, data: subscription() }),
    await context.request.patch(`/api/subscriptions/${saved.id}`, { headers, data: { price: 1 } }),
    await context.request.delete(`/api/subscriptions/${saved.id}`, { headers }),
    await context.request.patch('/api/preferences', { headers, data: { monthlyBudget: 25 } }),
    await context.request.post('/api/import', { headers, data: { data: [], mode: 'replace' } }),
  ]
  for (const response of unguarded) {
    expect(response.status(), await response.text()).toBe(428)
    expect(await response.json()).toEqual({ error: expect.any(String) })
  }
  expect(await collection(context.request)).toEqual(before)
  const preview = await context.request.post('/api/import/preview', { headers, data: { data: [] } })
  const previewHeaders = await revisionHeaders(context.request, preview)
  const updated = await context.request.patch('/api/preferences', {
    headers: previewHeaders,
    data: { monthlyBudget: 25 },
  })
  expect(updated.ok(), await updated.text()).toBeTruthy()
  expect(updated.headers().etag).toBeTruthy()
  expect(updated.headers().etag).not.toBe(previewHeaders['If-Match'])
  const committed = await collection(context.request)
  const staleWrite = await context.request.patch(`/api/subscriptions/${saved.id}`, {
    headers: previewHeaders,
    data: { price: 1 },
  })
  expect(staleWrite.status()).toBe(409)
  const staleImport = await context.request.post('/api/import', {
    headers: previewHeaders,
    data: { data: [], mode: 'replace' },
  })
  expect(staleImport.status()).toBe(409)
  expect(await collection(context.request)).toEqual(committed)
})

test('login uses a protected cookie and logout revokes the session', async ({ playwright }) => {
  const client = await playwright.request.newContext({ baseURL: origin, storageState: { cookies: [], origins: [] } })
  try {
    const status = await client.get('/api/status')
    expect(await status.json()).toMatchObject({ authenticated: false, authDisabled: false })
    const wrong = await client.post('/api/login', { headers, data: { pin: '000000' } })
    expect(wrong.status()).toBe(401)
    const login = await client.post('/api/login', { headers, data: { pin } })
    expect(login.ok(), await login.text()).toBeTruthy()
    expect(login.headers()['set-cookie']).toMatch(/HttpOnly/i)
    expect(login.headers()['set-cookie']).toMatch(/SameSite=Strict/i)
    expect((await client.get('/api/data')).ok()).toBeTruthy()
    const logout = await client.post('/api/logout', { headers })
    expect(logout.ok()).toBeTruthy()
    expect((await client.get('/api/data')).status()).toBe(401)
  } finally {
    await client.dispose()
  }
})
