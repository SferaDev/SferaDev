import { eq } from "drizzle-orm";
import { Hono } from "hono";
import type { Auth } from "../auth.js";
import { db } from "../db/index.js";
import { accountSubscriptions, users } from "../db/schema.js";
import { type AuthVariables, requireSession } from "../middleware/auth.js";

export function accountRoutes(auth: Auth) {
	const app = new Hono<{ Variables: AuthVariables }>();

	app.use("*", requireSession(auth));

	// Get current account details
	app.get("/me", async (c) => {
		const user = c.get("user");

		const [account] = await db
			.select({
				id: users.id,
				name: users.name,
				email: users.email,
				emailVerified: users.emailVerified,
				image: users.image,
				stripeCustomerId: users.stripeCustomerId,
				createdAt: users.createdAt,
			})
			.from(users)
			.where(eq(users.id, user.id))
			.limit(1);

		if (!account) return c.json({ error: "Account not found" }, 404);
		return c.json(account);
	});

	// Get account by ID (for admin/service use)
	app.get("/:id", async (c) => {
		const id = c.req.param("id");

		const [account] = await db
			.select({
				id: users.id,
				name: users.name,
				email: users.email,
				emailVerified: users.emailVerified,
				image: users.image,
				createdAt: users.createdAt,
			})
			.from(users)
			.where(eq(users.id, id))
			.limit(1);

		if (!account) return c.json({ error: "Account not found" }, 404);
		return c.json(account);
	});

	// List account subscriptions
	app.get("/me/subscriptions", async (c) => {
		const user = c.get("user");

		const subs = await db
			.select()
			.from(accountSubscriptions)
			.where(eq(accountSubscriptions.accountId, user.id));

		return c.json(subs);
	});

	return app;
}
