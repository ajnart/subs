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
import type { BillingCycle, Subscription } from '~/store/subscriptionStore'
import { initializeNextPaymentDate } from '~/utils/nextPaymentDate'
import { IconUrlInput } from './IconFinder'
import SubscriptionCard from './SubscriptionCard'

interface EditSubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (subscription: Omit<Subscription, 'id'>) => void
  editingSubscription: Subscription | null
}

const subscriptionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  currency: z.string().min(1, 'Currency is required'),
  domain: z.string().url('Invalid URL'),
  icon: z.string().optional(),
  billingCycle: z.enum(['monthly', 'yearly', 'weekly', 'daily']).optional(),
  nextPaymentDate: z.string().optional(),
  showNextPayment: z.boolean().optional(),
  paymentDay: z.number().min(1).max(31).optional(),
})

const EditSubscriptionModal: React.FC<EditSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSubscription,
}) => {
  const { rates } = useLoaderData<typeof loader>()
  const [calendarOpen, setCalendarOpen] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: '',
      price: 0,
      currency: 'USD',
      domain: '',
      icon: '',
      billingCycle: undefined as BillingCycle | undefined,
      nextPaymentDate: undefined as string | undefined,
      showNextPayment: false,
      paymentDay: undefined as number | undefined,
    },
  })

  useEffect(() => {
    if (editingSubscription) {
      reset(editingSubscription)
    } else {
      reset({
        name: '',
        price: 0,
        currency: 'USD',
        domain: '',
        icon: '',
        billingCycle: undefined,
        nextPaymentDate: undefined,
        showNextPayment: false,
        paymentDay: undefined,
      })
    }
  }, [editingSubscription, reset])

  const watchedFields = watch()

  // Auto-calculate next payment date when billing cycle or payment day changes
  useEffect(() => {
    if (watchedFields.billingCycle && watchedFields.showNextPayment) {
      const currentDate = watchedFields.nextPaymentDate
      if (!currentDate) {
        const newDate = initializeNextPaymentDate(watchedFields.billingCycle, watchedFields.paymentDay)
        setValue('nextPaymentDate', newDate)
      }
    }
  }, [watchedFields.billingCycle, watchedFields.showNextPayment, watchedFields.paymentDay, setValue])

  const previewSubscription: Subscription = {
    id: 'preview',
    name: watchedFields.name || 'Example Subscription',
    price: watchedFields.price || 0,
    currency: watchedFields.currency || 'USD',
    domain: watchedFields.domain || 'https://example.com',
    icon: watchedFields.icon,
    billingCycle: watchedFields.billingCycle,
    nextPaymentDate: watchedFields.nextPaymentDate,
    showNextPayment: watchedFields.showNextPayment,
    paymentDay: watchedFields.paymentDay,
  }

  const onSubmit = (data: Omit<Subscription, 'id'>) => {
    onSave(data)
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
                        <Input
                          id="price"
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                          className={errors.price ? 'border-red-500' : ''}
                        />
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
              {watchedFields.billingCycle === 'monthly' && (
                <div>
                  <Label htmlFor="paymentDay">Payment Day of Month (optional)</Label>
                  <Controller
                    name="paymentDay"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="paymentDay"
                        type="number"
                        min="1"
                        max="31"
                        placeholder="e.g., 15 for 15th of each month"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value === '' ? undefined : Number.parseInt(e.target.value)
                          field.onChange(value)
                        }}
                        value={field.value ?? ''}
                        className={errors.paymentDay ? 'border-red-500' : ''}
                      />
                    )}
                  />
                  <p className="text-red-500 text-xs h-4">{errors.paymentDay?.message || '\u00A0'}</p>
                </div>
              )}
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
