import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import type { Auth } from "../auth.js";
import { db } from "../db/index.js";
import { meters, planFeatures, plans, products } from "../db/schema.js";
import { requireAuth, type ServiceAuthVariables } from "../middleware/auth.js";

export function productRoutes(auth: Auth) {
	const app = new Hono<{ Variables: ServiceAuthVariables }>();

	// List products (public)
	app.get("/", async (c) => {
		const allProducts = await db.select().from(products);
		return c.json(allProducts);
	});

	// Get product plans (public)
	app.get("/:productId/plans", async (c) => {
		const productId = c.req.param("productId");

		const productPlans = await db
			.select()
			.from(plans)
			.where(eq(plans.productId, productId))
			.orderBy(plans.sortOrder);

		return c.json(productPlans);
	});

	// Get plan features (public)
	app.get("/:productId/plans/:planId/features", async (c) => {
		const planId = c.req.param("planId");

		const features = await db.select().from(planFeatures).where(eq(planFeatures.planId, planId));

		return c.json(features);
	});

	// ─── Admin routes (service token only) ──────────────────────────

	app.use("/admin/*", requireAuth(auth));

	// Register a product
	app.post("/admin/products", async (c) => {
		const body = await c.req.json();
		const parsed = z
			.object({
				id: z.string(),
				name: z.string(),
				slug: z.string(),
				stripeProductId: z.string().optional(),
			})
			.parse(body);

		const [product] = await db.insert(products).values(parsed).returning();
		return c.json(product, 201);
	});

	// Register a plan
	app.post("/admin/plans", async (c) => {
		const body = await c.req.json();
		const parsed = z
			.object({
				id: z.string(),
				productId: z.string(),
				name: z.string(),
				slug: z.string(),
				stripePriceId: z.string().optional(),
				isDefault: z.boolean().default(false),
				sortOrder: z.number().default(0),
			})
			.parse(body);

		const [plan] = await db.insert(plans).values(parsed).returning();
		return c.json(plan, 201);
	});

	// Register plan features
	app.post("/admin/plan-features", async (c) => {
		const body = await c.req.json();
		const parsed = z
			.array(
				z.object({
					id: z.string(),
					planId: z.string(),
					feature: z.string(),
					enabled: z.boolean().default(true),
					limitValue: z.number().nullable().default(null),
					limitWindow: z.string().nullable().default(null),
				}),
			)
			.parse(body);

		const inserted = await db.insert(planFeatures).values(parsed).returning();
		return c.json(inserted, 201);
	});

	// Register a meter
	app.post("/admin/meters", async (c) => {
		const body = await c.req.json();
		const parsed = z
			.object({
				id: z.string(),
				productId: z.string(),
				name: z.string(),
				stripeMeterId: z.string().optional(),
				stripeMeterEventName: z.string().optional(),
			})
			.parse(body);

		const [meter] = await db.insert(meters).values(parsed).returning();
		return c.json(meter, 201);
	});

	return app;
}
