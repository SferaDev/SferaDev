"use client";

import { useEffect } from "react";
import { BUNDLED_FONTS, loadFont } from "@/lib/compose/fonts";

/**
 * Loads the event's chosen kiosk display font (when set and bundled) and returns
 * a CSS `font-family` value to apply to kiosk headings. Returns `undefined` when
 * no override is set or the family is not bundled, so callers fall back to the
 * default system font.
 *
 * Loading is best-effort and SSR-safe: {@link loadFont} no-ops on the server and
 * silently ignores a missing asset, so the heading simply renders in the system
 * font until (or unless) the woff2 loads.
 */
export function useKioskFont(fontFamily: string | null | undefined): string | undefined {
	const url = fontFamily ? BUNDLED_FONTS[fontFamily] : undefined;

	useEffect(() => {
		if (!fontFamily || !url) return;
		void loadFont(fontFamily, url);
	}, [fontFamily, url]);

	return url ? `"${fontFamily}", serif` : undefined;
}
