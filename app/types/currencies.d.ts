export interface CurrencyRates {
  amount: number
  base: string
  date: string
  rates: Record<string, number>
}

export type SupportedCurrency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'INR' | 'CNY' | 'SGD' | 'CHF'
