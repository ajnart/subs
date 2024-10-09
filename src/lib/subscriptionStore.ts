import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface Subscription {
	id: number;
	name: string;
	url: string;
	price: number;
	icon: string;
}

interface SubscriptionStore {
	subscriptions: Subscription[];
	addSubscription: (subscription: Omit<Subscription, "id">) => void;
	removeSubscription: (id: number) => void;
}

const defaultSubscriptions: Subscription[] = [
	{
		id: 1,
		name: "Netflix",
		url: "https://www.netflix.com",
		price: 15.99,
		icon: "https://www.google.com/s2/favicons?domain=netflix.com",
	},
	{
		id: 2,
		name: "Google One",
		url: "https://one.google.com",
		price: 1.99,
		icon: "https://www.google.com/s2/favicons?domain=google.com",
	},
	{
		id: 3,
		name: "Amazon Prime",
		url: "https://www.amazon.com/prime",
		price: 14.99,
		icon: "https://www.google.com/s2/favicons?domain=amazon.com",
	},
	{
		id: 4,
		name: "Spotify",
		url: "https://www.spotify.com",
		price: 9.99,
		icon: "https://www.google.com/s2/favicons?domain=spotify.com",
	},
	{
		id: 5,
		name: "YouTube Premium",
		url: "https://onlyfans.com/",
		price: 69.99,
		icon: "https://www.google.com/s2/favicons?domain=onlyfans.com",
	},
];

export const useSubscriptionStore = create<SubscriptionStore>()(
	persist(
		(set) => ({
			subscriptions: defaultSubscriptions,
			addSubscription: (newSubscription) =>
				set((state) => ({
					subscriptions: [
						...state.subscriptions,
						{ ...newSubscription, id: Date.now() },
					],
				})),
			removeSubscription: (id) =>
				set((state) => ({
					subscriptions: state.subscriptions.filter(
						(subscription) => subscription.id !== id,
					),
				})),
		}),
		{
			name: "subscription-storage",
			storage: createJSONStorage(() => localStorage),
		},
	),
);
