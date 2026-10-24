export type BillingCycle = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled'
export type ImportMode = 'skip' | 'merge' | 'replace' | 'new'

export interface Subscription {
  id: string
  name: string
  price: number
  currency: string
  domain: string
  category: string
  billingCycle: BillingCycle
  nextPaymentDate: string
  status: SubscriptionStatus
  trialEndsAt: string | null
  notes: string
  createdAt: string
  updatedAt: string
  icon?: string
}

export type SubscriptionInput = Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>

export interface Preferences {
  currency: string
  monthlyBudget: number
  theme: 'system' | 'light' | 'dark'
}

export interface AppData {
  subscriptions: Subscription[]
  preferences: Preferences
}

export interface Status {
  setupRequired: boolean
  authenticated: boolean
  authDisabled: boolean
}

export interface ExchangeRates {
  base: string
  rates: Record<string, number>
  updatedAt: string | null
  stale: boolean
}

export interface Backup extends AppData {
  version: 3
  exportedAt: string
}

export interface ImportMatch {
  incomingIndex: number
  incomingId: string
  incomingName: string
  existingId: string
  existingName: string
  reason: 'id' | 'service'
  conflict: boolean
  conflictGroup: string | null
}

export interface ImportPreview {
  subscriptions: Subscription[]
  warnings: string[]
  duplicates: number
  matches: ImportMatch[]
}
