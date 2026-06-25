"use client";

import {
	Check,
	ChevronDown,
	Copy,
	Download,
	Eye,
	EyeOff,
	KeyRound,
	Loader2,
	RefreshCw,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";
import {
	getBridgePairingToken,
	listBridgeDownloads,
	rotateBridgePairingToken,
} from "@/actions/print-jobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Operating systems we can map to a preferred bridge build target. */
type DetectedOs = "mac" | "windows" | "linux" | "unknown";

/**
 * Best-effort OS sniff from the browser. We can't tell Apple Silicon from Intel
 * from JS, so macOS defaults to Apple Silicon (the common case) and lists Intel
 * as an alternative under "Other platforms".
 */
function detectOs(): DetectedOs {
	if (typeof navigator === "undefined") return "unknown";
	const haystack = `${navigator.userAgent} ${navigator.platform}`.toLowerCase();
	if (/mac|iphone|ipad|ipod/.test(haystack)) return "mac";
	if (/win/.test(haystack)) return "windows";
	if (/linux|android/.test(haystack)) return "linux";
	return "unknown";
}

/** The build target each detected OS should download by default. */
const PREFERRED_TARGET: Record<DetectedOs, string | null> = {
	mac: "bun-darwin-arm64",
	windows: "bun-windows-x64",
	linux: "bun-linux-x64",
	unknown: null,
};

function formatBytes(bytes: number): string {
	return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

/** Post-download shell setup a downloaded binary needs before it will run. */
interface SetupGuide {
	/** Shell command(s) to prepare the downloaded binary. */
	command: string;
	/** i18n key for the one-line explanation shown above the command. */
	helpKey: "setupMacHelp" | "setupLinuxHelp";
}

/**
 * The shell setup a freshly downloaded binary needs, by build target. The
 * binaries are unsigned, so macOS quarantines them ("damaged and can't be
 * opened") and browsers drop the executable bit. We surface a copyable fix keyed
 * off the *actual* downloaded filename so it pastes-and-runs. Windows builds need
 * no shell step, so they return `null`.
 */
function getSetupGuide(target: string, filename: string): SetupGuide | null {
	if (target.startsWith("bun-darwin")) {
		return {
			command: `xattr -c ./${filename} && chmod +x ./${filename}`,
			helpKey: "setupMacHelp",
		};
	}
	if (target.startsWith("bun-linux")) {
		return { command: `chmod +x ./${filename}`, helpKey: "setupLinuxHelp" };
	}
	return null;
}

interface BridgePairingSectionProps {
	eventId: string;
	/** This site's origin, set as BRIDGE_CLOUD_URL on the on-site bridge. */
	origin: string;
}

/**
 * "Print bridge pairing" settings: shows the event's bridge pairing token
 * (masked, with reveal + copy), a button to generate/regenerate it, and the two
 * env vars the on-site bridge must be configured with so it can claim this
 * event's server-side print jobs.
 *
 * The token is the bridge's only credential (see `lib/bridge-auth.ts`), so
 * regenerating it immediately revokes any previously paired bridge.
 */
export function BridgePairingSection({ eventId, origin }: BridgePairingSectionProps) {
	const t = useTranslations("dashboard.eventSettings.pairing");

	const { data, mutate, isLoading } = useSWR(["bridge-pairing-token", eventId], () =>
		getBridgePairingToken(eventId),
	);
	const token = data?.token ?? null;

	const [revealed, setRevealed] = useState(false);
	const [rotating, setRotating] = useState(false);
	const [copied, setCopied] = useState<"token" | "command" | null>(null);

	const handleRotate = useCallback(async () => {
		setRotating(true);
		try {
			const result = await rotateBridgePairingToken(eventId);
			await mutate({ token: result.token }, { revalidate: false });
			setRevealed(true);
		} finally {
			setRotating(false);
		}
	}, [eventId, mutate]);

	const handleCopy = useCallback(async (value: string, which: "token" | "command") => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(which);
			setTimeout(() => setCopied(null), 2_000);
		} catch {
			// Clipboard blocked (insecure context / permissions) — no-op; the field is
			// selectable so the operator can copy manually.
		}
	}, []);

	// Mask the token in the field unless revealed, but keep it copyable always.
	const displayValue = token ? (revealed ? token : "•".repeat(token.length)) : "";

	return (
		<div className="space-y-4 rounded-lg border p-4">
			<div className="flex items-start gap-3">
				<KeyRound className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" aria-hidden="true" />
				<div>
					<h2 className="font-medium">{t("title")}</h2>
					<p className="text-sm text-muted-foreground">{t("help")}</p>
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="bridge-pairing-token">{t("tokenLabel")}</Label>
				{isLoading ? (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Loader2 className="h-4 w-4 animate-spin" />
						{t("loading")}
					</div>
				) : token ? (
					<div className="flex items-center gap-2">
						<Input
							id="bridge-pairing-token"
							readOnly
							value={displayValue}
							className="font-mono"
							onFocus={(e) => e.currentTarget.select()}
						/>
						<Button
							type="button"
							variant="outline"
							size="icon"
							onClick={() => setRevealed((v) => !v)}
							aria-label={revealed ? t("hide") : t("reveal")}
							title={revealed ? t("hide") : t("reveal")}
						>
							{revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
						</Button>
						<Button
							type="button"
							variant="outline"
							size="icon"
							onClick={() => void handleCopy(token, "token")}
							aria-label={t("copy")}
							title={t("copy")}
						>
							{copied === "token" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
						</Button>
					</div>
				) : (
					<p className="text-sm text-muted-foreground">{t("noToken")}</p>
				)}
			</div>

			<Button
				type="button"
				variant="outline"
				onClick={() => void handleRotate()}
				disabled={rotating}
			>
				{rotating ? (
					<Loader2 className="h-4 w-4 mr-2 animate-spin" />
				) : (
					<RefreshCw className="h-4 w-4 mr-2" />
				)}
				{token ? t("regenerate") : t("generate")}
			</Button>

			{token ? (
				<div className="space-y-2 rounded-md bg-muted/50 p-3 text-sm">
					<p className="text-muted-foreground">{t("instructions")}</p>
					<div className="flex items-start justify-between gap-2">
						{/* Full one-line command to run the on-site bridge. The displayed
						    token is masked unless revealed, but copy always yields the real
						    command so the operator can paste-and-run. */}
						<code className="block min-w-0 grow break-all font-mono text-xs leading-relaxed">
							{`BRIDGE_CLOUD_URL=${origin} BRIDGE_PAIRING_TOKEN=${revealed ? token : "•".repeat(token.length)} ./print-bridge`}
						</code>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="h-6 w-6 shrink-0"
							onClick={() =>
								void handleCopy(
									`BRIDGE_CLOUD_URL=${origin} BRIDGE_PAIRING_TOKEN=${token} ./print-bridge`,
									"command",
								)
							}
							aria-label={t("copyCommand")}
							title={t("copyCommand")}
						>
							{copied === "command" ? (
								<Check className="h-3.5 w-3.5" />
							) : (
								<Copy className="h-3.5 w-3.5" />
							)}
						</Button>
					</div>
				</div>
			) : null}

			<BridgeDownloads eventId={eventId} />
		</div>
	);
}

/**
 * "Download the bridge app" subsection: lists the published bridge binaries with
 * a primary button for the operator's detected OS and the rest under an "Other
 * platforms" expander. Shows a subtle note (not an error) when nothing has been
 * published yet — the host must run `scripts/publish-bridge-binaries.ts`.
 */
function BridgeDownloads({ eventId }: { eventId: string }) {
	const t = useTranslations("dashboard.eventSettings.pairing");

	const { data: downloads, isLoading } = useSWR(["bridge-downloads", eventId], () =>
		listBridgeDownloads(eventId),
	);

	// Detect the OS on the client only, to avoid a server/client hydration mismatch.
	const [detectedOs, setDetectedOs] = useState<DetectedOs>("unknown");
	useEffect(() => setDetectedOs(detectOs()), []);

	const [showOthers, setShowOthers] = useState(false);
	const [copiedSetup, setCopiedSetup] = useState(false);

	const handleCopySetup = useCallback(async (value: string) => {
		try {
			await navigator.clipboard.writeText(value);
			setCopiedSetup(true);
			setTimeout(() => setCopiedSetup(false), 2_000);
		} catch {
			// Clipboard blocked (insecure context / permissions) — no-op; the command
			// is selectable so the operator can copy it manually.
		}
	}, []);

	if (isLoading) {
		return (
			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				<Loader2 className="h-4 w-4 animate-spin" />
				{t("loading")}
			</div>
		);
	}

	const items = downloads ?? [];
	const preferredTarget = PREFERRED_TARGET[detectedOs];
	const primary = items.find((item) => item.target === preferredTarget) ?? items[0] ?? null;
	const others = items.filter((item) => item !== primary);
	const setupGuide = primary ? getSetupGuide(primary.target, primary.filename) : null;

	return (
		<div className="space-y-3 border-t pt-4">
			<div className="flex items-start gap-3">
				<Download className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" aria-hidden="true" />
				<div>
					<h3 className="font-medium">{t("downloadTitle")}</h3>
					<p className="text-sm text-muted-foreground">{t("downloadHelp")}</p>
				</div>
			</div>

			{primary === null ? (
				<p className="text-sm text-muted-foreground">{t("notPublished")}</p>
			) : (
				<div className="space-y-2">
					<Button asChild className="w-full sm:w-auto">
						<a href={primary.url} download={primary.filename}>
							<Download className="h-4 w-4 mr-2" />
							{t("downloadButton", { platform: primary.label })}
							<span className="ml-2 text-xs opacity-80">{formatBytes(primary.sizeBytes)}</span>
						</a>
					</Button>

					{setupGuide ? (
						<div className="space-y-2 rounded-md bg-muted/50 p-3 text-sm">
							<p className="text-muted-foreground">
								<span className="font-medium text-foreground">{t("setupTitle")}</span>{" "}
								{t(setupGuide.helpKey)}
							</p>
							<div className="flex items-start justify-between gap-2">
								<code className="block min-w-0 grow break-all font-mono text-xs leading-relaxed">
									{setupGuide.command}
								</code>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="h-6 w-6 shrink-0"
									onClick={() => void handleCopySetup(setupGuide.command)}
									aria-label={t("copySetup")}
									title={t("copySetup")}
								>
									{copiedSetup ? (
										<Check className="h-3.5 w-3.5" />
									) : (
										<Copy className="h-3.5 w-3.5" />
									)}
								</Button>
							</div>
						</div>
					) : null}

					{others.length > 0 ? (
						<div className="space-y-2">
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="text-muted-foreground"
								onClick={() => setShowOthers((v) => !v)}
								aria-expanded={showOthers}
							>
								<ChevronDown
									className={`h-4 w-4 mr-1 transition-transform ${showOthers ? "rotate-180" : ""}`}
								/>
								{t("otherPlatforms")}
							</Button>

							{showOthers ? (
								<ul className="space-y-1">
									{others.map((item) => (
										<li key={item.target}>
											<a
												href={item.url}
												download={item.filename}
												className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50"
											>
												<Download className="h-4 w-4 shrink-0 text-muted-foreground" />
												<span className="grow">{item.label}</span>
												<span className="text-xs text-muted-foreground">
													{formatBytes(item.sizeBytes)}
												</span>
											</a>
										</li>
									))}
								</ul>
							) : null}
						</div>
					) : null}
				</div>
			)}
		</div>
	);
}
