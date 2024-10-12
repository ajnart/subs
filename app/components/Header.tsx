import { PlusCircle } from 'lucide-react'
import type React from 'react'
import { Button } from '~/components/ui/button'

interface HeaderProps {
  onAddSubscription: () => void
}

const Header: React.FC<HeaderProps> = ({ onAddSubscription }) => {
  return (
    <header className="bg-slate-200 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Subs</h1>
          <p className="text-sm text-slate-600">Easily track your subscriptions</p>
        </div>
        <Button onClick={onAddSubscription} className="bg-slate-700 hover:bg-slate-800 text-white">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Subscription
        </Button>
      </div>
    </header>
  )
}

export default Header
