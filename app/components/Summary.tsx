import type React from 'react'
import { NumberTicker } from '~/components/number-ticker'
import { Card, CardContent } from '~/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { type CURRENCY_RATES, LAST_UPDATED } from '~/constants/currencyRates'
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
    <Card className="mb-6 bg-card shadow-lg">
      <CardContent className="p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-foreground">Summary</h2>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          {Object.entries(totals).map(([currency, total]) => (
            <div key={currency} className="flex items-center bg-muted rounded-lg p-2 sm:p-3 shadow-sm">
              <span className="font-semibold mr-1 text-muted-foreground text-sm">{currency}:</span>
              <p className="text-base sm:text-lg font-bold text-foreground">{total.toFixed(0)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground">Total</span>
              <span className="text-sm text-muted-foreground">Rates at {LAST_UPDATED}</span>
            </div>
            <div className="flex items-center">
              <NumberTicker
                decimalPlaces={2}
                value={convertedTotal}
                className="text-xl sm:text-2xl font-bold text-foreground mr-2"
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
