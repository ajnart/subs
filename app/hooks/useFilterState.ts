import { useMemo, useState } from 'react'
import { SUBSCRIPTION_CATEGORIES, type Subscription } from '~/store/subscriptionStore'
import { calculateNextPaymentDate } from '~/utils/nextPaymentDate'

export const SORT_OPTIONS = ['name-asc', 'name-desc', 'price-desc', 'price-asc', 'next-payment'] as const
export const CYCLE_OPTIONS = ['all', 'daily', 'weekly', 'monthly', 'yearly'] as const
const CATEGORY_OPTIONS = ['all', ...SUBSCRIPTION_CATEGORIES] as const

export type SortOption = (typeof SORT_OPTIONS)[number]
export type CycleOption = (typeof CYCLE_OPTIONS)[number]

function getNextPaymentTimestamp(sub: Subscription): number {
  if (!sub.billingCycle) return Number.MAX_SAFE_INTEGER
  const date = new Date(
    calculateNextPaymentDate(sub.billingCycle, sub.nextPaymentDate, sub.renewalDayOfMonth) ?? Number.MAX_SAFE_INTEGER,
  )
  const ts = date.getTime()
  return Number.isNaN(ts) ? Number.MAX_SAFE_INTEGER : ts
}

export function useFilterState(subscriptions: Subscription[]) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('name-asc')
  const [billingCycleFilter, setBillingCycleFilter] = useState<CycleOption>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const filteredSubscriptions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return subscriptions
      .filter((sub) => {
        const matchesSearch =
          q.length === 0 || sub.name.toLowerCase().includes(q) || sub.domain.toLowerCase().includes(q)
        const matchesCycle = billingCycleFilter === 'all' || sub.billingCycle === billingCycleFilter
        const matchesCategory = categoryFilter === 'all' || sub.category === categoryFilter
        return matchesSearch && matchesCycle && matchesCategory
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name-desc':
            return b.name.localeCompare(a.name)
          case 'price-asc':
            return a.price - b.price
          case 'price-desc':
            return b.price - a.price
          case 'next-payment':
            return getNextPaymentTimestamp(a) - getNextPaymentTimestamp(b)
          default:
            return a.name.localeCompare(b.name)
        }
      })
  }, [subscriptions, searchQuery, sortBy, billingCycleFilter, categoryFilter])

  const hasActiveFilters =
    searchQuery.trim().length > 0 || billingCycleFilter !== 'all' || categoryFilter !== 'all' || sortBy !== 'name-asc'

  const clearFilters = () => {
    setSearchQuery('')
    setSortBy('name-asc')
    setBillingCycleFilter('all')
    setCategoryFilter('all')
  }

  const cycleSortOption = () =>
    setSortBy((prev) => SORT_OPTIONS[(SORT_OPTIONS.indexOf(prev) + 1) % SORT_OPTIONS.length])

  const cycleBillingFilter = () =>
    setBillingCycleFilter((prev) => CYCLE_OPTIONS[(CYCLE_OPTIONS.indexOf(prev) + 1) % CYCLE_OPTIONS.length])

  const cycleCategoryFilter = () =>
    setCategoryFilter((prev) => {
      const idx = CATEGORY_OPTIONS.indexOf(prev as (typeof CATEGORY_OPTIONS)[number])
      return CATEGORY_OPTIONS[(idx + 1) % CATEGORY_OPTIONS.length]
    })

  return {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    billingCycleFilter,
    setBillingCycleFilter,
    categoryFilter,
    setCategoryFilter,
    filteredSubscriptions,
    hasActiveFilters,
    clearFilters,
    cycleSortOption,
    cycleBillingFilter,
    cycleCategoryFilter,
  }
}
