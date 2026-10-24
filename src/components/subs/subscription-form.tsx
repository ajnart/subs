import { ArrowUpRightIcon, SquaresFourIcon } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { api, errorMessage, isRevisionConflict } from '@/lib/api'
import { safeIconUrl } from '@/lib/service-icons'
import { formatMoney } from '@/lib/subscriptions'
import type { AppData, BillingCycle, Subscription, SubscriptionInput, SubscriptionStatus } from '@/lib/types'
import { assertMoneyPrecision, inputSchema } from '@/lib/validation'
import type { QuickSetupSeed } from './quick-setup'
import { Choice, categories, currencies, cycles, Notice, ServiceMark, serviceUrl, statuses } from './shared'

export function SubscriptionForm({
  subscription,
  currency,
  onClose,
  onSave,
  onDelete,
  template,
  revision,
  onReview,
  onQuickSetup,
}: {
  subscription?: Subscription
  currency: string
  onClose: () => void
  onSave: (input: SubscriptionInput, id?: string, revision?: string | null) => Promise<void>
  onDelete: (id: string, revision: string | null) => void
  template?: { name: string; domain: string; category: string }
  revision: string | null
  onReview: () => Promise<{ data: AppData; revision: string }>
  onQuickSetup?: (draft: QuickSetupSeed | undefined, revision: string | null) => void
}) {
  const [initialForm] = useState<SubscriptionInput>(() => ({
    name: subscription?.name ?? template?.name ?? '',
    domain: subscription?.domain ?? template?.domain ?? '',
    category: subscription?.category ?? template?.category ?? 'Other',
    price: subscription?.price ?? 0,
    currency: subscription?.currency ?? currency,
    billingCycle: subscription?.billingCycle ?? 'monthly',
    nextPaymentDate: subscription?.nextPaymentDate ?? '',
    status: subscription?.status ?? 'active',
    trialEndsAt: subscription?.trialEndsAt ?? null,
    notes: subscription?.notes ?? '',
    icon: subscription?.icon ?? '',
  }))
  const [form, setForm] = useState(initialForm)
  const [price, setPrice] = useState(subscription ? String(subscription.price) : '')
  const [error, setError] = useState('')
  const [priceError, setPriceError] = useState('')
  const [iconError, setIconError] = useState('')
  const [action, setAction] = useState<'saving' | 'reviewing' | null>(null)
  const [draftRevision, setDraftRevision] = useState(revision)
  const [conflict, setConflict] = useState(false)
  const [latest, setLatest] = useState<{ subscription: Subscription; revision: string } | null>(null)
  const [reviewNotice, setReviewNotice] = useState('')
  const [history, setHistory] = useState<{ date: string; price: number; currency: string }[]>([])
  const [historyError, setHistoryError] = useState('')
  const [historyLoading, setHistoryLoading] = useState(Boolean(subscription))
  const active = useRef(true)
  const pending = useRef(false)
  const originalIcon = useRef(initialForm.icon ?? '')
  const feedback = useRef<HTMLDivElement>(null)
  const busy = action !== null
  const subscriptionId = subscription?.id
  const website = serviceUrl(form.domain)
  const icon = form.icon ?? ''
  const legacyIcon = Boolean(icon && icon === originalIcon.current && !safeIconUrl(icon))
  const hasDraft = Boolean(
    template ||
      price ||
      form.name ||
      form.domain ||
      icon ||
      form.notes ||
      form.nextPaymentDate ||
      form.trialEndsAt ||
      form.currency !== initialForm.currency ||
      form.category !== 'Other' ||
      form.billingCycle !== 'monthly' ||
      form.status !== 'active',
  )

  useEffect(() => {
    active.current = true
    return () => {
      active.current = false
    }
  }, [])

  useEffect(() => {
    if (error || latest || reviewNotice) feedback.current?.focus()
  }, [error, latest, reviewNotice])

  useEffect(() => {
    if (!subscriptionId) return
    const controller = new AbortController()
    api<{ date: string; price: number; currency: string }[]>(`/history/${encodeURIComponent(subscriptionId)}`, {
      signal: controller.signal,
    })
      .then((result) => {
        if (!controller.signal.aborted && active.current) setHistory(result)
      })
      .catch((cause) => {
        if (!controller.signal.aborted && active.current) setHistoryError(errorMessage(cause))
      })
      .finally(() => {
        if (!controller.signal.aborted && active.current) setHistoryLoading(false)
      })
    return () => controller.abort()
  }, [subscriptionId])

  const change = <K extends keyof SubscriptionInput>(key: K, value: SubscriptionInput[K]) =>
    setForm((previous) => ({ ...previous, [key]: value }))
  const close = () => {
    if (pending.current || !active.current) return
    active.current = false
    onClose()
  }
  const openQuickSetup = () => {
    if (subscription || !onQuickSetup || pending.current || conflict || !active.current) return
    let draft: QuickSetupSeed | undefined
    if (hasDraft) draft = { input: { ...form }, price }
    active.current = false
    onQuickSetup(draft, draftRevision)
  }
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (pending.current || conflict || !active.current) return
    setError('')
    setPriceError('')
    setIconError('')
    setReviewNotice('')
    const amount = Number(price)
    if (!price.trim() || !/^\d*(?:\.\d*)?$/.test(price.trim()) || !Number.isFinite(amount) || amount < 0) {
      const message = 'Enter a non-negative price. Use 0 for a free plan.'
      setPriceError(message)
      setError(message)
      return
    }
    let nextIcon = icon
    if (icon !== originalIcon.current) nextIcon = icon.trim()
    if (icon !== originalIcon.current && nextIcon && !safeIconUrl(nextIcon)) {
      const message = 'Use a public HTTP(S) image URL without credentials, or clear the custom icon.'
      setIconError(message)
      setError(message)
      return
    }
    const input = inputSchema.safeParse({
      ...form,
      price: amount,
      currency: form.currency.toUpperCase(),
      icon: nextIcon,
    })
    if (!input.success) {
      setError(input.error.issues[0]?.message ?? 'Review your subscription details.')
      return
    }
    try {
      assertMoneyPrecision(input.data.price, input.data.currency)
    } catch (cause) {
      const message = errorMessage(cause)
      setPriceError(message)
      setError(message)
      return
    }
    pending.current = true
    setAction('saving')
    try {
      await onSave(input.data, subscriptionId, draftRevision)
      if (!active.current) return
      active.current = false
      onClose()
    } catch (cause) {
      if (!active.current) return
      setError(errorMessage(cause))
      setConflict(isRevisionConflict(cause))
      setLatest(null)
    } finally {
      pending.current = false
      if (active.current) setAction(null)
    }
  }
  const reviewLatest = async () => {
    if (pending.current || !active.current) return
    pending.current = true
    setAction('reviewing')
    try {
      const snapshot = await onReview()
      if (!active.current) return
      if (!subscriptionId) {
        setDraftRevision(snapshot.revision)
        setConflict(false)
        setError('')
        setReviewNotice(
          'Collection refreshed. Your new subscription draft is unchanged; review it before saving again.',
        )
        return
      }
      const current = snapshot.data.subscriptions.find((item) => item.id === subscriptionId)
      if (!current)
        throw new Error(
          'This subscription was deleted elsewhere. Your draft has been kept here; close this dialog to return to the refreshed collection.',
        )
      setLatest({ subscription: current, revision: snapshot.revision })
    } catch (cause) {
      if (active.current) setError(errorMessage(cause))
    } finally {
      pending.current = false
      if (active.current) setAction(null)
    }
  }
  const useLatest = () => {
    if (!latest || pending.current || !active.current) return
    const current = latest.subscription
    setForm({
      name: current.name,
      domain: current.domain,
      category: current.category,
      price: current.price,
      currency: current.currency,
      billingCycle: current.billingCycle,
      nextPaymentDate: current.nextPaymentDate,
      status: current.status,
      trialEndsAt: current.trialEndsAt,
      notes: current.notes,
      icon: current.icon ?? '',
    })
    setPrice(String(current.price))
    originalIcon.current = current.icon ?? ''
    setDraftRevision(latest.revision)
    setLatest(null)
    setConflict(false)
    setError('')
    setPriceError('')
    setIconError('')
    setReviewNotice('Latest details loaded. Review them before saving.')
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      <DialogContent
        className="flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl"
        showCloseButton={!busy}
      >
        <DialogHeader className="shrink-0 flex-row flex-wrap items-center justify-between gap-3 px-4 py-3 pr-12">
          <div className="flex min-w-0 flex-col gap-1">
            <DialogTitle>{subscription ? 'Edit subscription' : 'Add a subscription'}</DialogTitle>
            <DialogDescription>Your service, your plan, your actual price.</DialogDescription>
          </div>
          {!subscription && onQuickSetup && (
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={openQuickSetup} disabled={busy || conflict}>
                <SquaresFourIcon data-icon="inline-start" />
                Add several
              </Button>
              <p className="text-xs text-muted-foreground">Keeps this draft.</p>
            </div>
          )}
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
          <FieldGroup className="gap-4">
            <div ref={feedback} tabIndex={-1} className="flex flex-col gap-3 empty:hidden focus:outline-none">
              {error && (
                <Notice
                  title={conflict ? 'This collection changed while you were editing' : 'Could not save subscription'}
                >
                  <p>{error}</p>
                  {conflict && (
                    <>
                      <p>Your draft is unchanged. Review the latest version before saving.</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-auto min-h-8 whitespace-normal"
                        disabled={busy}
                        onClick={() => void reviewLatest()}
                      >
                        Refresh and review latest version
                      </Button>
                    </>
                  )}
                </Notice>
              )}
              {latest && (
                <Notice title="Current server version">
                  <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-xs">
                    {[
                      ['Service', latest.subscription.name],
                      ['Price', formatMoney(latest.subscription.price, latest.subscription.currency)],
                      ['Billing cycle', latest.subscription.billingCycle],
                      ['Next payment', latest.subscription.nextPaymentDate || 'Not set'],
                      ['Category', latest.subscription.category],
                      ['Status', latest.subscription.status],
                      ['Website', latest.subscription.domain || 'Not set'],
                      ['Custom icon', latest.subscription.icon || 'Automatic'],
                      ['Trial ends', latest.subscription.trialEndsAt || 'Not set'],
                      ['Notes', latest.subscription.notes || 'None'],
                    ].map(([label, value]) => (
                      <div key={label} className="contents">
                        <dt>{label}</dt>
                        <dd className="break-words">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p>Loading this version replaces your unsaved draft.</p>
                  <Button type="button" variant="outline" size="sm" disabled={busy} onClick={useLatest}>
                    Load latest details into form
                  </Button>
                </Notice>
              )}
              {reviewNotice && (
                <p role="status" className="text-sm text-muted-foreground">
                  {reviewNotice}
                </p>
              )}
            </div>
            <form id="subscription-form" onSubmit={submit} aria-busy={busy}>
              <FieldSet disabled={busy}>
                <FieldGroup className="grid min-w-0 gap-x-6 gap-y-4 md:grid-cols-2">
                  <FieldGroup className="grid min-w-0 items-center gap-3 md:col-span-2 md:grid-cols-2">
                    <section aria-label="Service preview" className="flex min-w-0 items-center gap-3">
                      <ServiceMark name={form.name || 'Service'} domain={form.domain} icon={form.icon} size="large" />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{form.name.trim() || 'Your service'}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {form.domain || 'Preview updates as you type'}
                        </p>
                      </div>
                    </section>
                    <Field>
                      <FieldLabel htmlFor="service-name">Service name</FieldLabel>
                      <Input
                        id="service-name"
                        placeholder="e.g. Spotify Premium"
                        value={form.name}
                        onChange={(event) => change('name', event.target.value)}
                        maxLength={200}
                        required
                        autoFocus
                      />
                    </Field>
                  </FieldGroup>
                  <FieldSet className="min-w-0 gap-3">
                    <FieldLegend className="mb-0">Price & billing</FieldLegend>
                    <FieldGroup className="gap-3">
                      <FieldGroup className="grid grid-cols-[minmax(0,1fr)_6rem] items-start gap-3">
                        <Field data-invalid={Boolean(priceError)}>
                          <FieldLabel htmlFor="price">Price per billing cycle</FieldLabel>
                          <Input
                            id="price"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={price}
                            onChange={(event) => {
                              setPrice(event.target.value)
                              setPriceError('')
                            }}
                            aria-invalid={Boolean(priceError)}
                            aria-describedby={priceError ? 'price-error' : 'price-help'}
                            required
                          />
                          {priceError && <FieldError id="price-error">{priceError}</FieldError>}
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="currency">Currency</FieldLabel>
                          <Input
                            id="currency"
                            value={form.currency}
                            onChange={(event) => change('currency', event.target.value.toUpperCase())}
                            maxLength={3}
                            minLength={3}
                            list="currencies"
                            autoComplete="off"
                            required
                          />
                          <datalist id="currencies">
                            {currencies.map((item) => (
                              <option key={item} value={item} />
                            ))}
                          </datalist>
                        </Field>
                      </FieldGroup>
                      <p id="price-help" className="-mt-1 text-xs text-muted-foreground">
                        Charged once per cycle. Enter 0 for a free plan.
                      </p>
                      <FieldGroup className="grid grid-cols-1 gap-4 min-[400px]:grid-cols-2">
                        <Field>
                          <FieldLabel htmlFor="billing-cycle">Billing cycle</FieldLabel>
                          <Choice
                            id="billing-cycle"
                            label="Billing cycle"
                            value={form.billingCycle}
                            options={cycles}
                            onChange={(value) => change('billingCycle', value as BillingCycle)}
                          />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="next-date">Next payment (optional)</FieldLabel>
                          <Input
                            id="next-date"
                            type="date"
                            value={form.nextPaymentDate}
                            onChange={(event) => change('nextPaymentDate', event.target.value)}
                          />
                          <FieldDescription>Leave blank if unknown.</FieldDescription>
                        </Field>
                      </FieldGroup>
                    </FieldGroup>
                  </FieldSet>
                  <FieldSet className="min-w-0 gap-3">
                    <FieldLegend className="mb-0">Website & artwork</FieldLegend>
                    <FieldGroup className="gap-3">
                      <Field>
                        <FieldLabel htmlFor="domain">Website (optional)</FieldLabel>
                        <Input
                          id="domain"
                          inputMode="url"
                          placeholder="spotify.com or a full website link"
                          value={form.domain}
                          onChange={(event) => change('domain', event.target.value)}
                          maxLength={2048}
                          autoComplete="off"
                          spellCheck={false}
                        />
                        {website && (
                          <FieldDescription>
                            <a
                              href={website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1"
                            >
                              Open website <ArrowUpRightIcon aria-hidden="true" className="size-3" />
                            </a>
                          </FieldDescription>
                        )}
                      </Field>
                      <Field data-invalid={Boolean(iconError)}>
                        <FieldLabel htmlFor="custom-icon">Custom icon URL (optional)</FieldLabel>
                        <Input
                          id="custom-icon"
                          inputMode="url"
                          placeholder="https://example.com/icon.png"
                          value={icon}
                          onChange={(event) => {
                            change('icon', event.target.value)
                            setIconError('')
                          }}
                          maxLength={2048}
                          autoComplete="off"
                          spellCheck={false}
                          aria-invalid={Boolean(iconError)}
                          aria-describedby="custom-icon-help"
                        />
                        <FieldDescription id="custom-icon-help">
                          Public HTTP(S) images load in your browser. Leave empty for automatic service artwork.
                        </FieldDescription>
                        {legacyIcon && (
                          <FieldDescription>
                            Your existing icon value is kept unchanged. Automatic artwork is shown for legacy values.
                          </FieldDescription>
                        )}
                        {iconError && <FieldError>{iconError}</FieldError>}
                      </Field>
                    </FieldGroup>
                  </FieldSet>
                  <FieldSet className="min-w-0 gap-3 md:col-span-2">
                    <FieldLegend className="mb-0">Tracking details</FieldLegend>
                    <FieldGroup className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 md:grid-cols-3">
                      <Field>
                        <FieldLabel htmlFor="category">Category</FieldLabel>
                        <Input
                          id="category"
                          list="categories"
                          value={form.category}
                          maxLength={100}
                          onChange={(event) => change('category', event.target.value)}
                          required
                        />
                        <datalist id="categories">
                          {categories.map((item) => (
                            <option key={item} value={item} />
                          ))}
                        </datalist>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="status">Status</FieldLabel>
                        <Choice
                          id="status"
                          label="Status"
                          options={statuses}
                          value={form.status}
                          onChange={(value) => change('status', value as SubscriptionStatus)}
                        />
                        <FieldDescription>Tracking only; not cancellation.</FieldDescription>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="trial">Trial ends (optional)</FieldLabel>
                        <Input
                          id="trial"
                          type="date"
                          value={form.trialEndsAt ?? ''}
                          onChange={(event) => change('trialEndsAt', event.target.value || null)}
                        />
                      </Field>
                    </FieldGroup>
                  </FieldSet>
                  <FieldGroup className="grid min-w-0 gap-3 md:col-span-2 md:grid-cols-2">
                    <details className="subs-disclosure min-w-0 only:col-span-full">
                      <summary>Notes</summary>
                      <Field className="pt-3">
                        <FieldLabel htmlFor="notes">Notes</FieldLabel>
                        <Textarea
                          id="notes"
                          placeholder="Plan details or account email"
                          value={form.notes}
                          onChange={(event) => change('notes', event.target.value)}
                          maxLength={10000}
                        />
                      </Field>
                    </details>
                    {subscription && (
                      <details className="subs-disclosure min-w-0">
                        <summary>Recorded prices</summary>
                        <section aria-label="Recorded price changes" className="flex flex-col gap-2 pt-3">
                          <p className="text-xs text-muted-foreground">Recorded changes, not payments.</p>
                          {historyLoading && (
                            <p className="text-xs text-muted-foreground" role="status">
                              Loading recorded prices…
                            </p>
                          )}
                          {historyError && (
                            <p className="text-xs text-destructive">Could not load recorded prices: {historyError}</p>
                          )}
                          {!historyLoading && !historyError && !history.length && (
                            <p className="text-xs text-muted-foreground">No price records yet.</p>
                          )}
                          <ul className="flex max-h-32 flex-col gap-2 overflow-y-auto">
                            {history.map((record) => (
                              <li
                                key={`${record.date}-${record.currency}-${record.price}`}
                                className="flex justify-between gap-3 text-xs"
                              >
                                <span className="text-muted-foreground">{new Date(record.date).toLocaleString()}</span>
                                <span>{formatMoney(record.price, record.currency)}</span>
                              </li>
                            ))}
                          </ul>
                        </section>
                      </details>
                    )}
                  </FieldGroup>
                </FieldGroup>
              </FieldSet>
            </form>
          </FieldGroup>
        </div>
        <DialogFooter className="mx-0 mb-0 shrink-0 flex-row flex-wrap items-center justify-end px-4 py-3">
          {subscription && (
            <Button
              type="button"
              variant="destructive"
              className="mr-auto max-sm:w-full"
              disabled={busy}
              onClick={() => {
                if (pending.current || !active.current) return
                active.current = false
                onDelete(subscription.id, draftRevision)
              }}
            >
              Delete subscription
            </Button>
          )}
          <Button type="button" variant="outline" onClick={close} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" form="subscription-form" disabled={busy || conflict}>
            {action === 'saving' ? 'Saving…' : 'Save subscription'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
