import type { BoothLayout } from "@/lib/layout/types";

/**
 * Font families bundled with the app, mapped to their woff2 asset paths. The
 * real font files are added in a later PR; this map is the single source of
 * truth for which families the compositor knows how to load.
 */
export const BUNDLED_FONTS: Record<string, string> = {
	"Dancing Script": "/fonts/dancing-script.woff2",
	"Great Vibes": "/fonts/great-vibes.woff2",
	"Playfair Display": "/fonts/playfair-display.woff2",
	"Noto Serif": "/fonts/noto-serif.woff2",
};

/** Families that have already been registered with the document. */
const loaded = new Set<string>();

/** Register a font with the document (idempotent per family). */
export async function loadFont(family: string, url: string): Promise<void> {
	if (loaded.has(family)) return;
	if (typeof document === "undefined" || typeof FontFace === "undefined") return;

	const fontFace = new FontFace(family, `url(${url})`);
	await fontFace.load();
	document.fonts.add(fontFace);
	loaded.add(family);
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
