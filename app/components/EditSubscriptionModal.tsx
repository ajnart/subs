import { zodResolver } from '@hookform/resolvers/zod'
import { useLoaderData } from '@remix-run/react'
import { CalendarIcon } from 'lucide-react'
import type React from 'react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '~/components/ui/button'
import { Calendar } from '~/components/ui/calendar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Switch } from '~/components/ui/switch'
import { cn } from '~/lib/utils'
import type { loader } from '~/routes/_index'
import { usePreferencesStore } from '~/store/preferences'
import {
  type BillingCycle,
  SUBSCRIPTION_CATEGORIES,
  type Subscription,
  type SubscriptionTemplate,
} from '~/store/subscriptionStore'
import { getRenewalDayOfMonth, initializeNextPaymentDate } from '~/utils/nextPaymentDate'
import { IconUrlInput } from './IconFinder'
import SubscriptionCard from './SubscriptionCard'

function getCurrencySymbol(currency: string): string {
  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(0)
      .replace(/[\d,. ]/g, '')
      .trim()
  } catch {
    return currency
  }
}

interface EditSubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (subscription: Omit<Subscription, 'id'>) => void
  editingSubscription: Subscription | null
  templateValues?: SubscriptionTemplate | null
}

const subscriptionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  currency: z.string().min(1, 'Currency is required'),
  domain: z.string().url('Invalid URL'),
  icon: z.string().optional(),
  billingCycle: z.enum(['monthly', 'yearly', 'weekly', 'daily']).optional(),
  nextPaymentDate: z.string().optional(),
  renewalDayOfMonth: z.number().int().min(1).max(31).optional(),
  showNextPayment: z.boolean().optional(),
  category: z.enum(SUBSCRIPTION_CATEGORIES).optional(),
})

type SubscriptionFormValues = z.infer<typeof subscriptionSchema>

