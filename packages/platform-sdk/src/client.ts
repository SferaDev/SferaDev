import { LRUCache } from "lru-cache";
import type {
	Account,
	Entitlement,
	Invoice,
	PlatformClient,
	PlatformClientOptions,
	Quota,
	Subscription,
	UsageSummary,
} from "./types.js";

export function createPlatformClient(options: PlatformClientOptions): PlatformClient {
	const {
		serviceUrl,
		productId,
		serviceToken,
		timeout = 5_000,
		retries = 2,
		failOpen = false,
	} = options;

	const baseUrl = serviceUrl.replace(/\/$/, "");

	// Brief session cache to avoid hammering the platform on every request
	const sessionCache = new LRUCache<string, Account>({
		max: 5_000,
		ttl: 30_000, // 30 seconds
	});

	async function request<T>(
		method: string,
		path: string,
		body?: unknown,
		headers?: Headers,
	): Promise<T> {
		let lastError: Error | undefined;

		for (let attempt = 0; attempt <= retries; attempt++) {
			const controller = new AbortController();
			const timer = setTimeout(() => controller.abort(), timeout);

			try {
				const reqHeaders: Record<string, string> = {
					Authorization: `Bearer ${serviceToken}`,
					"Content-Type": "application/json",
				};

				// Forward user's auth header if present (for session verification)
				const userAuth = headers?.get("Authorization");
				if (userAuth) {
					reqHeaders["X-Forwarded-Authorization"] = userAuth;
				}

				// Forward cookies for session-based auth
				const cookies = headers?.get("Cookie");
				if (cookies) {
					reqHeaders["Cookie"] = cookies;
				}

				const res = await fetch(`${baseUrl}${path}`, {
					method,
					headers: reqHeaders,
					body: body ? JSON.stringify(body) : undefined,
					signal: controller.signal,
				});

				if (!res.ok) {
					const errorBody = await res.text().catch(() => "Unknown error");
					throw new Error(`Platform API error ${res.status}: ${errorBody}`);
				}

				return (await res.json()) as T;
			} catch (error) {
				lastError = error instanceof Error ? error : new Error(String(error));
				if (attempt < retries) continue;
			} finally {
				clearTimeout(timer);
			}
		}

		throw lastError;
	}

	async function requestWithFallback<T>(
		method: string,
		path: string,
		fallback: T,
		body?: unknown,
	): Promise<T> {
		try {
			return await request<T>(method, path, body);
		} catch (error) {
			if (failOpen) return fallback;
			throw error;
		}
	}

	return {
		async verifySession(headers: Headers): Promise<Account | null> {
			// Check for bearer token or cookies
			const authHeader = headers.get("Authorization");
			const cacheKey = authHeader ?? headers.get("Cookie") ?? "";

			if (cacheKey) {
				const cached = sessionCache.get(cacheKey);
				if (cached) return cached;
			}

			try {
				const sessionHeaders: Record<string, string> = {};

				if (authHeader) {
					sessionHeaders["Authorization"] = authHeader;
				}

				const cookies = headers.get("Cookie");
				if (cookies) {
					sessionHeaders["Cookie"] = cookies;
				}

				const res = await fetch(`${baseUrl}/auth/get-session`, {
					headers: sessionHeaders,
				});

				if (!res.ok) return null;

				const data = (await res.json()) as { user: Account } | null;
				if (!data?.user) return null;

				if (cacheKey) {
					sessionCache.set(cacheKey, data.user);
				}

				return data.user;
			} catch {
				if (failOpen) return null;
				return null;
			}
		},

		async can(accountId: string, feature: string): Promise<boolean> {
			const params = new URLSearchParams({
				accountId,
				productId,
				feature,
			});

			const result = await requestWithFallback<{ allowed: boolean }>(
				"GET",
				`/api/entitlements/can?${params}`,
				{ allowed: failOpen },
			);

			return result.allowed;
		},

		async getQuota(accountId: string, feature: string): Promise<Quota> {
			const params = new URLSearchParams({
				accountId,
				productId,
				feature,
			});

			return request<Quota>("GET", `/api/entitlements/quota?${params}`);
		},

		async getEntitlements(accountId: string): Promise<Entitlement[]> {
			const params = new URLSearchParams({ accountId, productId });
			return request<Entitlement[]>("GET", `/api/entitlements/all?${params}`);
		},

		async reportUsage(accountId: string, meter: string, value: number): Promise<void> {
			await request("POST", "/api/billing/usage", {
				accountId,
				productId,
				meter,
				value,
			});
		},

		async getUsage(accountId: string, meter: string): Promise<UsageSummary> {
			const params = new URLSearchParams({
				accountId,
				productId,
				meter,
			});
			return request<UsageSummary>("GET", `/api/billing/usage?${params}`);
		},

		async subscribe(accountId: string, planId: string): Promise<Subscription> {
			return request<Subscription>("POST", "/api/billing/subscribe", {
				accountId,
				productId,
				planId,
			});
		},

		async changePlan(accountId: string, newPlanId: string): Promise<Subscription> {
			return request<Subscription>("PATCH", "/api/billing/subscribe", {
				accountId,
				productId,
				newPlanId,
			});
		},

		async cancelSubscription(accountId: string): Promise<void> {
			await request("DELETE", "/api/billing/subscribe", {
				accountId,
				productId,
			});
		},

		async getPortalUrl(accountId: string): Promise<string> {
			const params = new URLSearchParams({ accountId });
			const result = await request<{ url: string }>("GET", `/api/billing/portal-url?${params}`);
			return result.url;
		},

		async getInvoices(accountId: string): Promise<Invoice[]> {
			const params = new URLSearchParams({ accountId });
			return request<Invoice[]>("GET", `/api/billing/invoices?${params}`);
		},
	};
}
