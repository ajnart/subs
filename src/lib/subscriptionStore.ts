import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import axios from 'axios';
import { env } from '~/env';

interface Subscription {
  id: number;
  name: string;
  url: string;
  price: number;
  currency: string;
  icon: string;
}

interface SubscriptionStore {
  subscriptions: Subscription[];
  exchangeRates: Record<string, number>;
  globalCurrency: string;
  setGlobalCurrency: (currency: string) => void;
  fetchExchangeRates: () => Promise<void>;
  addSubscription: (subscription: Omit<Subscription, 'id'>) => void;
  removeSubscription: (id: number) => void;
  editSubscription: (id: number, updatedSubscription: Omit<Subscription, 'id'>) => void;
}

const defaultSubscriptions: Subscription[] = [
  {
    id: 1,
    name: 'Netflix',
    url: 'https://www.netflix.com',
    price: 15.99,
    currency: 'USD',
    icon: 'https://www.google.com/s2/favicons?domain=netflix.com',
  },
  {
    id: 2,
    name: 'Google One',
    url: 'https://one.google.com',
    price: 1.99,
    currency: 'USD',
    icon: 'https://www.google.com/s2/favicons?domain=google.com',
  },
  {
    id: 3,
    name: 'Amazon Prime',
    url: 'https://www.amazon.com/prime',
    price: 14.99,
    currency: 'USD',
    icon: 'https://www.google.com/s2/favicons?domain=amazon.com',
  },
  {
    id: 4,
    name: 'Spotify',
    url: 'https://www.spotify.com',
    price: 9.99,
    currency: 'USD',
    icon: 'https://www.google.com/s2/favicons?domain=spotify.com',
  },
  {
    id: 5,
    name: 'YouTube Premium',
    url: 'https://onlyfans.com/',
    price: 69.99,
    currency: 'USD',
    icon: 'https://www.google.com/s2/favicons?domain=onlyfans.com',
  },
];

const getStorage = () => {
  if (typeof window === 'undefined') {
    return {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve(),
    };
  }

  if (env.NEXT_PUBLIC_USE_SQLITE === 'false') {
    return localStorage;
  }

  return {
    getItem: async (name: string): Promise<string | null> => {
      try {
        const response = await fetch(`/api/kv/${name}`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.value) && data.value.length === 0) {
            return JSON.stringify({ subscriptions: defaultSubscriptions });
          }
          return JSON.stringify(data.value);
        }
        return null;
      } catch (error) {
        console.error('Error fetching from KV store:', error);
        return null;
      }
    },
    setItem: async (name: string, value: string): Promise<void> => {
      try {
        await fetch(`/api/kv/${name}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ value: JSON.parse(value) }),
        });
      } catch (error) {
        console.error('Error setting item in KV store:', error);
      }
    },
    removeItem: async (name: string): Promise<void> => {
      try {
        await fetch(`/api/kv/${name}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Error removing item from KV store:', error);
      }
    },
  };
};

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set) => ({
      subscriptions: defaultSubscriptions,
      exchangeRates: { USD: 1 },
      globalCurrency: 'USD',
      setGlobalCurrency: (currency: string) => set({ globalCurrency: currency }),
      fetchExchangeRates: async () => {
        try {
          const response = await axios.get('https://api.frankfurter.app/latest?from=USD');
          const rates = response.data.rates;
          if (!rates.USD) {
            rates.USD = 1;
          }
          set({ exchangeRates: rates });
        } catch (error) {
          console.error('Error fetching exchange rates:', error);
        }
      },
      addSubscription: (newSubscription) =>
        set((state) => ({
          subscriptions: [...state.subscriptions, { ...newSubscription, id: Date.now() }],
        })),
      removeSubscription: (id) =>
        set((state) => ({
          subscriptions: state.subscriptions.filter((subscription) => subscription.id !== id),
        })),
      editSubscription: (id, updatedSubscription) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((subscription) =>
            subscription.id === id ? { ...subscription, ...updatedSubscription } : subscription
          ),
        })),
    }),
    {
      name: 'subscription-storage',
      storage: createJSONStorage(getStorage),
      skipHydration: false,
    }
  )
);