const EditSubscriptionModal: React.FC<EditSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSubscription,
  templateValues,
}) => {
  const { rates } = useLoaderData<typeof loader>()
  const { selectedCurrency } = usePreferencesStore()
  const [calendarOpen, setCalendarOpen] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: '',
      price: 0,
      currency: 'USD',
      domain: '',
      icon: '',
      billingCycle: undefined as BillingCycle | undefined,
      nextPaymentDate: undefined as string | undefined,
      renewalDayOfMonth: undefined as number | undefined,
      showNextPayment: false,
      category: undefined as Subscription['category'] | undefined,
    },
  })

  useEffect(() => {
    if (editingSubscription) {
      reset({
        ...editingSubscription,
        renewalDayOfMonth:
          editingSubscription.renewalDayOfMonth ??
          (editingSubscription.billingCycle === 'monthly'
            ? getRenewalDayOfMonth(editingSubscription.nextPaymentDate)
            : undefined),
      })
    } else if (templateValues) {
      reset({
        name: templateValues.name,
        price: templateValues.price,
        currency: templateValues.currency,
        domain: templateValues.domain,
        icon: '',
        billingCycle: templateValues.billingCycle,
        nextPaymentDate: undefined,
        renewalDayOfMonth: undefined,
        showNextPayment: false,
        category: templateValues.category,
      })
    } else {
      reset({
        name: '',
        price: 0,
        currency: 'USD',
        domain: '',
        icon: '',
        billingCycle: undefined,
        nextPaymentDate: undefined,
        renewalDayOfMonth: undefined,
        showNextPayment: false,
        category: undefined,
      })
    }
  }, [editingSubscription, templateValues, reset])

  const watchedFields = watch()

  // Auto-calculate next payment date when billing cycle changes
  useEffect(() => {
    if (watchedFields.billingCycle && watchedFields.showNextPayment) {
      const currentDate = watchedFields.nextPaymentDate
      if (!currentDate) {
        const now = new Date()
        const newDate = initializeNextPaymentDate(watchedFields.billingCycle, now)
        setValue('nextPaymentDate', newDate)
        setValue('renewalDayOfMonth', watchedFields.billingCycle === 'monthly' ? now.getUTCDate() : undefined)
      }
    }
  }, [watchedFields.billingCycle, watchedFields.showNextPayment, setValue])

  const previewSubscription: Subscription = {
    id: 'preview',
    name: watchedFields.name || 'Example Subscription',
    price: watchedFields.price || 0,
    currency: watchedFields.currency || 'USD',
    domain: watchedFields.domain || 'https://example.com',
    icon: watchedFields.icon,
    billingCycle: watchedFields.billingCycle,
    nextPaymentDate: watchedFields.nextPaymentDate,
    renewalDayOfMonth: watchedFields.renewalDayOfMonth,
    showNextPayment: watchedFields.showNextPayment,
    category: (watchedFields.category as Subscription['category']) ?? undefined,
  }

  const onSubmit = (data: Omit<Subscription, 'id'>) => {
    onSave({
      ...data,
      renewalDayOfMonth:
        data.billingCycle === 'monthly'
          ? (data.renewalDayOfMonth ?? getRenewalDayOfMonth(data.nextPaymentDate))
          : undefined,
    })
    onClose()
  }

  const formatDateForDisplay = (dateString: string | undefined) => {
    if (!dateString) return 'Pick a date'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingSubscription ? 'Edit Subscription' : 'Add Subscription'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div>
                <IconUrlInput
                  value={watchedFields.icon || ''}
                  onChange={(value) => setValue('icon', value)}
                  label="Icon (optional)"
                  error={!!errors.icon}
                />
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => <Input id="name" {...field} className={errors.name ? 'border-red-500' : ''} />}
                />
                <p className="text-red-500 text-xs h-4">{errors.name?.message || '\u00A0'}</p>
              </div>
              <div>
                <div className="flex items-start space-x-2">
                  <div className="flex-1">
                    <Label htmlFor="price">Price</Label>
                    <Controller
                      name="price"
                      control={control}
                      render={({ field }) => (
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">
                            {getCurrencySymbol(watchedFields.currency || 'USD')}
                          </span>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                            className={cn('pl-7', errors.price ? 'border-red-500' : '')}
                          />
                        </div>
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="currency">Currency</Label>
                    <Controller
                      name="currency"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger id="currency" className={errors.currency ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(rates ?? []).map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
                {(watchedFields.price ?? 0) > 0 &&
                  watchedFields.currency &&
                  rates &&
                  selectedCurrency &&
                  selectedCurrency !== watchedFields.currency && (
                    <p className="text-xs text-muted-foreground -mt-1 mb-1">
                      ≈{' '}
                      {(
                        ((watchedFields.price ?? 0) * (rates[watchedFields.currency] ?? 1)) /
                        (rates[selectedCurrency] ?? 1)
                      ).toFixed(2)}{' '}
                      {selectedCurrency}
                    </p>
                  )}
                <p className="text-red-500 text-xs h-4">
                  {errors.price?.message || errors.currency?.message || '\u00A0'}
                </p>
              </div>
              <div>
                <Label htmlFor="domain">Domain</Label>
                <Controller
                  name="domain"
                  control={control}
                  render={({ field }) => (
                    <Input id="domain" {...field} className={errors.domain ? 'border-red-500' : ''} />
                  )}
                />
                <p className="text-red-500 text-xs h-4">{errors.domain?.message || '\u00A0'}</p>
              </div>
              <div>
                <Label htmlFor="billingCycle">Billing Cycle (optional)</Label>
                <Controller
                  name="billingCycle"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="billingCycle">
                        <SelectValue placeholder="Select billing cycle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <p className="text-red-500 text-xs h-4">{'\u00A0'}</p>
              </div>
              <div>
                <Label htmlFor="category">Category (optional)</Label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value ?? ''}>
                      <SelectTrigger id="category">
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
                  )}
                />
                <p className="text-red-500 text-xs h-4">{'\u00A0'}</p>
              </div>
              {watchedFields.billingCycle && (
                <>
                  <div className="flex items-center space-x-2 mb-2">
                    <Controller
                      name="showNextPayment"
                      control={control}
                      render={({ field }) => (
                        <Switch id="showNextPayment" checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    />
                    <Label htmlFor="showNextPayment" className="cursor-pointer">
                      Show next payment date
                    </Label>
                  </div>
                  {watchedFields.showNextPayment && (
                    <div>
                      <Label htmlFor="nextPaymentDate">Next Payment Date</Label>
                      <Controller
                        name="nextPaymentDate"
                        control={control}
                        render={({ field }) => (
                          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                id="nextPaymentDate"
                                variant="outline"
                                className={cn(
                                  'w-full justify-start text-left font-normal',
                                  !field.value && 'text-muted-foreground',
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formatDateForDisplay(field.value)}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value ? new Date(field.value) : undefined}
                                onSelect={(date) => {
                                  const nextDate = date?.toISOString().split('T')[0]
                                  field.onChange(nextDate)
                                  setValue(
                                    'renewalDayOfMonth',
                                    watchedFields.billingCycle === 'monthly'
                                      ? getRenewalDayOfMonth(nextDate)
                                      : undefined,
                                  )
                                  setCalendarOpen(false)
                                }}
                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        )}
                      />
                      <p className="text-red-500 text-xs h-4">{'\u00A0'}</p>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="my-auto">
              <SubscriptionCard subscription={previewSubscription} onEdit={() => {}} onDelete={() => {}} />
            </div>
          </div>
          <div className="flex justify-end mt-4 gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <div>
              <Button type="submit" className="contain-content">
                Save
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditSubscriptionModal
