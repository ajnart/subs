import type { CurrencyRates } from '~/types/currencies'

const CACHE_TTL = 6 * 60 * 60 // 6 hours in seconds
const CACHE_KEY = 'currency-rates'

// Simple in-memory cache
let memoryCache: {
  data: CurrencyRates | null
  timestamp: number
} = {
  data: null,
  timestamp: 0,
}

export async function getCurrencyRates(force = false): Promise<CurrencyRates | null> {
  const now = Date.now()

  // Check memory cache first
  if (!force && memoryCache.data && now - memoryCache.timestamp < CACHE_TTL * 1000) {
    return memoryCache.data
  }

  try {
    console.info(`[server]: Fetching currency rates at ${new Date()}`)
    const response = await fetch(
      'https://api.frankfurter.app/latest?base=USD&symbols=USD,EUR,GBP,JPY,CAD,AUD,INR,CNY,SGD,CHF',
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch currency rates: ${response.statusText}`)
    }

    const data = (await response.json()) as CurrencyRates
    data.rates.USD = 1 // Add USD to ratess

    // Update memory cache
    memoryCache = {
      data,
      timestamp: now,
    }

    return data
  } catch (error) {
    console.error('Error fetching currency rates:', error)
    // Return cached data if available, even if expired
    return memoryCache.data
  }
}

export function getCacheHeaders(timestamp?: string) {
  const lastModified = timestamp ? new Date(timestamp) : new Date()

  return {
    'Cache-Control': `public, max-age=${CACHE_TTL}`,
    'Last-Modified': lastModified.toUTCString(),
    Vary: 'Accept-Encoding',
  }
}
