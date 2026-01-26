#!/usr/bin/env npx tsx
/**
 * Stripe Infrastructure as Code Setup Script
 *
 * This script sets up all necessary Stripe products, prices, and configurations
 * for the Photocall application.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_xxx npx tsx scripts/setup-stripe.ts
 *
 * Or with .env file:
 *   npx tsx scripts/setup-stripe.ts
 */

import Stripe from "stripe";

// Configuration
const CONFIG = {
	// Event Credit Product
	eventCredit: {
		name: "Event Credit",
		description:
			"Single event credit for photo booth. Includes 200 photos, additional photos $0.25 each.",
		price: 4900, // $49.00 in cents
		currency: "usd",
	},
	// Photo Overage Product
	photoOverage: {
		name: "Photo Overage",
		description: "Additional photos beyond the 200 included per event.",
		price: 25, // $0.25 in cents
		currency: "usd",
	},
	// Webhook endpoints
	webhooks: {
		events: [
			"checkout.session.completed",
			"payment_intent.succeeded",
			"payment_intent.payment_failed",
		],
	},
	// Customer Portal Configuration
	portal: {
		features: {
			payment_method_update: { enabled: true },
			invoice_history: { enabled: true },
		},
		business_profile: {
			headline: "Photocall - Manage your billing",
		},
	},
};

interface SetupResult {
	eventCreditProduct: Stripe.Product;
	eventCreditPrice: Stripe.Price;
	photoOverageProduct: Stripe.Product;
	photoOveragePrice: Stripe.Price;
	portalConfiguration: Stripe.BillingPortal.Configuration;
}

async function setupStripe(): Promise<SetupResult> {
	const apiKey = process.env.STRIPE_SECRET_KEY;

	if (!apiKey) {
		console.error("Error: STRIPE_SECRET_KEY environment variable is required");
		console.error("");
		console.error("Usage:");
		console.error("  STRIPE_SECRET_KEY=sk_test_xxx npx tsx scripts/setup-stripe.ts");
		console.error("");
		console.error("Or create a .env file with STRIPE_SECRET_KEY=sk_test_xxx");
		process.exit(1);
	}

	const stripe = new Stripe(apiKey);

	console.log("🚀 Setting up Stripe infrastructure...\n");

	// Check if we're in test mode
	const isTestMode = apiKey.startsWith("sk_test_");
	console.log(`Mode: ${isTestMode ? "TEST" : "LIVE"}\n`);

	// 1. Create or update Event Credit Product
	console.log("📦 Creating Event Credit product...");
	const eventCreditProduct = await findOrCreateProduct(stripe, {
		name: CONFIG.eventCredit.name,
		description: CONFIG.eventCredit.description,
		metadata: { type: "event_credit" },
	});
	console.log(`   Product ID: ${eventCreditProduct.id}`);

	// 2. Create Event Credit Price
	console.log("💰 Creating Event Credit price...");
	const eventCreditPrice = await findOrCreatePrice(stripe, {
		product: eventCreditProduct.id,
		unit_amount: CONFIG.eventCredit.price,
		currency: CONFIG.eventCredit.currency,
		metadata: { type: "event_credit" },
	});
	console.log(`   Price ID: ${eventCreditPrice.id}`);

	// 3. Create or update Photo Overage Product
	console.log("📦 Creating Photo Overage product...");
	const photoOverageProduct = await findOrCreateProduct(stripe, {
		name: CONFIG.photoOverage.name,
		description: CONFIG.photoOverage.description,
		metadata: { type: "photo_overage" },
	});
	console.log(`   Product ID: ${photoOverageProduct.id}`);

	// 4. Create Photo Overage Price
	console.log("💰 Creating Photo Overage price...");
	const photoOveragePrice = await findOrCreatePrice(stripe, {
		product: photoOverageProduct.id,
		unit_amount: CONFIG.photoOverage.price,
		currency: CONFIG.photoOverage.currency,
		metadata: { type: "photo_overage" },
	});
	console.log(`   Price ID: ${photoOveragePrice.id}`);

	// 5. Set up Customer Portal Configuration
	console.log("🔧 Configuring Customer Portal...");
	const portalConfiguration = await setupPortalConfiguration(stripe);
	console.log(`   Portal Config ID: ${portalConfiguration.id}`);

	console.log("\n✅ Stripe setup complete!\n");

	// Output environment variables
	console.log("Add these environment variables to your .env file:");
	console.log("─".repeat(50));
	console.log(`STRIPE_EVENT_CREDIT_PRICE_ID=${eventCreditPrice.id}`);
	console.log(`STRIPE_PHOTO_OVERAGE_PRICE_ID=${photoOveragePrice.id}`);
	console.log(`STRIPE_PORTAL_CONFIG_ID=${portalConfiguration.id}`);
	console.log("─".repeat(50));

	// Webhook setup instructions
	console.log("\n📝 Webhook Setup Instructions:");
	console.log("─".repeat(50));
	console.log("1. Go to https://dashboard.stripe.com/webhooks");
	console.log("2. Click 'Add endpoint'");
	console.log("3. Set endpoint URL to: {YOUR_APP_URL}/api/webhooks/stripe");
	console.log("4. Select these events:");
	for (const event of CONFIG.webhooks.events) {
		console.log(`   - ${event}`);
	}
	console.log("5. Copy the signing secret and add to .env:");
	console.log("   STRIPE_WEBHOOK_SECRET=whsec_xxx");
	console.log("─".repeat(50));

	return {
		eventCreditProduct,
		eventCreditPrice,
		photoOverageProduct,
		photoOveragePrice,
		portalConfiguration,
	};
}

