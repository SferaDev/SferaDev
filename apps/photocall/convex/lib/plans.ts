export type SubscriptionTier = "free" | "starter" | "pro" | "enterprise";

export interface PlanLimits {
	maxEvents: number;
	maxPhotosPerEvent: number;
	maxStorageBytes: number;
	maxTeamMembers: number;
	features: {
		customBranding: boolean;
		removeWatermark: boolean;
		prioritySupport: boolean;
		apiAccess: boolean;
		analytics: boolean;
		customDomain: boolean;
	};
}

export const PLAN_LIMITS: Record<SubscriptionTier, PlanLimits> = {
	free: {
		maxEvents: 1,
		maxPhotosPerEvent: 100,
		maxStorageBytes: 500 * 1024 * 1024, // 500 MB
		maxTeamMembers: 1,
		features: {
			customBranding: false,
			removeWatermark: false,
			prioritySupport: false,
			apiAccess: false,
			analytics: false,
			customDomain: false,
		},
	},
	starter: {
		maxEvents: 5,
		maxPhotosPerEvent: 500,
		maxStorageBytes: 5 * 1024 * 1024 * 1024, // 5 GB
		maxTeamMembers: 3,
		features: {
			customBranding: true,
			removeWatermark: true,
			prioritySupport: false,
			apiAccess: false,
			analytics: true,
			customDomain: false,
		},
	},
	pro: {
		maxEvents: 20,
		maxPhotosPerEvent: 2000,
		maxStorageBytes: 25 * 1024 * 1024 * 1024, // 25 GB
		maxTeamMembers: 10,
		features: {
			customBranding: true,
			removeWatermark: true,
			prioritySupport: true,
			apiAccess: true,
			analytics: true,
			customDomain: false,
		},
	},
	enterprise: {
		maxEvents: -1, // unlimited
		maxPhotosPerEvent: -1, // unlimited
		maxStorageBytes: 100 * 1024 * 1024 * 1024, // 100 GB base
		maxTeamMembers: -1, // unlimited
		features: {
			customBranding: true,
			removeWatermark: true,
			prioritySupport: true,
			apiAccess: true,
			analytics: true,
			customDomain: true,
		},
	},
};

export const STRIPE_PRICE_IDS: Record<SubscriptionTier, string | null> = {
	free: null,
	starter: process.env.STRIPE_STARTER_PRICE_ID ?? "price_starter",
	pro: process.env.STRIPE_PRO_PRICE_ID ?? "price_pro",
	enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID ?? "price_enterprise",
};

export function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}
