import { type BoothLayout, LAYOUT_SCHEMA_VERSION } from "./types";

/**
 * Parse a stored layout JSON string into a `BoothLayout`. Returns null for
 * null/empty input, invalid JSON, or a mismatched schema version.
 */
export function parseLayoutJson(json: string | null): BoothLayout | null {
	if (!json) return null;
	try {
		const parsed = JSON.parse(json) as BoothLayout;
		if (parsed.version !== LAYOUT_SCHEMA_VERSION) return null;
		return parsed;
	} catch {
		return null;
	}
}

/** Serialize a `BoothLayout` to its stored JSON representation. */
export function serializeLayout(layout: BoothLayout): string {
	return JSON.stringify(layout);
}
