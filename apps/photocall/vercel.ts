import { exec } from "node:child_process";
import { promisify } from "node:util";
import type { VercelConfig } from "@vercel/config/v1";

const run = promisify(exec);

// `vercel.ts` executes at build time, so this is where we apply any pending
// Drizzle migrations before the app is built — a deploy never ends up running
// against an out-of-date schema. Guarded on DATABASE_URL so a database-less
// `vercel dev`/local compile stays a no-op rather than failing.
if (process.env.DATABASE_URL) {
	console.log("[vercel.ts] applying pending database migrations…");
	const { stdout, stderr } = await run("pnpm run db:migrate");
	if (stdout.trim()) console.log(stdout.trim());
	if (stderr.trim()) console.error(stderr.trim());
}

export const config: VercelConfig = {
	framework: "nextjs",
	crons: [{ path: "/api/cron/cleanup", schedule: "0 3 * * *" }],
};
