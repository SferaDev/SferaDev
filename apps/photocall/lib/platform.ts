import { createPlatformClient, type PlatformClient } from "@sferadev/platform-sdk";

let _client: PlatformClient | null = null;

/**
 * Returns a singleton platform SDK client. Fails open when the platform service
 * is unreachable so a missing/down platform never blocks the kiosk flow.
 *
 * Returns null when env vars are not configured (e.g. local dev without the
 * platform service running). Callers should treat null as "no platform" and
 * fall back to local checks.
 */
export function getPlatformClient(): PlatformClient | null {
	if (_client) return _client;

	const serviceUrl = process.env.PLATFORM_SERVICE_URL;
	const productId = process.env.PLATFORM_PRODUCT_ID;
	const serviceToken = process.env.PLATFORM_SERVICE_TOKEN;

	if (!serviceUrl || !productId || !serviceToken) return null;

	_client = createPlatformClient({
		serviceUrl,
		productId,
		serviceToken,
		failOpen: true,
	});

	return _client;
}
