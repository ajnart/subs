import { test, expect } from '@playwright/test'

test.describe('Subscription Card Height Consistency', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for the page to load
    await page.waitForSelector('[data-testid="subscription-card"]', { timeout: 10000 })
  })

  test('all subscription cards should have the same height', async ({ page }) => {
    // Get all subscription cards
    const cards = await page.locator('[data-testid="subscription-card"]').all()
    
    // Ensure we have at least 2 cards to compare
    expect(cards.length).toBeGreaterThanOrEqual(2)
    
    // Get heights of all cards
    const heights = await Promise.all(
      cards.map(async (card) => {
        const box = await card.boundingBox()
        return box?.height || 0
      })
    )
    
    // All heights should be the same (within 1px tolerance for rounding)
    const firstHeight = heights[0]
    for (let i = 1; i < heights.length; i++) {
      expect(Math.abs(heights[i] - firstHeight)).toBeLessThanOrEqual(1)
    }
  })

  test('card height should remain consistent after adding monthly billing', async ({ page }) => {
    // Get initial card heights
    const cardsBefore = await page.locator('[data-testid="subscription-card"]').all()
    const heightsBefore = await Promise.all(
      cardsBefore.map(async (card) => {
        const box = await card.boundingBox()
        return box?.height || 0
      })
    )
    
    // Click edit on the first subscription
    await page.locator('button:has-text("Edit")').first().click()
    
    // Wait for modal to open
    await page.waitForSelector('text=Edit Subscription', { timeout: 5000 })
    
    // Select monthly billing cycle
    await page.locator('[id="billingCycle"]').click()
    await page.locator('text=Monthly').click()
    
    // Enable next payment date
    await page.locator('switch:has-text("Show next payment date")').click()
    
    // Save the subscription
    await page.locator('button:has-text("Save")').click()
    
    // Wait for modal to close and page to update
    await page.waitForTimeout(1000)
    
    // Get card heights after adding billing info
    const cardsAfter = await page.locator('[data-testid="subscription-card"]').all()
    const heightsAfter = await Promise.all(
      cardsAfter.map(async (card) => {
        const box = await card.boundingBox()
        return box?.height || 0
      })
    )
    
    // All cards should still have the same height
    const firstHeightAfter = heightsAfter[0]
    for (let i = 1; i < heightsAfter.length; i++) {
      expect(Math.abs(heightsAfter[i] - firstHeightAfter)).toBeLessThanOrEqual(1)
    }
    
    // Heights should be consistent before and after
    expect(Math.abs(heightsAfter[0] - heightsBefore[0])).toBeLessThanOrEqual(1)
  })

  test('cards should have a square aspect ratio (approximately 1:1)', async ({ page }) => {
    // Get all subscription cards
    const cards = await page.locator('[data-testid="subscription-card"]').all()
    
    // Check aspect ratio for each card
    for (const card of cards) {
      const box = await card.boundingBox()
      if (box) {
        const aspectRatio = box.width / box.height
        // Aspect ratio should be close to 1 (square), allowing 10% tolerance
        expect(aspectRatio).toBeGreaterThan(0.9)
        expect(aspectRatio).toBeLessThan(1.1)
      }
    }
  })

  test('card with billing cycle badge should not be taller than others', async ({ page }) => {
    // Add a new subscription with monthly billing
    await page.locator('button:has-text("Add Subscription")').click()
    await page.waitForSelector('text=Add Subscription', { timeout: 5000 })
    
    // Fill in subscription details
    await page.locator('[id="name"]').fill('Test Subscription')
    await page.locator('[id="price"]').fill('9.99')
    await page.locator('[id="domain"]').fill('https://test.com')
    
    // Select monthly billing
    await page.locator('[id="billingCycle"]').click()
    await page.locator('text=Monthly').last().click()
    
    // Enable next payment
    await page.locator('switch:has-text("Show next payment date")').click()
    
    // Save
    await page.locator('button:has-text("Save")').click()
    
    // Wait for page to update
    await page.waitForTimeout(1000)
    
    // Get all card heights
    const cards = await page.locator('[data-testid="subscription-card"]').all()
    const heights = await Promise.all(
      cards.map(async (card) => {
        const box = await card.boundingBox()
        return box?.height || 0
      })
    )
    
    // All heights should be the same
    const firstHeight = heights[0]
    for (let i = 1; i < heights.length; i++) {
      expect(Math.abs(heights[i] - firstHeight)).toBeLessThanOrEqual(1)
    }
  })
})
