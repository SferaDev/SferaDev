// Photocall kiosk service worker.
//
// Goals:
//  1. App shell offline: once a kiosk has been opened, its UI keeps loading
//     without a network (navigations + Next.js static assets are cached).
//  2. Slideshow images stay available offline (bounded cache).
//  3. Background-sync hook: when connectivity returns, wake clients so the
//     offline photo outbox (IndexedDB) can be drained.

const VERSION = "v2";
const SHELL_CACHE = `photocall-shell-${VERSION}`;
const STATIC_CACHE = `photocall-static-${VERSION}`;
const IMAGE_CACHE = `photocall-images-${VERSION}`;
const MAX_CACHED_IMAGES = 60;

// Minimal shell to render an offline fallback for uncached navigations.
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
	event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.add(OFFLINE_URL)));
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	const keep = new Set([SHELL_CACHE, STATIC_CACHE, IMAGE_CACHE]);
	event.waitUntil(
		caches
			.keys()
			.then((names) =>
				Promise.all(names.filter((name) => !keep.has(name)).map((n) => caches.delete(n))),
			)
			.then(() => self.clients.claim()),
	);
});

function isStaticAsset(url) {
	return url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/fonts/");
}

function isImageRequest(request, url) {
	return (
		request.destination === "image" ||
		url.pathname.includes("/api/storage/") ||
		(request.headers.get("accept") || "").includes("image/")
	);
}

async function trimCache(cache, max) {
	const keys = await cache.keys();
	for (let i = 0; i < keys.length - max; i++) {
		await cache.delete(keys[i]);
	}
}

// Cache-first for immutable static assets.
async function staticFirst(request) {
	const cache = await caches.open(STATIC_CACHE);
	const cached = await cache.match(request);
	if (cached) return cached;
	const response = await fetch(request);
	if (response.ok) cache.put(request, response.clone());
	return response;
}

// Network-first for navigations so the kiosk shows fresh content when online
// and the last-seen page (or an offline fallback) when not.
async function navigationFirst(request) {
	const cache = await caches.open(SHELL_CACHE);
	try {
		const response = await fetch(request);
		if (response.ok) cache.put(request, response.clone());
		return response;
	} catch {
		const cached = await cache.match(request);
		return cached || (await cache.match(OFFLINE_URL)) || Response.error();
	}
}

// Cache-first with bounded size for images.
async function imageCacheFirst(request) {
	const cache = await caches.open(IMAGE_CACHE);
	const cached = await cache.match(request);
	if (cached) return cached;
	try {
		const response = await fetch(request);
		if (response.ok) {
			await cache.put(request, response.clone());
			await trimCache(cache, MAX_CACHED_IMAGES);
		}
		return response;
	} catch {
		return cached || new Response("", { status: 503 });
	}
}

// In local development, hashed asset URLs are not stable while their contents
// change, so caching them cache-first would serve stale CSS/JS and break HMR.
// Skip the service worker entirely on localhost.
const IS_LOCALHOST =
	self.location.hostname === "localhost" || self.location.hostname === "127.0.0.1";

self.addEventListener("fetch", (event) => {
	if (IS_LOCALHOST) return;

	const { request } = event;
	if (request.method !== "GET") return;

	const url = new URL(request.url);
	if (url.origin !== self.location.origin && !isImageRequest(request, url)) return;

	if (request.mode === "navigate") {
		event.respondWith(navigationFirst(request));
		return;
	}
	if (isStaticAsset(url)) {
		event.respondWith(staticFirst(request));
		return;
	}
	if (isImageRequest(request, url)) {
		event.respondWith(imageCacheFirst(request));
	}
});

// When the platform supports Background Sync, the browser fires this after the
// device regains connectivity even if the kiosk tab was backgrounded. We simply
// notify any open clients so their `useOfflineSync` hook drains the outbox.
self.addEventListener("sync", (event) => {
	if (event.tag === "photocall-photo-sync") {
		event.waitUntil(
			self.clients.matchAll({ includeUncontrolled: true }).then((clients) => {
				for (const client of clients) client.postMessage({ type: "photocall-sync" });
			}),
		);
	}
});
