import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { dateLabel, formatMoney } from '@/lib/subscriptions'
import type { Subscription } from '@/lib/types'
import { cn } from '@/lib/utils'
import { dateKey as iso, projectedPayments } from './projections'
import { ServiceMark } from './shared'

export function CalendarView({
  subscriptions,
  onEdit,
}: {
  subscriptions: Subscription[]
  onEdit: (subscription: Subscription) => void
}) {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1, 12))
  const [selected, setSelected] = useState<string | null>(null)
  const payments = useMemo(() => {
    const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0, 12)
    const result: { date: string; subscription: Subscription; trial: boolean }[] = projectedPayments(
      subscriptions,
      month,
      endDate,
    ).map((payment) => ({ ...payment, trial: false }))
    const end = iso(endDate)
    for (const subscription of subscriptions) {
      if (subscription.status !== 'active') continue
      if (subscription.trialEndsAt && subscription.trialEndsAt >= iso(month) && subscription.trialEndsAt <= end)
        result.push({ date: subscription.trialEndsAt, subscription, trial: true })
    }
    return result.sort((a, b) => a.date.localeCompare(b.date))
  }, [subscriptions, month])
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const offset = (month.getDay() + 6) % 7
  const visible = payments.filter((payment) => !selected || payment.date === selected)
  const changeMonth = (amount: number) => {
    setMonth(new Date(month.getFullYear(), month.getMonth() + amount, 1, 12))
    setSelected(null)
  }
  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(16rem,1fr)]">
      <Card className="min-w-0">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>{month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</CardTitle>
              <CardDescription>A little foresight for your finances.</CardDescription>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" aria-label="Previous month" onClick={() => changeMonth(-1)}>
                <CaretLeftIcon />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1, 12))
                  setSelected(null)
                }}
              >
                Today
              </Button>
              <Button variant="outline" size="icon" aria-label="Next month" onClick={() => changeMonth(1)}>
                <CaretRightIcon />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <span key={day} className="pb-3 text-center text-xs text-muted-foreground">
                {day}
              </span>
            ))}
            {offset > 0 && <div style={{ gridColumn: `span ${offset}` }} />}
            {Array.from({ length: days }, (_, index) => {
              const date = iso(new Date(month.getFullYear(), month.getMonth(), index + 1, 12))
              const daily = payments.filter((item) => item.date === date)
              return (
                <Button
                  key={date}
                  variant={selected === date ? 'secondary' : 'ghost'}
                  onClick={() => setSelected((previous) => (previous === date ? null : date))}
                  className="h-20 min-w-0 flex-col justify-start gap-2 rounded-none px-1 py-2 sm:h-24"
                  aria-label={`${dateLabel(date)}, ${daily.length} payments and trial deadlines`}
                  aria-pressed={selected === date}
                >
                  <span
                    className={cn(
                      'flex size-6 items-center justify-center',
                      date === iso(new Date()) && 'rounded-full bg-primary text-primary-foreground',
                    )}
                  >
                    {index + 1}
                  </span>
                  {daily.length > 0 && (
                    <>
                      <span className="hidden max-w-full truncate text-[10px] text-muted-foreground sm:block">
                        {daily[0].subscription.name}
                        {daily.length > 1 && ` +${daily.length - 1}`}
                      </span>
                      <span className="size-1 rounded-full bg-primary sm:hidden" />
                    </>
                  )}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>{selected ? dateLabel(selected) : 'Payments & trial deadlines'}</CardTitle>
            <Badge variant="secondary">{visible.length}</Badge>
          </div>
          <CardDescription>
            {selected
              ? 'Click the date again to see the full month.'
              : 'Projected charges and decisions to make, in order.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex max-h-[32rem] flex-col gap-1 overflow-y-auto">
            {visible.length ? (
              visible.map(({ date, subscription, trial }) => (
                <button
                  key={`${subscription.id}-${date}-${trial}`}
                  type="button"
                  onClick={() => onEdit(subscription)}
                  className="flex items-center gap-3 rounded-md p-2 text-left hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ServiceMark name={subscription.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{subscription.name}</p>
                    <p className="text-xs text-muted-foreground">{dateLabel(date)}</p>
                  </div>
                  {trial ? (
                    <Badge variant="outline">Trial ends</Badge>
                  ) : (
                    <span className="text-sm tabular-nums">
                      {formatMoney(subscription.price, subscription.currency)}
                    </span>
                  )}
                </button>
              ))
            ) : (
              <p className="py-8 text-sm text-muted-foreground">No payments scheduled. A little breathing room.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
