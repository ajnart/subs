"use client";

import { useEffect, useState } from 'react';
import Logo from "@/components/Logo";
import SubscriptionItem from "@/components/SubscriptionItem";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import MadeWithKodu from "~/components/MadeWithKodu";
import { useSubscriptionStore } from "~/lib/subscriptionStore";
import InstructionsPopup from '~/components/InstructionsPopup';

export default function Component() {
	const { subscriptions, addSubscription, removeSubscription } = useSubscriptionStore();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.price, 0);

	const handleAddSubscription = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const name = formData.get("name") as string;
		const url = formData.get("url") as string;
		const price = parseFloat(formData.get("price") as string);
		const icon = `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`;

		if (name && url && price) {
			addSubscription({ name, url, price, icon });
			(event.target as HTMLFormElement).reset();
		}
	};

	if (!mounted) {
		return null; // Return null on initial render to avoid hydration mismatch
	}

	return (
		<div className="min-h-screen bg-gray-900 text-gray-100">
			<div className="container mx-auto p-8 max-w-7xl">
				<div className="flex justify-between items-center mb-12">
					<h1 className="text-4xl font-bold text-white">Monthly Subscriptions Tracker</h1>
				</div>
				<InstructionsPopup popupKey="show-instructions" />
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{subscriptions.map((subscription) => (
						<SubscriptionItem key={subscription.id} subscription={subscription} onRemove={removeSubscription} />
					))}
				</div>

				<div className="mt-16 text-3xl font-semibold text-white">
					Total Monthly: ${totalMonthly.toFixed(2)}
				</div>

				<Dialog>
					<DialogTrigger asChild>
						<Button className="mt-10 bg-blue-600 hover:bg-blue-700 text-white">
							<PlusCircle className="mr-2 h-5 w-5" />
							Add Subscription
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[425px] bg-gray-800 text-gray-100">
						<DialogHeader>
							<DialogTitle className="text-white">Add New Subscription</DialogTitle>
							<DialogDescription className="text-gray-400">
								Enter the details for your new subscription.
							</DialogDescription>
						</DialogHeader>

						<form onSubmit={handleAddSubscription} className="grid gap-4 py-4">
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="name" className="text-right text-gray-300">
									Name
								</Label>
								<Input id="name" name="name" className="col-span-3 bg-gray-700 text-white" required />
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="url" className="text-right text-gray-300">
									URL
								</Label>
								<Input id="url" name="url" type="url" className="col-span-3 bg-gray-700 text-white" required />
							</div>
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="price" className="text-right text-gray-300">
									Price
								</Label>
								<Input id="price" name="price" type="number" step="0.01" className="col-span-3 bg-gray-700 text-white" required />
							</div>
							<DialogFooter>
								<Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Add Subscription</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>
			<MadeWithKodu />
		</div>
	);
}
