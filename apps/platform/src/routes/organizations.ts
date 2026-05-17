import { eq } from "drizzle-orm";
import { Hono } from "hono";
import type { Auth } from "../auth.js";
import { db } from "../db/index.js";
import { organizations } from "../db/schema.js";
import { requireAuth, type ServiceAuthVariables } from "../middleware/auth.js";

/**
 * Service-token-authenticated organization lookups. Used by product services
 * that need to resolve an organization by id or slug without acting as a
 * specific user (e.g. anonymous kiosk pages serving public event data).
 *
 * Product-facing CRUD lives in the better-auth organization plugin at
 * `/auth/organization/*` and requires a real user session.
 */
export function organizationRoutes(auth: Auth) {
	const app = new Hono<{ Variables: ServiceAuthVariables }>();

	app.use("*", requireAuth(auth));

	app.get("/:idOrSlug", async (c) => {
		const idOrSlug = c.req.param("idOrSlug");

		const [org] = await db
			.select({
				id: organizations.id,
				name: organizations.name,
				slug: organizations.slug,
				logo: organizations.logo,
				metadata: organizations.metadata,
				stripeCustomerId: organizations.stripeCustomerId,
				createdAt: organizations.createdAt,
			})
			.from(organizations)
			.where(eq(organizations.id, idOrSlug))
			.limit(1);

		if (org) return c.json(org);

		const [bySlug] = await db
			.select({
				id: organizations.id,
				name: organizations.name,
				slug: organizations.slug,
				logo: organizations.logo,
				metadata: organizations.metadata,
				stripeCustomerId: organizations.stripeCustomerId,
				createdAt: organizations.createdAt,
			})
			.from(organizations)
			.where(eq(organizations.slug, idOrSlug))
			.limit(1);

		if (!bySlug) return c.json(null, 404);
		return c.json(bySlug);
	});

	return app;
}
