import { createMiddleware } from "hono/factory";
import type { Auth } from "../auth.js";
import { env } from "../env.js";

type SessionUser = Auth["$Infer"]["Session"]["user"];
type Session = Auth["$Infer"]["Session"]["session"];

export interface AuthVariables {
	user: SessionUser;
	session: Session;
}

/**
 * Middleware that requires a valid user session (cookie or bearer token).
 * Sets `c.get("user")` and `c.get("session")`.
 */
export function requireSession(auth: Auth) {
	return createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
		const session = await auth.api.getSession({ headers: c.req.raw.headers });

		if (!session) {
			return c.json({ error: "Unauthorized" }, 401);
		}

		c.set("user", session.user);
		c.set("session", session.session);
		return next();
	});
}

/**
 * Middleware that accepts either a user session or a service token.
 * Service tokens are used by product backends for server-to-server calls.
 * Sets `c.get("user")` if session auth, or allows through with service token.
 */
export interface ServiceAuthVariables {
	user: SessionUser | null;
	session: Session | null;
	isServiceCall: boolean;
	/** The accountId from query/body when using service token auth */
	serviceAccountId: string | null;
}

export function requireAuth(auth: Auth) {
	return createMiddleware<{ Variables: ServiceAuthVariables }>(async (c, next) => {
		// Check for service token first
		const authHeader = c.req.header("Authorization");
		if (authHeader === `Bearer ${env.PLATFORM_SERVICE_TOKEN}`) {
			c.set("user", null);
			c.set("session", null);
			c.set("isServiceCall", true);
			c.set("serviceAccountId", null);
			return next();
		}

		// Fall back to user session
		const session = await auth.api.getSession({ headers: c.req.raw.headers });
		if (!session) {
			return c.json({ error: "Unauthorized" }, 401);
		}

		c.set("user", session.user);
		c.set("session", session.session);
		c.set("isServiceCall", false);
		c.set("serviceAccountId", null);
		return next();
	});
}

/**
 * Resolves the accountId from either the user session or the request body/query
 * (for service token calls).
 */
export function resolveAccountId(c: {
	get: (key: string) => unknown;
	req: { query: (key: string) => string | undefined };
}): string | null {
	const isServiceCall = c.get("isServiceCall") as boolean;
	if (isServiceCall) {
		return c.req.query("accountId") ?? (c.get("serviceAccountId") as string | null);
	}
	const user = c.get("user") as SessionUser | null;
	return user?.id ?? null;
}
