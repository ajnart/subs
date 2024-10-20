import type React from 'react'
import useSubscriptionStore from '~/store/subscriptionStore'
import AddSubscriptionPopover from './AddSubscriptionPopover'

interface HeaderProps {
  onSave: () => void
}

const Header: React.FC<HeaderProps> = ({ onSave }) => {
  const { addSubscription } = useSubscriptionStore()

  return (
    <header className="p-4 shadow-md bg-accent">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Subs</h1>
          <p className="text-sm">Easily track your subscriptions</p>
        </div>
        <AddSubscriptionPopover addSubscription={addSubscription} />
      </div>
    </header>
  )
}

export default Header