async function findOrCreateProduct(
	stripe: Stripe,
	params: {
		name: string;
		description: string;
		metadata: Record<string, string>;
	},
): Promise<Stripe.Product> {
	// Search for existing product by metadata
	const existingProducts = await stripe.products.search({
		query: `metadata["type"]:"${params.metadata.type}" AND active:"true"`,
	});

	if (existingProducts.data.length > 0) {
		const product = existingProducts.data[0];
		// Update product if needed
		return await stripe.products.update(product.id, {
			name: params.name,
			description: params.description,
		});
	}

	// Create new product
	return await stripe.products.create({
		name: params.name,
		description: params.description,
		metadata: params.metadata,
	});
}

async function findOrCreatePrice(
	stripe: Stripe,
	params: {
		product: string;
		unit_amount: number;
		currency: string;
		metadata: Record<string, string>;
	},
): Promise<Stripe.Price> {
	// Search for existing active price with same amount
	const existingPrices = await stripe.prices.list({
		product: params.product,
		active: true,
	});

	const matchingPrice = existingPrices.data.find(
		(p) => p.unit_amount === params.unit_amount && p.currency === params.currency,
	);

	if (matchingPrice) {
		return matchingPrice;
	}

	// Create new price
	return await stripe.prices.create({
		product: params.product,
		unit_amount: params.unit_amount,
		currency: params.currency,
		metadata: params.metadata,
	});
}

async function setupPortalConfiguration(
	stripe: Stripe,
): Promise<Stripe.BillingPortal.Configuration> {
	// List existing configurations
	const existingConfigs = await stripe.billingPortal.configurations.list({
		limit: 1,
	});

	const configParams: Stripe.BillingPortal.ConfigurationCreateParams = {
		features: {
			payment_method_update: { enabled: true },
			invoice_history: { enabled: true },
			customer_update: {
				enabled: true,
				allowed_updates: ["email", "name"],
			},
		},
		business_profile: {
			headline: "Photocall - Manage your billing",
			privacy_policy_url: "https://photocall.app/privacy",
			terms_of_service_url: "https://photocall.app/terms",
		},
	};

	if (existingConfigs.data.length > 0) {
		// Update existing configuration
		return await stripe.billingPortal.configurations.update(
			existingConfigs.data[0].id,
			configParams,
		);
	}

	// Create new configuration
	return await stripe.billingPortal.configurations.create(configParams);
}

// Run the setup
setupStripe().catch((error) => {
	console.error("Setup failed:", error);
	process.exit(1);
});
