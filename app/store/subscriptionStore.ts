import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface Subscription {
  id: string
  name: string
  price: number
  currency: string
  domain: string
  icon?: string
}

interface SubscriptionStore {
  subscriptions: Subscription[]
  addSubscription: (subscription: Omit<Subscription, 'id'>) => void
  editSubscription: (id: string, updatedSubscription: Partial<Omit<Subscription, 'id'>>) => void
  deleteSubscription: (id: string) => void
  exportSubscriptions: () => string
  importSubscriptions: (data: string) => void
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

const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set, get) => ({
      subscriptions: defaultSubscriptions,
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
      exportSubscriptions: () => JSON.stringify(get().subscriptions, null, 2),
      importSubscriptions: (data) => {
        try {
          const parsedData = JSON.parse(data)
          if (Array.isArray(parsedData) && parsedData.every(isValidSubscription)) {
            set({ subscriptions: parsedData })
          } else {
            throw new Error('Invalid subscription data format')
          }
        } catch (error) {
          console.error('Failed to import subscriptions:', error)
          throw error
        }
      },
      resetToDefault: () => set({ subscriptions: defaultSubscriptions }),
    }),
    {
      name: 'subscription-storage',
      storage: createJSONStorage(() => createCustomStorage()),
      partialize: (state) => ({ subscriptions: state.subscriptions }),
      onRehydrateStorage: () => (state) => {
        if (!state || !state.subscriptions?.length) {
          useSubscriptionStore.setState({ subscriptions: defaultSubscriptions })
        }
      },
    },
  ),
)

// Type guard for subscription validation
function isValidSubscription(sub: any): sub is Subscription {
  return (
    typeof sub === 'object' &&
    typeof sub.id === 'string' &&
    typeof sub.name === 'string' &&
    typeof sub.price === 'number' &&
    typeof sub.currency === 'string' &&
    typeof sub.domain === 'string' &&
    (sub.icon === undefined || typeof sub.icon === 'string')
  )
}

export default useSubscriptionStore
