/**
 * Module-level cache for decoded images used by the compositor. Network/asset
 * URLs are cached so repeated composites (e.g. re-rendering on filter change)
 * don't re-fetch; transient `blob:` URLs are never cached because they are
 * revoked after a single use.
 *
 * The cache stores the in-flight Promise (not just the resolved image) so that
 * concurrent callers for the same URL — e.g. a template-editor preview
 * re-render firing while a compose is already loading the same background or
 * graphic asset — share a single network request instead of each issuing one.
 */

const cache = new Map<string, Promise<HTMLImageElement>>();

function loadImage(url: string): Promise<HTMLImageElement> {
	return new Promise<HTMLImageElement>((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
		img.src = url;
	});
}

/** Load an image (cached, except for blob: URLs) with CORS enabled. */
export function loadImageCached(url: string): Promise<HTMLImageElement> {
	// blob: URLs are single-use and revoked after one composite — never cache.
	if (url.startsWith("blob:")) return loadImage(url);

	const cached = cache.get(url);
	if (cached) return cached;

	const promise = loadImage(url).catch((error) => {
		// Don't cache failures: drop the entry so a later attempt can retry.
		cache.delete(url);
		throw error;
	});
	cache.set(url, promise);
	return promise;
}

/** Drop all cached images. */
export function clearImageCache(): void {
	cache.clear();
}
