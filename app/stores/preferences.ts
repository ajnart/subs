import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type PreferencesStore = {
  selectedCurrency: string
  setSelectedCurrency: (currency: string) => void
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      selectedCurrency: 'USD',
      setSelectedCurrency: (currency) => set({ selectedCurrency: currency }),
    }),
    {
      name: 'currency-storage',
    }
  )
)