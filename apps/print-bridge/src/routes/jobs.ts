import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { HTTPException } from "hono/http-exception";
import { printJobRequestSchema } from "../types.js";
import type { BridgeContext } from "./context.js";

const THIRTY_MB = 30 * 1024 * 1024;

/** Print job submission, status and cancellation. */
export function jobRoutes(ctx: BridgeContext): Hono {
	const app = new Hono();

	// Submit a print job. The image arrives as base64 JPEG in the JSON body, so
	// allow a generous body size for high-resolution strips.
	app.post(
		"/",
		bodyLimit({
			maxSize: THIRTY_MB,
			onError: () => {
				throw new HTTPException(413, { message: "Image too large (max 30MB)" });
			},
		}),
		async (c) => {
			const body = await c.req.json();
			const request = printJobRequestSchema.parse(body);

			const printer = ctx.registry.get(request.printerId);
			if (!printer) {
				throw new HTTPException(404, { message: "Unknown printer" });
			}

			const imageBuffer = Buffer.from(request.imageBase64, "base64");
			if (imageBuffer.length === 0) {
				throw new HTTPException(400, { message: "Invalid image data" });
			}

			const job = ctx.queue.enqueue(request.printerId, imageBuffer, {
				paperSize: request.paperSize,
				borderless: request.borderless,
				copies: request.copies,
				orientation: request.orientation,
				mediaType: request.mediaType ?? "photographic-glossy",
			});

			return c.json({ jobId: job.id, status: job.status }, 202);
		},
	);

	// Most recent jobs (up to 50).
	app.get("/", (c) => c.json(ctx.queue.list()));

	// Status of a single job.
	app.get("/:id", (c) => {
		const job = ctx.queue.get(c.req.param("id"));
		if (!job) {
			throw new HTTPException(404, { message: "Job not found" });
		}
		return c.json(job);
	});

	// Cancel a pending job.
	app.delete("/:id", (c) => {
		const cancelled = ctx.queue.cancel(c.req.param("id"));
		if (!cancelled) {
			throw new HTTPException(409, { message: "Job is not cancellable" });
		}
		return c.json({ status: "cancelled" });
	});

	return app;
}
