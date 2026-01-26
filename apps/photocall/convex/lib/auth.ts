import type { GenericMutationCtx, GenericQueryCtx } from "convex/server";
import type { DataModel, Id } from "../_generated/dataModel";
import { authComponent } from "../auth";

type QueryCtx = GenericQueryCtx<DataModel>;
type MutationCtx = GenericMutationCtx<DataModel>;

export async function requireAuth(ctx: QueryCtx | MutationCtx): Promise<string> {
	const user = await authComponent.getAuthUser(ctx);
	if (!user) {
		throw new Error("Unauthorized");
	}
	return user.id;
}

export async function getUser(ctx: QueryCtx | MutationCtx) {
	return authComponent.getAuthUser(ctx);
}

export async function getUserProfile(ctx: QueryCtx | MutationCtx, betterAuthUserId: string) {
	return await ctx.db
		.query("userProfiles")
		.withIndex("by_user", (q: any) => q.eq("userId", betterAuthUserId))
		.unique();
}

export async function requireOrgMembership(
	ctx: QueryCtx | MutationCtx,
	userId: string,
	organizationId: Id<"organizations">,
	requiredRoles?: ("owner" | "admin" | "member")[],
) {
	const membership = await ctx.db
		.query("organizationMembers")
		.withIndex("by_org_user", (q: any) =>
			q.eq("organizationId", organizationId).eq("userId", userId),
		)
		.unique();

	if (!membership) {
		throw new Error("Not a member of this organization");
	}

	if (requiredRoles && !requiredRoles.includes(membership.role)) {
		throw new Error("Insufficient permissions");
	}

	return membership;
}

export async function requireEventAccess(
	ctx: QueryCtx | MutationCtx,
	userId: string,
	eventId: Id<"events">,
	requiredRoles?: ("owner" | "admin" | "member")[],
) {
	const event = await ctx.db.get(eventId);
	if (!event) {
		throw new Error("Event not found");
	}

	const membership = await requireOrgMembership(ctx, userId, event.organizationId, requiredRoles);

	return { event, membership };
}

export function generateToken(length: number = 32): string {
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
