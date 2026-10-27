import { SUBSCRIPTION_CATEGORIES, type Subscription } from '~/store/subscriptionStore'
import { normalizePaymentDate } from '~/utils/nextPaymentDate'

export interface RowValidationResult {
  index: number
  /** The raw row data (may be partial / malformed) */
  raw: unknown
  valid: boolean
  errors: string[]
  /** Populated only when the row is valid */
  subscription?: Subscription
}

export interface ImportValidationReport {
  rows: RowValidationResult[]
  validCount: number
  invalidCount: number
}

const VALID_BILLING_CYCLES = ['monthly', 'yearly', 'weekly', 'daily'] as const

/**
 * Validate a single raw row object and return detailed per-field errors.
 */
function validateRow(raw: unknown, index: number): RowValidationResult {
  const errors: string[] = []

  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { index, raw, valid: false, errors: ['Row must be a JSON object'] }
  }

  const row = raw as Record<string, unknown>

  // id – accept missing (we'll assign a new one) but must be string if present
  if (row.id !== undefined && typeof row.id !== 'string') {
    errors.push('id must be a string')
  }

  // name – required string
  if (typeof row.name !== 'string' || row.name.trim() === '') {
    errors.push('name is required and must be a non-empty string')
  }

  // price – required positive number
  if (typeof row.price !== 'number' || !Number.isFinite(row.price) || row.price < 0) {
    errors.push('price must be a non-negative number')
  }

  // currency – required string
  if (typeof row.currency !== 'string' || row.currency.trim() === '') {
    errors.push('currency is required and must be a non-empty string')
  }

  // domain – required string
  if (typeof row.domain !== 'string' || row.domain.trim() === '') {
    errors.push('domain is required and must be a non-empty string')
  }

  // billingCycle – optional but must be one of the valid values
  if (
    row.billingCycle !== undefined &&
    !VALID_BILLING_CYCLES.includes(row.billingCycle as (typeof VALID_BILLING_CYCLES)[number])
  ) {
    errors.push(`billingCycle must be one of: ${VALID_BILLING_CYCLES.join(', ')}`)
  }

  // nextPaymentDate – optional ISO date string
  if (row.nextPaymentDate !== undefined) {
    if (typeof row.nextPaymentDate !== 'string') {
      errors.push('nextPaymentDate must be a string')
    } else if (Number.isNaN(Date.parse(row.nextPaymentDate))) {
      errors.push('nextPaymentDate must be a valid ISO date string')
    }
  }

  // renewalDayOfMonth – optional original monthly schedule day
  if (
    row.renewalDayOfMonth !== undefined &&
    (!Number.isInteger(row.renewalDayOfMonth) ||
      (row.renewalDayOfMonth as number) < 1 ||
      (row.renewalDayOfMonth as number) > 31)
  ) {
    errors.push('renewalDayOfMonth must be an integer from 1 to 31')
  }

  // showNextPayment – optional boolean
  if (row.showNextPayment !== undefined && typeof row.showNextPayment !== 'boolean') {
    errors.push('showNextPayment must be a boolean')
  }

  // icon – optional string
  if (row.icon !== undefined && typeof row.icon !== 'string') {
    errors.push('icon must be a string')
  }

  // category – optional, must be one of the defined categories
  if (
    row.category !== undefined &&
    !SUBSCRIPTION_CATEGORIES.includes(row.category as (typeof SUBSCRIPTION_CATEGORIES)[number])
  ) {
    errors.push(`category must be one of: ${SUBSCRIPTION_CATEGORIES.join(', ')}`)
  }

  if (errors.length > 0) {
    return { index, raw, valid: false, errors }
  }

  const subscription: Subscription = {
    id: typeof row.id === 'string' && row.id.trim() !== '' ? row.id : crypto.randomUUID(),
    name: (row.name as string).trim(),
    price: row.price as number,
    currency: (row.currency as string).trim().toUpperCase(),
    domain: (row.domain as string).trim(),
    ...(row.icon !== undefined ? { icon: row.icon as string } : {}),
    ...(row.billingCycle !== undefined ? { billingCycle: row.billingCycle as Subscription['billingCycle'] } : {}),
    ...(row.nextPaymentDate !== undefined
      ? { nextPaymentDate: normalizePaymentDate(row.nextPaymentDate as string) }
      : {}),
    ...(row.renewalDayOfMonth !== undefined ? { renewalDayOfMonth: row.renewalDayOfMonth as number } : {}),
    ...(row.showNextPayment !== undefined ? { showNextPayment: row.showNextPayment as boolean } : {}),
    ...(row.category !== undefined ? { category: row.category as Subscription['category'] } : {}),
  }

  return { index, raw, valid: true, errors: [], subscription }
}

/**
 * Parse raw JSON text and validate every row independently.
 * Returns a full report with per-row results plus aggregate counts.
 */
export function validateImportData(jsonText: string): ImportValidationReport {
  let parsed: unknown

  try {
    parsed = JSON.parse(jsonText)
  } catch {
    const row: RowValidationResult = { index: 0, raw: jsonText, valid: false, errors: ['File is not valid JSON'] }
    return { rows: [row], validCount: 0, invalidCount: 1 }
  }

  if (!Array.isArray(parsed)) {
    const row: RowValidationResult = {
      index: 0,
      raw: parsed,
      valid: false,
      errors: ['Root value must be a JSON array of subscriptions'],
    }
    return { rows: [row], validCount: 0, invalidCount: 1 }
  }

  const rows = parsed.map((item, i) => validateRow(item, i))
  const validCount = rows.filter((r) => r.valid).length
  const invalidCount = rows.length - validCount

  return { rows, validCount, invalidCount }
}

/** Extract valid subscriptions from a report */
export function getValidSubscriptions(report: ImportValidationReport): Subscription[] {
  return report.rows.filter((r) => r.valid).map((r) => r.subscription as Subscription)
}
