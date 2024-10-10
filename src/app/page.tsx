'use client'

import SubscriptionItem from '@/components/SubscriptionItem'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { FloatingDock } from '@/components/ui/floating-dock'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LinkPreview } from '@/components/ui/link-preview'
import { PlusCircle } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import InstructionsPopup from '~/components/InstructionsPopup'
import MadeWithKodu from '~/components/MadeWithKodu'
import { env } from '~/env'
import { useSubscriptionStore } from '~/lib/subscriptionStore'

interface Subscription {
  id: number
  name: string
  url: string
  price: number
  icon: string
}

export default function Component() {
  const { subscriptions, addSubscription, removeSubscription, editSubscription } = useSubscriptionStore()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.price, 0)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = formData.get('name') as string
    const url = formData.get('url') as string
    const price = Number.parseFloat(formData.get('price') as string)
    const icon = `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`

    if (name && url && price) {
      if (editingSubscription) {
        editSubscription(editingSubscription.id, { name, url, price, icon })
      } else {
        addSubscription({ name, url, price, icon })
      }
      setIsOpen(false)
      setEditingSubscription(null)
      ;(event.target as HTMLFormElement).reset()
    }
  }

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription)
    setIsOpen(true)
  }

  const dockItems = subscriptions.map((sub) => ({
    title: sub.name,
    icon: <Image src={sub.icon} width={64} height={64} alt={`${sub.name} icon`} />,
    href: sub.url,
  }))

  if (!mounted) {
    return null // Return null on initial render to avoid hydration mismatch
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto p-8 max-w-7xl">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-white">Monthly Subscriptions Tracker</h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setEditingSubscription(null)}>
                <PlusCircle className="mr-2 h-5 w-5" />
                Add Subscription
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-gray-800 text-gray-100">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingSubscription ? 'Edit Subscription' : 'Add New Subscription'}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {editingSubscription
                    ? 'Edit the details of your subscription.'
                    : 'Enter the details for your new subscription.'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right text-gray-300">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    className="col-span-3 bg-gray-700 text-white"
                    required
                    defaultValue={editingSubscription?.name ?? ''}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="url" className="text-right text-gray-300">
                    URL
                  </Label>
                  <Input
                    id="url"
                    name="url"
                    type="url"
                    className="col-span-3 bg-gray-700 text-white"
                    required
                    defaultValue={editingSubscription?.url ?? ''}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right text-gray-300">
                    Price
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    className="col-span-3 bg-gray-700 text-white"
                    required
                    defaultValue={editingSubscription?.price ?? ''}
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4">
                  {editingSubscription ? 'Update Subscription' : 'Add Subscription'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <InstructionsPopup popupKey="show-instructions" />
        <div className="mt-8 mb-8 text-3xl font-semibold text-white text-center">
          Total Monthly: ${totalMonthly.toFixed(2)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((subscription) => (
            <LinkPreview key={subscription.id} url={subscription.url}>
              <SubscriptionItem subscription={subscription} onRemove={removeSubscription} onEdit={handleEdit} />
            </LinkPreview>
          ))}
        </div>
      </div>
      {env.NEXT_PUBLIC_SHOW_KODU === 'true' && <MadeWithKodu />}
      <FloatingDock
        items={dockItems}
        desktopClassName="fixed bottom-4 left-1/2 transform -translate-x-1/2"
        mobileClassName="fixed bottom-4 right-4"
      />
    </div>
  )
}
