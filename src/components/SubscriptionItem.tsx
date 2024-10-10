'use client'
import { Edit2, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type React from 'react'

interface Subscription {
  id: number
  name: string
  url: string
  price: number
  icon: string
}

interface SubscriptionItemProps {
  subscription: Subscription
  onRemove: (id: number) => void
  onEdit: (subscription: Subscription) => void
}

const SubscriptionItem: React.FC<SubscriptionItemProps> = ({ subscription, onRemove, onEdit }) => {
  return (
    <div className="relative group">
      <div className="bg-gray-800 p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl group flex flex-col justify-between h-full w-full transform hover:scale-105 hover:bg-gray-700">
        <div className="flex items-center mb-4">
          <Image
            src={subscription.icon}
            alt={`${subscription.name} icon`}
            width={32}
            height={32}
            className="rounded-full mr-3"
          />
          <h2 className="text-2xl font-semibold text-white">{subscription.name}</h2>
        </div>
        <p className="text-lg font-medium text-green-400 mb-4">${subscription.price.toFixed(2)}/mo</p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-blue-400 hover:underline">Visit site</span>
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onEdit(subscription)
              }}
              className="text-yellow-400 hover:text-yellow-600 transition-colors duration-200"
            >
              <Edit2 className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onRemove(subscription.id)
              }}
              className="text-red-400 hover:text-red-600 transition-colors duration-200"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionItem
