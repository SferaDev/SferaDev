import type { MdnsManager } from "../mdns.js";
import type { PrinterRegistry } from "../printer-registry.js";
import type { PrintQueue } from "../queue.js";

/** Shared dependencies wired up in `server.ts` and handed to each route group. */
export interface BridgeContext {
	registry: PrinterRegistry;
	queue: PrintQueue;
	mdns: MdnsManager;
	/** Process start time (epoch millis) for the `/health` uptime field. */
	startedAt: number;
}
