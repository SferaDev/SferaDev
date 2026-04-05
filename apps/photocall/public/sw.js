const CACHE_NAME = "photocall-kiosk-v1";
const MAX_CACHED_IMAGES = 50;

self.addEventListener("install", (event) => {
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((names) =>
				Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))),
			),
	);
	self.clients.claim();
});

self.addEventListener("fetch", (event) => {
	const url = new URL(event.request.url);

	// Only cache image requests from Convex storage
	const isImage =
		event.request.destination === "image" ||
		url.pathname.includes("/api/storage/") ||
		event.request.headers.get("accept")?.includes("image/");

	if (!isImage) return;

	event.respondWith(
		caches.open(CACHE_NAME).then(async (cache) => {
			const cached = await cache.match(event.request);
			if (cached) return cached;

			try {
				const response = await fetch(event.request);
				if (response.ok) {
					cache.put(event.request, response.clone());
					// Trim cache if too large
					const keys = await cache.keys();
					if (keys.length > MAX_CACHED_IMAGES) {
						for (let i = 0; i < keys.length - MAX_CACHED_IMAGES; i++) {
							await cache.delete(keys[i]);
						}
					}
				}
				return response;
			} catch {
				// Network failed, return cached if available
				return cached || new Response("", { status: 503 });
			}
		}),
	);
});
