import type { Id } from "../_generated/dataModel";

// Subscription and billing types
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
}

export interface Subscription {
	tier: SubscriptionTier;
	status: SubscriptionStatus;
	limits: PlanLimits;
	features: PlanFeatures;
}

export interface EventBillingSummary {
	eventId: Id<"events">;
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

// Type guards
export function isSubscriptionTier(value: unknown): value is SubscriptionTier {
	return value === "free" || value === "paid";
}

export function isSubscriptionStatus(value: unknown): value is SubscriptionStatus {
	return (
		value === "active" ||
		value === "past_due" ||
		value === "canceled" ||
		value === "trialing" ||
		value === "none"
	);
}

export function isBillingSummary(value: unknown): value is BillingSummary {
	if (typeof value !== "object" || value === null) return false;

	const obj = value as Record<string, unknown>;

	return (
		isSubscriptionTier(obj.tier) &&
		typeof obj.eventCredits === "number" &&
		typeof obj.eventsUsed === "number" &&
		typeof obj.eventPrice === "number" &&
		typeof obj.includedPhotosPerEvent === "number" &&
		typeof obj.overagePricePerPhoto === "number" &&
		Array.isArray(obj.events) &&
		typeof obj.totalOverageCost === "number"
	);
}

export function isEventBillingSummary(value: unknown): value is EventBillingSummary {
	if (typeof value !== "object" || value === null) return false;

	const obj = value as Record<string, unknown>;

	return (
		typeof obj.eventId === "string" &&
		typeof obj.name === "string" &&
		typeof obj.photoCount === "number" &&
		typeof obj.includedPhotos === "number" &&
		typeof obj.overagePhotos === "number" &&
		typeof obj.overageCost === "number"
	);
}

// Organization member types
export type MemberRole = "owner" | "admin" | "member";

export interface OrganizationMember {
	_id: Id<"organizationMembers">;
	userId: Id<"users">;
	role: MemberRole;
	joinedAt: number;
	user?: {
		name?: string;
		email?: string;
		avatarUrl?: string;
	};
}

export interface Invitation {
	_id: Id<"invitations">;
	email: string;
	role: "admin" | "member";
	createdAt: number;
	expiresAt: number;
}

// Event types
export type EventStatus = "draft" | "active" | "paused" | "archived";

export interface Event {
	_id: Id<"events">;
	organizationId: Id<"organizations">;
	name: string;
	slug: string;
	description?: string;
	startDate?: number;
	endDate?: number;
	status: EventStatus;
	photoCount: number;
	sessionCount: number;
	createdAt: number;
	updatedAt: number;
}

// Organization types
export interface Organization {
	_id: Id<"organizations">;
	name: string;
	slug: string;
	ownerId: Id<"users">;
	subscriptionTier: SubscriptionTier;
	subscriptionStatus: SubscriptionStatus;
	maxEvents: number;
	maxPhotosPerEvent: number;
	maxStorageBytes: number;
	maxTeamMembers: number;
	currentStorageBytes: number;
	stripeCustomerId?: string;
	createdAt: number;
	updatedAt: number;
}

// Type guards for organization types
export function isMemberRole(value: unknown): value is MemberRole {
	return value === "owner" || value === "admin" || value === "member";
}

export function isEventStatus(value: unknown): value is EventStatus {
	return value === "draft" || value === "active" || value === "paused" || value === "archived";
}
