import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateBridge } from "@/lib/bridge-auth";
import { db, schema } from "@/lib/db";

const printerSchema = z.object({
	printerId: z.string().min(1),
	name: z.string().min(1),
	makeAndModel: z.string().optional(),
	state: z.string().optional(),
	stateReasons: z.array(z.string()).optional(),
	markerLevels: z.array(z.number()).optional(),
	mediaSupported: z.array(z.string()).optional(),
	reachable: z.boolean().optional(),
});

const heartbeatSchema = z.object({
	printers: z.array(printerSchema),
});

export async function POST(request: Request) {
	const event = await authenticateBridge(request);
	if (!event) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	const parsed = heartbeatSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{ error: "Invalid request body", issues: parsed.error.issues },
			{ status: 400 },
		);
	}

	const { printers } = parsed.data;
	const now = new Date();

	// Upsert each reported printer keyed by (eventId, printerId). The array-valued
	// fields are stored as JSON text columns. `lastSeenAt` is the heartbeat.
	for (const printer of printers) {
		await db
			.insert(schema.bridgePrinters)
			.values({
				eventId: event.id,
				printerId: printer.printerId,
				name: printer.name,
				makeAndModel: printer.makeAndModel ?? null,
				state: printer.state ?? null,
				stateReasons: printer.stateReasons ? JSON.stringify(printer.stateReasons) : null,
				markerLevels: printer.markerLevels ? JSON.stringify(printer.markerLevels) : null,
				mediaSupported: printer.mediaSupported ? JSON.stringify(printer.mediaSupported) : null,
				reachable: printer.reachable ?? true,
				lastSeenAt: now,
			})
			.onConflictDoUpdate({
				target: [schema.bridgePrinters.eventId, schema.bridgePrinters.printerId],
				set: {
					name: printer.name,
					makeAndModel: printer.makeAndModel ?? null,
					state: printer.state ?? null,
					stateReasons: printer.stateReasons ? JSON.stringify(printer.stateReasons) : null,
					markerLevels: printer.markerLevels ? JSON.stringify(printer.markerLevels) : null,
					mediaSupported: printer.mediaSupported ? JSON.stringify(printer.mediaSupported) : null,
					reachable: printer.reachable ?? true,
					lastSeenAt: now,
				},
			});
	}

	return NextResponse.json({ ok: true, count: printers.length });
}
