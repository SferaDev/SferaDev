import type { LayoutTokens } from "@/lib/compose/tokens";

/** Editor preview token values. Reuses the compositor's LayoutTokens shape. */
export type PreviewTokens = LayoutTokens;

/** Sample token values used to render realistic copy in the editor/preview. */
export const SAMPLE_TOKENS: PreviewTokens = {
	coupleNames: "Alex & Sam",
	date: "June 16, 2026",
	eventName: "Our Celebration",
};
