import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer, jwt, organization } from "better-auth/plugins";
import { db } from "./db/index.js";
import * as schema from "./db/schema.js";
import { env } from "./env.js";
import { createStripeCustomer } from "./services/billing.js";

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
	plugins: [bearer(), jwt(), organization()],
});

export type Auth = typeof auth;
