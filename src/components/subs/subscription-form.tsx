import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { api, errorMessage, isRevisionConflict } from '@/lib/api'
import { formatMoney } from '@/lib/subscriptions'
import type { AppData, BillingCycle, Subscription, SubscriptionInput, SubscriptionStatus } from '@/lib/types'
import { Choice, categories, currencies, cycles, Notice, serviceUrl, statuses } from './shared'

export function SubscriptionForm({
  subscription,
  currency,
  onClose,
  onSave,
  onDelete,
  template,
  revision,
  onReview,
}: {
  subscription?: Subscription
  currency: string
  onClose: () => void
  onSave: (input: SubscriptionInput, id?: string, revision?: string | null) => Promise<void>
  onDelete: (id: string, revision: string | null) => void
  template?: { name: string; domain: string; category: string }
  revision: string | null
  onReview: () => Promise<{ data: AppData; revision: string }>
}) {
  const today = new Date()
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const [form, setForm] = useState<SubscriptionInput>(
    subscription ?? {
      name: template?.name ?? '',
      domain: template?.domain ?? '',
      category: template?.category ?? 'Other',
      price: 0,
      currency,
      billingCycle: 'monthly',
      nextPaymentDate: date,
      status: 'active',
      trialEndsAt: null,
      notes: '',
    },
  )
  const [price, setPrice] = useState(subscription ? String(subscription.price) : '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [draftRevision, setDraftRevision] = useState(revision)
  const [conflict, setConflict] = useState(false)
  const [latest, setLatest] = useState<{ subscription: Subscription; revision: string } | null>(null)
  const [history, setHistory] = useState<{ date: string; price: number; currency: string }[]>([])
  const [historyError, setHistoryError] = useState('')
  const [historyLoading, setHistoryLoading] = useState(Boolean(subscription))
  const website = serviceUrl(form.domain)
  useEffect(() => {
    if (!subscription) return
    const controller = new AbortController()
    api<{ date: string; price: number; currency: string }[]>(`/history/${encodeURIComponent(subscription.id)}`, {
      signal: controller.signal,
    })
      .then((result) => {
        if (!controller.signal.aborted) setHistory(result)
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setHistoryError(errorMessage(cause))
      })
      .finally(() => {
        if (!controller.signal.aborted) setHistoryLoading(false)
      })
    return () => controller.abort()
  }, [subscription])
  const change = <K extends keyof SubscriptionInput>(key: K, value: SubscriptionInput[K]) =>
    setForm((previous) => ({ ...previous, [key]: value }))
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (conflict) return
    if (!form.name.trim() || !price || !Number.isFinite(Number(price)) || Number(price) < 0) {
      setError('Enter a service name and a valid, non-negative price.')
      return
    }
    setBusy(true)
    setError('')
    const {
      name,
      domain,
      category,
      currency: selectedCurrency,
      billingCycle,
      nextPaymentDate,
      status,
      trialEndsAt,
      notes,
    } = form
    try {
      await onSave(
        {
          name: name.trim(),
          domain: domain.trim(),
          category,
          currency: selectedCurrency.toUpperCase(),
          billingCycle,
          nextPaymentDate,
          status,
          trialEndsAt,
          notes,
          price: Number(price),
        },
        subscription?.id,
        subscription ? draftRevision : undefined,
      )
      onClose()
    } catch (cause) {
      setError(errorMessage(cause))
      setConflict(isRevisionConflict(cause))
    } finally {
      setBusy(false)
    }
  }
  const reviewLatest = async () => {
    setBusy(true)
    try {
      const snapshot = await onReview()
      if (!subscription) {
        setConflict(false)
        setError('Collection refreshed. Your new subscription draft is unchanged; review it before saving again.')
        return
      }
      const current = snapshot.data.subscriptions.find((item) => item.id === subscription.id)
      if (!current)
        throw new Error(
          'This subscription was deleted elsewhere. Your draft has been kept here; close this dialog to return to the refreshed collection.',
        )
      setLatest({ subscription: current, revision: snapshot.revision })
    } catch (cause) {
      setError(errorMessage(cause))
    } finally {
      setBusy(false)
    }
  }
  const useLatest = () => {
    if (!latest) return
    setForm(latest.subscription)
    setPrice(String(latest.subscription.price))
    setDraftRevision(latest.revision)
    setLatest(null)
    setConflict(false)
    setError('')
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose()
      }}
    >
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{subscription ? 'Edit subscription' : 'Add a subscription'}</DialogTitle>
          <DialogDescription>Enter your plan details.</DialogDescription>
        </DialogHeader>
        <form id="subscription-form" onSubmit={submit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="service-name">Service name</FieldLabel>
              <Input
                id="service-name"
                placeholder="e.g. Spotify"
                value={form.name}
                onChange={(event) => change('name', event.target.value)}
                maxLength={200}
                required
                autoFocus
              />
            </Field>
            <FieldGroup className="grid grid-cols-1 gap-4 min-[400px]:grid-cols-2">
              <Field data-invalid={Boolean(error) && !price}>
                <FieldLabel htmlFor="price">Price per billing cycle</FieldLabel>
                <Input
                  id="price"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="1000000000"
                  step="any"
                  placeholder="0.00"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  aria-invalid={Boolean(error) && !price}
                  required
                />
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
                  required
                />
                <datalist id="currencies">
                  {currencies.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </Field>
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
                <FieldDescription>Optional. No date, no forecast.</FieldDescription>
              </Field>
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
                <FieldDescription>Tracking only. Cancel plans with the provider.</FieldDescription>
              </Field>
            </FieldGroup>
            <details className="subs-disclosure">
              <summary>Website, trial & notes</summary>
              <FieldGroup className="pt-4">
                <Field>
                  <FieldLabel htmlFor="domain">
                    Website <span className="text-muted-foreground">(optional)</span>
                  </FieldLabel>
                  <Input
                    id="domain"
                    placeholder="spotify.com"
                    value={form.domain}
                    onChange={(event) => change('domain', event.target.value)}
                    maxLength={2048}
                  />
                  {website && (
                    <FieldDescription>
                      <a
                        href={website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-4"
                      >
                        Open website
                      </a>
                    </FieldDescription>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="trial">
                    Trial ends <span className="text-muted-foreground">(optional)</span>
                  </FieldLabel>
                  <Input
                    id="trial"
                    type="date"
                    value={form.trialEndsAt ?? ''}
                    onChange={(event) => change('trialEndsAt', event.target.value || null)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="notes">Notes</FieldLabel>
                  <Textarea
                    id="notes"
                    placeholder="Plan details or account email"
                    value={form.notes}
                    onChange={(event) => change('notes', event.target.value)}
                    maxLength={10000}
                  />
                </Field>
              </FieldGroup>
            </details>
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
                <Button type="button" variant="outline" size="sm" onClick={useLatest}>
                  Load latest details into form
                </Button>
              </Notice>
            )}
          </FieldGroup>
        </form>
        {subscription && (
          <>
            <Separator />
            <details className="subs-disclosure">
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
          </>
        )}
        <DialogFooter>
          {subscription && (
            <Button
              variant="ghost"
              className="mr-auto text-destructive"
              disabled={busy}
              onClick={() => onDelete(subscription.id, draftRevision)}
            >
              Delete subscription
            </Button>
          )}
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button form="subscription-form" disabled={busy || conflict}>
            {busy ? 'Saving…' : 'Save subscription'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
