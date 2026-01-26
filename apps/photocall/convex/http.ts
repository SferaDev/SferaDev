import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";

const http = httpRouter();

// Auth routes
auth.addHttpRoutes(http);

// Stripe webhook handler
http.route({
	path: "/stripe/webhook",
	method: "POST",
	handler: httpAction(async (ctx, request) => {
		const signature = request.headers.get("stripe-signature");
		const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

		if (!signature || !webhookSecret) {
			return new Response("Webhook signature or secret missing", {
				status: 400,
			});
		}

		const body = await request.text();

		// Verify webhook signature
		const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
		if (!stripeSecretKey) {
			return new Response("Stripe secret key not configured", { status: 500 });
		}

		const Stripe = (await import("stripe")).default;
		const stripe = new Stripe(stripeSecretKey);

		let event: import("stripe").Stripe.Event;
		try {
			event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
		} catch (err) {
			console.error("Webhook signature verification failed:", err);
			return new Response("Webhook signature verification failed", {
				status: 400,
			});
		}

		// Handle the event
		switch (event.type) {
			case "checkout.session.completed": {
				const session = event.data.object as import("stripe").Stripe.Checkout.Session;

				if (session.payment_status === "paid" && session.metadata) {
					const { organizationId, type, eventId } = session.metadata;

					if (type === "event_purchase" || type === "overage_payment") {
						await ctx.runMutation(internal.stripe.handlePaymentSuccess, {
							stripeEventId: event.id,
							stripeCustomerId: session.customer as string,
							type,
							organizationId,
							eventId: eventId || undefined,
						});
					}
				}
				break;
			}

			case "payment_intent.payment_failed": {
				const paymentIntent = event.data.object as import("stripe").Stripe.PaymentIntent;
				console.error(
					"Payment failed:",
					paymentIntent.id,
					paymentIntent.last_payment_error?.message,
				);
				break;
			}
		}

		return new Response(JSON.stringify({ received: true }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	}),
});

export default http;
