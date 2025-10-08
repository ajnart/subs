import type React from 'react'
import useSubscriptionStore from '~/store/subscriptionStore'
import AddSubscriptionPopover from './AddSubscriptionPopover'

interface HeaderProps {
  addPopoverOpen?: boolean
  onAddPopoverOpenChange?: (open: boolean) => void
}

const Header: React.FC<HeaderProps> = ({ addPopoverOpen, onAddPopoverOpenChange }) => {
  const { addSubscription } = useSubscriptionStore()

  return (
    <header className="p-4 shadow-md bg-accent">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Subs</h1>
          <p className="text-sm">Easily track your subscriptions</p>
        </div>
        <AddSubscriptionPopover
          addSubscription={addSubscription}
          open={addPopoverOpen}
          onOpenChange={onAddPopoverOpenChange}
        />
      </div>
    </header>
  )
}

export default Header
