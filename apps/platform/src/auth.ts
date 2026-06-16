import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer, jwt, organization } from "better-auth/plugins";
import { db } from "./db/index.js";
import * as schema from "./db/schema.js";
import { env } from "./env.js";
import { createOrganizationStripeCustomer, createStripeCustomer } from "./services/billing.js";

const socialProviders: Record<string, { clientId: string; clientSecret: string }> = {};

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
	socialProviders.google = {
		clientId: env.GOOGLE_CLIENT_ID,
		clientSecret: env.GOOGLE_CLIENT_SECRET,
	};
}

if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
	socialProviders.github = {
		clientId: env.GITHUB_CLIENT_ID,
		clientSecret: env.GITHUB_CLIENT_SECRET,
	};
}

export const auth = betterAuth({
	baseURL: env.BETTER_AUTH_URL,
	// The Hono app mounts this handler at `/auth/*` (see index.ts) and products
	// proxy `/api/auth/*` to it, so better-auth must use `/auth` as its base
	// path rather than its default of `/api/auth`.
	basePath: "/auth",
	// Products call auth through a first-party `/api/auth/*` proxy, so requests
	// arrive with the product's browser origin. Allow those configured origins
	// in addition to the platform's own.
	trustedOrigins: env.TRUSTED_ORIGINS
		? env.TRUSTED_ORIGINS.split(",").map((origin) => origin.trim())
		: [],
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			user: schema.users,
			session: schema.sessions,
			account: schema.accounts,
			verification: schema.verifications,
			organization: schema.organizations,
			member: schema.members,
			invitation: schema.invitations,
			jwks: schema.jwks,
		},
	}),
	emailAndPassword: { enabled: true },
	socialProviders,
	user: {
		additionalFields: {
			stripeCustomerId: {
				type: "string",
				required: false,
				input: false,
			},
		},
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // refresh daily
	},
	databaseHooks: {
		user: {
			create: {
				after: async (user) => {
					// Create a Stripe customer on signup and link it
					await createStripeCustomer(user.id, user.email, user.name);
				},
			},
		},
	},
	plugins: [
		bearer(),
		jwt(),
		organization({
			organizationHooks: {
				afterCreateOrganization: async ({ organization }) => {
					// Create a Stripe customer for the organization so it can act
					// as a billing account for product subscriptions.
					await createOrganizationStripeCustomer(organization.id, organization.name);
				},
			},
		}),
	],
});

export type Auth = typeof auth;
