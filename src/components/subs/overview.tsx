import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  ListIcon,
  MagnifyingGlassIcon,
  PauseIcon,
  PlusIcon,
  SquaresFourIcon,
  TrashIcon,
} from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  convertAmount,
  dateLabel,
  formatMoney,
  monthlyAmount,
  nextPaymentDate,
  upcomingPayments,
} from '@/lib/subscriptions'
import type { ExchangeRates, Subscription } from '@/lib/types'
import { Choice, cycles, ServiceMark } from './shared'

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
  const money = (value: number) => {
    if (missing && amounts.every((item) => item === null)) return 'Unavailable'
    if (missing) return `${formatMoney(value, currency)} +`
    return formatMoney(value, currency)
  }
  return (
    <section aria-label="Spending summary" className="grid grid-cols-2 gap-x-5 gap-y-6 border-y py-6 lg:grid-cols-4">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium text-muted-foreground">Monthly spending{missing && ' · partial'}</p>
        <p className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">{money(monthly)}</p>
        <p className="text-xs text-muted-foreground">Your recurring monthly average</p>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium text-muted-foreground">Yearly estimate</p>
        <p className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">{money(monthly * 12)}</p>
        <p className="text-xs text-muted-foreground">At your current pace</p>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium text-muted-foreground">Active subscriptions</p>
        <p className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
          {active.length}
          <span className="ml-2 text-sm font-normal text-muted-foreground">of {subscriptions.length}</span>
        </p>
        <p className="text-xs text-muted-foreground">Only active plans count toward spending</p>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium text-muted-foreground">Next payment</p>
        <p className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
          {next ? formatMoney(next.price, next.currency) : '—'}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {next ? `${next.name} · ${dateLabel(next.dueDate)}` : 'Nothing on the horizon'}
        </p>
      </div>
      {missing && (
        <div className="col-span-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground lg:col-span-4">
          <span>Unconverted monthly totals:</span>
          {[...new Set(active.map((item) => item.currency))].sort().map((code) => (
            <Badge key={code} variant="outline">
              {formatMoney(
                active.filter((item) => item.currency === code).reduce((sum, item) => sum + monthlyAmount(item), 0),
                code,
              )}
            </Badge>
          ))}
        </div>
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
            return second - first
          }
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
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight">Your subscriptions</h2>
            <Badge variant="secondary">{subscriptions.length}</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onTemplates}>
            Browse starters
            <ArrowUpRightIcon data-icon="inline-end" />
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
            <div className="w-40">
              <Choice
                value={category}
                onChange={setCategory}
                label="Filter by category"
                options={['all', ...new Set(subscriptions.map((item) => item.category))]}
              />
            </div>
            <div className="w-36">
              <Choice value={cycle} onChange={setCycle} label="Filter by billing cycle" options={['all', ...cycles]} />
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
        {filtered.length === 0 ? (
          <Empty className="min-h-80 border border-dashed bg-muted/20">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SquaresFourIcon />
              </EmptyMedia>
              <EmptyTitle>
                {subscriptions.length ? 'No matches. No worries.' : 'Make room for a clearer picture.'}
              </EmptyTitle>
              <EmptyDescription>
                {subscriptions.length
                  ? 'Try a different search or loosen your filters.'
                  : 'Streaming, software, that gym you definitely go to. Bring your recurring payments together and know what’s next.'}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={onAdd}>
                <PlusIcon data-icon="inline-start" />
                Add your first subscription
              </Button>
              {!subscriptions.length && (
                <Button variant="link" onClick={onTemplates}>
                  Or start with a familiar service
                  <ArrowRightIcon data-icon="inline-end" />
                </Button>
              )}
            </EmptyContent>
          </Empty>
        ) : view === 'cards' ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => (
              <Card key={item.id} className="min-w-0 gap-4">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <ServiceMark name={item.name} />
                      <div className="min-w-0">
                        <CardTitle className="truncate">{item.name}</CardTitle>
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
                <CardFooter className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    {item.status === 'active' ? `Next ${dateLabel(nextPaymentDate(item))}` : 'Not included in spending'}
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => onEdit(item)}>
                    Manage
                    <ArrowUpRightIcon data-icon="inline-end" />
                  </Button>
                </CardFooter>
              </Card>
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
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.category}
                            {item.trialEndsAt && ` · Trial ends ${dateLabel(item.trialEndsAt)}`}
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
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Coming up next</h2>
          <p className="text-sm text-muted-foreground">Your next charges in the coming 30 days.</p>
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
                  <span className="text-[10px] uppercase text-muted-foreground">
                    {new Date(`${item.dueDate}T12:00:00`).toLocaleDateString(undefined, { month: 'short' })}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatMoney(item.price, item.currency)} ·{' '}
                    {item.daysUntil === 0 ? 'Today' : `in ${item.daysUntil}d`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
            A quiet month ahead. Your upcoming payments will appear here.
          </p>
        )}
      </section>
    </div>
  )
}
