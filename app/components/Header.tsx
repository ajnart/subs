import { PlusCircle } from 'lucide-react'
import type React from 'react'
import { Button } from '~/components/ui/button'

interface HeaderProps {
  onAddSubscription: () => void
}

const Header: React.FC<HeaderProps> = ({ onAddSubscription }) => {
  return (
    <header className="p-4 shadow-md bg-accent">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Subs</h1>
          <p className="text-sm">Easily track your subscriptions</p>
        </div>
        <Button onClick={onAddSubscription}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Subscription
        </Button>
      </div>
    </header>
  )
}

export default Header
