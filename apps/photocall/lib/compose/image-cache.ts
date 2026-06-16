/**
 * Module-level cache for decoded images used by the compositor. Network/asset
 * URLs are cached so repeated composites (e.g. re-rendering on filter change)
 * don't re-fetch; transient `blob:` URLs are never cached because they are
 * revoked after a single use.
 */

const cache = new Map<string, HTMLImageElement>();

/** Load an image (cached, except for blob: URLs) with CORS enabled. */
export function loadImageCached(url: string): Promise<HTMLImageElement> {
	const cached = cache.get(url);
	if (cached) return Promise.resolve(cached);

	return new Promise<HTMLImageElement>((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => {
			if (!url.startsWith("blob:")) cache.set(url, img);
			resolve(img);
		};
		img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
		img.src = url;
	});
}

/** Drop all cached images. */
export function clearImageCache(): void {
	cache.clear();
}
