import {
	Contrast,
	Haze,
	ImageIcon,
	type LucideIcon,
	Moon,
	Snowflake,
	Sparkles,
	Sun,
} from "lucide-react";
import type { FilterKind } from "@/lib/layout/types";

/**
 * Approximate each pixel-level `FilterKind` as a CSS `filter` string for the
 * live camera preview. These are intentionally close-but-not-exact: the real,
 * authoritative filter is applied per-pixel by `composeStrip` at compose time
 * (see `lib/compose/filters.ts`). Preview only needs to feel right.
 */
export const CSS_FILTERS: Record<FilterKind, string> = {
	none: "none",
	bw: "grayscale(1)",
	warm: "sepia(0.35) saturate(1.2) hue-rotate(-10deg)",
	cool: "saturate(1.1) hue-rotate(15deg) brightness(1.02)",
	faded: "contrast(0.85) brightness(1.1) saturate(0.8)",
	vivid: "saturate(1.6) contrast(1.1)",
	noir: "grayscale(1) contrast(1.6) brightness(0.95)",
};

/** Human-readable label for each filter, for guest-facing chips. */
export const FILTER_LABELS: Record<FilterKind, string> = {
	none: "Original",
	bw: "B&W",
	warm: "Warm",
	cool: "Cool",
	faded: "Faded",
	vivid: "Vivid",
	noir: "Noir",
};

/**
 * A distinctive icon for each filter, so guests can tell them apart at a glance
 * even when the small swatches look similar (Original/Faded/Cool, etc.).
 */
export const FILTER_ICONS: Record<FilterKind, LucideIcon> = {
	none: ImageIcon,
	bw: Contrast,
	warm: Sun,
	cool: Snowflake,
	faded: Haze,
	vivid: Sparkles,
	noir: Moon,
};

/** All selectable filters in display order. */
export const ALL_FILTERS: FilterKind[] = ["none", "bw", "warm", "cool", "faded", "vivid", "noir"];

/** Map a `FilterKind` to its CSS preview `filter` string. */
export function cssFilterFor(filter: FilterKind): string {
	return CSS_FILTERS[filter];
}
