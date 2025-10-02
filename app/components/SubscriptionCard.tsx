import { motion } from 'framer-motion'
import { Calendar, Edit, Trash2 } from 'lucide-react'
import type React from 'react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { LinkPreview } from '~/components/ui/link-preview'
import { Switch } from '~/components/ui/switch'
import type { Subscription } from '~/store/subscriptionStore'

interface SubscriptionCardProps {
  subscription: Subscription
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  className?: string
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ subscription, onEdit, onDelete, className }) => {
  const { id, name, price, currency, domain, icon, nextPaymentDate, billingCycle } = subscription

  // Sanitize the domain URL
  const sanitizeDomain = (domain: string) => {
    try {
      return new URL(domain).href
    } catch {
      return new URL(`https://${domain}`).href
    }
  }

  const sanitizedDomain = sanitizeDomain(domain)
  const defaultLogoUrl = `https://www.google.com/s2/favicons?domain=${sanitizedDomain}&sz=64`

  // Use custom icon if available, otherwise fall back to domain favicon
  const logoUrl = icon || defaultLogoUrl

  // Format date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return null
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return null
    }
  }

  // Check if payment is overdue
  const isOverdue = (dateString: string | undefined) => {
    if (!dateString) return false
    try {
      const paymentDate = new Date(dateString)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      paymentDate.setHours(0, 0, 0, 0)
      return paymentDate < today
    } catch {
      return false
    }
  }

  const formattedDate = formatDate(nextPaymentDate)
  const overdue = isOverdue(nextPaymentDate)

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`group ${className}`}
    >
      <Card className="bg-card hover:bg-card/80 transition-all duration-200 shadow-md hover:shadow-lg relative h-full">
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2 z-10">
          <Button variant="outline" size="icon" onClick={() => onEdit(id)} className="bg-background hover:bg-muted h-8 w-8">
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDelete(id)}
            className="bg-background hover:bg-muted text-destructive hover:text-destructive/80 h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
        <LinkPreview url={sanitizedDomain}>
          <CardContent className="flex flex-col items-start justify-between p-4 sm:p-6 h-full min-h-[280px]">
            <div className="w-full flex flex-col items-start gap-3">
              <div className="flex items-center gap-3 w-full">
                <img src={logoUrl} alt={`${name} logo`} className="w-12 h-12 rounded-full shadow-md flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-card-foreground truncate">
                    {name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Switch checked={true} className="scale-75" />
                  </div>
                </div>
              </div>
              <div className="w-full flex items-baseline gap-1">
                <span className="text-3xl font-bold text-card-foreground">{currency} {price.toFixed(2)}</span>
                <span className="text-sm text-muted-foreground">per {billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                Software
              </Badge>
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                Active
              </Badge>
            </div>
            {formattedDate && (
              <div className="w-full flex items-center gap-2 text-sm text-muted-foreground mt-4 pt-4 border-t">
                <Calendar className="h-4 w-4" />
                <span className={overdue ? 'text-destructive font-semibold' : ''}>
                  Next Payment: {formattedDate}
                </span>
              </div>
            )}
          </CardContent>
        </LinkPreview>
      </Card>
    </motion.div>
  )
}

export default SubscriptionCard
