import { expect, test } from '@playwright/test'
import { calculateNextPaymentDate, initializeNextPaymentDate } from '../../app/utils/nextPaymentDate'

test.describe('monthly payment dates', () => {
  test('clamps a 31st renewal to February instead of skipping to March', () => {
    const january31 = new Date(2026, 0, 31, 12)
    const february15 = new Date(2026, 1, 15, 12)

    expect(initializeNextPaymentDate('monthly', january31)).toBe('2026-02-28')
    expect(calculateNextPaymentDate('monthly', '2026-01-31', february15)).toBe('2026-02-28')
  })

  test('keeps the original day when catching up across a short month', () => {
    const march15 = new Date(2026, 2, 15, 12)

    expect(calculateNextPaymentDate('monthly', '2026-01-31', march15)).toBe('2026-03-31')
  })
})
