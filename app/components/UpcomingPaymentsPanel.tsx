import { CalendarCheck, CalendarClock } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import type { Subscription } from '~/store/subscriptionStore'
import { advancePaymentDate, calculateNextPaymentDate } from '~/utils/nextPaymentDate'

interface UpcomingPaymentsPanelProps {
  subscriptions: Subscription[]
  rates: Record<string, number> | null
  onMarkPaid: (id: string, nextDate: string) => void
}

function getUpcomingSubscriptions(
  subscriptions: Subscription[],
  withinDays: number,
): Array<{ sub: Subscription; nextDate: Date }> {
  const now = new Date()
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() + withinDays)

  const result: Array<{ sub: Subscription; nextDate: Date }> = []

  for (const sub of subscriptions) {
    if (!sub.showNextPayment || !sub.billingCycle) continue

    const dateStr = calculateNextPaymentDate(sub.billingCycle, sub.nextPaymentDate, sub.renewalDayOfMonth)
    if (!dateStr) continue

    const nextDate = new Date(dateStr)
    if (nextDate >= now && nextDate <= cutoff) {
      result.push({ sub, nextDate })
    }
  }

  return result.sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime())
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function PaymentRow({
  sub,
  nextDate,
  onMarkPaid,
}: {
  sub: Subscription
  nextDate: Date
  onMarkPaid: (id: string, nextDate: string) => void
}) {
  const handleMarkPaid = () => {
    if (!sub.billingCycle) return
    const currentDateStr = nextDate.toISOString().split('T')[0]
    const advanced = advancePaymentDate(currentDateStr, sub.billingCycle, sub.renewalDayOfMonth)
    onMarkPaid(sub.id, advanced)
  }

  const isToday = new Date().toDateString() === nextDate.toDateString()
  const isTomorrow = (() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toDateString() === nextDate.toDateString()
  })()

  const dateLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : formatDate(nextDate)

  return (
    <div className="flex items-center justify-between py-2 border-b last:border-b-0">
      <div className="flex items-center gap-3 min-w-0">
        {sub.icon ? (
          <img src={sub.icon} alt={sub.name} className="h-6 w-6 rounded object-contain flex-shrink-0" />
        ) : (
          <div className="h-6 w-6 rounded bg-muted flex-shrink-0" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{sub.name}</p>
          <p className="text-xs text-muted-foreground">{dateLabel}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        <span className="text-sm font-semibold">
          {sub.currency} {sub.price.toFixed(2)}
        </span>
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleMarkPaid}>
          Mark paid
        </Button>
      </div>
    </div>
  )
}

export default function UpcomingPaymentsPanel({ subscriptions, rates, onMarkPaid }: UpcomingPaymentsPanelProps) {
  const next7 = getUpcomingSubscriptions(subscriptions, 7)
  const next30 = getUpcomingSubscriptions(subscriptions, 30)
  // Items in next 8–30 days (exclude the 7-day ones to avoid duplicates)
  const next8to30 = next30.filter(({ sub }) => !next7.some((e) => e.sub.id === sub.id))

  if (next30.length === 0) return null

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarClock className="h-4 w-4" />
          Upcoming Payments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {next7.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1">
                <CalendarCheck className="h-3 w-3" />
                Next 7 days
              </p>
              {next7.map(({ sub, nextDate }) => (
                <PaymentRow key={sub.id} sub={sub} nextDate={nextDate} onMarkPaid={onMarkPaid} />
              ))}
            </div>
          )}
          {next8to30.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1">
                <CalendarClock className="h-3 w-3" />
                Next 30 days
              </p>
              {next8to30.map(({ sub, nextDate }) => (
                <PaymentRow key={sub.id} sub={sub} nextDate={nextDate} onMarkPaid={onMarkPaid} />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
