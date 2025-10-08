import type { BillingCycle } from '~/store/subscriptionStore'

/**
 * Calculate the next payment date based on billing cycle and current date
 * Ensures the returned date is always in the future
 */
export function calculateNextPaymentDate(
  billingCycle: BillingCycle | undefined,
  paymentDay: number | undefined,
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
    nextDate = getNextOccurrence(nextDate, billingCycle, paymentDay, now)
  } else {
    // No existing date, calculate from now
    nextDate = getNextOccurrence(now, billingCycle, paymentDay, now)
  }

  return nextDate.toISOString().split('T')[0] // Return YYYY-MM-DD format
}

/**
 * Get the next occurrence of a payment date after the current date
 */
function getNextOccurrence(
  baseDate: Date,
  billingCycle: BillingCycle,
  paymentDay: number | undefined,
  now: Date,
): Date {
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
      // For monthly, respect the paymentDay if provided
      if (paymentDay !== undefined && paymentDay >= 1 && paymentDay <= 31) {
        // Start from now and find the next occurrence of paymentDay
        result.setFullYear(now.getFullYear())
        result.setMonth(now.getMonth())
        result.setDate(Math.min(paymentDay, getLastDayOfMonth(result.getFullYear(), result.getMonth())))
        
        // If this date is in the past, move to next month
        while (result <= now) {
          result.setMonth(result.getMonth() + 1)
          result.setDate(Math.min(paymentDay, getLastDayOfMonth(result.getFullYear(), result.getMonth())))
        }
      } else {
        // No specific day, just add months until we're in the future
        while (result <= now) {
          result.setMonth(result.getMonth() + 1)
        }
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
 * Get the last day of a given month
 */
function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/**
 * Initialize a next payment date from today based on billing cycle
 */
export function initializeNextPaymentDate(
  billingCycle: BillingCycle | undefined,
  paymentDay?: number,
): string | undefined {
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
      if (paymentDay !== undefined && paymentDay >= 1 && paymentDay <= 31) {
        nextDate.setMonth(nextDate.getMonth() + 1)
        nextDate.setDate(Math.min(paymentDay, getLastDayOfMonth(nextDate.getFullYear(), nextDate.getMonth())))
      } else {
        nextDate.setMonth(nextDate.getMonth() + 1)
      }
      break

    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1)
      break
  }

  return nextDate.toISOString().split('T')[0]
}
