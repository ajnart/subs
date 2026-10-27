import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLoaderData } from '@remix-run/react'
import { CalendarIcon, PlusCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { POPULAR_TEMPLATES } from '~/lib/templates'
import { cn } from '~/lib/utils'
import type { loader } from '~/routes/_index'
import { usePreferencesStore } from '~/store/preferences'
import { type BillingCycle, SUBSCRIPTION_CATEGORIES, type Subscription } from '~/store/subscriptionStore'
import { getRenewalDayOfMonth, initializeNextPaymentDate } from '~/utils/nextPaymentDate'
import { IconUrlInput } from './IconFinder'

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

interface AddSubscriptionPopoverProps {
  addSubscription: (subscription: Omit<Subscription, 'id'>) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const subscriptionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  currency: z.string().min(1, 'Currency is required'),
  icon: z.string().optional(),
  domain: z.string().url('Invalid URL'),
  billingCycle: z.enum(['monthly', 'yearly', 'weekly', 'daily']).optional(),
  nextPaymentDate: z.string().optional(),
  renewalDayOfMonth: z.number().int().min(1).max(31).optional(),
  showNextPayment: z.boolean().optional(),
  category: z.enum(SUBSCRIPTION_CATEGORIES).optional(),
})

type SubscriptionFormValues = z.infer<typeof subscriptionSchema>

export const AddSubscriptionPopover: React.FC<AddSubscriptionPopoverProps> = ({
  addSubscription,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}) => {
  const { rates } = useLoaderData<typeof loader>()
  const { selectedCurrency } = usePreferencesStore()
  const [internalOpen, setInternalOpen] = useState(false)
  const [shouldFocus, setShouldFocus] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)

  // Use external control if provided, otherwise use internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = externalOnOpenChange !== undefined ? externalOnOpenChange : setInternalOpen

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setFocus,
    setValue,
    watch,
    control,
  } = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: '',
      icon: '',
      price: 0,
      currency: 'USD',
      domain: '',
      billingCycle: undefined,
      nextPaymentDate: undefined,
      renewalDayOfMonth: undefined,
      showNextPayment: false,
      category: undefined,
    },
  })

  const iconValue = watch('icon')
  const billingCycleValue = watch('billingCycle')
  const showNextPaymentValue = watch('showNextPayment')
  const nextPaymentDateValue = watch('nextPaymentDate')
  const priceValue = watch('price')
  const currencyValue = watch('currency')
  const categoryValue = watch('category')

  useEffect(() => {
    if (shouldFocus) {
      setFocus('name')
      setShouldFocus(false)
    }
  }, [shouldFocus, setFocus])

  // Auto-calculate next payment date when billing cycle changes
  useEffect(() => {
    if (billingCycleValue && showNextPaymentValue) {
      const currentDate = nextPaymentDateValue
      if (!currentDate) {
        const now = new Date()
        const newDate = initializeNextPaymentDate(billingCycleValue, now)
        setValue('nextPaymentDate', newDate)
        setValue('renewalDayOfMonth', billingCycleValue === 'monthly' ? now.getUTCDate() : undefined)
      }
    }
  }, [billingCycleValue, showNextPaymentValue, nextPaymentDateValue, setValue])

  const onSubmit = (data: SubscriptionFormValues) => {
    addSubscription({
      ...data,
      renewalDayOfMonth:
        data.billingCycle === 'monthly'
          ? (data.renewalDayOfMonth ?? getRenewalDayOfMonth(data.nextPaymentDate))
          : undefined,
    })
    toast.success(`${data.name} added successfully.`)
    reset()
    setShouldFocus(true)
  }

  useEffect(() => {
    if (open) {
      setFocus('name')
    }
  }, [open, setFocus])

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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Subscription
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <h3 className="font-medium text-lg mb-3">Add Subscription</h3>
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-2">Quick templates</p>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_TEMPLATES.map((template) => (
                <button
                  key={template.label}
                  type="button"
                  onClick={() => {
                    reset({
                      name: template.name,
                      price: template.price,
                      currency: template.currency,
                      domain: template.domain,
                      billingCycle: template.billingCycle,
                      category: template.category,
                      icon: '',
                      showNextPayment: false,
                    })
                  }}
                  className="text-xs px-2 py-0.5 rounded-full border border-border bg-muted/50 hover:bg-muted text-foreground transition-colors"
                >
                  {template.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <IconUrlInput
                value={iconValue || ''}
                onChange={(value) => setValue('icon', value)}
                label="Icon (optional)"
                error={!!errors.icon}
              />
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input required id="name" {...register('name')} className={errors.name ? 'border-red-500' : ''} />
              <p className="text-red-500 text-xs h-4">{errors.name?.message}</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="flex-1">
                <Label htmlFor="price">Price</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">
                    {getCurrencySymbol(currencyValue || 'USD')}
                  </span>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('price', { valueAsNumber: true })}
                    className={cn('pl-7', errors.price ? 'border-red-500' : '')}
                  />
                </div>
                {(priceValue ?? 0) > 0 &&
                  currencyValue &&
                  rates &&
                  selectedCurrency &&
                  selectedCurrency !== currencyValue && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      ≈{' '}
                      {(((priceValue ?? 0) * (rates[currencyValue] ?? 1)) / (rates[selectedCurrency] ?? 1)).toFixed(2)}{' '}
                      {selectedCurrency}
                    </p>
                  )}
                <p className="text-red-500 text-xs h-4">{errors.price?.message}</p>
              </div>
              <div className="flex-1">
                <Label htmlFor="currency">Currency</Label>
                <Select onValueChange={(value) => setValue('currency', value)} defaultValue="USD">
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
                <p className="text-red-500 text-xs h-4">{errors.currency?.message}</p>
              </div>
            </div>
            <div>
              <Label htmlFor="domain">Domain</Label>
              <Input id="domain" {...register('domain')} className={errors.domain ? 'border-red-500' : ''} />
              <p className="text-red-500 text-xs h-4">{errors.domain?.message}</p>
            </div>
            <div>
              <Label htmlFor="billingCycle">Billing Cycle (optional)</Label>
              <Select
                onValueChange={(value) => {
                  const cycle = value as BillingCycle
                  setValue('billingCycle', cycle)
                  if (cycle === 'monthly' && !watch('renewalDayOfMonth')) {
                    setValue('renewalDayOfMonth', getRenewalDayOfMonth(nextPaymentDateValue))
                  }
                }}
              >
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
            </div>
            {billingCycleValue && (
              <>
                <div className="flex items-center space-x-2">
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
                {showNextPaymentValue && (
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
                                  billingCycleValue === 'monthly' ? getRenewalDayOfMonth(nextDate) : undefined,
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
                  </div>
                )}
              </>
            )}
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
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button type="submit" className="contain-content">
              Save
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}

export default AddSubscriptionPopover
