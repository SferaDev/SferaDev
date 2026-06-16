import { LRUCache } from "lru-cache";
import type {
	Account,
	CreateCheckoutSessionOptions,
	CreateOrganizationInput,
	Entitlement,
	Invitation,
	Invoice,
	Member,
	Organization,
	OrganizationRole,
	PlatformClient,
	PlatformClientOptions,
	Quota,
	Subscription,
	UpdateOrganizationInput,
	UsageSummary,
} from "./types.js";

interface RequestOptions {
	method: string;
	path: string;
	body?: unknown;
	/**
	 * Whether to forward the user's auth cookies/bearer (true) or use the
	 * platform service token only (false). Service-token calls are used for
	 * trusted server-to-server APIs (entitlements, billing). User-credentialed
	 * calls are used to invoke better-auth's organization plugin on behalf of
	 * the signed-in user.
	 */
	userHeaders?: Headers;
}

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

	async function request<T>(opts: RequestOptions): Promise<T> {
		let lastError: Error | undefined;

		for (let attempt = 0; attempt <= retries; attempt++) {
			const controller = new AbortController();
			const timer = setTimeout(() => controller.abort(), timeout);

			try {
				const reqHeaders: Record<string, string> = {
					"Content-Type": "application/json",
					// These are server-to-server calls and carry no browser Origin.
					// better-auth's organization plugin enforces an origin check on
					// state-changing requests, so present the platform's own origin
					// (always trusted by better-auth as its configured baseURL).
					Origin: baseUrl,
				};

				if (opts.userHeaders) {
					// User-credentialed call: forward cookies and authorization so
					// better-auth can authenticate as the calling user.
					const userAuth = opts.userHeaders.get("Authorization");
					if (userAuth) reqHeaders["Authorization"] = userAuth;
					const cookies = opts.userHeaders.get("Cookie");
					if (cookies) reqHeaders["Cookie"] = cookies;
				} else {
					// Service-token call.
					reqHeaders["Authorization"] = `Bearer ${serviceToken}`;
				}

				const res = await fetch(`${baseUrl}${opts.path}`, {
					method: opts.method,
					headers: reqHeaders,
					body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
					signal: controller.signal,
				});

				if (!res.ok) {
					const errorBody = await res.text().catch(() => "Unknown error");
					throw new Error(`Platform API error ${res.status}: ${errorBody}`);
				}

				if (res.status === 204) {
					return undefined as T;
				}

				const text = await res.text();
				if (!text) return undefined as T;
				return JSON.parse(text) as T;
			} catch (error) {
				lastError = error instanceof Error ? error : new Error(String(error));
				if (attempt < retries) continue;
			} finally {
				clearTimeout(timer);
			}
		}

		throw lastError;
	}

	async function requestWithFallback<T>(opts: RequestOptions, fallback: T): Promise<T> {
		try {
			return await request<T>(opts);
		} catch (error) {
			if (failOpen) return fallback;
			throw error;
		}
	}

	function authPost<T>(path: string, body: unknown, headers: Headers): Promise<T> {
		return request<T>({ method: "POST", path, body, userHeaders: headers });
	}

	function authGet<T>(path: string, headers: Headers): Promise<T> {
		return request<T>({ method: "GET", path, userHeaders: headers });
	}

	return {
		async verifySession(headers: Headers): Promise<Account | null> {
			const authHeader = headers.get("Authorization");
			const cacheKey = authHeader ?? headers.get("Cookie") ?? "";

			if (cacheKey) {
				const cached = sessionCache.get(cacheKey);
				if (cached) return cached;
			}

			try {
				const sessionHeaders: Record<string, string> = {};
				if (authHeader) sessionHeaders["Authorization"] = authHeader;
				const cookies = headers.get("Cookie");
				if (cookies) sessionHeaders["Cookie"] = cookies;

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

		async can(accountId, feature) {
			const params = new URLSearchParams({ accountId, productId, feature });
			const result = await requestWithFallback<{ allowed: boolean }>(
				{ method: "GET", path: `/api/entitlements/can?${params}` },
				{ allowed: failOpen },
			);
			return result.allowed;
		},

		async getQuota(accountId, feature) {
			const params = new URLSearchParams({ accountId, productId, feature });
			return request<Quota>({ method: "GET", path: `/api/entitlements/quota?${params}` });
		},

		async getEntitlements(accountId) {
			const params = new URLSearchParams({ accountId, productId });
			return request<Entitlement[]>({ method: "GET", path: `/api/entitlements/all?${params}` });
		},

		async reportUsage(accountId, meter, value) {
			await request<{ ok: true }>({
				method: "POST",
				path: "/api/billing/usage",
				body: { accountId, productId, meter, value },
			});
		},

		async getUsage(accountId, meter) {
			const params = new URLSearchParams({ accountId, productId, meter });
			return request<UsageSummary>({ method: "GET", path: `/api/billing/usage?${params}` });
		},

		async subscribe(accountId, planId) {
			return request<Subscription>({
				method: "POST",
				path: "/api/billing/subscribe",
				body: { accountId, productId, planId },
			});
		},

		async changePlan(accountId, newPlanId) {
			return request<Subscription>({
				method: "PATCH",
				path: "/api/billing/subscribe",
				body: { accountId, productId, newPlanId },
			});
		},

		async cancelSubscription(accountId) {
			await request<{ ok: true }>({
				method: "DELETE",
				path: "/api/billing/subscribe",
				body: { accountId, productId },
			});
		},

		async createCheckoutSession(
			accountId: string,
			input: CreateCheckoutSessionOptions,
		): Promise<{ url: string }> {
			return request<{ url: string }>({
				method: "POST",
				path: "/api/billing/checkout",
				body: { ...input, accountId, productId },
			});
		},

		async getSubscription(accountId: string): Promise<Subscription | null> {
			const params = new URLSearchParams({ accountId, productId });
			return request<Subscription | null>({
				method: "GET",
				path: `/api/billing/subscription?${params}`,
			});
		},

		async getPortalUrl(accountId, returnUrl) {
			const params = new URLSearchParams({ accountId });
			if (returnUrl) params.set("returnUrl", returnUrl);
			const result = await request<{ url: string }>({
				method: "GET",
				path: `/api/billing/portal-url?${params}`,
			});
			return result.url;
		},

		async getInvoices(accountId) {
			const params = new URLSearchParams({ accountId });
			return request<Invoice[]>({ method: "GET", path: `/api/billing/invoices?${params}` });
		},

		// ─── Organization plugin wrappers (via better-auth /auth/organization/*)

		async listOrganizations(headers) {
			return authGet<Organization[]>("/auth/organization/list", headers);
		},

		async lookupOrganization(idOrSlug: string): Promise<Organization | null> {
			try {
				return await request<Organization | null>({
					method: "GET",
					path: `/api/organizations/${encodeURIComponent(idOrSlug)}`,
				});
			} catch (error) {
				if (error instanceof Error && error.message.includes("404")) return null;
				throw error;
			}
		},

		async getOrganization(idOrSlug, headers) {
			// Try id first, then slug. better-auth accepts both via query params.
			const params = new URLSearchParams();
			// Heuristic: slugs are typically lowercase kebab-case. We try id first
			// since UUIDs are unambiguous; if the lookup returns null the caller
			// can retry with the slug-typed form.
			params.set("organizationId", idOrSlug);
			try {
				const org = await authGet<Organization | null>(
					`/auth/organization/get-full-organization?${params}`,
					headers,
				);
				if (org) return org;
			} catch {
				// fall through to slug lookup
			}

			const slugParams = new URLSearchParams({ organizationSlug: idOrSlug });
			try {
				return await authGet<Organization | null>(
					`/auth/organization/get-full-organization?${slugParams}`,
					headers,
				);
			} catch {
				return null;
			}
		},

		async createOrganization(input: CreateOrganizationInput, headers) {
			return authPost<Organization>("/auth/organization/create", input, headers);
		},

		async updateOrganization(orgId, input: UpdateOrganizationInput, headers) {
			return authPost<Organization>(
				"/auth/organization/update",
				{ data: input, organizationId: orgId },
				headers,
			);
		},

		async deleteOrganization(orgId, headers) {
			await authPost<unknown>("/auth/organization/delete", { organizationId: orgId }, headers);
		},

		async setActiveOrganization(orgId, headers) {
			await authPost<unknown>("/auth/organization/set-active", { organizationId: orgId }, headers);
		},

		async listMembers(orgId, headers) {
			const params = new URLSearchParams({ organizationId: orgId });
			const result = await authGet<{ members: Member[]; total: number } | Member[]>(
				`/auth/organization/list-members?${params}`,
				headers,
			);
			if (Array.isArray(result)) return result;
			return result.members ?? [];
		},

		async removeMember(orgId, memberId, headers) {
			await authPost<unknown>(
				"/auth/organization/remove-member",
				{ memberIdOrEmail: memberId, organizationId: orgId },
				headers,
			);
		},

		async updateMemberRole(orgId, memberId, role: OrganizationRole | string, headers) {
			return authPost<Member>(
				"/auth/organization/update-member-role",
				{ memberId, role, organizationId: orgId },
				headers,
			);
		},

		async listInvitations(orgId, headers) {
			const params = new URLSearchParams({ organizationId: orgId });
			return authGet<Invitation[]>(`/auth/organization/list-invitations?${params}`, headers);
		},

		async inviteMember(orgId, input, headers) {
			return authPost<Invitation>(
				"/auth/organization/invite-member",
				{ email: input.email, role: input.role, organizationId: orgId },
				headers,
			);
		},

		async getInvitation(invitationId, headers) {
			const params = new URLSearchParams({ id: invitationId });
			try {
				return await authGet<Invitation | null>(
					`/auth/organization/get-invitation?${params}`,
					headers,
				);
			} catch {
				return null;
			}
		},

		async acceptInvitation(invitationId, headers) {
			const result = await authPost<{
				invitation: Invitation;
				member: Member;
			}>("/auth/organization/accept-invitation", { invitationId }, headers);
			return { organizationId: result.invitation.organizationId };
		},

		async rejectInvitation(invitationId, headers) {
			await authPost<unknown>("/auth/organization/reject-invitation", { invitationId }, headers);
		},

		async cancelInvitation(invitationId, headers) {
			await authPost<unknown>("/auth/organization/cancel-invitation", { invitationId }, headers);
		},
	};
}
