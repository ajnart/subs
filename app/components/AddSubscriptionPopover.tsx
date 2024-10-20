import { zodResolver } from '@hookform/resolvers/zod'
import { useLoaderData } from '@remix-run/react'
import { PlusCircle } from 'lucide-react'
import type React from 'react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import type { loader } from '~/routes/_index'
import type { Subscription } from '~/store/subscriptionStore'

interface AddSubscriptionPopoverProps {
  addSubscription: (subscription: Omit<Subscription, 'id'>) => void
}

const subscriptionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  currency: z.string().min(1, 'Currency is required'),
  domain: z.string().url('Invalid URL'),
})

type SubscriptionFormValues = z.infer<typeof subscriptionSchema>

export const AddSubscriptionPopover: React.FC<AddSubscriptionPopoverProps> = ({ addSubscription }) => {
  const { rates } = useLoaderData<typeof loader>()
  const [open, setOpen] = useState(false)
  const [shouldFocus, setShouldFocus] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setFocus,
    setValue,
  } = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: '',
      price: 0,
      currency: 'USD',
      domain: '',
    },
  })

  useEffect(() => {
    if (shouldFocus) {
      setFocus('name')
      setShouldFocus(false)
    }
  }, [shouldFocus, setFocus])

  const onSubmit = (data: SubscriptionFormValues) => {
    addSubscription(data)
    toast.success(`${data.name} added successfully.`)
    reset()
    setShouldFocus(true)
  }

  // Focus name field when popover opens
  useEffect(() => {
    if (open) {
      setFocus('name')
    }
  }, [open, setFocus])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Subscription
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <form onSubmit={handleSubmit(onSubmit)}>
          <h3 className="font-medium text-lg">Add Subscription</h3>
          <div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input required id="name" {...register('name')} className={errors.name ? 'border-red-500' : ''} />
              <p className="text-red-500 text-xs h-4">{errors.name?.message}</p>
            </div>
            <div>
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
                </div>
              </div>
              <p className="text-red-500 text-xs h-4">{errors.price?.message || errors.currency?.message}</p>
            </div>
            <div>
              <Label htmlFor="domain">Domain</Label>
              <Input id="domain" {...register('domain')} className={errors.domain ? 'border-red-500' : ''} />
              <p className="text-red-500 text-xs h-4">{errors.domain?.message}</p>
            </div>
          </div>
          <div className="flex justify-end">
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
