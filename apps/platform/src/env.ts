import { z } from "zod";

const envSchema = z.object({
	DATABASE_URL: z.string().url(),
	BETTER_AUTH_SECRET: z.string().min(32),
	BETTER_AUTH_URL: z.string().url(),
	GOOGLE_CLIENT_ID: z.string().optional(),
	GOOGLE_CLIENT_SECRET: z.string().optional(),
	GITHUB_CLIENT_ID: z.string().optional(),
	GITHUB_CLIENT_SECRET: z.string().optional(),
	STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
	STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
	PLATFORM_SERVICE_TOKEN: z.string().min(1),
	PORT: z.coerce.number().default(3100),
	// Comma-separated list of product origins allowed to use the auth endpoints
	// (better-auth CSRF/origin allowlist). Products proxy `/api/auth/*` here, so
	// their browser origin must be trusted.
	TRUSTED_ORIGINS: z.string().optional(),
});

export const env = envSchema.parse(process.env);
