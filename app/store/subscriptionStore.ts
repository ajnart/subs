import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface Subscription {
  id: string
  name: string
  price: number
  currency: string
  domain: string
}

interface SubscriptionStore {
  subscriptions: Subscription[]
  addSubscription: (subscription: Omit<Subscription, 'id'>) => void
  editSubscription: (id: string, updatedSubscription: Omit<Subscription, 'id'>) => void
  deleteSubscription: (id: string) => void
  exportSubscriptions: () => string
  importSubscriptions: (data: string) => void
}

function useGetStorage() {
  return localStorage
}

const defaultSubscriptions: Subscription[] = [
  { id: '1', name: 'Netflix', price: 15.99, currency: 'USD', domain: 'netflix.com' },
  { id: '2', name: 'Spotify', price: 9.99, currency: 'USD', domain: 'spotify.com' },
  { id: '3', name: 'Amazon Prime', price: 14.99, currency: 'USD', domain: 'amazon.com' },
  { id: '4', name: 'Disney+', price: 7.99, currency: 'USD', domain: 'disneyplus.com' },
  { id: '5', name: 'YouTube Premium', price: 11.99, currency: 'USD', domain: 'youtube.com' },
  { id: '6', name: 'Hulu', price: 7.99, currency: 'USD', domain: 'hulu.com' },
  { id: '7', name: 'Apple Music', price: 9.99, currency: 'JPY', domain: 'apple.com/apple-music' },
  { id: '8', name: 'HBO Max', price: 14.99, currency: 'JPY', domain: 'hbomax.com' },
  { id: '9', name: 'Adobe Creative Cloud', price: 52.99, currency: 'EUR', domain: 'adobe.com' },
  { id: '10', name: 'Microsoft 365', price: 6.99, currency: 'EUR', domain: 'microsoft.com' },
  // { id: '11', name: 'Onlyfans', price: 55.99, currency: 'USD', domain: 'onlyfans.com' },
]

const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set, get) => ({
      subscriptions: defaultSubscriptions,
      addSubscription: (subscription) => {
        set((state) => ({
          subscriptions: [...state.subscriptions, { ...subscription, id: Date.now().toString() }],
        }))
      },
      editSubscription: (id, updatedSubscription) => {
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) => (sub.id === id ? { ...sub, ...updatedSubscription } : sub)),
        }))
      },
      deleteSubscription: (id) => {
        set((state) => ({
          subscriptions: state.subscriptions.filter((sub) => sub.id !== id),
        }))
      },
      exportSubscriptions: () => {
        return JSON.stringify(get().subscriptions)
      },
      importSubscriptions: (data) => {
        try {
          const parsedData = JSON.parse(data)
          if (Array.isArray(parsedData)) {
            set({ subscriptions: parsedData as Subscription[] })
          }
        } catch (error) {
          console.error('Failed to import subscriptions:', error)
        }
      },
    }),
    {
      name: 'subscription-storage',
      skipHydration: false,
      storage: createJSONStorage(useGetStorage),
    },
  ),
)

export default useSubscriptionStore
