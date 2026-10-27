import { expect, test } from '@playwright/test'
import {
  advancePaymentDate,
  calculateNextPaymentDate,
  initializeNextPaymentDate,
} from '../../app/utils/nextPaymentDate'

test.describe('monthly payment dates', () => {
  test('clamps a 31st renewal to February instead of skipping to March', () => {
    const january31 = new Date(Date.UTC(2026, 0, 31, 12))
    const february15 = new Date(Date.UTC(2026, 1, 15, 12))

    expect(initializeNextPaymentDate('monthly', january31)).toBe('2026-02-28')
    expect(calculateNextPaymentDate('monthly', '2026-01-31', undefined, february15)).toBe('2026-02-28')
  })

  test('keeps the original day when catching up across a short month', () => {
    const march15 = new Date(Date.UTC(2026, 2, 15, 12))

    expect(calculateNextPaymentDate('monthly', '2026-01-31', undefined, march15)).toBe('2026-03-31')
  })

  test('keeps the original day after a clamped date is persisted', () => {
    const march15 = new Date(Date.UTC(2026, 2, 15, 12))

    expect(calculateNextPaymentDate('monthly', '2026-02-28', 31, march15)).toBe('2026-03-31')
    expect(advancePaymentDate('2026-01-31', 'monthly', 31)).toBe('2026-02-28')
    expect(advancePaymentDate('2026-02-28', 'monthly', 31)).toBe('2026-03-31')
  })

  test('uses UTC fields for the reference calendar date', () => {
    const now = new Date('2026-03-01T00:30:00.000Z')

    expect(initializeNextPaymentDate('monthly', now)).toBe('2026-04-01')
    expect(calculateNextPaymentDate('monthly', '2026-03-01', undefined, now)).toBe('2026-04-01')
  })
})
