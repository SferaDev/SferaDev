import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Simple hash function for PIN (in production, use a proper library)
// This is a basic implementation for demonstration
async function hashPin(pin: string, salt: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(pin + salt);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function generateSalt(): string {
	const array = new Uint8Array(16);
	crypto.getRandomValues(array);
	return Array.from(array)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

// Default settings
const DEFAULT_SETTINGS = {
	slideshowEnabled: true,
	slideshowSafeMode: false,
	idleTimeoutSeconds: 60,
	defaultCamera: "user" as const,
	language: "en" as const,
	photoQuality: 0.9,
	maxPhotoDimension: 2048,
	retentionDays: undefined,
	deleteAfterDate: undefined,
	shareExpirationDays: undefined,
};

export const get = query({
	args: {},
	handler: async (ctx) => {
		const settings = await ctx.db.query("settings").first();
		if (!settings) {
			// Return defaults without sensitive data
			return {
				...DEFAULT_SETTINGS,
				hasPin: false,
			};
		}

		// Don't expose hash/salt
		const { adminPinHash, adminPinSalt, ...publicSettings } = settings;
		return {
			...publicSettings,
			hasPin: !!adminPinHash,
		};
	},
});

export const initialize = mutation({
	args: {
		pin: v.string(),
	},
	handler: async (ctx, args) => {
		// Check if settings already exist
		const existing = await ctx.db.query("settings").first();
		if (existing) {
			throw new Error("Settings already initialized");
		}

		const salt = generateSalt();
		const hash = await hashPin(args.pin, salt);

		await ctx.db.insert("settings", {
			adminPinHash: hash,
			adminPinSalt: salt,
			...DEFAULT_SETTINGS,
			updatedAt: Date.now(),
		});
	},
});

export const validatePin = mutation({
	args: {
		pin: v.string(),
	},
	handler: async (ctx, args) => {
		const settings = await ctx.db.query("settings").first();
		if (!settings) {
			// First time - any PIN is valid and initializes the system
			const salt = generateSalt();
			const hash = await hashPin(args.pin, salt);

			await ctx.db.insert("settings", {
				adminPinHash: hash,
				adminPinSalt: salt,
				...DEFAULT_SETTINGS,
				updatedAt: Date.now(),
			});

			return { valid: true, initialized: true };
		}

		const hash = await hashPin(args.pin, settings.adminPinSalt);
		const valid = hash === settings.adminPinHash;

		return { valid, initialized: false };
	},
});

export const changePin = mutation({
	args: {
		currentPin: v.string(),
		newPin: v.string(),
	},
	handler: async (ctx, args) => {
		const settings = await ctx.db.query("settings").first();
		if (!settings) {
			throw new Error("Settings not initialized");
		}

		// Verify current PIN
		const currentHash = await hashPin(args.currentPin, settings.adminPinSalt);
		if (currentHash !== settings.adminPinHash) {
			throw new Error("Invalid current PIN");
		}

		// Set new PIN
		const newSalt = generateSalt();
		const newHash = await hashPin(args.newPin, newSalt);

		await ctx.db.patch(settings._id, {
			adminPinHash: newHash,
			adminPinSalt: newSalt,
			updatedAt: Date.now(),
		});

		return { success: true };
	},
});

export const update = mutation({
	args: {
		slideshowEnabled: v.optional(v.boolean()),
		slideshowSafeMode: v.optional(v.boolean()),
		idleTimeoutSeconds: v.optional(v.number()),
		defaultCamera: v.optional(v.union(v.literal("user"), v.literal("environment"))),
		language: v.optional(v.union(v.literal("en"), v.literal("es"), v.literal("cat"))),
		photoQuality: v.optional(v.number()),
		maxPhotoDimension: v.optional(v.number()),
		retentionDays: v.optional(v.union(v.number(), v.null())),
		deleteAfterDate: v.optional(v.union(v.number(), v.null())),
		shareExpirationDays: v.optional(v.union(v.number(), v.null())),
	},
	handler: async (ctx, args) => {
		const settings = await ctx.db.query("settings").first();
		if (!settings) {
			throw new Error("Settings not initialized");
		}

		// Filter out undefined values and handle null -> undefined conversion
		const updates: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(args)) {
			if (value !== undefined) {
				updates[key] = value === null ? undefined : value;
			}
		}

		await ctx.db.patch(settings._id, {
			...updates,
			updatedAt: Date.now(),
		});
	},
});
