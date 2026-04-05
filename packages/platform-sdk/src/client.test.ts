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
			fetchSpy.mockResolvedValueOnce(
				new Response(JSON.stringify({ allowed: true }), { status: 200 }),
			);

			const client = createClient();
			const result = await client.can("user-1", "advanced_analytics");

			expect(result).toBe(true);
			expect(fetchSpy).toHaveBeenCalledOnce();

			const [url, init] = fetchSpy.mock.calls[0];
			expect(url).toContain("/api/entitlements/can");
			expect(url).toContain("accountId=user-1");
			expect(url).toContain(`productId=${PRODUCT_ID}`);
			expect(url).toContain("feature=advanced_analytics");
			expect(init?.headers).toHaveProperty("Authorization", `Bearer ${SERVICE_TOKEN}`);
		});

		it("returns false when the platform says not allowed", async () => {
			fetchSpy.mockResolvedValueOnce(
				new Response(JSON.stringify({ allowed: false }), { status: 200 }),
			);

			const client = createClient();
			const result = await client.can("user-1", "premium_feature");
			expect(result).toBe(false);
		});

		it("throws on platform error with failOpen=false", async () => {
			fetchSpy.mockResolvedValue(new Response("Internal Server Error", { status: 500 }));

			const client = createClient({ retries: 0 });
			await expect(client.can("user-1", "feature")).rejects.toThrow("Platform API error 500");
		});

		it("returns failOpen value when platform is unreachable", async () => {
			fetchSpy.mockRejectedValue(new Error("Network error"));

			const client = createClient({ failOpen: true, retries: 0 });
			const result = await client.can("user-1", "feature");
			expect(result).toBe(true); // failOpen defaults to allowing
		});
	});

	describe("reportUsage()", () => {
		it("sends a POST with the correct body", async () => {
			fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }));

			const client = createClient();
			await client.reportUsage("user-1", "api_calls", 5);

			expect(fetchSpy).toHaveBeenCalledOnce();
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
			const mockSub = {
				id: "sub-1",
				accountId: "user-1",
				productId: PRODUCT_ID,
				planId: "pro",
				status: "active",
			};

			fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify(mockSub), { status: 200 }));

			const client = createClient();
			const result = await client.subscribe("user-1", "pro");

			expect(result.id).toBe("sub-1");
			expect(result.status).toBe("active");
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

			fetchSpy.mockResolvedValueOnce(
				new Response(JSON.stringify({ user: mockAccount }), { status: 200 }),
			);

			const client = createClient();
			const headers = new Headers({
				Authorization: "Bearer valid-token",
			});

			const result = await client.verifySession(headers);
			expect(result).toEqual(mockAccount);

			// Check it calls the auth endpoint with the user's credentials
			const [url] = fetchSpy.mock.calls[0];
			expect(url).toContain("/auth/get-session");
		});

		it("returns null when session is invalid", async () => {
			fetchSpy.mockResolvedValueOnce(new Response("Unauthorized", { status: 401 }));

			const client = createClient();
			const headers = new Headers({ Authorization: "Bearer invalid" });
			const result = await client.verifySession(headers);
			expect(result).toBeNull();
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

			fetchSpy.mockResolvedValueOnce(
				new Response(JSON.stringify({ user: mockAccount }), { status: 200 }),
			);

			const client = createClient();
			const headers = new Headers({ Authorization: "Bearer token-abc" });

			const result1 = await client.verifySession(headers);
			const result2 = await client.verifySession(headers);

			expect(result1).toEqual(mockAccount);
			expect(result2).toEqual(mockAccount);
			expect(fetchSpy).toHaveBeenCalledOnce(); // second call served from cache
		});
	});

	describe("retries", () => {
		it("retries on failure", async () => {
			fetchSpy
				.mockRejectedValueOnce(new Error("Network error"))
				.mockResolvedValueOnce(new Response(JSON.stringify({ allowed: true }), { status: 200 }));

			const client = createClient({ retries: 1 });
			const result = await client.can("user-1", "feature");

			expect(result).toBe(true);
			expect(fetchSpy).toHaveBeenCalledTimes(2);
		});
	});
});
