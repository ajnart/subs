import { motion } from 'framer-motion'
import { AlertTriangle, Calendar, Edit, Trash2 } from 'lucide-react'
import { memo } from 'react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { LinkPreview } from '~/components/ui/link-preview'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'
import { sanitizeDomain } from '~/lib/utils'
import type { Subscription } from '~/store/subscriptionStore'
import { calculateNextPaymentDate } from '~/utils/nextPaymentDate'

interface SubscriptionCardProps {
  subscription: Subscription
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  className?: string
}

const billingCycleLabel: Record<string, string> = {
  monthly: 'Monthly',
  yearly: 'Yearly',
  weekly: 'Weekly',
  daily: 'Daily',
}

const getDaysUntil = (dateString: string): number => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateString)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

const SubscriptionCard = memo(function SubscriptionCard({
  subscription,
  onEdit,
  onDelete,
  className,
}: SubscriptionCardProps) {
  const { id, name, price, currency, domain, icon, billingCycle, nextPaymentDate, showNextPayment, category } =
    subscription

  // Billing health warning: cycle set but no payment date shown
  const hasBillingHealthWarning = billingCycle && !showNextPayment

  // Check if next payment date is in the past (but not rolled forward)
  const isDateInPast =
    showNextPayment && nextPaymentDate ? new Date(nextPaymentDate) < new Date(new Date().setHours(0, 0, 0, 0)) : false

  // Sanitize the domain URL
  const sanitizedDomain = sanitizeDomain(domain)
  const defaultLogoUrl = `https://www.google.com/s2/favicons?domain=${sanitizedDomain}&sz=64`

  // Use custom icon if available, otherwise fall back to domain favicon
  const logoUrl = icon || defaultLogoUrl

  // Calculate and format next payment date (single call reused for both display and relative label)
  const getNextPaymentDisplay = () => {
    if (!showNextPayment || !billingCycle) {
      return null
    }

    const calculatedDate = calculateNextPaymentDate(billingCycle, nextPaymentDate, subscription.renewalDayOfMonth)
    if (!calculatedDate) {
      return null
    }

    const date = new Date(calculatedDate)
    return {
      formatted: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      calculatedDate,
    }
  }

  const paymentInfo = getNextPaymentDisplay()
  const nextPaymentDisplay = paymentInfo?.formatted ?? null
  const nextPaymentDateValue = paymentInfo?.calculatedDate
  const daysUntilPayment = nextPaymentDateValue ? getDaysUntil(nextPaymentDateValue) : undefined
  const relativeNextPaymentLabel =
    daysUntilPayment === undefined
      ? null
      : daysUntilPayment === 0
        ? 'today'
        : daysUntilPayment === 1
          ? 'tomorrow'
          : `in ${daysUntilPayment} days`

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`group ${className}`}
    >
      <Card
        className="bg-card hover:bg-card/80 transition-all duration-200 shadow-md hover:shadow-lg relative h-[180px] overflow-hidden"
        data-testid="subscription-card"
      >
        {/* Absolutely positioned overlays - do NOT affect card height */}

        {/* Billing Cycle Badge + optional health warning - Top Left */}
        {billingCycle && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
            <Badge variant="secondary" className="text-xs">
              {billingCycleLabel[billingCycle] ?? billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)}
            </Badge>
            {(hasBillingHealthWarning || isDateInPast) && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertTriangle className="h-3 w-3 text-yellow-500 shrink-0 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    {isDateInPast
                      ? 'Next payment date is in the past'
                      : 'Billing cycle set but next payment date is not shown'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}

        {/* Category Badge - Bottom Right */}
        {category && (
          <Badge variant="outline" className="absolute bottom-2 right-2 text-xs z-10">
            {category}
          </Badge>
        )}

        {/* Next Payment Date - Bottom Left */}
        {nextPaymentDisplay && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 text-xs text-muted-foreground z-10">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>
              Next: {nextPaymentDisplay}
              {relativeNextPaymentLabel ? ` (${relativeNextPaymentLabel})` : ''}
            </span>
          </div>
        )}

        {/* Edit/Delete Buttons - Top Right */}
        <div className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 flex space-x-2 z-10">
          <Button variant="outline" size="icon" onClick={() => onEdit(id)} className="bg-background hover:bg-muted">
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDelete(id)}
            className="bg-background hover:bg-muted text-destructive hover:text-destructive/80"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>

        <LinkPreview url={sanitizedDomain}>
          <CardContent className="flex flex-col items-center justify-center p-4 sm:p-6 h-full">
            <img src={logoUrl} alt={`${name} logo`} className="w-16 h-16 mb-3 rounded-full shadow-md object-cover" />
            <h3 className="text-xl sm:text-1xl font-bold mb-2 text-card-foreground max-w-full text-wrap-balance overflow-wrap-break-word line-clamp-1 text-center">
              {name}
            </h3>
            <p className="text-md sm:text-sm font-semibold text-card-foreground text-center">{`${currency} ${price}`}</p>
          </CardContent>
        </LinkPreview>
      </Card>
    </motion.div>
  )
})

export default SubscriptionCard
