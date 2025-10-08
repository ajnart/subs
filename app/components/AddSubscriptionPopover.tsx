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
import { cn } from '~/lib/utils'
import type { loader } from '~/routes/_index'
import type { BillingCycle, Subscription } from '~/store/subscriptionStore'
import { initializeNextPaymentDate } from '~/utils/nextPaymentDate'
import { IconUrlInput } from './IconFinder'

interface AddSubscriptionPopoverProps {
  addSubscription: (subscription: Omit<Subscription, 'id'>) => void
}

const subscriptionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  currency: z.string().min(1, 'Currency is required'),
  icon: z.string().optional(),
  domain: z.string().url('Invalid URL'),
  billingCycle: z.enum(['monthly', 'yearly', 'weekly', 'daily']).optional(),
  nextPaymentDate: z.string().optional(),
  showNextPayment: z.boolean().optional(),
  paymentDay: z.number().min(1).max(31).optional(),
})

type SubscriptionFormValues = z.infer<typeof subscriptionSchema>

export const AddSubscriptionPopover: React.FC<AddSubscriptionPopoverProps> = ({ addSubscription }) => {
  const { rates } = useLoaderData<typeof loader>()
  const [open, setOpen] = useState(false)
  const [shouldFocus, setShouldFocus] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)

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
      showNextPayment: false,
      paymentDay: undefined,
    },
  })

  const iconValue = watch('icon')
  const billingCycleValue = watch('billingCycle')
  const showNextPaymentValue = watch('showNextPayment')
  const paymentDayValue = watch('paymentDay')
  const nextPaymentDateValue = watch('nextPaymentDate')

  useEffect(() => {
    if (shouldFocus) {
      setFocus('name')
      setShouldFocus(false)
    }
  }, [shouldFocus, setFocus])

  // Auto-calculate next payment date when billing cycle or payment day changes
  useEffect(() => {
    if (billingCycleValue && showNextPaymentValue) {
      const currentDate = nextPaymentDateValue
      if (!currentDate) {
        const newDate = initializeNextPaymentDate(billingCycleValue, paymentDayValue)
        setValue('nextPaymentDate', newDate)
      }
    }
  }, [billingCycleValue, showNextPaymentValue, paymentDayValue, nextPaymentDateValue, setValue])

  const onSubmit = (data: SubscriptionFormValues) => {
    addSubscription(data)
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
          <h3 className="font-medium text-lg mb-4">Add Subscription</h3>
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
                <Input
                  id="price"
                  type="number"
                  {...register('price', {
                    valueAsNumber: true,
                  })}
                  className={errors.price ? 'border-red-500' : ''}
                />
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
              <Select onValueChange={(value) => setValue('billingCycle', value as BillingCycle)}>
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
            {billingCycleValue === 'monthly' && (
              <div>
                <Label htmlFor="paymentDay">Payment Day of Month (optional)</Label>
                <Input
                  id="paymentDay"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="e.g., 15 for 15th"
                  {...register('paymentDay', {
                    valueAsNumber: true,
                    setValueAs: (v) => (v === '' || v === undefined ? undefined : Number(v)),
                  })}
                  className={errors.paymentDay ? 'border-red-500' : ''}
                />
                <p className="text-red-500 text-xs h-4">{errors.paymentDay?.message}</p>
              </div>
            )}
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
                                field.onChange(date?.toISOString().split('T')[0])
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
