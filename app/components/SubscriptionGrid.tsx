import { AnimatePresence, motion } from 'framer-motion'
import type React from 'react'
import type { Subscription } from '~/store/subscriptionStore'
import SubscriptionCard from './SubscriptionCard'

interface SubscriptionGridProps {
  subscriptions: Subscription[]
  onEditSubscription: (id: string) => void
  onDeleteSubscription: (id: string) => void
}

const SubscriptionGrid: React.FC<SubscriptionGridProps> = ({
  subscriptions,
  onEditSubscription,
  onDeleteSubscription,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <AnimatePresence>
        {subscriptions.map((subscription) => (
          <motion.div key={subscription.id} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
            <SubscriptionCard
              subscription={subscription}
              onEdit={() => onEditSubscription(subscription.id)}
              onDelete={() => onDeleteSubscription(subscription.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
      {subscriptions.length === 0 && (
        <div className="col-span-full text-center py-8">
          <p className="text-xl text-slate-600">No subscriptions found. Add one to get started!</p>
        </div>
      )}
    </div>
  )
}

export default SubscriptionGrid
