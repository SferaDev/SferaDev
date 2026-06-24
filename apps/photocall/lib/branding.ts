/**
 * Shared branding tokens for the kiosk and dashboard.
 *
 * `DEFAULT_BRAND_COLOR` is the fallback used whenever an event hasn't set its
 * own `primaryColor`. Keeping it in one place avoids the hard-coded hex drifting
 * across the ~9 screens that render branded CTAs.
 */
export const DEFAULT_BRAND_COLOR = "#e11d48";

/**
 * Tactile feedback for branded CTAs. Buttons that set their colour via an inline
 * `style={{ backgroundColor }}` lose the `Button` component's `hover:bg-*`
 * affordance (the inline background wins), so they apply this class to restore a
 * subtle hover/press response that works on top of any brand colour.
 */
export const BRANDED_CTA_FEEDBACK =
	"transition-transform hover:brightness-110 active:brightness-95 active:scale-[0.97]";

/**
 * Shared sizing for the primary TEXT call-to-action across the kiosk flow. Pair
 * with `size="xl"` on the `Button` so every screen's primary action is the same
 * height, radius and type scale.
 */
export const PRIMARY_CTA_CLASS = "rounded-full px-10 text-lg";
