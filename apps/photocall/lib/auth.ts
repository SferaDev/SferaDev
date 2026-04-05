import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { headers } from "next/headers";
import { db } from "./db";

export const auth = betterAuth({
	baseURL: process.env.SITE_URL ?? "http://localhost:3000",
	database: drizzleAdapter(db, { provider: "pg" }),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
	},
	socialProviders: {
		github: {
			clientId: process.env.GITHUB_CLIENT_ID ?? "",
			clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
		},
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID ?? "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
		},
	},
});

export type Session = typeof auth.$Infer.Session;

/** Get the current authenticated user from the request headers. Returns null if not authenticated. */
export async function getSession() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	return session;
}

/** Require authentication - throws if not authenticated */
export async function requireSession() {
	const session = await getSession();
	if (!session) {
		throw new Error("Unauthorized");
	}
	return session;
}
