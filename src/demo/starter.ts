import type { AppData, Subscription } from '@/lib/types'

function upcoming(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function starterData(): AppData {
  const now = new Date().toISOString()
  const services: Array<{
    name: string
    domain: string
    price: number
    category: string
    days: number
    billingCycle?: Subscription['billingCycle']
    status?: Subscription['status']
    currency?: string
    trial?: boolean
  }> = [
    { name: 'Spotify', domain: 'spotify.com', price: 11.99, category: 'Entertainment', days: 2 },
    { name: 'Netflix', domain: 'netflix.com', price: 15.49, category: 'Entertainment', days: 5 },
    { name: 'iCloud+', domain: 'apple.com', price: 2.99, category: 'Cloud Storage', days: 8 },
    {
      name: 'GitHub Copilot',
      domain: 'github.com',
      price: 100,
      category: 'Development',
      days: 12,
      billingCycle: 'yearly',
    },
    { name: 'YouTube Premium', domain: 'youtube.com', price: 13.99, category: 'Entertainment', days: 15 },
    { name: 'Notion', domain: 'notion.so', price: 10, category: 'Productivity', days: 6, trial: true },
    {
      name: 'Proton Mail',
      domain: 'proton.me',
      price: 47.88,
      category: 'Productivity',
      days: 24,
      billingCycle: 'yearly',
      currency: 'EUR',
    },
    { name: 'Adobe Creative Cloud', domain: 'adobe.com', price: 59.99, category: 'Design', days: 18, status: 'paused' },
    {
      name: 'Disney+',
      domain: 'disneyplus.com',
      price: 9.99,
      category: 'Entertainment',
      days: 21,
      status: 'cancelled',
    },
  ]
  return {
    preferences: { currency: 'USD', monthlyBudget: 100, theme: 'system' },
    subscriptions: services.map((service, index) => ({
      id: `demo-${index + 1}`,
      name: service.name,
      domain: service.domain,
      price: service.price,
      currency: service.currency ?? 'USD',
      category: service.category,
      billingCycle: service.billingCycle ?? 'monthly',
      nextPaymentDate: upcoming(service.days),
      status: service.status ?? 'active',
      trialEndsAt: service.trial ? upcoming(service.days) : null,
      notes: 'Illustrative demo subscription. Edit or delete freely; no real subscription or payment is affected.',
      createdAt: now,
      updatedAt: now,
    })),
  }
}
