import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { validateImportData } from '~/utils/importValidation'

export type BillingCycle = 'monthly' | 'yearly' | 'weekly' | 'daily'

export const SUBSCRIPTION_CATEGORIES = [
  'Streaming',
  'Music',
  'Cloud',
  'AI Tools',
  'Productivity',
  'Gaming',
  'News & Media',
  'Health & Fitness',
  'Education',
  'Finance',
  'Developer Tools',
  'Other',
] as const

export type SubscriptionCategory = (typeof SUBSCRIPTION_CATEGORIES)[number]

export interface Subscription {
  id: string
  name: string
  price: number
  currency: string
  domain: string
  icon?: string
  billingCycle?: BillingCycle
  nextPaymentDate?: string // ISO date string
  renewalDayOfMonth?: number // Original day for monthly renewals after a month-end clamp
  showNextPayment?: boolean
  category?: SubscriptionCategory
}

export interface SubscriptionTemplate {
  label: string
  name: string
  domain: string
  billingCycle: BillingCycle
  price: number
  currency: string
  category?: SubscriptionCategory
  /** ISO country name e.g. "France", "Japan" — used for regional filtering */
  region?: string
  /** Appears in the Popular tab in the onboarding dialog */
  popular?: boolean
}

interface SubscriptionStore {
  subscriptions: Subscription[]
  lastImportedAt?: string
  addSubscription: (subscription: Omit<Subscription, 'id'>) => void
  editSubscription: (id: string, updatedSubscription: Partial<Omit<Subscription, 'id'>>) => void
  deleteSubscription: (id: string) => void
  restoreSubscription: (subscription: Subscription, index?: number) => void
  exportSubscriptions: () => string
  importSubscriptions: (data: string) => void
  replaceSubscriptions: (subscriptions: Subscription[]) => void
  resetToDefault: () => void
}

export const defaultSubscriptions: Subscription[] = [
  { id: '1', name: 'Netflix', price: 15.99, currency: 'USD', domain: 'https://netflix.com' },
  { id: '2', name: 'Spotify', price: 9.99, currency: 'USD', domain: 'https://spotify.com' },
  { id: '3', name: 'Amazon Prime', price: 14.99, currency: 'USD', domain: 'https://amazon.com' },
  { id: '4', name: 'Disney+', price: 7.99, currency: 'USD', domain: 'https://disneyplus.com' },
  { id: '5', name: 'YouTube Premium', price: 11.99, currency: 'USD', domain: 'https://youtube.com' },
  { id: '6', name: 'Hulu', price: 7.99, currency: 'USD', domain: 'https://hulu.com' },
  { id: '7', name: 'Apple Music', price: 9.99, currency: 'JPY', domain: 'https://apple.com/apple-music' },
  { id: '8', name: 'HBO Max', price: 14.99, currency: 'JPY', domain: 'https://hbomax.com' },
  { id: '9', name: 'Adobe Creative Cloud', price: 52.99, currency: 'EUR', domain: 'https://adobe.com' },
  { id: '10', name: 'Microsoft 365', price: 6.99, currency: 'EUR', domain: 'https://microsoft.com' },
]

const createCustomStorage = () => {
  const USE_LOCAL_STORAGE = typeof window !== 'undefined' && window.ENV.USE_LOCAL_STORAGE === true

  if (USE_LOCAL_STORAGE) {
    return localStorage
  }

  if (typeof window === 'undefined') {
    return {
      getItem: () => null,
      setItem: () => null,
      removeItem: () => null,
    }
  }

  return {
    getItem: async (key: string): Promise<string | null> => {
      try {
        const response = await fetch(`/api/storage/${key}`)
        if (!response.ok) return null
        const data = await response.json()
        return JSON.stringify(data.value)
      } catch (error) {
        console.error('Error fetching data:', error)
        return null
      }
    },
    setItem: async (key: string, value: string): Promise<void> => {
      try {
        await fetch(`/api/storage/${key}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: JSON.parse(value) }),
        })
      } catch (error) {
        console.error('Error setting data:', error)
      }
    },
    removeItem: async (key: string): Promise<void> => {
      try {
        await fetch(`/api/storage/${key}`, { method: 'DELETE' })
      } catch (error) {
        console.error('Error removing data:', error)
      }
    },
  }
}

const customStorage = createCustomStorage()

const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set, get) => ({
      subscriptions: defaultSubscriptions,
      lastImportedAt: undefined,
      addSubscription: (subscription) =>
        set((state) => ({
          subscriptions: [...state.subscriptions, { ...subscription, id: crypto.randomUUID() }],
        })),
      editSubscription: (id, updatedSubscription) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) => (sub.id === id ? { ...sub, ...updatedSubscription } : sub)),
        })),
      deleteSubscription: (id) =>
        set((state) => ({
          subscriptions: state.subscriptions.filter((sub) => sub.id !== id),
        })),
      restoreSubscription: (subscription, index) =>
        set((state) => {
          const subs = [...state.subscriptions]
          if (index !== undefined && index >= 0 && index <= subs.length) {
            subs.splice(index, 0, subscription)
          } else {
            subs.push(subscription)
          }
          return { subscriptions: subs }
        }),
      exportSubscriptions: () => JSON.stringify(get().subscriptions, null, 2),
      importSubscriptions: (data) => {
        try {
          const report = validateImportData(data)
          if (report.invalidCount > 0) {
            throw new Error('Invalid subscription data format')
          }
          const subscriptions = report.rows.map((r) => r.subscription as Subscription)
          set({ subscriptions, lastImportedAt: new Date().toISOString() })
        } catch (error) {
          console.error('Failed to import subscriptions:', error)
          throw error
        }
      },
      resetToDefault: () => set({ subscriptions: defaultSubscriptions }),
      replaceSubscriptions: (subscriptions) => set({ subscriptions }),
    }),
    {
      name: 'subscription-storage',
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => ({ subscriptions: state.subscriptions, lastImportedAt: state.lastImportedAt }),
      onRehydrateStorage: () => (state) => {
        if (!state || !state.subscriptions?.length) {
          useSubscriptionStore.setState({ subscriptions: defaultSubscriptions })
        }
      },
    },
  ),
)

export default useSubscriptionStore
