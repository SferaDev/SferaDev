import { createPlatformClient, type PlatformClient } from "@sferadev/platform-sdk";

let _client: PlatformClient | null = null;

/**
 * Returns the singleton platform SDK client used to talk to
 * `@sferadev/platform` for auth, billing, and entitlements.
 *
 * Photocall delegates **all** identity, billing, and quota concerns to the
 * platform — this client is the single entrypoint. The three env vars below
 * are required at runtime; missing them is a configuration error and we
 * fail fast rather than silently falling back to local behaviour.
 */
export function getPlatformClient(): PlatformClient {
	if (_client) return _client;

	const serviceUrl = process.env.PLATFORM_SERVICE_URL;
	const productId = process.env.PLATFORM_PRODUCT_ID;
	const serviceToken = process.env.PLATFORM_SERVICE_TOKEN;

	if (!serviceUrl || !productId || !serviceToken) {
		throw new Error(
			"Platform client not configured. Set PLATFORM_SERVICE_URL, PLATFORM_PRODUCT_ID, and PLATFORM_SERVICE_TOKEN.",
		);
	}

	_client = createPlatformClient({ serviceUrl, productId, serviceToken });
	return _client;
}

/**
 * Returns the public-facing URL of the platform service. Used by client-side
 * code that needs to hit the platform directly (rare — most calls go through
 * the local `/api/auth/*` proxy or through server actions that use the SDK).
 */
export function getPlatformServiceUrl(): string {
	const url = process.env.PLATFORM_SERVICE_URL;
	if (!url) throw new Error("PLATFORM_SERVICE_URL is not set");
	return url;
}
