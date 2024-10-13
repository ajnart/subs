'use client'

import SubscriptionItem from '@/components/SubscriptionItem';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FloatingDock } from '@/components/ui/floating-dock';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LinkPreview } from '@/components/ui/link-preview';
import { PlusCircle } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import InstructionsPopup from '@/components/InstructionsPopup';
import MadeWithKodu from '@/components/MadeWithKodu';
import CurrencySelector from '@/components/CurrencySelector';
import { env } from '~/env';
import { useSubscriptionStore } from '~/lib/subscriptionStore';
import { convertPrice, formatPrice } from '~/lib/utils';

interface Subscription {
  id: number;
  name: string;
  url: string;
  price: number;
  currency: string;
  icon: string;
}

export default function Component() {
  const { subscriptions, addSubscription, removeSubscription, editSubscription, globalCurrency, setGlobalCurrency, fetchExchangeRates, exchangeRates } = useSubscriptionStore();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [loadingRates, setLoadingRates] = useState(true);

  useEffect(() => {
    setMounted(true);
    const fetchRates = async () => {
      await fetchExchangeRates();
      setLoadingRates(false);
    };
    fetchRates();
  }, [fetchExchangeRates]);

  useEffect(() => {
    if (editingSubscription) {
      setName(editingSubscription.name);
      setUrl(editingSubscription.url);
      setPrice(editingSubscription.price.toString());
      setCurrency(editingSubscription.currency);
    } else {
      setName('');
      setUrl('');
      setPrice('');
      setCurrency('USD');
    }
  }, [editingSubscription]);

  const totalMonthlyBase = subscriptions.reduce((sum, sub) => sum + convertPrice(sub.price, sub.currency, globalCurrency, exchangeRates), 0);
  const formattedTotalMonthly = formatPrice(totalMonthlyBase, globalCurrency);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const icon = `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`;

    if (name && url && !isNaN(Number(price)) && currency) {
      if (editingSubscription) {
        editSubscription(editingSubscription.id, { name, url, price: Number(price), currency, icon });
      } else {
        addSubscription({ name, url, price: Number(price), currency, icon });
      }
      setIsOpen(false);
      setEditingSubscription(null);
    }
  };

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setIsOpen(true);
  };

  const dockItems = subscriptions.map((sub) => ({
    title: sub.name,
    icon: <Image src={sub.icon} width={64} height={64} alt={`${sub.name} icon`} />,
    href: sub.url,
  }));

  if (!mounted) {
    return null;
  }

  const availableCurrencies = Object.keys(exchangeRates).sort();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto p-8 max-w-7xl">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-white">Monthly Subscriptions Tracker</h1>
          <div className="flex items-center space-x-4">
            <CurrencySelector
              id="base-currency"
              name="base-currency"
              currencies={availableCurrencies}
              required
              value={globalCurrency}
              onChange={(e) => setGlobalCurrency(e.target.value)}
              className="bg-gray-700 text-white rounded-lg p-1"
            />
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
                    {editingSubscription ? 'Edit the details of your subscription.' : 'Enter the details for your new subscription.'}
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
                      value={name}
                      onChange={(e) => setName(e.target.value)}
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
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
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
                      className="col-span-3 bg-gray-700 text白色"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="currency" className="text-right text-gray-300">
                      Currency
                    </Label>
                    {loadingRates ? (
                      <div className="col-span-3 bg-gray-700 text-white p-2">Loading...</div>
                    ) : (
                      <CurrencySelector
                        id="currency"
                        name="currency"
                        currencies={availableCurrencies}
                        className="col-span-3 bg-gray-700 text白色"
                        required
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                      />
                    )}
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text白色 mt-4">
                    {editingSubscription ? 'Update Subscription' : 'Add Subscription'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <InstructionsPopup popupKey="show-instructions" />
        <div className="mt-8 mb-8 text-3xl font-semibold text白色 text-center">
          Total Monthly: {formattedTotalMonthly}
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
  );
}
