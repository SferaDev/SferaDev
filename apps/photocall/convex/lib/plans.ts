export type SubscriptionTier = "free" | "paid";

export interface PlanLimits {
	maxEvents: number;
	maxPhotosPerEvent: number;
	maxStorageBytes: number;
	maxTeamMembers: number;
	features: {
		customBranding: boolean;
		removeWatermark: boolean;
		prioritySupport: boolean;
		analytics: boolean;
	};
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
		maxPhotosPerEvent: INCLUDED_PHOTOS_PER_EVENT, // included, then overages
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

export function calculateEventCost(photoCount: number): {
	baseCost: number;
	overagePhotos: number;
	overageCost: number;
	totalCost: number;
} {
	const overagePhotos = Math.max(0, photoCount - INCLUDED_PHOTOS_PER_EVENT);
	const overageCost = overagePhotos * OVERAGE_PRICE_CENTS;
	return {
		baseCost: EVENT_PRICE_CENTS,
		overagePhotos,
		overageCost,
		totalCost: EVENT_PRICE_CENTS + overageCost,
	};
}
