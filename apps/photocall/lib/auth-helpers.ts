import type { Account, Member, OrganizationRole } from "@sferadev/platform-sdk";
import { eq } from "drizzle-orm";
import { headers as nextHeaders } from "next/headers";
import { db, schema } from "./db";
import { getPlatformClient } from "./platform";

/**
 * Verifies the platform session against the SDK and returns the authenticated
 * account. Throws when there is no valid session — used by server actions that
 * need to require an authenticated user.
 */
export async function requireSession(): Promise<{ user: Account }> {
	const account = await getPlatformClient().verifySession(await nextHeaders());
	if (!account) throw new Error("Unauthorized");
	return { user: account };
}

/**
 * Loads the calling user's membership in the given platform organization and
 * (optionally) asserts they hold one of `requiredRoles`. Returns the member
 * record from the platform.
 */
export async function requireOrgMembership(
	organizationId: string,
	requiredRoles?: OrganizationRole[],
): Promise<Member> {
	const platform = getPlatformClient();
	const headers = await nextHeaders();

	const account = await platform.verifySession(headers);
	if (!account) throw new Error("Unauthorized");

	const members = await platform.listMembers(organizationId, headers);
	const membership = members.find((m) => m.userId === account.id);

	if (!membership) {
		throw new Error("Not a member of this organization");
	}

	if (requiredRoles && !requiredRoles.includes(membership.role as OrganizationRole)) {
		throw new Error("Insufficient permissions");
	}

	return membership;
}

/**
 * Asserts the calling user has access to the given event (via membership in
 * the event's owning organization) and returns both the event and the
 * membership record.
 */
export async function requireEventAccess(
	eventId: string,
	requiredRoles?: OrganizationRole[],
): Promise<{ event: typeof schema.events.$inferSelect; membership: Member }> {
	const event = await db
		.select()
		.from(schema.events)
		.where(eq(schema.events.id, eventId))
		.then((rows) => rows[0]);

	if (!event) throw new Error("Event not found");

	const membership = await requireOrgMembership(event.organizationId, requiredRoles);
	return { event, membership };
}

export function generateToken(length = 32): string {
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let result = "";
	const randomValues = new Uint8Array(length);
	crypto.getRandomValues(randomValues);
	for (let i = 0; i < length; i++) {
		result += chars[randomValues[i] % chars.length];
	}
	return result;
}

export function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

export async function hashPin(pin: string): Promise<{ hash: string; salt: string }> {
	const salt = generateToken(16);
	const encoder = new TextEncoder();
	const data = encoder.encode(pin + salt);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
	return { hash, salt };
}

export async function verifyPin(pin: string, hash: string, salt: string): Promise<boolean> {
	const encoder = new TextEncoder();
	const data = encoder.encode(pin + salt);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const computedHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
	return computedHash === hash;
}

export function generateHumanCode(): string {
	const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
	const digits = "0123456789";
	let code = "";
	for (let i = 0; i < 4; i++) {
		code += letters.charAt(Math.floor(Math.random() * letters.length));
	}
	code += "-";
	for (let i = 0; i < 4; i++) {
		code += digits.charAt(Math.floor(Math.random() * digits.length));
	}
	return code;
}
