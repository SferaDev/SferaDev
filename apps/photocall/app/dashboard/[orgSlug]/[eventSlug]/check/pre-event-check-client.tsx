"use client";

import {
	AlertTriangle,
	CheckCircle2,
	ChevronLeft,
	Loader2,
	RefreshCw,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";
import { getEventBySlug } from "@/actions/events";
import { checkStorage } from "@/actions/ops";
import { listTemplates } from "@/actions/templates";
import { Button } from "@/components/ui/button";
import { enumerateCameras } from "@/hooks/use-camera";
import { listBridgePrinters, pingBridge } from "@/lib/print/bridge-client";

type CheckStatus = "pending" | "running" | "pass" | "fail" | "warn";

interface CheckRow {
	id: string;
	label: string;
	status: CheckStatus;
	detail: string;
}

type Event = NonNullable<Awaited<ReturnType<typeof getEventBySlug>>>;

/**
 * Pre-event self-test. Runs a battery of readiness checks (event active,
 * templates, camera, network, storage, and — for bridge printing — bridge +
 * printer status) and renders a pass/fail row per check with a re-run button.
 * Designed to be opened on the actual kiosk iPad before guests arrive.
 */
export default function PreEventCheck() {
	const router = useRouter();
	const params = useParams();
	const orgSlug = params.orgSlug as string;
	const eventSlug = params.eventSlug as string;

	const t = useTranslations("kiosk.checklist");
	const tc = useTranslations("kiosk.checklist.checks");

	const { data: event } = useSWR(["events", orgSlug, eventSlug], () =>
		getEventBySlug(orgSlug, eventSlug),
	);

	const [rows, setRows] = useState<Record<string, CheckRow>>({});
	const [running, setRunning] = useState<string | null>(null);

	const setRow = useCallback((row: CheckRow) => {
		setRows((prev) => ({ ...prev, [row.id]: row }));
	}, []);

	const runEventActive = useCallback(
		(ev: Event): CheckRow =>
			ev.status === "active"
				? {
						id: "eventActive",
						label: tc("eventActive"),
						status: "pass",
						detail: tc("eventActiveOkActive"),
					}
				: {
						id: "eventActive",
						label: tc("eventActive"),
						status: "fail",
						detail: tc("eventActivePaused"),
					},
		[tc],
	);

	const runTemplates = useCallback(
		async (ev: Event): Promise<CheckRow> => {
			const templates = await listTemplates(ev.id, true);
			return templates.length > 0
				? {
						id: "templates",
						label: tc("templates"),
						status: "pass",
						detail: tc("templatesOk", { count: templates.length }),
					}
				: { id: "templates", label: tc("templates"), status: "fail", detail: tc("templatesNone") };
		},
		[tc],
	);

	const runCamera = useCallback(async (): Promise<CheckRow> => {
		const cameras = await enumerateCameras();
		return cameras.length > 0
			? {
					id: "camera",
					label: tc("camera"),
					status: "pass",
					detail: tc("cameraOk", { count: cameras.length }),
				}
			: { id: "camera", label: tc("camera"), status: "fail", detail: tc("cameraNone") };
	}, [tc]);

	const runNetwork = useCallback((): CheckRow => {
		const online = typeof navigator === "undefined" ? true : navigator.onLine;
		return online
			? { id: "network", label: tc("network"), status: "pass", detail: tc("networkOk") }
			: { id: "network", label: tc("network"), status: "warn", detail: tc("networkOffline") };
	}, [tc]);

	const runStorage = useCallback(
		async (ev: Event): Promise<CheckRow> => {
			const result = await checkStorage(ev.id);
			return result.ok
				? { id: "storage", label: tc("storage"), status: "pass", detail: tc("storageOk") }
				: { id: "storage", label: tc("storage"), status: "fail", detail: result.error };
		},
		[tc],
	);

	const runBridge = useCallback(
		async (ev: Event): Promise<CheckRow> => {
			if (!ev.printBridgeUrl) {
				return { id: "bridge", label: tc("bridge"), status: "warn", detail: tc("bridgeNoUrl") };
			}
			const reachable = await pingBridge(ev.printBridgeUrl);
			return reachable
				? { id: "bridge", label: tc("bridge"), status: "pass", detail: tc("bridgeOk") }
				: { id: "bridge", label: tc("bridge"), status: "fail", detail: tc("bridgeUnreachable") };
		},
		[tc],
	);

	const runPrinter = useCallback(
		async (ev: Event): Promise<CheckRow> => {
			if (!ev.printBridgeUrl) {
				return { id: "printer", label: tc("printer"), status: "warn", detail: tc("bridgeNoUrl") };
			}
			const result = await listBridgePrinters(ev.printBridgeUrl);
			if (!result.ok) {
				return { id: "printer", label: tc("printer"), status: "fail", detail: result.error };
			}
			const target = result.printers.find((p) => p.id === ev.printPrinterId) ?? result.printers[0];
			if (!target) {
				return { id: "printer", label: tc("printer"), status: "fail", detail: tc("printerNone") };
			}
			const reasons = target.stateReasons.join(" ").toLowerCase();
			if (reasons.includes("media-empty") || reasons.includes("media-needed")) {
				return {
					id: "printer",
					label: tc("printer"),
					status: "fail",
					detail: tc("printerOutOfPaper", { name: target.name }),
				};
			}
			const ready = target.state.toLowerCase() === "idle" || target.reachable;
			return ready
				? {
						id: "printer",
						label: tc("printer"),
						status: "pass",
						detail: tc("printerOk", { name: target.name }),
					}
				: {
						id: "printer",
						label: tc("printer"),
						status: "fail",
						detail: tc("printerNotReady", { name: target.name, state: target.state }),
					};
		},
		[tc],
	);

	const runOne = useCallback(
		async (id: string, ev: Event): Promise<void> => {
			setRunning(id);
			setRow({ id, label: tc(id), status: "running", detail: t("checking") });
			try {
				let result: CheckRow;
				switch (id) {
					case "eventActive":
						result = runEventActive(ev);
						break;
					case "templates":
						result = await runTemplates(ev);
						break;
					case "camera":
						result = await runCamera();
						break;
					case "network":
						result = runNetwork();
						break;
					case "storage":
						result = await runStorage(ev);
						break;
					case "bridge":
						result = await runBridge(ev);
						break;
					case "printer":
						result = await runPrinter(ev);
						break;
					default:
						return;
				}
				setRow(result);
			} finally {
				setRunning(null);
			}
		},
		[
			setRow,
			tc,
			t,
			runEventActive,
			runTemplates,
			runCamera,
			runNetwork,
			runStorage,
			runBridge,
			runPrinter,
		],
	);

	const checkIds = useCallback((ev: Event): string[] => {
		const base = ["eventActive", "templates", "camera", "network", "storage"];
		return ev.printMethod === "bridge" ? [...base, "bridge", "printer"] : base;
	}, []);

	const runAll = useCallback(async () => {
		if (!event) return;
		for (const id of checkIds(event)) {
			await runOne(id, event);
		}
	}, [event, checkIds, runOne]);

	// Auto-run once, after the event first loads. `runAll` is stable per event id.
	const eventId = event?.id;
	useEffect(() => {
		if (eventId) void runAll();
	}, [eventId, runAll]);

	if (event === undefined) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!event) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center space-y-4">
					<h1 className="text-2xl font-bold">{tc("eventActivePaused")}</h1>
					<Button onClick={() => router.push(`/dashboard/${orgSlug}`)}>
						<ChevronLeft className="h-4 w-4 mr-2" />
						{t("openKiosk")}
					</Button>
				</div>
			</div>
		);
	}

	const ids = checkIds(event);
	const orderedRows = ids.map((id) => rows[id]).filter((row): row is CheckRow => row != null);
	const allRun =
		orderedRows.length === ids.length && orderedRows.every((r) => r.status !== "running");
	const anyFailed = orderedRows.some((r) => r.status === "fail");

	return (
		<div className="min-h-screen bg-background">
			<header className="border-b">
				<div className="container mx-auto px-4 py-4 flex items-center gap-4">
					<Link
						href={`/dashboard/${orgSlug}/${eventSlug}`}
						className="text-muted-foreground hover:text-foreground"
					>
						<ChevronLeft className="h-5 w-5" />
					</Link>
					<div>
						<h1 className="font-bold text-xl">{t("title")}</h1>
						<p className="text-sm text-muted-foreground">{t("subtitle")}</p>
					</div>
				</div>
			</header>

			<main className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
				<div className="flex items-center justify-between">
					<Button onClick={() => void runAll()} disabled={running != null}>
						{running != null ? (
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
						) : (
							<RefreshCw className="h-4 w-4 mr-2" />
						)}
						{running != null ? t("running") : t("runAll")}
					</Button>
					<Button variant="outline" asChild>
						<Link href={`/kiosk/${orgSlug}/${eventSlug}`} target="_blank">
							{t("openKiosk")}
						</Link>
					</Button>
				</div>

				<div className="divide-y rounded-lg border">
					{ids.map((id) => {
						const row = rows[id];
						return (
							<div key={id} className="flex items-center gap-4 p-4">
								<StatusIcon status={row?.status ?? "pending"} />
								<div className="flex-1 min-w-0">
									<div className="font-medium">{tc(id)}</div>
									<div className="text-sm text-muted-foreground truncate">
										{row?.detail ?? t("pending")}
									</div>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => void runOne(id, event)}
									disabled={running != null}
								>
									{t("rerun")}
								</Button>
							</div>
						);
					})}
				</div>

				{allRun ? (
					<div
						className={`rounded-lg border p-4 text-sm ${
							anyFailed
								? "border-destructive/50 text-destructive"
								: "border-green-600/50 text-green-700 dark:text-green-400"
						}`}
					>
						{anyFailed ? t("someFailed") : t("allGood")}
					</div>
				) : null}
			</main>
		</div>
	);
}

function StatusIcon({ status }: { status: CheckStatus }) {
	switch (status) {
		case "running":
			return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />;
		case "pass":
			return <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden="true" />;
		case "fail":
			return <XCircle className="h-5 w-5 text-destructive" aria-hidden="true" />;
		case "warn":
			return <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />;
		default:
			return <div className="h-5 w-5 rounded-full border-2 border-muted" aria-hidden="true" />;
	}
}
