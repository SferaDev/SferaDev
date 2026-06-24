import type { VercelConfig } from "@vercel/config/v1";

// `vercel.ts` executes at build time, so this is where we apply any pending
// Drizzle migrations before the app is built — a deploy never ends up running
// against an out-of-date schema. We call Drizzle's migrator directly instead of
// shelling out to the drizzle-kit CLI, so it behaves identically in any build
// environment. Guarded on DATABASE_URL so a database-less local compile stays a
// no-op; the dedicated pool is closed so the config process can exit cleanly.
if (process.env.DATABASE_URL) {
	const { drizzle } = await import("drizzle-orm/node-postgres");
	const { migrate } = await import("drizzle-orm/node-postgres/migrator");
	const { default: pg } = await import("pg");

	const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
	try {
		console.log("[vercel.ts] applying pending database migrations…");
		await migrate(drizzle(pool), { migrationsFolder: "./lib/db/migrations" });
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
