import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db, schema } from "@/lib/db";
import { INCLUDED_PHOTOS_PER_EVENT, PLAN_LIMITS } from "@/lib/plans";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function isEventProcessed(stripeEventId: string): Promise<boolean> {
	const [existing] = await db
		.select()
		.from(schema.stripeEvents)
		.where(eq(schema.stripeEvents.stripeEventId, stripeEventId));
	return !!existing;
}

async function recordStripeEvent(stripeEventId: string, type: string) {
	await db.insert(schema.stripeEvents).values({
		stripeEventId,
		type,
		processedAt: new Date(),
	});
}

async function findOrgByStripeCustomer(stripeCustomerId: string) {
	const [org] = await db
		.select()
		.from(schema.organizations)
		.where(eq(schema.organizations.stripeCustomerId, stripeCustomerId));
	return org ?? null;
}

async function handlePaymentSuccess(
	stripeEventId: string,
	stripeCustomerId: string,
	type: string,
	_organizationId: string,
	_eventId?: string,
) {
	if (await isEventProcessed(stripeEventId)) return;
	await recordStripeEvent(stripeEventId, type);

	const org = await findOrgByStripeCustomer(stripeCustomerId);
	if (!org) {
		console.error("Organization not found for Stripe customer:", stripeCustomerId);
		return;
	}

	if (type === "event_purchase") {
		const paidLimits = PLAN_LIMITS.paid;
		await db
			.update(schema.organizations)
			.set({
				subscriptionTier: "paid",
				subscriptionStatus: "active",
				maxEvents: org.maxEvents + 1,
				maxPhotosPerEvent: paidLimits.maxPhotosPerEvent,
				maxStorageBytes: paidLimits.maxStorageBytes,
				maxTeamMembers: paidLimits.maxTeamMembers,
				updatedAt: new Date(),
			})
			.where(eq(schema.organizations.id, org.id));
	}
	// Overage payments don't change org state - they just settle the balance
}

async function handleSubscriptionUpdated(
	stripeEventId: string,
	stripeCustomerId: string,
	status: string,
	subscriptionId: string,
) {
	if (await isEventProcessed(stripeEventId)) return;
	await recordStripeEvent(stripeEventId, "subscription_updated");

	const org = await findOrgByStripeCustomer(stripeCustomerId);
	if (!org) {
		console.error("Organization not found for Stripe customer:", stripeCustomerId);
		return;
	}

	const statusMap: Record<string, "active" | "past_due" | "canceled" | "trialing"> = {
		active: "active",
		past_due: "past_due",
		canceled: "canceled",
		unpaid: "canceled",
		trialing: "trialing",
	};

	const subscriptionStatus = statusMap[status];
	if (!subscriptionStatus) {
		console.error("Unknown subscription status:", status);
		return;
	}

	await db
		.update(schema.organizations)
		.set({
			subscriptionStatus,
			stripeSubscriptionId: subscriptionId,
			updatedAt: new Date(),
		})
		.where(eq(schema.organizations.id, org.id));
}

async function handleInvoicePaymentFailed(
	stripeEventId: string,
	stripeCustomerId: string,
	attemptCount: number,
) {
	if (await isEventProcessed(stripeEventId)) return;
	await recordStripeEvent(stripeEventId, "invoice_payment_failed");

	const org = await findOrgByStripeCustomer(stripeCustomerId);
	if (!org) {
		console.error("Organization not found for Stripe customer:", stripeCustomerId);
		return;
	}

	console.error("Invoice payment failed for org:", org.id, "attempt:", attemptCount);

	if (attemptCount >= 3) {
		await db
			.update(schema.organizations)
			.set({
				subscriptionStatus: "past_due",
				updatedAt: new Date(),
			})
			.where(eq(schema.organizations.id, org.id));
	}
}

export async function POST(request: Request) {
	const signature = request.headers.get("stripe-signature");
	const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

	if (!signature || !webhookSecret) {
		return NextResponse.json({ error: "Webhook signature or secret missing" }, { status: 400 });
	}

	const body = await request.text();

	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
	} catch (err) {
		console.error("Webhook signature verification failed:", err);
		return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
	}

	switch (event.type) {
		case "checkout.session.completed": {
			const session = event.data.object as Stripe.Checkout.Session;

			if (session.payment_status === "paid" && session.metadata) {
				const { organizationId, type, eventId } = session.metadata;

				if (type === "event_purchase" || type === "overage_payment") {
					await handlePaymentSuccess(
						event.id,
						session.customer as string,
						type,
						organizationId,
						eventId || undefined,
					);
				}
			}
			break;
		}

		case "payment_intent.payment_failed": {
			const paymentIntent = event.data.object as Stripe.PaymentIntent;
			console.error("Payment failed:", paymentIntent.id, paymentIntent.last_payment_error?.message);
			break;
		}

		case "customer.subscription.updated": {
			const subscription = event.data.object as Stripe.Subscription;
			await handleSubscriptionUpdated(
				event.id,
				subscription.customer as string,
				subscription.status,
				subscription.id,
			);
			break;
		}

		case "customer.subscription.deleted": {
			const subscription = event.data.object as Stripe.Subscription;
			await handleSubscriptionUpdated(
				event.id,
				subscription.customer as string,
				"canceled",
				subscription.id,
			);
			break;
		}

		case "invoice.payment_failed": {
			const invoice = event.data.object as Stripe.Invoice;
			await handleInvoicePaymentFailed(
				event.id,
				invoice.customer as string,
				invoice.attempt_count ?? 1,
			);
			break;
		}
	}

	return NextResponse.json({ received: true });
}
