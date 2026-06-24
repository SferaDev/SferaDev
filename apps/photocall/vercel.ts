import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { VercelConfig } from "@vercel/config/v1";

/**
 * Resolve the Drizzle migrations folder regardless of the working directory
 * Vercel runs `vercel.ts` from (build logs show it isn't `apps/photocall`). We
 * try the path relative to this file first, then the monorepo-root and
 * app-root cwd layouts.
 */
function resolveMigrationsFolder(): string {
	const candidates = [
		fileURLToPath(new URL("./lib/db/migrations", import.meta.url)),
		join(process.cwd(), "apps/photocall/lib/db/migrations"),
		join(process.cwd(), "lib/db/migrations"),
	];
	const found = candidates.find((path) => existsSync(path));
	if (!found) {
		throw new Error(`Could not locate migrations folder. Tried:\n${candidates.join("\n")}`);
	}
	return found;
}

// `vercel.ts` executes at build time, so this is where we apply any pending
// Drizzle migrations before the app is built — a deploy never ends up running
// against an out-of-date schema. We call Drizzle's migrator directly (no
// `pnpm`/CLI subprocess, which isn't resolvable from the monorepo build cwd).
// Guarded on DATABASE_URL so a database-less local compile stays a no-op; the
// dedicated pool is closed so the config process can exit cleanly.
if (process.env.DATABASE_URL) {
	const { drizzle } = await import("drizzle-orm/node-postgres");
	const { migrate } = await import("drizzle-orm/node-postgres/migrator");
	const { default: pg } = await import("pg");

	const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
	try {
		console.log("[vercel.ts] applying pending database migrations…");
		await migrate(drizzle(pool), { migrationsFolder: resolveMigrationsFolder() });
		console.log("[vercel.ts] database migrations up to date.");
	} finally {
		await pool.end();
	}
}

export const config: VercelConfig = {
	framework: "nextjs",
	// Daily cleanup of expired shares/photos (migrated from vercel.json).
	crons: [{ path: "/api/cron/cleanup", schedule: "0 3 * * *" }],
};
