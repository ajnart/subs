import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react'
import { useEffect, useId, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { errorMessage, isRevisionConflict } from '@/lib/api'
import {
  type QuickSetupDraft,
  type QuickSetupErrors,
  quickSetupHostname,
  quickSetupInput,
  quickSetupLimit,
  sameQuickSetupService,
  validateQuickSetupDraft,
} from '@/lib/quick-setup'
import { templates } from '@/lib/templates'
import type { AppData, BillingCycle, Subscription, SubscriptionInput, SubscriptionStatus } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Choice, categories, currencies, cycles, Notice, ServiceMark, serviceUrl, statuses } from './shared'

export type QuickSetupSeed = { input: SubscriptionInput; price: string }

function initialRows(seed: QuickSetupSeed | undefined): QuickSetupDraft[] {
  if (!seed) return []
  const preset = templates.find(
    (template) =>
      template.name.toLowerCase() === seed.input.name.trim().toLowerCase() &&
      quickSetupHostname(template.domain) === quickSetupHostname(seed.input.domain),
  )
  let key = 'initial-draft'
  if (preset) key = `preset-${preset.domain}`
  return [{ key, input: { ...seed.input }, price: seed.price, selected: true }]
}

function ReviewRow({
  row,
  index,
  id,
  errors,
  duplicates,
  disabled,
  onChange,
  onPrice,
  onRemove,
}: {
  row: QuickSetupDraft
  index: number
  id: string
  errors: QuickSetupErrors
  duplicates: string[]
  disabled: boolean
  onChange: <K extends keyof SubscriptionInput>(field: K, value: SubscriptionInput[K]) => void
  onPrice: (price: string) => void
  onRemove: () => void
}) {
  const input = row.input
  const name = input.name.trim() || `Subscription ${index + 1}`
  const fieldId = (field: keyof SubscriptionInput) => `${id}-${row.key}-${field}`
  const descriptionId = (field: keyof SubscriptionInput) => {
    if (errors[field]) return `${fieldId(field)}-error`
    return undefined
  }
  const extraErrors = Boolean(
    errors.nextPaymentDate || errors.trialEndsAt || errors.category || errors.status || errors.icon || errors.notes,
  )
  const detailsRef = useRef<HTMLDetailsElement>(null)
  useEffect(() => {
    if (extraErrors && detailsRef.current) detailsRef.current.open = true
  }, [extraErrors])
  return (
    <FieldSet className="min-w-0 gap-2 rounded-lg border p-3" disabled={disabled}>
      <FieldLegend className="sr-only">
        Subscription {index + 1}: {name}
      </FieldLegend>
      <FieldGroup className="grid min-w-0 grid-cols-2 items-start gap-3 sm:grid-cols-6 lg:grid-cols-[2.75rem_minmax(0,1.25fr)_minmax(0,1.5fr)_minmax(0,0.85fr)_5rem_minmax(0,1fr)_2rem]">
        <div className="col-span-2 col-start-1 row-start-1 flex min-w-0 items-center gap-3 pr-10 sm:col-span-6 lg:col-span-1 lg:col-start-1 lg:self-end lg:pr-0">
          <ServiceMark name={input.name} domain={input.domain} icon={input.icon} />
          <div className="min-w-0 lg:sr-only">
            <p className="truncate font-medium">{name}</p>
            <p className="text-xs text-muted-foreground">Plan {index + 1}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="col-start-2 row-start-1 justify-self-end sm:col-start-6 lg:col-start-7 lg:self-end"
          aria-label={`Remove ${name}`}
          onClick={onRemove}
        >
          <TrashIcon />
        </Button>
        <Field
          className="col-span-2 min-w-0 gap-1 sm:col-span-3 lg:col-span-1 lg:col-start-2 lg:row-start-1"
          data-invalid={Boolean(errors.name)}
        >
          <FieldLabel htmlFor={fieldId('name')}>
            Name <span className="sr-only">for plan {index + 1}</span>
          </FieldLabel>
          <Input
            id={fieldId('name')}
            value={input.name}
            onChange={(event) => onChange('name', event.target.value)}
            placeholder="Service or plan name"
            maxLength={200}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={descriptionId('name')}
            required
          />
          <FieldError id={`${fieldId('name')}-error`}>{errors.name}</FieldError>
        </Field>
        <Field
          className="col-span-2 min-w-0 gap-1 sm:col-span-3 lg:col-span-1 lg:col-start-3 lg:row-start-1"
          data-invalid={Boolean(errors.domain)}
        >
          <FieldLabel htmlFor={fieldId('domain')}>
            Website <span className="sr-only">for plan {index + 1}</span>
          </FieldLabel>
          <Input
            id={fieldId('domain')}
            inputMode="url"
            value={input.domain}
            onChange={(event) => onChange('domain', event.target.value)}
            placeholder="service.com or a full link"
            maxLength={2048}
            autoComplete="off"
            aria-invalid={Boolean(errors.domain)}
            aria-describedby={descriptionId('domain')}
          />
          <FieldError id={`${fieldId('domain')}-error`}>{errors.domain}</FieldError>
        </Field>
        <Field
          className="min-w-0 gap-1 sm:col-span-2 lg:col-span-1 lg:col-start-4 lg:row-start-1"
          data-invalid={Boolean(errors.price)}
        >
          <FieldLabel htmlFor={fieldId('price')}>
            Price <span className="sr-only">for plan {index + 1}</span>
          </FieldLabel>
          <Input
            id={fieldId('price')}
            inputMode="decimal"
            value={row.price}
            onChange={(event) => onPrice(event.target.value)}
            placeholder="Your price"
            autoComplete="off"
            aria-invalid={Boolean(errors.price)}
            aria-describedby={descriptionId('price')}
            required
          />
          <FieldError id={`${fieldId('price')}-error`}>{errors.price}</FieldError>
        </Field>
        <Field
          className="min-w-0 gap-1 sm:col-span-2 lg:col-span-1 lg:col-start-5 lg:row-start-1"
          data-invalid={Boolean(errors.currency)}
        >
          <FieldLabel htmlFor={fieldId('currency')}>
            Currency <span className="sr-only">for plan {index + 1}</span>
          </FieldLabel>
          <Input
            id={fieldId('currency')}
            value={input.currency}
            onChange={(event) => onChange('currency', event.target.value.toUpperCase())}
            list={`${id}-currencies`}
            maxLength={3}
            autoComplete="off"
            aria-invalid={Boolean(errors.currency)}
            aria-describedby={descriptionId('currency')}
            required
          />
          <FieldError id={`${fieldId('currency')}-error`}>{errors.currency}</FieldError>
        </Field>
        <Field
          className="col-span-2 min-w-0 gap-1 sm:col-span-2 lg:col-span-1 lg:col-start-6 lg:row-start-1"
          data-invalid={Boolean(errors.billingCycle)}
        >
          <FieldLabel htmlFor={fieldId('billingCycle')}>Billing cycle</FieldLabel>
          <Choice
            id={fieldId('billingCycle')}
            label={`Billing cycle for plan ${index + 1}`}
            value={input.billingCycle}
            options={cycles}
            onChange={(value) => onChange('billingCycle', value as BillingCycle)}
          />
          <FieldError>{errors.billingCycle}</FieldError>
        </Field>
      </FieldGroup>
      <div className="grid min-w-0 items-start gap-2 lg:grid-cols-[minmax(0,1fr)_auto]">
        {duplicates.length > 0 && (
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <Badge variant="outline">Possible duplicate</Badge>
            {duplicates.map((message) => (
              <p key={message} className="min-w-0 break-words">
                {message}
              </p>
            ))}
          </div>
        )}
        <details ref={detailsRef} className="min-w-0 lg:col-start-2 lg:open:col-span-2 lg:open:col-start-1">
          <summary className="cursor-pointer py-0.5 text-xs font-medium text-muted-foreground">
            Dates, icon & other details
          </summary>
          <FieldGroup className="pt-3">
            <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field data-invalid={Boolean(errors.nextPaymentDate)}>
                <FieldLabel htmlFor={fieldId('nextPaymentDate')}>Next payment (optional)</FieldLabel>
                <Input
                  id={fieldId('nextPaymentDate')}
                  type="date"
                  value={input.nextPaymentDate}
                  onChange={(event) => onChange('nextPaymentDate', event.target.value)}
                  aria-invalid={Boolean(errors.nextPaymentDate)}
                  aria-describedby={descriptionId('nextPaymentDate')}
                />
                <FieldDescription>No date, no forecast.</FieldDescription>
                <FieldError id={`${fieldId('nextPaymentDate')}-error`}>{errors.nextPaymentDate}</FieldError>
              </Field>
              <Field data-invalid={Boolean(errors.trialEndsAt)}>
                <FieldLabel htmlFor={fieldId('trialEndsAt')}>Trial ends (optional)</FieldLabel>
                <Input
                  id={fieldId('trialEndsAt')}
                  type="date"
                  value={input.trialEndsAt ?? ''}
                  onChange={(event) => onChange('trialEndsAt', event.target.value || null)}
                  aria-invalid={Boolean(errors.trialEndsAt)}
                  aria-describedby={descriptionId('trialEndsAt')}
                />
                <FieldError id={`${fieldId('trialEndsAt')}-error`}>{errors.trialEndsAt}</FieldError>
              </Field>
              <Field data-invalid={Boolean(errors.category)}>
                <FieldLabel htmlFor={fieldId('category')}>Category</FieldLabel>
                <Input
                  id={fieldId('category')}
                  value={input.category}
                  onChange={(event) => onChange('category', event.target.value)}
                  list={`${id}-categories`}
                  maxLength={100}
                  aria-invalid={Boolean(errors.category)}
                  aria-describedby={descriptionId('category')}
                  required
                />
                <FieldError id={`${fieldId('category')}-error`}>{errors.category}</FieldError>
              </Field>
              <Field data-invalid={Boolean(errors.status)}>
                <FieldLabel htmlFor={fieldId('status')}>Status</FieldLabel>
                <Choice
                  id={fieldId('status')}
                  label={`Status for plan ${index + 1}`}
                  value={input.status}
                  options={statuses}
                  onChange={(value) => onChange('status', value as SubscriptionStatus)}
                />
                <FieldError>{errors.status}</FieldError>
              </Field>
            </FieldGroup>
            <Field data-invalid={Boolean(errors.icon)}>
              <FieldLabel htmlFor={fieldId('icon')}>Icon URL (optional)</FieldLabel>
              <Input
                id={fieldId('icon')}
                inputMode="url"
                value={input.icon ?? ''}
                onChange={(event) => onChange('icon', event.target.value)}
                placeholder="https://…/icon.png"
                maxLength={2048}
                autoComplete="off"
                aria-invalid={Boolean(errors.icon)}
                aria-describedby={descriptionId('icon')}
              />
              <FieldDescription>
                A public image URL, loaded only by your browser. Clear to use the service mark.
              </FieldDescription>
              <FieldError id={`${fieldId('icon')}-error`}>{errors.icon}</FieldError>
            </Field>
            <Field data-invalid={Boolean(errors.notes)}>
              <FieldLabel htmlFor={fieldId('notes')}>Notes</FieldLabel>
              <Textarea
                id={fieldId('notes')}
                value={input.notes}
                onChange={(event) => onChange('notes', event.target.value)}
                rows={2}
                maxLength={10000}
                aria-invalid={Boolean(errors.notes)}
                aria-describedby={descriptionId('notes')}
              />
              <FieldError id={`${fieldId('notes')}-error`}>{errors.notes}</FieldError>
            </Field>
          </FieldGroup>
        </details>
      </div>
    </FieldSet>
  )
}

