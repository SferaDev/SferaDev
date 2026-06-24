import { normalizeCaptureIndices } from "./captures";
import { type BoothLayout, LAYOUT_SCHEMA_VERSION } from "./types";

/**
 * Parse a stored layout JSON string into a `BoothLayout`. Returns null for
 * null/empty input, invalid JSON, or a mismatched schema version. Also heals
 * any out-of-range per-slot `captureIndex` so a layout saved with a dangling
 * reuse never renders a blank slot at the kiosk.
 */
export function parseLayoutJson(json: string | null): BoothLayout | null {
	if (!json) return null;
	try {
		const parsed = JSON.parse(json) as BoothLayout;
		if (parsed.version !== LAYOUT_SCHEMA_VERSION) return null;
		return normalizeCaptureIndices(parsed);
	} catch {
		return null;
	}
}

/** Serialize a `BoothLayout` to its stored JSON representation. */
export function serializeLayout(layout: BoothLayout): string {
	return JSON.stringify(layout);
}
