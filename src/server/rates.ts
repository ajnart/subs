import { z } from 'zod'
import type { ExchangeRates } from '../lib/types'
import { type Database, getMeta, setMeta } from './database'

const ratesSchema = z.object({
  base: z.literal('EUR'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  rates: z.record(z.string().regex(/^[A-Z]{3}$/), z.number().finite().positive()),
})

export async function getRates(db: Database): Promise<ExchangeRates> {
  const cached = await getMeta(db, 'exchange_rates')
  let previous: { fetchedAt: number; data: ExchangeRates } | undefined
  if (cached) previous = JSON.parse(cached) as typeof previous
  if (previous && Date.now() - previous.fetchedAt < 6 * 60 * 60 * 1000) return { ...previous.data, stale: false }
  const lastAttempt = Number(await getMeta(db, 'exchange_rates_attempt'))
  if (Date.now() - lastAttempt < 60_000) {
    if (previous) return { ...previous.data, stale: true }
    return { base: 'EUR', rates: { EUR: 1 }, updatedAt: null, stale: true }
  }
  await setMeta(db, 'exchange_rates_attempt', String(Date.now()))
  try {
    const response = await fetch('https://api.frankfurter.dev/v1/latest?base=EUR', {
      signal: AbortSignal.timeout(5000),
      redirect: 'error',
    })
    if (!response.ok) throw new Error(`Rate provider returned ${response.status}`)
    const parsed = ratesSchema.parse(await response.json())
    const data: ExchangeRates = {
      base: 'EUR',
      rates: { ...parsed.rates, EUR: 1 },
      updatedAt: `${parsed.date}T00:00:00.000Z`,
      stale: false,
    }
    await setMeta(db, 'exchange_rates', JSON.stringify({ fetchedAt: Date.now(), data }))
    return data
  } catch (error) {
    console.warn(
      'Exchange rate refresh failed; using cached rates when available',
      error instanceof Error ? error.message : 'Unknown provider error',
    )
    if (previous) return { ...previous.data, stale: true }
    return { base: 'EUR', rates: { EUR: 1 }, updatedAt: null, stale: true }
  }
}
