import { and, eq } from "drizzle-orm";
import { db, schema } from "./db";

/** Check if a user is a member of an organization and has the required role */
export async function requireOrgMembership(
	userId: string,
	organizationId: string,
	requiredRoles?: ("owner" | "admin" | "member")[],
) {
	const membership = await db
		.select()
		.from(schema.organizationMembers)
		.where(
			and(
				eq(schema.organizationMembers.organizationId, organizationId),
				eq(schema.organizationMembers.userId, userId),
			),
		)
		.then((rows) => rows[0]);

	if (!membership) {
		throw new Error("Not a member of this organization");
	}

	if (requiredRoles && !requiredRoles.includes(membership.role as "owner" | "admin" | "member")) {
		throw new Error("Insufficient permissions");
	}

	return membership;
}

/** Check if a user has access to an event (via org membership) */
export async function requireEventAccess(
	userId: string,
	eventId: string,
	requiredRoles?: ("owner" | "admin" | "member")[],
) {
	const event = await db
		.select()
		.from(schema.events)
		.where(eq(schema.events.id, eventId))
		.then((rows) => rows[0]);

	if (!event) {
		throw new Error("Event not found");
	}

	const membership = await requireOrgMembership(userId, event.organizationId, requiredRoles);
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
