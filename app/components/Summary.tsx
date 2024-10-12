import type React from 'react'
import { NumberTicker } from '~/components/number-ticker'
import { Card, CardContent } from '~/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import type { CURRENCY_RATES } from '~/constants/currencyRates'
import { usePreferencesStore } from '~/stores/preferences'

interface SummaryProps {
  totals: { [key: string]: number }
  currencyRates: typeof CURRENCY_RATES
}

const Summary: React.FC<SummaryProps> = ({ totals, currencyRates }) => {
  const { selectedCurrency, setSelectedCurrency } = usePreferencesStore()

  const calculateTotal = () => {
    const totalUSD = Object.entries(totals).reduce((acc, [currency, amount]) => {
      return acc + amount / currencyRates[currency as keyof typeof currencyRates]
    }, 0)
    return totalUSD * currencyRates[selectedCurrency as keyof typeof currencyRates]
  }

  const convertedTotal = calculateTotal()

  return (
    <Card className="mb-6 bg-white shadow-lg">
      <CardContent className="p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-slate-800">Summary</h2>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          {Object.entries(totals).map(([currency, total]) => (
            <div key={currency} className="flex items-center bg-slate-100 rounded-lg p-2 sm:p-3 shadow-sm">
              <span className="font-semibold mr-1 text-slate-700 text-sm">{currency}:</span>
              <p className="text-base sm:text-lg font-bold text-slate-800">{total.toFixed(0)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-slate-700">Total:</span>
            <div className="flex items-center">
              <NumberTicker
                decimalPlaces={2}
                value={convertedTotal}
                className="text-xl sm:text-2xl font-bold text-slate-800 mr-2"
              />
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(currencyRates).map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default Summary
