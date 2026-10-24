import {
  ListIcon,
  MagnifyingGlassIcon,
  PauseIcon,
  PlusIcon,
  SquaresFourIcon,
  TrashIcon,
  UploadSimpleIcon,
} from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { MagicCard } from '@/components/magicui/magic-card'
import { NumberTicker } from '@/components/magicui/number-ticker'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { isDemo } from '@/lib/mode'
import {
  convertAmount,
  dateLabel,
  formatMoney,
  monthlyAmount,
  nextPaymentDate,
  upcomingPayments,
} from '@/lib/subscriptions'
import { templates } from '@/lib/templates'
import type { ExchangeRates, Subscription } from '@/lib/types'
import { Choice, cycles, ServiceLink, ServiceMark } from './shared'

function paymentLabel(subscription: Subscription): string {
  if (subscription.status !== 'active') return subscription.status
  const date = nextPaymentDate(subscription)
  if (!date) return 'No payment date'
  return `Next ${dateLabel(date)}`
}

export function Summary({
  subscriptions,
  currency,
  rates,
}: {
  subscriptions: Subscription[]
  currency: string
  rates?: ExchangeRates
}) {
  const active = subscriptions.filter((item) => item.status === 'active')
  const amounts = active.map((item) => convertAmount(monthlyAmount(item), item.currency, currency, rates))
  const missing = amounts.some((item) => item === null)
  const monthly = amounts.reduce<number>((sum, item) => sum + (item ?? 0), 0)
  const next = upcomingPayments(subscriptions, 366)[0]
  const nativeCurrencies = [...new Set(active.map((item) => item.currency))].sort()
  if (!nativeCurrencies.length) nativeCurrencies.push(currency)
  const nativeTotals = nativeCurrencies.map((code) => ({
    currency: code,
    monthly: active.filter((item) => item.currency === code).reduce((sum, item) => sum + monthlyAmount(item), 0),
  }))
  const converted = nativeCurrencies.some((code) => code !== currency)
  const money = (value: number) => {
    if (missing && amounts.every((item) => item === null)) return 'Unavailable'
    if (missing) return `${formatMoney(value, currency)} +`
    return formatMoney(value, currency)
  }
  return (
    <section
      aria-label="Spending summary"
      className="subs-summary grid grid-cols-2 gap-x-6 gap-y-5 border-y py-5 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,.7fr)_minmax(0,1fr)]"
    >
      <div className="col-span-2 flex min-w-0 flex-col gap-2 sm:col-span-1">
        <p className="text-xs text-muted-foreground">Monthly totals</p>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          {nativeTotals.map((total) => (
            <span key={total.currency} className="text-2xl font-semibold tracking-tight tabular-nums">
              {formatMoney(total.monthly, total.currency)}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-2 text-xs text-muted-foreground">
          <span>Yearly estimate</span>
          {nativeTotals.map((total) => (
            <span key={total.currency} className="tabular-nums">
              {formatMoney(total.monthly * 12, total.currency)}
            </span>
          ))}
        </div>
        {converted && (
          <p className="text-xs text-muted-foreground">
            {money(monthly)} converted estimate{missing && ' (partial)'}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-xs text-muted-foreground">Active subscriptions</p>
        <p className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
          <NumberTicker
            value={active.length}
            locale={new Intl.NumberFormat().resolvedOptions().locale}
            aria-live="polite"
          />
          <span className="ml-2 text-sm font-normal text-muted-foreground">of {subscriptions.length}</span>
        </p>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-xs text-muted-foreground">Next payment</p>
        <p className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
          {next ? formatMoney(next.price, next.currency) : 'Not scheduled'}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {next ? `${next.name}, ${dateLabel(next.dueDate)}` : ''}
        </p>
      </div>
      {converted && isDemo && (
        <p className="col-span-2 text-xs text-muted-foreground sm:col-span-3">Illustrative rates</p>
      )}
      {converted && !isDemo && rates?.updatedAt && (
        <p className="col-span-2 text-xs text-muted-foreground sm:col-span-3">
          FX estimates: Frankfurter, {new Date(rates.updatedAt).toLocaleDateString()}
          {rates.stale && ' (saved rates)'}
        </p>
      )}
    </section>
  )
}

export function Overview({
  subscriptions,
  currency,
  rates,
  onAdd,
  onTemplates,
  onTemplate,
  onImport,
  onEdit,
  onDelete,
  onPause,
  searchRef,
}: {
  subscriptions: Subscription[]
  currency: string
  rates?: ExchangeRates
  onAdd: () => void
  onTemplates: () => void
  onTemplate: (template: (typeof templates)[number]) => void
  onImport: () => void
  onEdit: (subscription: Subscription) => void
  onDelete: (ids: string[]) => void
  onPause: (ids: string[]) => Promise<void>
  searchRef: React.RefObject<HTMLInputElement | null>
}) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [category, setCategory] = useState('all')
  const [cycle, setCycle] = useState('all')
  const [sort, setSort] = useState('Next payment')
  const [view, setView] = useState('cards')
  const [selected, setSelected] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const filtered = useMemo(
    () =>
      subscriptions
        .filter(
          (item) =>
            `${item.name} ${item.domain} ${item.category} ${item.notes}`.toLowerCase().includes(search.toLowerCase()) &&
            (status === 'all' || status === item.status) &&
            (category === 'all' || category === item.category) &&
            (cycle === 'all' || cycle === item.billingCycle),
        )
        .sort((a, b) => {
          if (sort === 'Name') return a.name.localeCompare(b.name) || a.id.localeCompare(b.id)
          if (sort === 'Price: high to low') {
            const first = convertAmount(monthlyAmount({ ...a, status: 'active' }), a.currency, currency, rates)
            const second = convertAmount(monthlyAmount({ ...b, status: 'active' }), b.currency, currency, rates)
            if (first === null && second === null) return a.currency.localeCompare(b.currency) || b.price - a.price
            if (first === null) return 1
            if (second === null) return -1
            return second - first || a.name.localeCompare(b.name) || a.id.localeCompare(b.id)
          }
          if (!nextPaymentDate(a) && nextPaymentDate(b)) return 1
          if (nextPaymentDate(a) && !nextPaymentDate(b)) return -1
          return (
            nextPaymentDate(a).localeCompare(nextPaymentDate(b)) ||
            a.name.localeCompare(b.name) ||
            a.id.localeCompare(b.id)
          )
        }),
    [subscriptions, search, status, category, cycle, sort, currency, rates],
  )
  const selectedVisible = selected.filter((id) => filtered.some((item) => item.id === id))
  const toggle = (id: string) =>
    setSelected((previous) => (previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]))
  const pause = async () => {
    setBusy(true)
    try {
      await onPause(selectedVisible)
      setSelected([])
    } finally {
      setBusy(false)
    }
  }
  const upcoming = upcomingPayments(subscriptions, 30).slice(0, 4)
  return (
    <div className="flex flex-col gap-7">
      <section className="flex flex-col gap-5">
        {subscriptions.length > 0 && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm text-muted-foreground" aria-live="polite">
                  {filtered.length} subscriptions
                </h2>
              </div>
              <Button variant="ghost" size="sm" onClick={onTemplates}>
                Choose a service
              </Button>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-40 flex-1">
                  <Input
                    ref={searchRef}
                    aria-label="Search subscriptions"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search subscriptions…"
                    className="pr-10"
                  />
                  <MagnifyingGlassIcon
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                </div>
                <div className="w-44">
                  <Choice
                    label="Sort subscriptions"
                    value={sort}
                    onChange={setSort}
                    options={['Next payment', 'Name', 'Price: high to low']}
                  />
                </div>
                <ToggleGroup
                  type="single"
                  value={view}
                  onValueChange={(value) => {
                    if (value) setView(value)
                  }}
                  variant="outline"
                  aria-label="Subscription layout"
                >
                  <ToggleGroupItem value="cards" aria-label="Card view">
                    <SquaresFourIcon />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="table" aria-label="Table view">
                    <ListIcon />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <ToggleGroup
                  type="single"
                  value={status}
                  onValueChange={(value) => {
                    if (value) setStatus(value)
                  }}
                  size="sm"
                  variant="outline"
                  aria-label="Filter by status"
                >
                  <ToggleGroupItem value="all">All</ToggleGroupItem>
                  <ToggleGroupItem value="active">Active</ToggleGroupItem>
                  <ToggleGroupItem value="paused">Paused</ToggleGroupItem>
                  <ToggleGroupItem value="cancelled">Cancelled</ToggleGroupItem>
                </ToggleGroup>
                <div className="min-w-32 flex-1 sm:w-40 sm:flex-none">
                  <Choice
                    value={category}
                    onChange={setCategory}
                    label="Filter by category"
                    optionLabels={{ all: 'All categories' }}
                    options={['all', ...new Set(subscriptions.map((item) => item.category))]}
                  />
                </div>
                <div className="min-w-32 flex-1 sm:w-36 sm:flex-none">
                  <Choice
                    value={cycle}
                    onChange={setCycle}
                    label="Filter by billing cycle"
                    optionLabels={{ all: 'All cycles' }}
                    options={['all', ...cycles]}
                  />
                </div>
                {(search || status !== 'all' || category !== 'all' || cycle !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearch('')
                      setStatus('all')
                      setCategory('all')
                      setCycle('all')
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
        {filtered.length === 0 ? (
          <Empty className="subs-empty min-h-80 py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SquaresFourIcon />
              </EmptyMedia>
              <EmptyTitle>
                {subscriptions.length ? 'No matching subscriptions' : 'Add your first subscription'}
              </EmptyTitle>
              <EmptyDescription>
                {subscriptions.length
                  ? 'Change your search or clear the filters.'
                  : 'Choose a service, then add your plan and price.'}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="w-full max-w-lg">
              {!subscriptions.length && (
                <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
                  {templates.slice(0, 8).map((template) => (
                    <Button
                      key={template.name}
                      variant="outline"
                      className="h-auto min-h-24 flex-col gap-2 px-2 py-3"
                      onClick={() => onTemplate(template)}
                    >
                      <ServiceMark name={template.name} />
                      <span className="max-w-full truncate text-xs">{template.name}</span>
                    </Button>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="outline" onClick={onAdd}>
                  <PlusIcon data-icon="inline-start" />
                  Add manually
                </Button>
                {!subscriptions.length && (
                  <Button variant="outline" onClick={onImport}>
                    <UploadSimpleIcon data-icon="inline-start" />
                    Import existing
                  </Button>
                )}
              </div>
            </EmptyContent>
          </Empty>
        ) : view === 'cards' ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => (
              <MagicCard
                key={item.id}
                gradientOpacity={0.035}
                gradientSize={180}
                className="subs-service-card group/card min-w-0 rounded-lg [--card-spacing:--spacing(4)] [&>div:last-child]:h-full"
              >
                <div className="flex h-full flex-col gap-4 pt-4">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <ServiceMark name={item.name} />
                        <div className="min-w-0">
                          <CardTitle className="truncate">
                            <ServiceLink name={item.name} domain={item.domain} />
                          </CardTitle>
                          <CardDescription className="truncate">{item.category}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={item.status === 'active' ? 'secondary' : 'outline'}>{item.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-semibold tracking-tight tabular-nums">
                        {formatMoney(item.price, item.currency)}
                      </span>
                      <span className="text-xs text-muted-foreground">/ {item.billingCycle}</span>
                    </div>
                    {item.trialEndsAt && (
                      <Badge variant="outline" className="mt-3">
                        Trial ends {dateLabel(item.trialEndsAt)}
                      </Badge>
                    )}
                  </CardContent>
                  <CardFooter className="mt-auto flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">{paymentLabel(item)}</span>
                    <Button size="sm" variant="ghost" onClick={() => onEdit(item)}>
                      Manage
                    </Button>
                  </CardFooter>
                </div>
              </MagicCard>
            ))}
          </div>
        ) : (
          <div className="min-w-0 rounded-md border">
            {selectedVisible.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 border-b bg-muted/40 p-3">
                <span className="mr-auto text-sm">{selectedVisible.length} selected</span>
                <Button variant="outline" size="sm" onClick={() => void pause()} disabled={busy}>
                  <PauseIcon data-icon="inline-start" />
                  Pause
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(selectedVisible)} disabled={busy}>
                  <TrashIcon data-icon="inline-start" />
                  Delete
                </Button>
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      aria-label="Select all visible subscriptions"
                      checked={selectedVisible.length === filtered.length}
                      onCheckedChange={(checked) => setSelected(checked ? filtered.map((item) => item.id) : [])}
                    />
                  </TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Next payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Manage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(item.id)}
                        onCheckedChange={() => toggle(item.id)}
                        aria-label={`Select ${item.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <ServiceMark name={item.name} />
                        <div>
                          <p className="font-medium">
                            <ServiceLink name={item.name} domain={item.domain} />
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.category}
                            {item.trialEndsAt && `, trial ends ${dateLabel(item.trialEndsAt)}`}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {formatMoney(item.price, item.currency)}
                      <p className="text-xs text-muted-foreground">{item.billingCycle}</p>
                    </TableCell>
                    <TableCell>{item.status === 'active' ? dateLabel(nextPaymentDate(item)) : '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${item.name}`}
                        onClick={() => onDelete([item.id])}
                      >
                        <TrashIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
      {subscriptions.length > 0 && (
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-medium">
              Coming up next <span className="ml-2 font-normal text-muted-foreground">30 days</span>
            </h2>
          </div>
          {upcoming.length ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {upcoming.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => onEdit(item)}
                  className="flex items-center gap-3 rounded-md border p-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex size-10 shrink-0 flex-col items-center justify-center rounded-md bg-muted text-xs">
                    <span className="font-semibold">{item.dueDate.slice(8)}</span>
                    <span className="text-xs text-foreground">
                      {new Date(`${item.dueDate}T12:00:00`).toLocaleDateString(undefined, { month: 'short' })}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatMoney(item.price, item.currency)},{' '}
                      {item.daysUntil === 0 ? 'Today' : `in ${item.daysUntil}d`}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
              No payments scheduled in the next 30 days.
            </p>
          )}
        </section>
      )}
    </div>
  )
}
