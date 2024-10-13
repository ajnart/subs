import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const defaultRates = { USD: 1 };

export async function getExchangeRates(): Promise<Record<string, number>> {
  const url = 'https://api.frankfurter.app/latest?base=USD'; 

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return {};
  }
}

export function convertPrice(price: number, fromCurrency: string, toCurrency: string, rates: Record<string, number>): number {
  if (fromCurrency === toCurrency) return price;

  const fromRate = rates[fromCurrency];
  const toRate = rates[toCurrency];

  if (fromRate === undefined) {
    console.error(`Undefined exchange rate for currency: ${fromCurrency}`);
    return price;
  }

  if (toRate === undefined) {
    console.error(`Undefined exchange rate for currency: ${toCurrency}`);
    return price;
  }

  const rateInUSD = price / fromRate;
  return rateInUSD * toRate;
}

// 价格格式化函数
export function formatPrice(price: number, currency: string): string {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
  return `${formattedPrice} ${currency}`;
}
