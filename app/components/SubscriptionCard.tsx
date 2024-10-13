import { motion } from 'framer-motion'
import { Edit, Trash2 } from 'lucide-react'
import type React from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { LinkPreview } from '~/components/ui/link-preview'
import type { Subscription } from '~/store/subscriptionStore'

interface SubscriptionCardProps {
  subscription: Subscription
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ subscription, onEdit, onDelete }) => {
  const { id, name, price, currency, domain } = subscription
  const logoUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group"
    >
      <Card className="bg-white hover:bg-slate-50 transition-all duration-200 shadow-md hover:shadow-lg relative">
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
          <Button variant="outline" size="icon" onClick={() => onEdit(id)} className="bg-white hover:bg-slate-100">
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDelete(id)}
            className="bg-white hover:bg-slate-100 text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
        <LinkPreview url={domain}>
          <CardContent className="flex flex-col items-center justify-center p-4 sm:p-6">
            <img src={logoUrl} alt={`${name} logo`} className="w-16 h-16 mb-3 rounded-full shadow-md" />
            <h3 className="text-1xl sm:text-2xl font-bold mb-2 text-slate-700">{name}</h3>
            <p className="text-md sm:text-sm font-semibold text-slate-800 text-center">{`${currency} ${price.toFixed(2)}`}</p>
          </CardContent>
        </LinkPreview>
      </Card>
    </motion.div>
  )
}

export default SubscriptionCard
