import type { BoothLayout } from "@/lib/layout/types";

/**
 * Font families bundled with the app, mapped to their woff2 asset paths. This
 * map is the single source of truth for which families the compositor knows how
 * to load.
 */
export const BUNDLED_FONTS: Record<string, string> = {
	"Dancing Script": "/fonts/dancing-script.woff2",
	"Great Vibes": "/fonts/great-vibes.woff2",
	"Playfair Display": "/fonts/playfair-display.woff2",
	"Noto Serif": "/fonts/noto-serif.woff2",
};

/** Families that have already been registered with the document. */
const loaded = new Set<string>();

/**
 * Register a font with the document (idempotent per family). Loading is
 * best-effort: a missing or failed font must never break compositing — the
 * canvas simply falls back to the next family in the text font stack (serif).
 */
export async function loadFont(family: string, url: string): Promise<void> {
	if (loaded.has(family)) return;
	if (typeof document === "undefined" || typeof FontFace === "undefined") return;

	try {
		const fontFace = new FontFace(family, `url(${url})`);
		await fontFace.load();
		document.fonts.add(fontFace);
		loaded.add(family);
	} catch {
		// Font asset unavailable — leave it unregistered; the compositor's font
		// stack falls back to a system serif so text still renders.
	}
}

/** Load every bundled font family referenced by a layout's text layers. */
export async function loadLayoutFonts(layout: BoothLayout): Promise<void> {
	const families = new Set(layout.textLayers.map((layer) => layer.fontFamily));

	await Promise.all(
		Array.from(families).map((family) => {
			const url = BUNDLED_FONTS[family];
			return url ? loadFont(family, url) : Promise.resolve();
		}),
	);
}
