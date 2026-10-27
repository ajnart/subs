import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { ArrowLeft, CalendarIcon, CheckCircle2, RotateCcw, Save } from 'lucide-react'
import { memo, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { IconUrlInput } from '~/components/IconFinder'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Calendar } from '~/components/ui/calendar'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Switch } from '~/components/ui/switch'
import { cn, formatDateForDisplay, getCurrencySymbol, sanitizeDomain } from '~/lib/utils'
import { getCacheHeaders, getCurrencyRates } from '~/services/currency.server'
import useSubscriptionStore, {
  SUBSCRIPTION_CATEGORIES,
  type BillingCycle,
  type Subscription,
} from '~/store/subscriptionStore'
import { getRenewalDayOfMonth } from '~/utils/nextPaymentDate'

export const meta: MetaFunction = () => {
  return [
    { title: 'Manage Subscriptions – Subs' },
    { name: 'description', content: 'Edit all your subscriptions at once' },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  const data = await getCurrencyRates()
  return json({ rates: data?.rates ?? null, lastUpdated: data?.date ?? null }, { headers: getCacheHeaders(data?.date) })
}

interface SubscriptionRowProps {
  draft: Subscription
  original: Subscription
  isDirty: boolean
  rates: Record<string, number> | null
  onChange: (updated: Partial<Subscription>) => void
  onDiscard: () => void
}

const SubscriptionRow = memo(function SubscriptionRow({
  draft,
  original,
  isDirty,
  rates,
  onChange,
  onDiscard,
}: SubscriptionRowProps) {
  const [calendarOpen, setCalendarOpen] = useState(false)

  const logoUrl =
    draft.icon ||
    `https://www.google.com/s2/favicons?domain=${sanitizeDomain(draft.domain || 'https://example.com')}&sz=64`

  return (
    <AccordionItem
      value={draft.id}
      className={cn('border rounded-lg mb-2 px-2', isDirty && 'border-primary/50 bg-primary/5')}
    >
      <AccordionTrigger className="hover:no-underline py-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <img
            src={logoUrl}
            alt={draft.name}
            className="h-8 w-8 rounded object-contain shrink-0 bg-background"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src =
                `https://www.google.com/s2/favicons?domain=${sanitizeDomain(draft.domain)}&sz=64`
            }}
          />
          <span className="font-medium truncate">{draft.name || 'Untitled'}</span>
          <span className="text-sm text-muted-foreground shrink-0">
            {getCurrencySymbol(draft.currency)}
            {draft.price?.toFixed(2)} {draft.currency}
          </span>
          {draft.billingCycle && (
            <Badge variant="secondary" className="shrink-0 capitalize hidden sm:inline-flex">
              {draft.billingCycle}
            </Badge>
          )}
          {draft.category && (
            <Badge variant="outline" className="shrink-0 hidden md:inline-flex">
              {draft.category}
            </Badge>
          )}
          {isDirty && (
            <Badge
              variant="default"
              className="shrink-0 bg-primary text-primary-foreground gap-1 hidden sm:inline-flex"
            >
              <CheckCircle2 className="h-3 w-3" />
              Modified
            </Badge>
          )}
        </div>
      </AccordionTrigger>

      <AccordionContent className="pt-2 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left column */}
          <div className="space-y-3">
            <div>
              <IconUrlInput
                value={draft.icon || ''}
                onChange={(value) => onChange({ icon: value })}
                label="Icon (optional)"
              />
            </div>

            <div>
              <Label htmlFor={`name-${draft.id}`}>Name</Label>
              <Input
                id={`name-${draft.id}`}
                value={draft.name}
                onChange={(e) => onChange({ name: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor={`price-${draft.id}`}>Price</Label>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">
                    {getCurrencySymbol(draft.currency || 'USD')}
                  </span>
                  <Input
                    id={`price-${draft.id}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={draft.price}
                    onChange={(e) => onChange({ price: Number.parseFloat(e.target.value) || 0 })}
                    className="pl-7"
                  />
                </div>
              </div>
              <div className="flex-1">
                <Label htmlFor={`currency-${draft.id}`}>Currency</Label>
                <Select value={draft.currency} onValueChange={(v) => onChange({ currency: v })}>
                  <SelectTrigger id={`currency-${draft.id}`} className="mt-1">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(rates ?? {}).map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor={`domain-${draft.id}`}>Domain</Label>
              <Input
                id={`domain-${draft.id}`}
                value={draft.domain}
                onChange={(e) => onChange({ domain: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-3">
            <div>
              <Label htmlFor={`billingCycle-${draft.id}`}>Billing Cycle (optional)</Label>
              <Select
                value={draft.billingCycle ?? ''}
                onValueChange={(v) => {
                  const billingCycle = (v || undefined) as BillingCycle | undefined
                  onChange({
                    billingCycle,
                    ...(billingCycle === 'monthly' && draft.renewalDayOfMonth === undefined
                      ? { renewalDayOfMonth: getRenewalDayOfMonth(draft.nextPaymentDate) }
                      : {}),
                  })
                }}
              >
                <SelectTrigger id={`billingCycle-${draft.id}`} className="mt-1">
                  <SelectValue placeholder="Select billing cycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor={`category-${draft.id}`}>Category (optional)</Label>
              <Select
                value={draft.category ?? ''}
                onValueChange={(v) => onChange({ category: (v || undefined) as Subscription['category'] | undefined })}
              >
                <SelectTrigger id={`category-${draft.id}`} className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {SUBSCRIPTION_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {draft.billingCycle && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`showNextPayment-${draft.id}`}
                    checked={!!draft.showNextPayment}
                    onCheckedChange={(v) => onChange({ showNextPayment: v })}
                  />
                  <Label htmlFor={`showNextPayment-${draft.id}`} className="cursor-pointer">
                    Show next payment date
                  </Label>
                </div>

                {draft.showNextPayment && (
                  <div>
                    <Label htmlFor={`nextPaymentDate-${draft.id}`}>Next Payment Date</Label>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          id={`nextPaymentDate-${draft.id}`}
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal mt-1',
                            !draft.nextPaymentDate && 'text-muted-foreground',
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formatDateForDisplay(draft.nextPaymentDate)}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={draft.nextPaymentDate ? new Date(draft.nextPaymentDate) : undefined}
                          onSelect={(date) => {
                            const nextDate = date?.toISOString().split('T')[0]
                            onChange({
                              nextPaymentDate: nextDate,
                              ...(draft.billingCycle === 'monthly'
                                ? { renewalDayOfMonth: getRenewalDayOfMonth(nextDate) }
                                : {}),
                            })
                            setCalendarOpen(false)
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {isDirty && (
          <div className="flex justify-end mt-4">
            <Button type="button" variant="ghost" size="sm" onClick={onDiscard} className="gap-1 text-muted-foreground">
              <RotateCcw className="h-3.5 w-3.5" />
              Discard changes
            </Button>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  )
})

export default function Manage() {
  const { rates } = useLoaderData<typeof loader>()
  const { subscriptions, editSubscription } = useSubscriptionStore()

  // Drafts: a mutable copy of all subscriptions
  const [drafts, setDrafts] = useState<Record<string, Subscription>>(() =>
    Object.fromEntries(subscriptions.map((s) => [s.id, { ...s }])),
  )

  // Keep drafts in sync when new subscriptions are added externally
  useEffect(() => {
    setDrafts((prev) => {
      const next = { ...prev }
      for (const sub of subscriptions) {
        if (!next[sub.id]) {
          next[sub.id] = { ...sub }
        }
      }
      // Remove drafts for deleted subscriptions
      for (const id of Object.keys(next)) {
        if (!subscriptions.find((s) => s.id === id)) {
          delete next[id]
        }
      }
      return next
    })
  }, [subscriptions])

  const isDirty = (id: string) => {
    const original = subscriptions.find((s) => s.id === id)
    if (!original) return false
    const draft = drafts[id]
    if (!draft) return false
    const keys: (keyof Subscription)[] = [
      'name',
      'price',
      'currency',
      'domain',
      'icon',
      'billingCycle',
      'nextPaymentDate',
      'renewalDayOfMonth',
      'showNextPayment',
      'category',
    ]
    return keys.some((k) => draft[k] !== original[k])
  }

  const dirtyCount = subscriptions.filter((s) => isDirty(s.id)).length

  const updateDraft = (id: string, partial: Partial<Subscription>) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...partial } }))
  }

  const discardDraft = (id: string) => {
    const original = subscriptions.find((s) => s.id === id)
    if (original) {
      setDrafts((prev) => ({ ...prev, [id]: { ...original } }))
    }
  }

  const discardAll = () => {
    setDrafts(Object.fromEntries(subscriptions.map((s) => [s.id, { ...s }])))
    toast.info('All changes discarded')
  }

  const handleSaveAll = () => {
    let saved = 0
    for (const sub of subscriptions) {
      if (isDirty(sub.id)) {
        const { id, ...rest } = drafts[sub.id]
        editSubscription(sub.id, rest)
        saved++
      }
    }
    if (saved === 0) {
      toast.info('No changes to save')
    } else {
      toast.success(`Saved ${saved} subscription${saved > 1 ? 's' : ''}`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="p-4 shadow-md bg-accent">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon" aria-label="Back to home">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Manage Subscriptions</h1>
              <p className="text-xs text-muted-foreground">
                {subscriptions.length} subscription{subscriptions.length !== 1 ? 's' : ''}
                {dirtyCount > 0 && ` · ${dirtyCount} unsaved change${dirtyCount > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {dirtyCount > 0 && (
              <Button variant="ghost" size="sm" onClick={discardAll} className="gap-1">
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Discard all</span>
              </Button>
            )}
            <Button onClick={handleSaveAll} size="sm" className="gap-1" disabled={dirtyCount === 0}>
              <Save className="h-4 w-4" />
              <span>Save{dirtyCount > 0 ? ` (${dirtyCount})` : ''}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto py-6 px-4 max-w-4xl">
        {subscriptions.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">No subscriptions yet.</p>
            <Link to="/" className="mt-2 inline-block">
              <Button variant="link">Go add some →</Button>
            </Link>
          </div>
        ) : (
          <Accordion type="multiple" className="space-y-0">
            {subscriptions.map((sub) => (
              <SubscriptionRow
                key={sub.id}
                draft={drafts[sub.id] ?? sub}
                original={sub}
                isDirty={isDirty(sub.id)}
                rates={rates}
                onChange={(partial) => updateDraft(sub.id, partial)}
                onDiscard={() => discardDraft(sub.id)}
              />
            ))}
          </Accordion>
        )}

        {subscriptions.length > 0 && (
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            {dirtyCount > 0 && (
              <Button variant="outline" onClick={discardAll} className="gap-1">
                <RotateCcw className="h-4 w-4" />
                Discard all
              </Button>
            )}
            <Button onClick={handleSaveAll} className="gap-1" disabled={dirtyCount === 0}>
              <Save className="h-4 w-4" />
              Save{dirtyCount > 0 ? ` ${dirtyCount} change${dirtyCount > 1 ? 's' : ''}` : ' changes'}
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
