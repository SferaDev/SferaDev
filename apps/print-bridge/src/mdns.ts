import { Bonjour, type Browser, type Service } from "bonjour-service";
import type { PrinterRegistry } from "./printer-registry.js";

/**
 * mDNS / Zeroconf integration:
 *  - advertises the bridge itself as `_photocall-bridge._tcp` so operators (and
 *    the kiosk) can find it without typing an IP, and
 *  - discovers AirPrint/IPP printers (`_ipp._tcp`, `_ipps._tcp`) on the LAN and
 *    feeds them into the registry.
 */
export class MdnsManager {
	private readonly bonjour = new Bonjour();
	private advertised: Service | undefined;
	private readonly browsers: Browser[] = [];

	constructor(
		private readonly registry: PrinterRegistry,
		private readonly useTls: boolean,
	) {}

	/** Advertise this bridge on the local network. */
	advertise(port: number): void {
		this.advertised = this.bonjour.publish({
			name: "Photocall Print Bridge",
			type: "photocall-bridge",
			port,
			txt: { version: "1" },
		});
	}

	/** Start discovering IPP and IPPS printers. */
	startDiscovery(): void {
		for (const type of ["ipp", "ipps"] as const) {
			const browser = this.bonjour.find({ type });
			browser.on("up", (service) => this.handleUp(service, type));
			browser.on("down", (service) => this.handleDown(service, type));
			this.browsers.push(browser);
		}
	}

	/** Re-query the network for printers (used by `POST /api/printers/discover`). */
	rediscover(): void {
		for (const browser of this.browsers) {
			browser.update();
		}
	}

	private buildEndpoint(service: Service, type: "ipp" | "ipps") {
		const scheme = type === "ipps" || this.useTls ? "ipps" : "ipp";
		const host = service.host ?? service.referer?.address ?? service.name;
		const rp = typeof service.txt?.rp === "string" ? service.txt.rp : "ipp/print";
		const uri = `${scheme}://${host}:${service.port}/${rp}`;
		const id = `${host}:${service.port}/${rp}`;
		return { id, name: service.name, host, port: service.port, uri };
	}

	private handleUp(service: Service, type: "ipp" | "ipps"): void {
		const endpoint = this.buildEndpoint(service, type);
		void this.registry.upsert(endpoint).catch((error) => {
			console.warn(
				"[mdns] failed to register printer:",
				error instanceof Error ? error.message : error,
			);
		});
	}

	private handleDown(service: Service, type: "ipp" | "ipps"): void {
		const endpoint = this.buildEndpoint(service, type);
		this.registry.remove(endpoint.id);
	}

	/** Tear down all mDNS sockets — call on shutdown. */
	destroy(): void {
		for (const browser of this.browsers) browser.stop();
		this.browsers.length = 0;
		this.advertised?.stop();
		this.bonjour.unpublishAll(() => this.bonjour.destroy());
	}
}