export function QuickSetup({
  currency,
  subscriptions,
  revision,
  initialDraft,
  onClose,
  onSave,
  onReview,
}: {
  currency: string
  subscriptions: Subscription[]
  revision: string | null
  initialDraft?: QuickSetupSeed
  onClose: () => void
  onSave: (inputs: SubscriptionInput[], revision: string | null) => Promise<void>
  onReview: () => Promise<{ data: AppData; revision: string }>
}) {
  const id = useId()
  const [rows, setRows] = useState(() => initialRows(initialDraft))
  const [stage, setStage] = useState<'choose' | 'review'>('choose')
  const [query, setQuery] = useState('')
  const [paste, setPaste] = useState('')
  const [pasteErrors, setPasteErrors] = useState<string[]>([])
  const [pasteOpen, setPasteOpen] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [attempted, setAttempted] = useState(false)
  const [busy, setBusy] = useState<'save' | 'review' | null>(null)
  const [draftRevision, setDraftRevision] = useState(revision)
  const [collection, setCollection] = useState(subscriptions)
  const [conflict, setConflict] = useState(revision === null)
  const active = useRef(true)
  const pending = useRef(false)
  const operation = useRef(0)
  const nextRow = useRef(0)
  const body = useRef<HTMLDivElement>(null)
  const selected = rows.filter((row) => row.selected)
  const filtered = templates.filter((template) =>
    `${template.name} ${template.domain} ${template.category}`.toLowerCase().includes(query.trim().toLowerCase()),
  )
  const ownDrafts = rows.filter((row) => !row.key.startsWith('preset-'))
  const validations = selected.map((row) => validateQuickSetupDraft(row))
  const duplicateHints = selected.map((row) => {
    const hints: string[] = []
    const existing = collection.filter((item) => sameQuickSetupService(row.input, item))
    const similar = selected.filter((other) => other.key !== row.key && sameQuickSetupService(row.input, other.input))
    if (existing.length) hints.push(`Already in your collection: ${existing.map((item) => item.name).join(', ')}.`)
    if (similar.length)
      hints.push(`Also selected: ${similar.map((item) => item.input.name || 'Untitled service').join(', ')}.`)
    return hints
  })

  useEffect(() => {
    active.current = true
    const invalidate = () => {
      active.current = false
      operation.current += 1
    }
    window.addEventListener('subs:locked', invalidate)
    return () => {
      invalidate()
      window.removeEventListener('subs:locked', invalidate)
    }
  }, [])

  const close = () => {
    if (pending.current || !active.current) return
    active.current = false
    operation.current += 1
    onClose()
  }
  const focusField = (key: string, field: keyof SubscriptionInput) => {
    requestAnimationFrame(() => {
      if (!active.current) return
      const control = document.getElementById(`${id}-${key}-${field}`)
      const details = control?.closest('details')
      if (details) details.open = true
      control?.focus()
    })
  }
  const showError = (value: string) => {
    setError(value)
    body.current?.scrollTo({ top: 0 })
  }
  const toggle = (key: string, preset?: (typeof templates)[number]) => {
    if (pending.current || !active.current) return
    const current = rows.find((row) => row.key === key)
    if (!current?.selected && selected.length >= quickSetupLimit) {
      showError('You can add up to 100 subscriptions at once. Deselect a service or save this batch first.')
      return
    }
    setRows((previous) => {
      if (current) return previous.map((row) => (row.key === key ? { ...row, selected: !row.selected } : row))
      if (!preset) return previous
      return [...previous, { key, input: quickSetupInput(currency, preset), price: '', selected: true }]
    })
    if (!conflict) setError('')
    setMessage('')
  }
  const change = <K extends keyof SubscriptionInput>(key: string, field: K, value: SubscriptionInput[K]) => {
    if (pending.current || !active.current) return
    setRows((previous) =>
      previous.map((row) => (row.key === key ? { ...row, input: { ...row.input, [field]: value } } : row)),
    )
    if (!conflict) setError('')
  }
  const price = (key: string, value: string) => {
    if (pending.current || !active.current) return
    setRows((previous) => previous.map((row) => (row.key === key ? { ...row, price: value } : row)))
    if (!conflict) setError('')
  }
  const pendingLinks = () => {
    if (!paste.trim()) return false
    setPasteOpen(true)
    showError('Some pasted links are not added yet. Add them, correct them, or clear the pasted text before reviewing.')
    requestAnimationFrame(() => {
      if (active.current) document.getElementById(`${id}-links`)?.focus()
    })
    return true
  }
  const reviewSelection = () => {
    if (pending.current || !active.current || pendingLinks() || !selected.length) return
    setStage('review')
    body.current?.scrollTo({ top: 0 })
    const first = selected[0]
    if (first) focusField(first.key, first.input.name.trim() ? 'price' : 'name')
  }
  const addCustom = () => {
    if (pending.current || !active.current || pendingLinks()) return
    if (selected.length >= quickSetupLimit) {
      showError('This batch already has 100 subscriptions. Remove a row or save it before adding another.')
      return
    }
    const key = `custom-${nextRow.current++}`
    setRows((previous) => [...previous, { key, input: quickSetupInput(currency), price: '', selected: true }])
    setStage('review')
    focusField(key, 'name')
  }
  const addLinks = () => {
    if (pending.current || !active.current) return
    const remaining: string[] = []
    const problems: string[] = []
    const additions: QuickSetupDraft[] = []
    const lines = paste.split(/\r?\n/)
    for (const raw of lines) {
      const value = raw.trim()
      if (!value) continue
      const host = quickSetupHostname(value)
      if (
        !serviceUrl(value) ||
        !host ||
        /\s/.test(value) ||
        value.length > 2048 ||
        (!value.includes('://') && !host.includes('.'))
      ) {
        remaining.push(raw)
        problems.push(
          `Remaining line ${remaining.length}: use one HTTP(S) website per line, without credentials (up to 2,048 characters).`,
        )
        continue
      }
      if (selected.length + additions.length >= quickSetupLimit) {
        remaining.push(raw)
        problems.push(
          `Remaining line ${remaining.length}: the 100-row limit is reached. Remove a selection or save this batch first.`,
        )
        continue
      }
      const preset = templates.find((template) => sameQuickSetupService({ name: '', domain: value }, template))
      const input = quickSetupInput(currency, {
        name: preset?.name ?? host,
        domain: value,
        category: preset?.category ?? 'Other',
      })
      additions.push({ key: `custom-${nextRow.current++}`, input, price: '', selected: true })
    }
    setRows((previous) => [...previous, ...additions])
    setPaste(remaining.join('\n'))
    setPasteErrors(problems)
    if (!conflict) setError('')
    if (additions.length) setMessage(`Added ${additions.length} website drafts. Enter your prices in review.`)
    else if (!problems.length) setPasteErrors(['Paste at least one website link to add.'])
  }
  const reviewLatest = async () => {
    if (pending.current || !active.current) return
    pending.current = true
    const token = ++operation.current
    setBusy('review')
    setMessage('')
    try {
      const snapshot = await onReview()
      if (!active.current || token !== operation.current) return
      setCollection(snapshot.data.subscriptions)
      setDraftRevision(snapshot.revision)
      setConflict(false)
      setError('')
      setMessage(
        'Latest collection loaded. Your drafts are unchanged and duplicate hints are updated. Review, then save when ready.',
      )
    } catch (cause) {
      if (active.current && token === operation.current) showError(errorMessage(cause))
    } finally {
      if (active.current && token === operation.current) {
        pending.current = false
        setBusy(null)
      }
    }
  }
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (pending.current || !active.current || conflict || stage !== 'review') return
    if (selected.length > quickSetupLimit) {
      showError('This batch has more than 100 subscriptions. Remove extra selections before saving.')
      return
    }
    setAttempted(true)
    const inputs: SubscriptionInput[] = []
    let firstInvalid: { key: string; field: keyof SubscriptionInput } | undefined
    for (const [index, validation] of validations.entries()) {
      if (validation.success) inputs.push(validation.input)
      else if (!firstInvalid) {
        const row = selected[index]
        const field = Object.keys(validation.errors)[0] as keyof SubscriptionInput
        if (row) firstInvalid = { key: row.key, field }
      }
    }
    if (firstInvalid) {
      showError(
        'Review the highlighted fields. Every selected plan needs a name and an explicit price; nothing has been saved.',
      )
      focusField(firstInvalid.key, firstInvalid.field)
      return
    }
    if (!inputs.length || pendingLinks()) return
    pending.current = true
    const token = ++operation.current
    setBusy('save')
    setError('')
    setMessage('')
    try {
      await onSave(inputs, draftRevision)
      if (!active.current || token !== operation.current) return
      active.current = false
      operation.current += 1
      onClose()
    } catch (cause) {
      if (!active.current || token !== operation.current) return
      showError(errorMessage(cause))
      setConflict(isRevisionConflict(cause))
    } finally {
      if (active.current && token === operation.current) {
        pending.current = false
        setBusy(null)
      }
    }
  }

  let primaryLabel = `Review ${selected.length} selected`
  if (stage === 'review') primaryLabel = `Save ${selected.length} subscriptions`
  if (stage === 'review' && selected.length === 1) primaryLabel = 'Save 1 subscription'
  if (busy === 'save') primaryLabel = 'Saving…'

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      <DialogContent
        className="flex max-h-[92svh] flex-col gap-0 overflow-hidden sm:h-[600px] sm:max-h-[calc(100svh-4rem)] sm:max-w-5xl"
        showCloseButton={!busy}
      >
        <DialogHeader className="shrink-0 gap-2 pb-3 pr-8 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-x-6">
          <DialogTitle>Add several subscriptions</DialogTitle>
          <DialogDescription className="sm:col-start-1">
            Choose your services, enter what you pay, and save them together.
          </DialogDescription>
          <ol
            aria-label="Quick setup progress"
            className="flex flex-wrap items-center gap-2 text-xs sm:col-start-2 sm:row-span-2 sm:row-start-1"
          >
            <li
              aria-current={stage === 'choose' ? 'step' : undefined}
              className={cn('flex items-center gap-2', stage === 'review' && 'text-muted-foreground')}
            >
              <Badge variant="outline">1</Badge> Choose services
              <ArrowRightIcon aria-hidden="true" />
            </li>
            <li
              aria-current={stage === 'review' ? 'step' : undefined}
              className={cn('flex items-center gap-2', stage === 'choose' && 'text-muted-foreground')}
            >
              <Badge variant="outline">2</Badge> Review & price
            </li>
          </ol>
        </DialogHeader>
        <Separator />
        <div ref={body} className="-mx-4 min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-3">
          <div className="flex flex-col gap-3">
            {(error || conflict) && (
              <Notice title={conflict ? 'Review the latest collection before saving' : 'Check your selection'}>
                {error && <p>{error}</p>}
                {conflict && (
                  <>
                    <p>
                      Your drafts are kept here. Load the latest collection to check for plans added elsewhere, then
                      save again.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={Boolean(busy)}
                      onClick={() => void reviewLatest()}
                    >
                      {busy === 'review' ? 'Loading latest…' : 'Refresh and review latest collection'}
                    </Button>
                  </>
                )}
              </Notice>
            )}
            {message && (
              <p role="status" className="text-sm text-muted-foreground">
                {message}
              </p>
            )}
            {stage === 'choose' && (
              <FieldGroup>
                <div className="flex flex-wrap items-end gap-3">
                  <Field className="min-w-0 flex-1">
                    <FieldLabel htmlFor={`${id}-search`}>Find a service</FieldLabel>
                    <Input
                      id={`${id}-search`}
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search services, websites or categories"
                      autoComplete="off"
                      autoFocus
                      disabled={Boolean(busy)}
                    />
                  </Field>
                  <Button type="button" variant="outline" onClick={addCustom} disabled={Boolean(busy)}>
                    <PlusIcon data-icon="inline-start" /> Add custom
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  New plans start monthly, active, in {currency}, with no dates. Prices are always yours to enter.
                </p>
                {selected.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2" aria-live="polite">
                    <Badge variant="secondary">
                      <CheckIcon data-icon="inline-start" />
                      {selected.length} selected
                    </Badge>
                    <span className="min-w-0 text-xs text-muted-foreground">
                      {selected
                        .slice(0, 5)
                        .map((row) => row.input.name || 'Untitled service')
                        .join(', ')}
                      {selected.length > 5 && ` and ${selected.length - 5} more`}
                    </span>
                  </div>
                )}
                <details
                  className="subs-disclosure"
                  open={pasteOpen}
                  onToggle={(event) => setPasteOpen(event.currentTarget.open)}
                >
                  <summary>Paste several website links</summary>
                  <FieldGroup className="pt-4">
                    <Field data-invalid={pasteErrors.length > 0}>
                      <FieldLabel htmlFor={`${id}-links`}>Website links, one per line</FieldLabel>
                      <Textarea
                        id={`${id}-links`}
                        value={paste}
                        onChange={(event) => {
                          setPaste(event.target.value)
                          setPasteErrors([])
                        }}
                        placeholder={'https://service.com/your-plan\nhttps://another-service.com'}
                        rows={3}
                        disabled={Boolean(busy)}
                        aria-invalid={pasteErrors.length > 0}
                        aria-describedby={`${id}-links-help`}
                      />
                      <FieldDescription id={`${id}-links-help`}>
                        Full paths and query strings are kept. Up to 100 selected rows; invalid or extra lines stay here
                        for correction.
                      </FieldDescription>
                      <FieldError errors={pasteErrors.map((message) => ({ message }))} />
                    </Field>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" onClick={addLinks} disabled={Boolean(busy)}>
                        <PlusIcon data-icon="inline-start" />
                        Add links
                      </Button>
                      {paste && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setPaste('')
                            setPasteErrors([])
                          }}
                          disabled={Boolean(busy)}
                        >
                          Clear pasted text
                        </Button>
                      )}
                    </div>
                  </FieldGroup>
                </details>
                {ownDrafts.length > 0 && (
                  <FieldSet>
                    <FieldLegend variant="label">Your drafts</FieldLegend>
                    <FieldGroup className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {ownDrafts.map((row, index) => (
                        <FieldLabel key={row.key} htmlFor={`${id}-select-${row.key}`}>
                          <Field orientation="horizontal" data-disabled={Boolean(busy)}>
                            <ServiceMark name={row.input.name} domain={row.input.domain} icon={row.input.icon} />
                            <FieldContent className="min-w-0">
                              <FieldTitle className="truncate">{row.input.name || 'Untitled service'}</FieldTitle>
                              <FieldDescription className="truncate">
                                {row.input.domain || 'Custom subscription'}
                              </FieldDescription>
                            </FieldContent>
                            <Checkbox
                              id={`${id}-select-${row.key}`}
                              aria-label={
                                row.input.name.trim() || row.input.domain.trim() || `Custom subscription ${index + 1}`
                              }
                              checked={row.selected}
                              onCheckedChange={() => toggle(row.key)}
                              disabled={Boolean(busy)}
                            />
                          </Field>
                        </FieldLabel>
                      ))}
                    </FieldGroup>
                  </FieldSet>
                )}
                {categories.map((category) => {
                  const services = filtered.filter((template) => template.category === category)
                  if (!services.length) return null
                  return (
                    <FieldSet key={category}>
                      <FieldLegend variant="label">{category}</FieldLegend>
                      <FieldGroup className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {services.map((template) => {
                          const key = `preset-${template.domain}`
                          const row = rows.find((item) => item.key === key)
                          const tracked = collection.some((item) => sameQuickSetupService(template, item))
                          const similar = selected.some(
                            (item) => item.key !== key && sameQuickSetupService(template, item.input),
                          )
                          return (
                            <FieldLabel key={key} htmlFor={`${id}-select-${key}`}>
                              <Field orientation="horizontal" data-disabled={Boolean(busy)}>
                                <ServiceMark name={template.name} domain={template.domain} />
                                <FieldContent className="min-w-0">
                                  <FieldTitle>{template.name}</FieldTitle>
                                  <FieldDescription>{template.domain}</FieldDescription>
                                  {tracked && <Badge variant="outline">Already tracked</Badge>}
                                  {!tracked && similar && <Badge variant="outline">Similar selected</Badge>}
                                </FieldContent>
                                <Checkbox
                                  id={`${id}-select-${key}`}
                                  aria-label={template.name}
                                  checked={Boolean(row?.selected)}
                                  onCheckedChange={() => toggle(key, template)}
                                  disabled={Boolean(busy)}
                                />
                              </Field>
                            </FieldLabel>
                          )
                        })}
                      </FieldGroup>
                    </FieldSet>
                  )
                })}
                {!filtered.length && (
                  <Empty>
                    <EmptyHeader>
                      <EmptyTitle>No matching presets</EmptyTitle>
                      <EmptyDescription>Try another search, paste a website, or add a custom service.</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
              </FieldGroup>
            )}
            {stage === 'review' && (
              <>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-medium">Your plans, your prices</h3>
                    <p className="text-sm text-muted-foreground">
                      Price per billing cycle; enter 0 for a free plan. Nothing is saved yet.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="self-start"
                    disabled={Boolean(busy)}
                    onClick={() => {
                      setStage('choose')
                      body.current?.scrollTo({ top: 0 })
                    }}
                  >
                    <ArrowLeftIcon data-icon="inline-start" />
                    Choose more
                  </Button>
                </div>
                {duplicateHints.some((hints) => hints.length > 0) && (
                  <p className="text-xs text-muted-foreground">
                    Similar services can be separate plans. Check the hints below; every selected row is added
                    separately, never merged, skipped or overwritten.
                  </p>
                )}
                <form id={`${id}-form`} onSubmit={(event) => void submit(event)} noValidate>
                  <FieldGroup className="gap-2">
                    {selected.map((row, index) => {
                      const validation = validations[index]
                      let errors: QuickSetupErrors = {}
                      if (attempted && validation && !validation.success) errors = validation.errors
                      return (
                        <ReviewRow
                          key={row.key}
                          row={row}
                          index={index}
                          id={id}
                          errors={errors}
                          duplicates={duplicateHints[index] ?? []}
                          disabled={Boolean(busy)}
                          onChange={(field, value) => change(row.key, field, value)}
                          onPrice={(value) => price(row.key, value)}
                          onRemove={() => toggle(row.key)}
                        />
                      )
                    })}
                    {!selected.length && (
                      <Empty>
                        <EmptyHeader>
                          <EmptyTitle>No subscriptions selected</EmptyTitle>
                          <EmptyDescription>Choose a preset or add a custom service to continue.</EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      className="self-start"
                      onClick={addCustom}
                      disabled={Boolean(busy)}
                    >
                      <PlusIcon data-icon="inline-start" />
                      Add custom service
                    </Button>
                  </FieldGroup>
                </form>
                <datalist id={`${id}-currencies`}>
                  {currencies.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
                <datalist id={`${id}-categories`}>
                  {categories.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </>
            )}
          </div>
        </div>
        <DialogFooter className="mt-3 shrink-0 flex-row flex-wrap items-center">
          <p className="basis-full text-xs text-muted-foreground sm:flex-1 sm:basis-auto" aria-live="polite">
            {selected.length} of {quickSetupLimit} selected · One save, no automatic additions
          </p>
          <Button type="button" variant="outline" onClick={close} disabled={Boolean(busy)}>
            Cancel
          </Button>
          {stage === 'choose' && (
            <Button type="button" onClick={reviewSelection} disabled={Boolean(busy) || !selected.length}>
              {primaryLabel}
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          )}
          {stage === 'review' && (
            <Button type="submit" form={`${id}-form`} disabled={Boolean(busy) || conflict || !selected.length}>
              {primaryLabel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
