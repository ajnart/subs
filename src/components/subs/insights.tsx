import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Progress } from '@/components/ui/progress'
import { convertAmount, formatMoney, monthlyAmount } from '@/lib/subscriptions'
import type { AppData, ExchangeRates } from '@/lib/types'
import { projectedPayments } from './projections'
import { Notice } from './shared'

export function Insights({ data, rates }: { data: AppData; rates?: ExchangeRates }) {
  const [removed, setRemoved] = useState<string[]>([])
  const active = data.subscriptions.filter((item) => item.status === 'active')
  const { currency, monthlyBudget } = data.preferences
  const converted = active.map((item) => ({
    ...item,
    monthly: convertAmount(monthlyAmount(item), item.currency, currency, rates),
  }))
  const missing = converted.some((item) => item.monthly === null)
  const unavailable = converted.length > 0 && converted.every((item) => item.monthly === null)
  const total = converted.reduce((sum, item) => sum + (item.monthly ?? 0), 0)
  const savings = converted
    .filter((item) => removed.includes(item.id))
    .reduce((sum, item) => sum + (item.monthly ?? 0), 0)
  const categories = [...new Set(active.map((item) => item.category))]
    .map((category) => {
      const items = converted.filter((item) => item.category === category)
      const total = items.reduce((sum, item) => sum + (item.monthly ?? 0), 0)
      const partial = items.some((item) => item.monthly === null)
      const unavailable = items.every((item) => item.monthly === null)
      let label = formatMoney(total, currency)
      if (unavailable) label = 'Unavailable'
      else if (partial) label += ' +'
      return { category, total, label, unavailable }
    })
    .sort((a, b) => b.total - a.total)
  const start = new Date()
  const end = new Date(start)
  end.setDate(end.getDate() + 29)
  const forecast = projectedPayments(active, start, end)
  const forecastAmounts = forecast.map(({ subscription }) =>
    convertAmount(subscription.price, subscription.currency, currency, rates),
  )
  const forecastTotal = forecastAmounts.reduce<number>((sum, value) => sum + (value ?? 0), 0)
  let forecastLabel = formatMoney(forecastTotal, currency)
  if (forecastAmounts.length > 0 && forecastAmounts.every((value) => value === null)) forecastLabel = 'Unavailable'
  else if (forecastAmounts.some((value) => value === null)) forecastLabel += ' + unconverted charges'
  const estimateLabel = (amount: number) => {
    if (unavailable) return 'Unavailable'
    if (missing) return `${formatMoney(amount, currency)} +`
    return formatMoney(amount, currency)
  }
  let budgetNote = 'Set a monthly budget in Settings to give your spending a little direction.'
  if (monthlyBudget && unavailable)
    budgetNote = 'Spending cannot be compared with your budget until rates are available.'
  else if (monthlyBudget && total > monthlyBudget) {
    budgetNote = `${formatMoney(total - monthlyBudget, currency)} over budget`
    if (missing) budgetNote = `At least ${budgetNote}`
  } else if (monthlyBudget && missing) {
    budgetNote = `At most ${formatMoney(monthlyBudget - total, currency)} remains before unconverted charges.`
  } else if (monthlyBudget) budgetNote = `${formatMoney(monthlyBudget - total, currency)} remaining`
  return (
    <div className="flex flex-col gap-6">
      {missing && (
        <Notice title="Partial currency conversion">
          Some currencies have no exchange rate. Totals and savings below include only convertible subscriptions, not a
          complete spending estimate.
        </Notice>
      )}
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Where your money goes</CardTitle>
            <CardDescription>Monthly equivalents, grouped by category.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-5">
              {categories.length ? (
                categories.map((item) => (
                  <div key={item.category} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span>{item.category}</span>
                      <span className="font-medium tabular-nums">{item.label}</span>
                    </div>
                    {!item.unavailable && (
                      <Progress
                        value={total ? (item.total / total) * 100 : 0}
                        aria-label={`${item.category} share of monthly spending`}
                      />
                    )}
                  </div>
                ))
              ) : (
                <p className="py-6 text-sm text-muted-foreground">
                  Add an active subscription to see your spending mix.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your monthly budget</CardTitle>
              <CardDescription>A boundary, not a guilt trip.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-2xl font-semibold tracking-tight">{estimateLabel(total)}</span>
                  <span className="text-sm text-muted-foreground">
                    {monthlyBudget ? `of ${formatMoney(monthlyBudget, currency)}` : 'No budget set'}
                  </span>
                </div>
                {!unavailable && (
                  <Progress
                    value={monthlyBudget ? Math.min(100, (total / monthlyBudget) * 100) : 0}
                    aria-label="Monthly budget usage"
                  />
                )}
                <p className="text-xs text-muted-foreground">{budgetNote}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>On the horizon</CardTitle>
              <CardDescription>Projected charges in the next 30 days, including today.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tracking-tight">{forecastLabel}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {forecast.length} projected charges across {new Set(forecast.map((item) => item.subscription.id)).size}{' '}
                services. Includes repeated daily and weekly renewals; not a record of actual payments.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>What if you let a few go?</CardTitle>
            <Badge variant="outline">Just exploring · nothing changes</Badge>
          </div>
          <CardDescription>
            Select subscriptions to see potential savings. Your actual plans stay untouched.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-8 lg:grid-cols-[1fr_16rem]">
            <FieldSet>
              <FieldLegend className="sr-only">Subscriptions to exclude from estimate</FieldLegend>
              <FieldDescription>What could you live without?</FieldDescription>
              <FieldGroup className="grid gap-3 sm:grid-cols-2">
                {converted.map((item) => (
                  <Field key={item.id} orientation="horizontal" className="rounded-md border p-3">
                    <Checkbox
                      id={`saving-${item.id}`}
                      checked={removed.includes(item.id)}
                      disabled={item.monthly === null}
                      onCheckedChange={(checked) =>
                        setRemoved((previous) =>
                          checked ? [...previous, item.id] : previous.filter((id) => id !== item.id),
                        )
                      }
                    />
                    <FieldLabel htmlFor={`saving-${item.id}`} className="flex min-w-0 flex-1 justify-between gap-2">
                      <span className="truncate">{item.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {item.monthly === null ? 'No rate' : `${formatMoney(item.monthly, currency)}/mo`}
                      </span>
                    </FieldLabel>
                  </Field>
                ))}
              </FieldGroup>
            </FieldSet>
            <div className="flex flex-col justify-center gap-2 rounded-md bg-muted/50 p-6">
              <p className="text-xs font-medium text-muted-foreground">Potential monthly savings</p>
              <p className="text-3xl font-semibold tracking-tight">{formatMoney(savings, currency)}</p>
              <p className="text-sm text-muted-foreground">That’s {formatMoney(savings * 12, currency)} a year.</p>
              <p className="mt-3 text-xs text-muted-foreground">
                New monthly estimate: {estimateLabel(total - savings)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
