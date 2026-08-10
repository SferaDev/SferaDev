import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { type GenericOAuthConfig, genericOAuth } from "better-auth/plugins";
import { z } from "zod";
import { db } from "./db";
import { accounts, sessions, users, verifications } from "./schema";

const VERCEL_USERINFO_URL = "https://api.vercel.com/v2/user";

/** Vercel returns the profile nested under `user`, not at the top level. */
const vercelUserInfoSchema = z.object({
	user: z.object({
		id: z.string(),
		name: z.string().nullable(),
		email: z.string(),
		avatar: z.string().nullable(),
	}),
});

/**
 * Vercel's OAuth does not advertise an OIDC discovery document, and its
 * userinfo endpoint wraps the profile in a `user` key rather than returning it
 * at the top level — so the endpoints are configured explicitly and the profile
 * is unwrapped in `getUserInfo`.
 *
 * Authorization starts at the integration install page rather than a plain
 * `/authorize`: that is how a Vercel integration is granted access, and it
 * redirects back with a `code` like any other authorization-code flow.
 */
const vercel: GenericOAuthConfig = {
	providerId: "vercel",
	clientId: process.env.AUTH_VERCEL_ID ?? "",
	clientSecret: process.env.AUTH_VERCEL_SECRET ?? "",
	authorizationUrl: `https://vercel.com/integrations/${process.env.AUTH_VERCEL_APP_NAME}/new`,
	tokenUrl: "https://api.vercel.com/v2/oauth/access_token",
	userInfoUrl: VERCEL_USERINFO_URL,
	getUserInfo: async (tokens) => {
		if (!tokens.accessToken) {
			throw new Error("Vercel token exchange returned no access token");
		}

		const response = await fetch(VERCEL_USERINFO_URL, {
			headers: { Authorization: `Bearer ${tokens.accessToken}` },
		});

		if (!response.ok) {
			throw new Error(`Vercel userinfo request failed with ${response.status}`);
		}

		const { user } = vercelUserInfoSchema.parse(await response.json());

		return {
			id: user.id,
			name: user.name ?? user.email,
			email: user.email,
			image: user.avatar ?? undefined,
			// Vercel only issues tokens for confirmed accounts, so the address is
			// already verified by the time it reaches us.
			emailVerified: true,
		};
	},
};

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: { user: users, session: sessions, account: accounts, verification: verifications },
	}),
	plugins: [genericOAuth({ config: [vercel] })],
});

export type Auth = typeof auth;
