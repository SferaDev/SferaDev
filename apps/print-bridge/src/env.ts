import { z } from "zod";

/**
 * Environment configuration for the print bridge.
 *
 * The bridge is meant to run on a small always-on machine on the same LAN as
 * the printer (a Raspberry Pi is strongly preferred — see README). Every value
 * has a sensible default so it can also be started with no configuration at
 * all for quick testing.
 */
const envSchema = z.object({
	/** HTTP port the REST API + QR pairing endpoint listen on. */
	PORT: z.coerce.number().default(3200),
	/**
	 * Comma-separated list of browser origins allowed to call the API, or `*`
	 * to reflect any origin. The photocall kiosk runs on the guests' tablets,
	 * so the default is permissive; lock it down in trusted deployments.
	 */
	BRIDGE_ALLOWED_ORIGINS: z.string().default("*"),
	/** Use `ipps://` (TLS) instead of `ipp://` when building printer URIs. */
	BRIDGE_USE_TLS: z
		.string()
		.default("false")
		.transform((value) => value === "true" || value === "1"),
	/** IPP protocol version to negotiate first (falls back to 1.1 on failure). */
	BRIDGE_IPP_VERSION: z.enum(["1.0", "1.1", "2.0", "2.1", "2.2"]).default("2.0"),
	/**
	 * Optional shared secret. When set, every `/api/*` request must send it as
	 * `Authorization: Bearer <key>` or an `x-api-key` header.
	 */
	BRIDGE_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);
