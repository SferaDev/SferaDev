import { describe, expect, it } from "vitest";
import {
	ensureGuestCookie,
	findGrant,
	isAllowedUploadType,
	isAllowedVideoType,
	MAX_GUEST_UPLOAD_BYTES,
	MAX_GUEST_VIDEO_UPLOAD_BYTES,
	maxUploadBytesFor,
	upsertGrant,
} from "@/lib/guest-album";

describe("isAllowedUploadType", () => {
	it("accepts common image types", () => {
		for (const type of ["image/jpeg", "image/png", "image/webp", "image/heic"]) {
			expect(isAllowedUploadType(type)).toBe(true);
		}
	});

	it("accepts browser-playable video types", () => {
		for (const type of ["video/mp4", "video/webm", "video/quicktime"]) {
			expect(isAllowedUploadType(type)).toBe(true);
			expect(isAllowedVideoType(type)).toBe(true);
		}
	});

	it("rejects SVG (stored-XSS vector) and non-media", () => {
		expect(isAllowedUploadType("image/svg+xml")).toBe(false);
		expect(isAllowedUploadType("application/pdf")).toBe(false);
		expect(isAllowedUploadType("text/html")).toBe(false);
		expect(isAllowedVideoType("image/jpeg")).toBe(false);
	});

	it("caps image upload size at a sane maximum", () => {
		expect(MAX_GUEST_UPLOAD_BYTES).toBeGreaterThan(0);
		expect(MAX_GUEST_UPLOAD_BYTES).toBeLessThanOrEqual(50 * 1024 * 1024);
	});

	it("allows videos a larger cap than images", () => {
		expect(MAX_GUEST_VIDEO_UPLOAD_BYTES).toBeGreaterThan(MAX_GUEST_UPLOAD_BYTES);
		expect(maxUploadBytesFor("image/jpeg")).toBe(MAX_GUEST_UPLOAD_BYTES);
		expect(maxUploadBytesFor("video/mp4")).toBe(MAX_GUEST_VIDEO_UPLOAD_BYTES);
	});
});

describe("ensureGuestCookie", () => {
	it("creates a cookie with a fresh guest id when none exists", () => {
		const cookie = ensureGuestCookie(null);
		expect(cookie.gid).toMatch(/[0-9a-f-]{36}/);
		expect(cookie.albums).toEqual([]);
	});

	it("preserves an existing cookie unchanged", () => {
		const existing = { gid: "guest-1", albums: [] };
		expect(ensureGuestCookie(existing)).toBe(existing);
	});
});

describe("upsertGrant / findGrant", () => {
	it("adds a new grant", () => {
		const cookie = ensureGuestCookie(null);
		const next = upsertGrant(cookie, { t: "tok", n: "Wedding", unlocked: true });
		expect(findGrant(next, "tok")).toEqual({ t: "tok", n: "Wedding", unlocked: true });
	});

	it("replaces an existing grant for the same token (no duplicates)", () => {
		let cookie = ensureGuestCookie(null);
		cookie = upsertGrant(cookie, { t: "tok", n: "Wedding", unlocked: false });
		cookie = upsertGrant(cookie, { t: "tok", n: "Wedding", unlocked: true, name: "Alex" });
		expect(cookie.albums.filter((grant) => grant.t === "tok")).toHaveLength(1);
		expect(findGrant(cookie, "tok")?.unlocked).toBe(true);
		expect(findGrant(cookie, "tok")?.name).toBe("Alex");
	});

	it("returns undefined for an unknown token or null cookie", () => {
		expect(findGrant(null, "tok")).toBeUndefined();
		expect(findGrant(ensureGuestCookie(null), "missing")).toBeUndefined();
	});
});
