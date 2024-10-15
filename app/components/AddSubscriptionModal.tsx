import type React from 'react'
import { useEffect, useState } from 'react'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { useToast } from '~/components/ui/use-toast'
import { CURRENCY_RATES } from '~/constants/currencyRates'
import type { Subscription } from '~/store/subscriptionStore'
import SubscriptionCard from './SubscriptionCard'

interface AddSubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (subscription: Omit<Subscription, 'id'>) => void
  editingSubscription: Subscription | null
}

const AddSubscriptionModal: React.FC<AddSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSubscription,
}) => {
  const [name, setName] = useState('')
  const [price, setPrice] = useState(0)
  const [currency, setCurrency] = useState('USD')
  const [domain, setDomain] = useState('')
  const [previewSubscription, setPreviewSubscription] = useState<Subscription>({
    currency: 'USD',
    domain: 'https://example.com',
    id: 'preview',
    name: 'Example Subscription',
    price: 9.99,
  })
  const { toast } = useToast()

  useEffect(() => {
    if (editingSubscription) {
      setName(editingSubscription.name)
      setPrice(editingSubscription.price)
      setCurrency(editingSubscription.currency)
      setDomain(editingSubscription.domain)
    } else {
      setName('')
      setPrice(0)
      setCurrency('USD')
      setDomain('')
    }
  }, [editingSubscription])

  useEffect(() => {
    setPreviewSubscription({
      id: 'preview',
      name: name.length > 0 ? name : 'Example Subscription',
      price: price,
      currency: currency,
      domain: domain.length > 0 ? domain : 'https://example.com',
    })
  }, [name, price, currency, domain])

  const handleSave = () => {
    if (!name || !price || !domain) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      })
      return
    }
    if (Number.isNaN(price) || price <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid price.',
        variant: 'destructive',
      })
      return
    }

    onSave({
      name,
      price: price,
      currency,
      domain,
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] lg:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{editingSubscription ? 'Edit Subscription' : 'Add Subscription'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-4">
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(Number.parseFloat(e.target.value))}
            />
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(CURRENCY_RATES).map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Domain" value={domain} onChange={(e) => setDomain(e.target.value)} />
          </div>
          {previewSubscription && (
            // biome-ignore lint/suspicious/noEmptyBlockStatements: It's just a preview, no need for actions
            <SubscriptionCard subscription={previewSubscription} onEdit={() => {}} onDelete={() => {}} />
          )}
        </div>
        <div className="flex justify-end">
          <Button className="contain-content" onClick={handleSave}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AddSubscriptionModal
