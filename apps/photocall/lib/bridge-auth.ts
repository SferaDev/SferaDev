import { and, eq, isNull } from "drizzle-orm";
import { db, schema } from "@/lib/db";

/** A row of the `events` table, as selected by Drizzle. */
export type Event = typeof schema.events.$inferSelect;

/**
 * Authenticate an inbound request from the on-site print bridge.
 *
 * The bridge has no user session: it presents the event's `bridgePairingToken`
 * either as `Authorization: Bearer <token>` or in an `x-bridge-token` header.
 * We look up the single live (not soft-deleted) event holding that token and
 * return it, or `null` when the token is missing/unknown. Callers must scope
 * every subsequent query to the returned event's id.
 */
export async function authenticateBridge(request: Request): Promise<Event | null> {
	const token = extractBridgeToken(request);
	if (!token) return null;

	const [event] = await db
		.select()
		.from(schema.events)
		.where(and(eq(schema.events.bridgePairingToken, token), isNull(schema.events.deletedAt)))
		.limit(1);

	return event ?? null;
}

/**
 * Pull the bridge token from the request headers. Prefers the `Authorization:
 * Bearer <token>` scheme and falls back to the `x-bridge-token` header.
 */
function extractBridgeToken(request: Request): string | null {
	const authHeader = request.headers.get("authorization");
	if (authHeader?.startsWith("Bearer ")) {
		const token = authHeader.slice("Bearer ".length).trim();
		if (token) return token;
	}

	const headerToken = request.headers.get("x-bridge-token")?.trim();
	return headerToken ? headerToken : null;
}
