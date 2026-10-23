import type { BillingCycle } from '~/store/subscriptionStore'

function toCalendarDate(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
}

function parseCalendarDate(date: string): Date {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function addMonthlyOccurrence(date: Date, dayOfMonth: number): Date {
  const nextMonth = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1))
  const lastDayOfMonth = new Date(Date.UTC(nextMonth.getUTCFullYear(), nextMonth.getUTCMonth() + 1, 0)).getUTCDate()
  nextMonth.setUTCDate(Math.min(dayOfMonth, lastDayOfMonth))
  return nextMonth
}

/**
 * Calculate the next payment date based on billing cycle and current date
 * Ensures the returned date is always in the future
 */
export function calculateNextPaymentDate(
  billingCycle: BillingCycle | undefined,
  currentNextPaymentDate?: string,
  now = new Date(),
): string | undefined {
  if (!billingCycle) {
    return undefined
  }

  const today = toCalendarDate(now)
  let nextDate: Date

  // If we have a current next payment date, use it as the base
  if (currentNextPaymentDate) {
    nextDate = parseCalendarDate(currentNextPaymentDate)

    // If the date is in the future, keep it
    if (nextDate > today) {
      return currentNextPaymentDate
    }

    // Otherwise, calculate the next occurrence
    nextDate = getNextOccurrence(nextDate, billingCycle, today)
  } else {
    // No existing date, calculate from today
    nextDate = getNextOccurrence(today, billingCycle, today)
  }

  return nextDate.toISOString().split('T')[0] // Return YYYY-MM-DD format
}

/**
 * Get the next occurrence of a payment date after the current date
 */
function getNextOccurrence(baseDate: Date, billingCycle: BillingCycle, today: Date): Date {
  let result = new Date(baseDate)

  switch (billingCycle) {
    case 'daily':
      // Add days until we're in the future
      while (result <= today) {
        result.setUTCDate(result.getUTCDate() + 1)
      }
      break

    case 'weekly':
      // Add weeks until we're in the future
      while (result <= today) {
        result.setUTCDate(result.getUTCDate() + 7)
      }
      break

    case 'monthly': {
      // Keep the original day when catching up; clamp months without that day.
      const dayOfMonth = result.getUTCDate()
      while (result <= today) {
        result = addMonthlyOccurrence(result, dayOfMonth)
      }
      break
    }

    case 'yearly':
      // Add years until we're in the future
      while (result <= today) {
        result.setUTCFullYear(result.getUTCFullYear() + 1)
      }
      break
  }

  return result
}

/**
 * Initialize a next payment date from today based on billing cycle
 */
export function initializeNextPaymentDate(
  billingCycle: BillingCycle | undefined,
  now = new Date(),
): string | undefined {
  if (!billingCycle) {
    return undefined
  }

  const nextDate = toCalendarDate(now)

  switch (billingCycle) {
    case 'daily':
      nextDate.setUTCDate(nextDate.getUTCDate() + 1)
      break

    case 'weekly':
      nextDate.setUTCDate(nextDate.getUTCDate() + 7)
      break

    case 'monthly':
      return addMonthlyOccurrence(nextDate, nextDate.getUTCDate()).toISOString().split('T')[0]

    case 'yearly':
      nextDate.setUTCFullYear(nextDate.getUTCFullYear() + 1)
      break
  }

  return nextDate.toISOString().split('T')[0]
}
