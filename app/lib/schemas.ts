import * as z from 'zod'

export const subscriptionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  currency: z.string().min(1, 'Currency is required'),
  domain: z.string().url('Invalid URL'),
  icon: z.string().optional(),
  billingCycle: z.enum(['monthly', 'yearly', 'weekly', 'daily']).optional(),
  nextPaymentDate: z.string().optional(),
  renewalDayOfMonth: z.number().int().min(1).max(31).optional(),
  showNextPayment: z.boolean().optional(),
  category: z.string().optional(),
})

export type SubscriptionFormValues = z.infer<typeof subscriptionSchema>
