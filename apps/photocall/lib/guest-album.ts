import { cookies } from "next/headers";

/**
 * Guest-album security primitives.
 *
 * Guests are anonymous (no platform account). Access to an album is granted by
 * knowing its unguessable `albumToken` (in the URL), optionally gated by a PIN
 * or a self-declared name. To remember which albums a guest has unlocked — so
 * returning to the site shows "your albums" without re-entering links — we store
 * a *signed* cookie. The HMAC signature means a guest cannot forge a grant (e.g.
 * flip `unlocked` to bypass a PIN); the server always re-checks the signature.
 */

const COOKIE_NAME = "pc_guest";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 180; // 180 days
const MAX_ALBUMS_PER_COOKIE = 50;

/** A guest's access record for a single album. */
export type AlbumGrant = {
	/** The album token (matches events.albumToken). */
	t: string;
	/** Event name, cached for the "your albums" list. */
	n: string;
	/** Whether the guest has cleared the album's access gate (PIN/identity). */
	unlocked: boolean;
	/** Self-declared display name, attributed to the guest's uploads. */
	name?: string;
};

type GuestCookie = {
	/** Stable anonymous guest id; attributed to uploads so a guest can manage them. */
	gid: string;
	albums: AlbumGrant[];
};

// Pure upload-validation primitives (MIME types, size caps) live in a
// server/client-shared module. Re-exported here for the album server actions,
// which import their guest helpers from this file.
export {
	type GuestImageUploadContentType,
	type GuestUploadContentType,
	type GuestVideoUploadContentType,
	isAllowedImageType,
	isAllowedUploadType,
	isAllowedVideoType,
	MAX_GUEST_UPLOAD_BYTES,
	MAX_GUEST_VIDEO_UPLOAD_BYTES,
	maxUploadBytesFor,
} from "./upload-types";

// ── Cookie signing (HMAC-SHA256) ─────────────────────────────────────────

function getSecret(): string {
	const secret = process.env.GUEST_COOKIE_SECRET ?? process.env.CRON_SECRET;
	if (!secret) {
		throw new Error("GUEST_COOKIE_SECRET (or CRON_SECRET) must be set to sign guest album cookies");
	}
	return secret;
}

function base64UrlEncode(bytes: Uint8Array): string {
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(value: string): Uint8Array {
	const padded = value.replace(/-/g, "+").replace(/_/g, "/");
	const binary = atob(padded);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes;
}

async function hmac(payload: string): Promise<string> {
	const key = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(getSecret()),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
	return base64UrlEncode(new Uint8Array(signature));
}

/** Constant-time string comparison to avoid signature timing oracles. */
function timingSafeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) return false;
	let mismatch = 0;
	for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return mismatch === 0;
}

async function encodeCookie(data: GuestCookie): Promise<string> {
	const payload = base64UrlEncode(new TextEncoder().encode(JSON.stringify(data)));
	const signature = await hmac(payload);
	return `${payload}.${signature}`;
}

async function decodeCookie(raw: string): Promise<GuestCookie | null> {
	const [payload, signature] = raw.split(".");
	if (!payload || !signature) return null;

	const expected = await hmac(payload);
	if (!timingSafeEqual(signature, expected)) return null;

	try {
		const json = new TextDecoder().decode(base64UrlToBytes(payload));
		const parsed = JSON.parse(json) as GuestCookie;
		if (typeof parsed?.gid !== "string" || !Array.isArray(parsed.albums)) return null;
		return parsed;
	} catch {
		return null;
	}
}

// ── Cookie read/write ────────────────────────────────────────────────────

/** Reads and verifies the guest cookie. Returns null when absent or tampered. */
export async function readGuestCookie(): Promise<GuestCookie | null> {
	const store = await cookies();
	const raw = store.get(COOKIE_NAME)?.value;
	if (!raw) return null;
	return decodeCookie(raw);
}

/**
 * Persists the guest cookie. Must be called from a Server Action or Route
 * Handler — Next.js disallows setting cookies during Server Component render.
 */
export async function writeGuestCookie(data: GuestCookie): Promise<void> {
	const trimmed: GuestCookie = {
		gid: data.gid,
		albums: data.albums.slice(-MAX_ALBUMS_PER_COOKIE),
	};
	const store = await cookies();
	store.set(COOKIE_NAME, await encodeCookie(trimmed), {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: COOKIE_MAX_AGE_SECONDS,
	});
}

// ── Grant helpers ────────────────────────────────────────────────────────

export function findGrant(cookie: GuestCookie | null, token: string): AlbumGrant | undefined {
	return cookie?.albums.find((grant) => grant.t === token);
}

/**
 * Returns the existing cookie or a fresh one with a new anonymous guest id.
 * Pure — does not write; callers persist via {@link writeGuestCookie}.
 */
export function ensureGuestCookie(cookie: GuestCookie | null): GuestCookie {
	if (cookie) return cookie;
	return { gid: crypto.randomUUID(), albums: [] };
}

/**
 * Inserts or updates an album grant in the cookie (immutably) and returns the
 * new cookie value to persist.
 */
export function upsertGrant(cookie: GuestCookie, grant: AlbumGrant): GuestCookie {
	const others = cookie.albums.filter((existing) => existing.t !== grant.t);
	return { ...cookie, albums: [...others, grant] };
}
