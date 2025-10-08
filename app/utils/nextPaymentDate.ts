import type { BillingCycle } from '~/store/subscriptionStore'

/**
 * Calculate the next payment date based on billing cycle and current date
 * Ensures the returned date is always in the future
 */
export function calculateNextPaymentDate(
  billingCycle: BillingCycle | undefined,
  currentNextPaymentDate?: string,
): string | undefined {
  if (!billingCycle) {
    return undefined
  }

  const now = new Date()
  let nextDate: Date

  // If we have a current next payment date, use it as the base
  if (currentNextPaymentDate) {
    nextDate = new Date(currentNextPaymentDate)

    // If the date is in the future, keep it
    if (nextDate > now) {
      return currentNextPaymentDate
    }

    // Otherwise, calculate the next occurrence
    nextDate = getNextOccurrence(nextDate, billingCycle, now)
  } else {
    // No existing date, calculate from now
    nextDate = getNextOccurrence(now, billingCycle, now)
  }

  return nextDate.toISOString().split('T')[0] // Return YYYY-MM-DD format
}

/**
 * Get the next occurrence of a payment date after the current date
 */
function getNextOccurrence(baseDate: Date, billingCycle: BillingCycle, now: Date): Date {
  const result = new Date(baseDate)

  switch (billingCycle) {
    case 'daily':
      // Add days until we're in the future
      while (result <= now) {
        result.setDate(result.getDate() + 1)
      }
      break

    case 'weekly':
      // Add weeks until we're in the future
      while (result <= now) {
        result.setDate(result.getDate() + 7)
      }
      break

    case 'monthly':
      // Add months until we're in the future
      while (result <= now) {
        result.setMonth(result.getMonth() + 1)
      }
      break

    case 'yearly':
      // Add years until we're in the future
      while (result <= now) {
        result.setFullYear(result.getFullYear() + 1)
      }
      break
  }

  return result
}

/**
 * Initialize a next payment date from today based on billing cycle
 */
export function initializeNextPaymentDate(billingCycle: BillingCycle | undefined): string | undefined {
  if (!billingCycle) {
    return undefined
  }

  const now = new Date()
  const nextDate = new Date(now)

  switch (billingCycle) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1)
      break

    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7)
      break

    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1)
      break

    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1)
      break
  }

  return nextDate.toISOString().split('T')[0]
}
