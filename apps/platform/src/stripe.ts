import Stripe from "stripe";
import { env } from "./env.js";

/**
 * Whether a real Stripe key is configured. Placeholder keys (used in local dev
 * and CI where no Stripe account is available) disable billing side effects so
 * the rest of the platform — auth, organizations, entitlements — works without
 * a Stripe account. Billing endpoints degrade gracefully when this is false.
 */
export const stripeEnabled = !env.STRIPE_SECRET_KEY.includes("placeholder");

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
	typescript: true,
});
