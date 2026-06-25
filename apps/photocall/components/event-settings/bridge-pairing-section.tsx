"use client";

import { Check, Copy, Eye, EyeOff, KeyRound, Loader2, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import useSWR from "swr";
import { getBridgePairingToken, rotateBridgePairingToken } from "@/actions/print-jobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
		</div>
	);
}
