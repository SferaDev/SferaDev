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
	/**
	 * Comma-separated list of IPP(S) printer URIs to seed into the registry at
	 * startup, e.g. `ipp://192.168.1.50:631/ipp/print`. This is the **manual
	 * fallback** for environments where mDNS discovery does not work (notably
	 * under Bun's `node:dgram` multicast — see the README). Printers added this
	 * way behave exactly like discovered ones.
	 */
	BRIDGE_PRINTER_URIS: z.string().default(""),
	/**
	 * When set to a folder path, the bridge publishes a virtual "Debug (file
	 * output)" printer that writes each job's image into that folder instead of
	 * sending it to a real printer. Lets the whole print flow be tested end to end
	 * without consuming dye-sub media. Leave unset in production.
	 */
	BRIDGE_DEBUG_PRINTER_DIR: z.string().optional(),
	/**
	 * Base URL of the photocall server's bridge-facing API (e.g.
	 * `https://photocall.example.com`). When set together with
	 * {@link BRIDGE_PAIRING_TOKEN}, the bridge additionally runs in **cloud-pull**
	 * mode: it polls the cloud for print jobs, prints them through the same local
	 * queue, and reports status back with heartbeats. Leave unset to run LAN-only
	 * (the existing `/api/*` REST API is always available regardless).
	 */
	BRIDGE_CLOUD_URL: z.string().url().optional(),
	/**
	 * Per-event pairing token sent as `Authorization: Bearer <token>` on every
	 * cloud-pull request. Required (alongside {@link BRIDGE_CLOUD_URL}) to enable
	 * cloud-pull mode.
	 */
	BRIDGE_PAIRING_TOKEN: z.string().optional(),
	/** How often (ms) to poll the cloud for new print jobs in cloud-pull mode. */
	BRIDGE_POLL_INTERVAL_MS: z.coerce.number().int().positive().default(3_000),
	/**
	 * How often (ms) to report tracked-job status / printer inventory to the
	 * cloud. The `printing` status reports double as the claim heartbeat: the
	 * server re-queues a job to another bridge if it hears no heartbeat for >5
	 * minutes, so keep this comfortably below that window (default 30s).
	 */
	BRIDGE_HEARTBEAT_INTERVAL_MS: z.coerce.number().int().positive().default(30_000),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);
