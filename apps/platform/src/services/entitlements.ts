import { and, eq } from "drizzle-orm";
import { LRUCache } from "lru-cache";
import { db } from "../db/index.js";
import { accountSubscriptions, planFeatures, plans } from "../db/schema.js";

export interface Entitlement {
	feature: string;
	enabled: boolean;
	limitValue: number | null;
	limitWindow: string | null;
}

interface CachedEntitlements {
	planId: string;
	features: Entitlement[];
}

const cache = new LRUCache<string, CachedEntitlements>({
	max: 10_000,
	ttl: 60_000, // 60 seconds
});

function cacheKey(accountId: string, productId: string): string {
	return `${accountId}:${productId}`;
}

async function resolveEntitlements(
	accountId: string,
	productId: string,
): Promise<CachedEntitlements | null> {
	const key = cacheKey(accountId, productId);
	const cached = cache.get(key);
	if (cached) return cached;

	// Find the account's subscription for this product
	const [sub] = await db
		.select()
		.from(accountSubscriptions)
		.where(
			and(
				eq(accountSubscriptions.accountId, accountId),
				eq(accountSubscriptions.productId, productId),
				eq(accountSubscriptions.status, "active"),
			),
		)
		.limit(1);

	let planId: string | null = sub?.planId ?? null;

	// No active subscription — check for a default (free) plan
	if (!planId) {
		const [defaultPlan] = await db
			.select()
			.from(plans)
			.where(and(eq(plans.productId, productId), eq(plans.isDefault, true)))
			.limit(1);

		if (!defaultPlan) return null;
		planId = defaultPlan.id;
	}

	// Load features for this plan
	const features = await db
		.select({
			feature: planFeatures.feature,
			enabled: planFeatures.enabled,
			limitValue: planFeatures.limitValue,
			limitWindow: planFeatures.limitWindow,
		})
		.from(planFeatures)
		.where(eq(planFeatures.planId, planId));

	const result: CachedEntitlements = { planId, features };
	cache.set(key, result);
	return result;
}

async function can(accountId: string, productId: string, feature: string): Promise<boolean> {
	const entitlements = await resolveEntitlements(accountId, productId);
	if (!entitlements) return false;

	const entry = entitlements.features.find((f) => f.feature === feature);
	return entry?.enabled ?? false;
}

async function getQuota(
	accountId: string,
	productId: string,
	feature: string,
): Promise<{ limit: number | null; window: string | null }> {
	const entitlements = await resolveEntitlements(accountId, productId);
	if (!entitlements) return { limit: null, window: null };

	const entry = entitlements.features.find((f) => f.feature === feature);
	if (!entry) return { limit: null, window: null };

	return {
		limit: entry.limitValue,
		window: entry.limitWindow,
	};
}

async function getEntitlements(accountId: string, productId: string): Promise<Entitlement[]> {
	const result = await resolveEntitlements(accountId, productId);
	return result?.features ?? [];
}

function invalidate(accountId: string, productId?: string): void {
	if (productId) {
		cache.delete(cacheKey(accountId, productId));
	} else {
		// Invalidate all entries for this account
		for (const key of cache.keys()) {
			if (key.startsWith(`${accountId}:`)) {
				cache.delete(key);
			}
		}
	}
}

export const entitlements = {
	can,
	getQuota,
	getEntitlements,
	invalidate,
};
