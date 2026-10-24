import { z } from 'zod'

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

export const currencySchema = z
  .string()
  .regex(/^[A-Z]{3}$/)
  .refine((currency) => Intl.supportedValuesOf('currency').includes(currency), 'Unsupported currency')

export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const [year, month, day] = value.split('-').map(Number)
    const date = new Date(year, month - 1, day, 12)
    return (
      year >= 1900 &&
      year <= 9999 &&
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    )
  }, 'Invalid calendar date')

export const inputSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    price: z.number().finite().min(0).max(1_000_000_000),
    currency: currencySchema,
    domain: z
      .string()
      .trim()
      .max(2048)
      .default('')
      .refine((value) => {
        if (!value) return true
        try {
          let address = value
          if (!address.includes('://')) address = `https://${address}`
          const url = new URL(address)
          return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password
        } catch {
          return false
        }
      }, 'Domain must be an HTTP(S) address'),
    category: z.string().trim().min(1).max(100).default('Other'),
    billingCycle: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).default('monthly'),
    nextPaymentDate: z.union([dateSchema, z.literal('')]).default(''),
    status: z.enum(['active', 'paused', 'cancelled']).default('active'),
    trialEndsAt: dateSchema.nullable().default(null),
    notes: z.string().max(10000).default(''),
    icon: z.string().max(2048).optional(),
  })
  .strict()

export const preferencesSchema = z
  .object({
    currency: currencySchema,
    monthlyBudget: z.number().finite().min(0).max(1_000_000_000),
    theme: z.enum(['system', 'light', 'dark']),
  })
  .strict()

export function exponent(currency: string): number {
  return new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2
}

export function toMinor(price: number, currency: string): number {
  return Math.round((price + Number.EPSILON) * 10 ** exponent(currency))
}

export function assertMoneyPrecision(price: number, currency: string): void {
  const scaled = price * 10 ** exponent(currency)
  if (
    !Number.isSafeInteger(toMinor(price, currency)) ||
    Math.abs(scaled - Math.round(scaled)) > Number.EPSILON * Math.max(1, Math.abs(scaled)) * 4
  ) {
    throw new HttpError(400, `Price must use at most ${exponent(currency)} decimal places for ${currency}`)
  }
}

export async function readBody(request: Request): Promise<unknown> {
  const limit = 2 * 1024 * 1024
  if (Number(request.headers.get('content-length')) > limit) throw new HttpError(413, 'Request body exceeds 2 MB')
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))
    throw new HttpError(415, 'Content-Type must be application/json')
  if (!request.body) throw new HttpError(400, 'JSON body required')
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  while (true) {
    const chunk = await reader.read()
    if (chunk.done) break
    size += chunk.value.byteLength
    if (size > limit) {
      await reader.cancel()
      throw new HttpError(413, 'Request body exceeds 2 MB')
    }
    chunks.push(chunk.value)
  }
  const buffer = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    buffer.set(chunk, offset)
    offset += chunk.byteLength
  }
  try {
    return JSON.parse(new TextDecoder().decode(buffer))
  } catch {
    throw new HttpError(400, 'Invalid JSON')
  }
}
