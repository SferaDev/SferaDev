import type { GenericMutationCtx, GenericQueryCtx } from "convex/server";
import type { DataModel, Id } from "../_generated/dataModel";

type QueryCtx = GenericQueryCtx<DataModel>;
type MutationCtx = GenericMutationCtx<DataModel>;

// getAuthUserId placeholder - will be provided by @convex-dev/auth/server
async function getAuthUserId(ctx: QueryCtx | MutationCtx): Promise<Id<"users"> | null> {
	// This is a stub. The actual implementation comes from @convex-dev/auth/server
	const auth = (ctx as any).auth;
	if (!auth) return null;
	const identity = await auth.getUserIdentity();
	if (!identity) return null;
	return identity.subject as Id<"users">;
}

export async function requireAuth(ctx: QueryCtx | MutationCtx): Promise<Id<"users">> {
	const userId = await getAuthUserId(ctx);
	if (!userId) {
		throw new Error("Unauthorized");
	}
	return userId;
}

export async function getUser(ctx: QueryCtx | MutationCtx) {
	const userId = await getAuthUserId(ctx);
	if (!userId) return null;
	return await ctx.db.get(userId);
}

export async function getUserProfile(ctx: QueryCtx | MutationCtx, userId: Id<"users">) {
	return await ctx.db
		.query("userProfiles")
		.withIndex("by_user", (q: any) => q.eq("userId", userId))
		.unique();
}

export async function requireOrgMembership(
	ctx: QueryCtx | MutationCtx,
	userId: Id<"users">,
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
	userId: Id<"users">,
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
