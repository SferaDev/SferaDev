import { boolean, integer, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

// ─── Platform tables ────────────────────────────────────────────────

export const products = pgTable("platform_products", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(),
	stripeProductId: text("stripe_product_id"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const plans = pgTable("platform_plans", {
	id: text("id").primaryKey(),
	productId: text("product_id")
		.references(() => products.id, { onDelete: "cascade" })
		.notNull(),
	name: text("name").notNull(),
	slug: text("slug").notNull(),
	stripePriceId: text("stripe_price_id"),
	isDefault: boolean("is_default").default(false).notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const planFeatures = pgTable("platform_plan_features", {
	id: text("id").primaryKey(),
	planId: text("plan_id")
		.references(() => plans.id, { onDelete: "cascade" })
		.notNull(),
	feature: text("feature").notNull(),
	enabled: boolean("enabled").default(true).notNull(),
	limitValue: integer("limit_value"),
	limitWindow: text("limit_window"),
});

export const meters = pgTable("platform_meters", {
	id: text("id").primaryKey(),
	productId: text("product_id")
		.references(() => products.id, { onDelete: "cascade" })
		.notNull(),
	name: text("name").notNull(),
	stripeMeterId: text("stripe_meter_id"),
	stripeMeterEventName: text("stripe_meter_event_name"),
});

export const accountSubscriptions = pgTable(
	"platform_account_subscriptions",
	{
		id: text("id").primaryKey(),
		accountId: text("account_id").notNull(),
		productId: text("product_id")
			.references(() => products.id, { onDelete: "cascade" })
			.notNull(),
		planId: text("plan_id")
			.references(() => plans.id)
			.notNull(),
		stripeSubscriptionId: text("stripe_subscription_id"),
		status: text("status").notNull(),
		currentPeriodStart: timestamp("current_period_start"),
		currentPeriodEnd: timestamp("current_period_end"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => [unique().on(table.accountId, table.productId)],
);

// ─── better-auth tables (generated via `npx @better-auth/cli generate`) ─────
// These are the core tables better-auth requires, defined here so Drizzle
// manages the full schema in one place.

export const users = pgTable("users", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	stripeCustomerId: text("stripe_customer_id"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	token: text("token").notNull().unique(),
	expiresAt: timestamp("expires_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	activeOrganizationId: text("active_organization_id"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	idToken: text("id_token"),
	password: text("password"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const verifications = pgTable("verifications", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── better-auth organization plugin tables ─────────────────────────

export const organizations = pgTable("organizations", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(),
	logo: text("logo"),
	metadata: text("metadata"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const members = pgTable("members", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	organizationId: text("organization_id")
		.references(() => organizations.id, { onDelete: "cascade" })
		.notNull(),
	role: text("role").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const invitations = pgTable("invitations", {
	id: text("id").primaryKey(),
	email: text("email").notNull(),
	inviterId: text("inviter_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	organizationId: text("organization_id")
		.references(() => organizations.id, { onDelete: "cascade" })
		.notNull(),
	role: text("role"),
	status: text("status").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── better-auth JWT plugin table ───────────────────────────────────

export const jwks = pgTable("jwks", {
	id: text("id").primaryKey(),
	publicKey: text("public_key").notNull(),
	privateKey: text("private_key").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
