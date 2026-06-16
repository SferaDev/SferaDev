import type { IPPVersion } from "ipp";
import { getPrinterAttributes } from "./ipp-client.js";
import type { DiscoveredPrinter } from "./types.js";

/** Fields known at discovery time, before we query live attributes. */
export interface DiscoveredEndpoint {
	id: string;
	name: string;
	host: string;
	port: number;
	uri: string;
}

/**
 * In-memory registry of printers discovered over mDNS. Holds the last-known
 * live state for each, refreshed on a timer and on demand. A single SELPHY is
 * the common case, but the registry handles any number of IPP printers.
 */
export class PrinterRegistry {
	private readonly printers = new Map<string, DiscoveredPrinter>();
	private refreshTimer: NodeJS.Timeout | undefined;

	constructor(private readonly ippVersion: IPPVersion) {}

	/** Add or update a discovered endpoint and immediately fetch its state. */
	async upsert(endpoint: DiscoveredEndpoint): Promise<void> {
		const existing = this.printers.get(endpoint.id);
		this.printers.set(endpoint.id, {
			...endpoint,
			state: existing?.state ?? "unknown",
			stateReasons: existing?.stateReasons ?? [],
			markerLevels: existing?.markerLevels ?? [],
			markerNames: existing?.markerNames ?? [],
			mediaSupported: existing?.mediaSupported ?? [],
			copiesSupported: existing?.copiesSupported ?? [],
			makeAndModel: existing?.makeAndModel,
			reachable: existing?.reachable ?? false,
			lastSeen: Date.now(),
		});
		await this.refresh(endpoint.id);
	}

	/** Drop a printer that went offline (mDNS `down`). */
	remove(id: string): void {
		this.printers.delete(id);
	}

	get(id: string): DiscoveredPrinter | undefined {
		return this.printers.get(id);
	}

	list(): DiscoveredPrinter[] {
		return [...this.printers.values()];
	}

	/** Refresh a single printer's live attributes. Marks it unreachable on error. */
	async refresh(id: string): Promise<DiscoveredPrinter | undefined> {
		const printer = this.printers.get(id);
		if (!printer) return undefined;

		try {
			const attributes = await getPrinterAttributes(printer.uri, this.ippVersion);
			const updated: DiscoveredPrinter = {
				...printer,
				state: attributes.state,
				stateReasons: attributes.stateReasons,
				markerLevels: attributes.markerLevels,
				markerNames: attributes.markerNames,
				mediaSupported: attributes.mediaSupported,
				copiesSupported: attributes.copiesSupported,
				makeAndModel: attributes.makeAndModel ?? printer.makeAndModel,
				reachable: true,
				lastSeen: Date.now(),
			};
			this.printers.set(id, updated);
			return updated;
		} catch (error) {
			console.warn(
				`[registry] printer ${id} unreachable:`,
				error instanceof Error ? error.message : error,
			);
			const updated: DiscoveredPrinter = { ...printer, reachable: false, lastSeen: Date.now() };
			this.printers.set(id, updated);
			return updated;
		}
	}

	/** Refresh every registered printer in parallel. */
	async refreshAll(): Promise<void> {
		await Promise.all(this.list().map((printer) => this.refresh(printer.id)));
	}

	/** Begin periodic background refresh (every 30s by default). */
	startAutoRefresh(intervalMs = 30_000): void {
		if (this.refreshTimer) return;
		this.refreshTimer = setInterval(() => {
			void this.refreshAll();
		}, intervalMs);
		// Don't keep the process alive solely for the refresh timer.
		this.refreshTimer.unref?.();
	}

	stopAutoRefresh(): void {
		if (this.refreshTimer) {
			clearInterval(this.refreshTimer);
			this.refreshTimer = undefined;
		}
	}
}
