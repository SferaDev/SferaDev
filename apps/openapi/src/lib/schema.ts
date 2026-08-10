import { relations } from "drizzle-orm";
import { boolean, jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

// ─── better-auth tables ─────────────────────────────────────────────
// The core tables better-auth requires. Column names follow better-auth's
// defaults so no `fields` mapping is needed in the drizzle adapter; the shape
// mirrors `apps/platform`, which is the other better-auth consumer here.

export const users = pgTable("users", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
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

export const oauthClient = pgTable("oauth_client", {
	id: varchar("id", { length: 255 }).primaryKey(),
	clientId: varchar("client_id", { length: 255 }).unique().notNull(),
	clientSecret: varchar("client_secret", { length: 255 }),
	name: varchar("name", { length: 255 }).notNull(),
	description: text("description"),
	logoUri: text("logo_uri"),
	redirectUris: text("redirect_uris").array().notNull(),
	grantTypes: text("grant_types").array().notNull(),
	tokenEndpointAuthMethod: text("token_endpoint_auth_method").notNull(),
	scope: text("scope"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const oauthAuthorizationCode = pgTable("oauth_authorization_code", {
	authorizationCode: varchar("authorization_code", { length: 255 }).primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	redirectUri: text("redirect_uri").notNull(),
	scope: text("scope"),
	authorizationDetails: jsonb("authorization_details"),
	codeChallenge: text("code_challenge"),
	codeChallengeMethod: text("code_challenge_method"),
	clientId: varchar("client_id", { length: 255 })
		.notNull()
		.references(() => oauthClient.id, { onDelete: "cascade" }),
	userId: varchar("user_id", { length: 255 }).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const oauthToken = pgTable("oauth_token", {
	accessToken: varchar("access_token", { length: 255 }).primaryKey(),
	accessTokenExpiresAt: timestamp("access_token_expires_at").notNull(),
	refreshToken: varchar("refresh_token", { length: 255 }).unique(),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	authorizationDetails: jsonb("authorization_details"),
	clientId: varchar("client_id", { length: 255 })
		.notNull()
		.references(() => oauthClient.id, { onDelete: "cascade" }),
	userId: varchar("user_id", { length: 255 }).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const oauthClientRelations = relations(oauthClient, ({ many }) => ({
	authorizationCodes: many(oauthAuthorizationCode),
	tokens: many(oauthToken),
}));

export const oauthAuthorizationCodeRelations = relations(oauthAuthorizationCode, ({ one }) => ({
	client: one(oauthClient, {
		fields: [oauthAuthorizationCode.clientId],
		references: [oauthClient.id],
	}),
}));

export const oauthTokenRelations = relations(oauthToken, ({ one }) => ({
	client: one(oauthClient, {
		fields: [oauthToken.clientId],
		references: [oauthClient.id],
	}),
}));
