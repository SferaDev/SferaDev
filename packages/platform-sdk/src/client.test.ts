import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPlatformClient } from "./client.js";

const SERVICE_URL = "http://localhost:3100";
const PRODUCT_ID = "test-product";
const SERVICE_TOKEN = "test-service-token";

function createClient(overrides?: { failOpen?: boolean; retries?: number; timeout?: number }) {
	return createPlatformClient({
		serviceUrl: SERVICE_URL,
		productId: PRODUCT_ID,
		serviceToken: SERVICE_TOKEN,
		...overrides,
	});
}

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

function getInitHeaders(init: RequestInit | undefined): Record<string, string> {
	const raw = init?.headers;
	if (!raw) return {};
	if (raw instanceof Headers) return Object.fromEntries(raw.entries());
	if (Array.isArray(raw)) return Object.fromEntries(raw);
	return raw as Record<string, string>;
}

describe("createPlatformClient", () => {
	const fetchSpy = vi.fn<typeof globalThis.fetch>();

	beforeEach(() => {
		fetchSpy.mockReset();
		vi.stubGlobal("fetch", fetchSpy);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("can()", () => {
		it("returns true when the platform says allowed", async () => {
			fetchSpy.mockResolvedValueOnce(jsonResponse({ allowed: true }));

			const client = createClient();
			const result = await client.can("user-1", "advanced_analytics");

			expect(result).toBe(true);
			expect(fetchSpy).toHaveBeenCalledOnce();

			const [url, init] = fetchSpy.mock.calls[0];
			expect(url).toContain("/api/entitlements/can");
			expect(url).toContain("accountId=user-1");
			expect(url).toContain(`productId=${PRODUCT_ID}`);
			expect(url).toContain("feature=advanced_analytics");
			expect(getInitHeaders(init)["Authorization"]).toBe(`Bearer ${SERVICE_TOKEN}`);
		});

		it("returns false when the platform says not allowed", async () => {
			fetchSpy.mockResolvedValueOnce(jsonResponse({ allowed: false }));

			const client = createClient();
			expect(await client.can("user-1", "premium_feature")).toBe(false);
		});

		it("throws on platform error with failOpen=false", async () => {
			fetchSpy.mockResolvedValue(new Response("Internal Server Error", { status: 500 }));

			const client = createClient({ retries: 0 });
			await expect(client.can("user-1", "feature")).rejects.toThrow("Platform API error 500");
		});

		it("returns failOpen value when platform is unreachable", async () => {
			fetchSpy.mockRejectedValue(new Error("Network error"));

			const client = createClient({ failOpen: true, retries: 0 });
			expect(await client.can("user-1", "feature")).toBe(true);
		});
	});

	describe("reportUsage()", () => {
		it("sends a POST with the correct body", async () => {
			fetchSpy.mockResolvedValueOnce(jsonResponse({ ok: true }));

			const client = createClient();
			await client.reportUsage("user-1", "api_calls", 5);

			const [url, init] = fetchSpy.mock.calls[0];
			expect(url).toBe(`${SERVICE_URL}/api/billing/usage`);
			expect(init?.method).toBe("POST");
			expect(JSON.parse(init?.body as string)).toEqual({
				accountId: "user-1",
				productId: PRODUCT_ID,
				meter: "api_calls",
				value: 5,
			});
		});
	});

	describe("subscribe()", () => {
		it("creates a subscription", async () => {
			fetchSpy.mockResolvedValueOnce(
				jsonResponse({
					id: "sub-1",
					accountId: "user-1",
					productId: PRODUCT_ID,
					planId: "pro",
					status: "active",
				}),
			);

			const client = createClient();
			const result = await client.subscribe("user-1", "pro");

			expect(result.id).toBe("sub-1");
			expect(result.status).toBe("active");
		});
	});

	describe("createCheckoutSession()", () => {
		it("posts to /api/billing/checkout with the input", async () => {
			fetchSpy.mockResolvedValueOnce(jsonResponse({ url: "https://stripe.test/checkout/abc" }));

			const client = createClient();
			const result = await client.createCheckoutSession("org-1", {
				planId: "pro",
				quantity: 2,
				successUrl: "https://app.test/success",
				cancelUrl: "https://app.test/cancel",
				metadata: { feature: "extra-event" },
			});

			expect(result.url).toBe("https://stripe.test/checkout/abc");
			const [url, init] = fetchSpy.mock.calls[0];
			expect(url).toBe(`${SERVICE_URL}/api/billing/checkout`);
			expect(init?.method).toBe("POST");
			expect(JSON.parse(init?.body as string)).toEqual({
				accountId: "org-1",
				productId: PRODUCT_ID,
				planId: "pro",
				quantity: 2,
				successUrl: "https://app.test/success",
				cancelUrl: "https://app.test/cancel",
				metadata: { feature: "extra-event" },
			});
		});
	});

	describe("getSubscription()", () => {
		it("returns a subscription when present", async () => {
			fetchSpy.mockResolvedValueOnce(
				jsonResponse({
					id: "sub-1",
					accountId: "org-1",
					productId: PRODUCT_ID,
					planId: "pro",
					status: "active",
				}),
			);

			const client = createClient();
			const sub = await client.getSubscription("org-1");
			expect(sub?.id).toBe("sub-1");

			const [url] = fetchSpy.mock.calls[0];
			expect(url).toContain("/api/billing/subscription");
			expect(url).toContain("accountId=org-1");
			expect(url).toContain(`productId=${PRODUCT_ID}`);
		});

		it("returns null when no subscription exists", async () => {
			fetchSpy.mockResolvedValueOnce(jsonResponse(null));

			const client = createClient();
			expect(await client.getSubscription("org-1")).toBeNull();
		});
	});

	describe("getPortalUrl()", () => {
		it("forwards returnUrl when provided", async () => {
			fetchSpy.mockResolvedValueOnce(jsonResponse({ url: "https://billing.stripe.test/portal/1" }));

			const client = createClient();
			const result = await client.getPortalUrl("org-1", "https://app.test/back");
			expect(result).toBe("https://billing.stripe.test/portal/1");

			const [url] = fetchSpy.mock.calls[0];
			expect(url).toContain("accountId=org-1");
			expect(url).toContain("returnUrl=https%3A%2F%2Fapp.test%2Fback");
		});
	});

	describe("verifySession()", () => {
		it("returns account when session is valid", async () => {
			const mockAccount = {
				id: "user-1",
				name: "Test User",
				email: "test@example.com",
				emailVerified: true,
				image: null,
				stripeCustomerId: "cus_123",
				createdAt: "2025-01-01T00:00:00Z",
			};

			fetchSpy.mockResolvedValueOnce(jsonResponse({ user: mockAccount }));

			const client = createClient();
			const headers = new Headers({ Authorization: "Bearer valid-token" });

			const result = await client.verifySession(headers);
			expect(result).toEqual(mockAccount);

			const [url] = fetchSpy.mock.calls[0];
			expect(url).toContain("/auth/get-session");
		});

		it("returns null when session is invalid", async () => {
			fetchSpy.mockResolvedValueOnce(new Response("Unauthorized", { status: 401 }));

			const client = createClient();
			const headers = new Headers({ Authorization: "Bearer invalid" });
			expect(await client.verifySession(headers)).toBeNull();
		});

		it("caches valid sessions", async () => {
			const mockAccount = {
				id: "user-1",
				name: "Test",
				email: "test@example.com",
				emailVerified: true,
				image: null,
				stripeCustomerId: null,
				createdAt: "2025-01-01T00:00:00Z",
			};

			fetchSpy.mockResolvedValueOnce(jsonResponse({ user: mockAccount }));

			const client = createClient();
			const headers = new Headers({ Authorization: "Bearer token-abc" });

			expect(await client.verifySession(headers)).toEqual(mockAccount);
			expect(await client.verifySession(headers)).toEqual(mockAccount);
			expect(fetchSpy).toHaveBeenCalledOnce();
		});
	});

	describe("organization plugin wrappers", () => {
		const userHeaders = new Headers({
			Cookie: "better-auth.session_token=abc",
		});

		it("listOrganizations() forwards user cookies", async () => {
			fetchSpy.mockResolvedValueOnce(jsonResponse([]));

			const client = createClient();
			await client.listOrganizations(userHeaders);

			const [url, init] = fetchSpy.mock.calls[0];
			expect(url).toBe(`${SERVICE_URL}/auth/organization/list`);
			expect(getInitHeaders(init)["Cookie"]).toBe("better-auth.session_token=abc");
			// Service token should NOT be sent on user-credentialed calls
			expect(getInitHeaders(init)["Authorization"]).toBeUndefined();
		});

		it("createOrganization() posts the input as body", async () => {
			const org = {
				id: "org-1",
				name: "Acme",
				slug: "acme",
				logo: null,
				metadata: null,
				stripeCustomerId: null,
				createdAt: "2025-01-01T00:00:00Z",
			};
			fetchSpy.mockResolvedValueOnce(jsonResponse(org));

			const client = createClient();
			const result = await client.createOrganization({ name: "Acme", slug: "acme" }, userHeaders);

			expect(result.id).toBe("org-1");
			const [url, init] = fetchSpy.mock.calls[0];
			expect(url).toBe(`${SERVICE_URL}/auth/organization/create`);
			expect(init?.method).toBe("POST");
			expect(JSON.parse(init?.body as string)).toEqual({ name: "Acme", slug: "acme" });
		});

		it("updateOrganization() wraps the body in { data, organizationId }", async () => {
			fetchSpy.mockResolvedValueOnce(jsonResponse({ id: "org-1", name: "New Name" }));

			const client = createClient();
			await client.updateOrganization("org-1", { name: "New Name" }, userHeaders);

			const [, init] = fetchSpy.mock.calls[0];
			expect(JSON.parse(init?.body as string)).toEqual({
				data: { name: "New Name" },
				organizationId: "org-1",
			});
		});

		it("listMembers() unwraps the { members, total } envelope", async () => {
			fetchSpy.mockResolvedValueOnce(
				jsonResponse({ members: [{ id: "m-1", userId: "u-1", role: "owner" }], total: 1 }),
			);

			const client = createClient();
			const members = await client.listMembers("org-1", userHeaders);
			expect(members).toHaveLength(1);
			expect(members[0].id).toBe("m-1");
		});

		it("inviteMember() sends email/role/orgId", async () => {
			fetchSpy.mockResolvedValueOnce(
				jsonResponse({
					id: "inv-1",
					email: "a@b.com",
					inviterId: "u-1",
					organizationId: "org-1",
					role: "member",
					status: "pending",
					expiresAt: "2025-12-31T00:00:00Z",
				}),
			);

			const client = createClient();
			const invitation = await client.inviteMember(
				"org-1",
				{ email: "a@b.com", role: "member" },
				userHeaders,
			);

			expect(invitation.id).toBe("inv-1");
			const [url, init] = fetchSpy.mock.calls[0];
			expect(url).toBe(`${SERVICE_URL}/auth/organization/invite-member`);
			expect(JSON.parse(init?.body as string)).toEqual({
				email: "a@b.com",
				role: "member",
				organizationId: "org-1",
			});
		});

		it("acceptInvitation() returns the new organization id", async () => {
			fetchSpy.mockResolvedValueOnce(
				jsonResponse({
					invitation: { id: "inv-1", organizationId: "org-1" },
					member: { id: "m-1" },
				}),
			);

			const client = createClient();
			const result = await client.acceptInvitation("inv-1", userHeaders);
			expect(result.organizationId).toBe("org-1");
		});

		it("removeMember() posts memberIdOrEmail and organizationId", async () => {
			fetchSpy.mockResolvedValueOnce(jsonResponse({ ok: true }));

			const client = createClient();
			await client.removeMember("org-1", "m-1", userHeaders);

			const [url, init] = fetchSpy.mock.calls[0];
			expect(url).toBe(`${SERVICE_URL}/auth/organization/remove-member`);
			expect(JSON.parse(init?.body as string)).toEqual({
				memberIdOrEmail: "m-1",
				organizationId: "org-1",
			});
		});
	});

	describe("retries", () => {
		it("retries on failure", async () => {
			fetchSpy
				.mockRejectedValueOnce(new Error("Network error"))
				.mockResolvedValueOnce(jsonResponse({ allowed: true }));

			const client = createClient({ retries: 1 });
			expect(await client.can("user-1", "feature")).toBe(true);
			expect(fetchSpy).toHaveBeenCalledTimes(2);
		});
	});
});
