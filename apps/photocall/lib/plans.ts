export type SubscriptionTier = "free" | "paid";

export type SubscriptionStatus = "active" | "past_due" | "canceled" | "trialing" | "none";

export interface PlanFeatures {
	customBranding: boolean;
	removeWatermark: boolean;
	prioritySupport: boolean;
	analytics: boolean;
}

export interface PlanLimits {
	maxEvents: number;
	maxPhotosPerEvent: number;
	maxStorageBytes: number;
	maxTeamMembers: number;
	features: PlanFeatures;
}

// Pricing constants
export const EVENT_PRICE_CENTS = 4900; // $49 per event
export const INCLUDED_PHOTOS_PER_EVENT = 200;
export const OVERAGE_PRICE_CENTS = 25; // $0.25 per photo over limit

export const PLAN_LIMITS: Record<SubscriptionTier, PlanLimits> = {
	free: {
		maxEvents: 1,
		maxPhotosPerEvent: 10,
		maxStorageBytes: 100 * 1024 * 1024, // 100 MB
		maxTeamMembers: 1,
		features: {
			customBranding: false,
			removeWatermark: false,
			prioritySupport: false,
			analytics: false,
		},
	},
	paid: {
		maxEvents: -1, // unlimited (pay per event)
		maxPhotosPerEvent: INCLUDED_PHOTOS_PER_EVENT,
		maxStorageBytes: -1, // unlimited (metered)
		maxTeamMembers: 10,
		features: {
			customBranding: true,
			removeWatermark: true,
			prioritySupport: true,
			analytics: true,
		},
	},
};

export function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

export function formatCents(cents: number): string {
	return `$${(cents / 100).toFixed(2)}`;
}

export interface Subscription {
	tier: SubscriptionTier;
	status: SubscriptionStatus;
	limits: {
		maxEvents: number;
		maxPhotosPerEvent: number;
		maxStorageBytes: number;
		maxTeamMembers: number;
	};
	features: PlanFeatures;
}

export interface EventBillingSummary {
	eventId: string;
	name: string;
	photoCount: number;
	includedPhotos: number;
	overagePhotos: number;
	overageCost: number;
}

export interface BillingSummary {
	tier: SubscriptionTier;
	eventCredits: number;
	eventsUsed: number;
	eventPrice: number;
	includedPhotosPerEvent: number;
	overagePricePerPhoto: number;
	events: EventBillingSummary[];
	totalOverageCost: number;
}
