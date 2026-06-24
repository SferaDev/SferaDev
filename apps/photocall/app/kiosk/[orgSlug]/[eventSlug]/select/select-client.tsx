"use client";

import { ArrowLeft, Clapperboard, Images, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { getPublicEvent } from "@/actions/events";
import { selectTemplate } from "@/actions/sessions";
import { listPublicTemplates } from "@/actions/templates";
import { TemplateLivePreview } from "@/components/template-live-preview";
import { Button } from "@/components/ui/button";
import { useKioskPreviewCamera } from "@/hooks/use-kiosk-preview-camera";
import { ALL_FILTERS, cssFilterFor } from "@/lib/compose/css-filters";
import { parseLayoutJson } from "@/lib/layout/parse";
import type { FilterKind } from "@/lib/layout/types";

type PublicTemplate = Awaited<ReturnType<typeof listPublicTemplates>>[number];

// Cap how many template cards get the live camera feed. All slot videos share a
// single stream (cheap), but each `<video>` still decodes frames, so we limit
// the live previews to roughly the first screenful of cards; the rest fall back
// to the static placeholder. The full-size FilterChooser preview always goes live.
const MAX_LIVE_PREVIEW_CARDS = 8;

export default function KioskSelectPage() {
	const router = useRouter();
	const params = useParams();
	const searchParams = useSearchParams();
	const orgSlug = params.orgSlug as string;
	const eventSlug = params.eventSlug as string;
	const sessionId = searchParams.get("session");
	const t = useTranslations("kiosk.select");
	const tCommon = useTranslations("kiosk.common");

	const { data: event, isLoading: eventLoading } = useSWR(
		["public-event", orgSlug, eventSlug],
		() => getPublicEvent(orgSlug, eventSlug),
	);

	const { data: templates, isLoading: templatesLoading } = useSWR(
		event ? ["public-templates", event.id] : null,
		() => listPublicTemplates(event!.id),
	);

	// One shared camera stream for the whole screen, configured like capture.
	// Every template's live slot previews reuse this single stream; when the
	// camera isn't available `stream` stays null and previews fall back to the
	// static placeholder.
	const { stream: previewStream, mirror: previewMirror } = useKioskPreviewCamera(event);

	// When the guest picks a layout template and the event lets guests choose the
	// filter, we stay on this screen to show the filter chooser before capture.
	const [pendingTemplate, setPendingTemplate] = useState<PublicTemplate | null>(null);
	const [navigating, setNavigating] = useState(false);
	// When boomerang is enabled, the guest first picks a capture mode. `null`
	// means "not chosen yet" (show the picker); "strip" continues to the frame
	// chooser below.
	const [mode, setMode] = useState<"strip" | "boomerang" | null>(null);

	const eventDate = useMemo(() => {
		if (!event?.startDate) return undefined;
		return new Date(event.startDate).toLocaleDateString(undefined, {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	}, [event?.startDate]);

	const goToCapture = async (template: PublicTemplate | null, filter: FilterKind) => {
		if (!sessionId) return;
		setNavigating(true);
		try {
			if (template) await selectTemplate(sessionId, template.id);
		} catch (error) {
			console.error("Failed to select template:", error);
		}
		const query = new URLSearchParams({ session: sessionId });
		if (template) query.set("template", template.id);
		query.set("filter", filter);
		router.push(`/kiosk/${orgSlug}/${eventSlug}/capture?${query.toString()}`);
	};

	const handleSelectTemplate = (template: PublicTemplate) => {
		const layout = parseLayoutJson(template.layoutJson);
		const guestChoosesFilter = event?.captureWhoChoosesFilter === "guest";
		// Layout templates with a guest-chosen filter get the filter step; legacy
		// (no layout) templates and host-chosen flows go straight to capture.
		if (layout && guestChoosesFilter) {
			setPendingTemplate(template);
			return;
		}
		void goToCapture(template, layout?.filter ?? "none");
	};

	const handleSkip = () => {
		void goToCapture(null, "none");
	};

	if (eventLoading || templatesLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-black text-white">
				<Loader2 className="h-12 w-12 animate-spin" />
			</div>
		);
	}

	if (!event || !sessionId) {
		router.push(`/kiosk/${orgSlug}/${eventSlug}`);
		return null;
	}

	const primaryColor = event.primaryColor || "#e11d48";

	const goToBoomerang = () => {
		setNavigating(true);
		router.push(`/kiosk/${orgSlug}/${eventSlug}/boomerang?session=${sessionId}`);
	};

	// Capture-mode picker: shown first when the event offers boomerangs and the
	// guest hasn't chosen a mode yet.
	if (event.boomerangEnabled && mode === null) {
		return (
			<ModePicker
				primaryColor={primaryColor}
				busy={navigating}
				onBack={() => router.push(`/kiosk/${orgSlug}/${eventSlug}`)}
				onPickStrip={() => setMode("strip")}
				onPickBoomerang={goToBoomerang}
			/>
		);
	}

	if (pendingTemplate) {
		return (
			<FilterChooser
				template={pendingTemplate}
				primaryColor={primaryColor}
				coupleNames={event.coupleNames ?? event.name}
				eventName={event.name}
				eventDate={eventDate}
				stream={previewStream}
				mirror={previewMirror}
				onBack={() => setPendingTemplate(null)}
				onConfirm={(filter) => goToCapture(pendingTemplate, filter)}
				busy={navigating}
			/>
		);
	}

	return (
		<div className="min-h-screen bg-black text-white p-8">
			<div className="max-w-6xl mx-auto">
				<div className="flex items-center justify-between mb-8">
					<Button
						variant="ghost"
						onClick={() =>
							event.boomerangEnabled ? setMode(null) : router.push(`/kiosk/${orgSlug}/${eventSlug}`)
						}
						className="text-white"
					>
						<ArrowLeft className="h-5 w-5 mr-2" />
						{tCommon("back")}
					</Button>
					<h1 className="text-2xl font-bold">{t("chooseFrame")}</h1>
					<Button variant="ghost" onClick={handleSkip} className="text-white">
						{tCommon("skip")}
					</Button>
				</div>

				{templates && templates.length === 0 ? (
					<div className="text-center py-16">
						<p className="text-2xl font-semibold mb-2">{t("noTemplatesTitle")}</p>
						<p className="text-white/70 mb-6">{t("noTemplatesSubtitle")}</p>
						<Button
							size="lg"
							onClick={handleSkip}
							className="text-lg px-10 py-6 rounded-full"
							style={{ backgroundColor: primaryColor }}
						>
							{t("continueWithoutFrame")}
						</Button>
					</div>
				) : (
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
						{templates?.map((template, index) => {
							const layout = parseLayoutJson(template.layoutJson);
							return (
								<motion.button
									key={template.id}
									type="button"
									onClick={() => handleSelectTemplate(template)}
									disabled={navigating}
									initial={{ opacity: 0, y: 16 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.04, type: "spring", stiffness: 260, damping: 24 }}
									whileHover={{ scale: 1.04 }}
									whileTap={{ scale: 0.97 }}
									className="aspect-3/4 rounded-lg overflow-hidden border-2 border-transparent hover:border-white transition-colors bg-white/5 flex items-center justify-center"
								>
									{layout ? (
										<TemplateLivePreview
											layout={layout}
											coupleNames={event.coupleNames ?? event.name}
											eventName={event.name}
											date={eventDate}
											stream={index < MAX_LIVE_PREVIEW_CARDS ? previewStream : null}
											mirror={previewMirror}
											className="flex h-full w-full items-center justify-center"
										/>
									) : template.thumbnailUrl ? (
										<img
											src={template.thumbnailUrl}
											alt={template.name}
											className="w-full h-full object-cover"
										/>
									) : (
										<span className="text-sm text-white/60">{template.name}</span>
									)}
								</motion.button>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}

interface ModePickerProps {
	primaryColor: string;
	busy: boolean;
	onBack: () => void;
	onPickStrip: () => void;
	onPickBoomerang: () => void;
}

/** Capture-mode chooser: classic photo strip vs animated boomerang. */
function ModePicker({ primaryColor, busy, onBack, onPickStrip, onPickBoomerang }: ModePickerProps) {
	const t = useTranslations("kiosk.boomerang");
	const tCommon = useTranslations("kiosk.common");

	const options = [
		{
			key: "strip" as const,
			title: t("modeStripTitle"),
			description: t("modeStripDescription"),
			icon: Images,
			onPick: onPickStrip,
		},
		{
			key: "boomerang" as const,
			title: t("modeBoomerangTitle"),
			description: t("modeBoomerangDescription"),
			icon: Clapperboard,
			onPick: onPickBoomerang,
		},
	];

	return (
		<div className="min-h-screen bg-black text-white p-8 flex flex-col">
			<div className="flex items-center justify-between mb-8">
				<Button variant="ghost" onClick={onBack} className="text-white" disabled={busy}>
					<ArrowLeft className="h-5 w-5 mr-2" />
					{tCommon("back")}
				</Button>
				<h1 className="text-2xl font-bold">{t("modeTitle")}</h1>
				<div className="w-20" />
			</div>

			<div className="flex-1 flex items-center justify-center">
				<div className="grid w-full max-w-3xl gap-6 sm:grid-cols-2">
					{options.map((option, index) => {
						const Icon = option.icon;
						return (
							<motion.button
								key={option.key}
								type="button"
								onClick={option.onPick}
								disabled={busy}
								initial={{ opacity: 0, y: 24 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									delay: index * 0.08,
									type: "spring",
									stiffness: 260,
									damping: 24,
								}}
								whileHover={{ scale: 1.03 }}
								whileTap={{ scale: 0.97 }}
								className="flex flex-col items-center gap-4 rounded-2xl border border-white/15 bg-white/5 p-10 text-center transition-colors hover:border-white/40 disabled:opacity-50"
							>
								<span
									className="flex h-20 w-20 items-center justify-center rounded-full"
									style={{ backgroundColor: primaryColor }}
								>
									<Icon className="h-10 w-10" aria-hidden="true" />
								</span>
								<span className="text-2xl font-semibold">{option.title}</span>
								<span className="text-sm text-white/70">{option.description}</span>
							</motion.button>
						);
					})}
				</div>
			</div>
		</div>
	);
}

interface FilterChooserProps {
	template: PublicTemplate;
	primaryColor: string;
	coupleNames: string;
	eventName: string;
	eventDate: string | undefined;
	stream: MediaStream | null;
	mirror: boolean;
	onBack: () => void;
	onConfirm: (filter: FilterKind) => void;
	busy: boolean;
}

function FilterChooser({
	template,
	primaryColor,
	coupleNames,
	eventName,
	eventDate,
	stream,
	mirror,
	onBack,
	onConfirm,
	busy,
}: FilterChooserProps) {
	const t = useTranslations("kiosk.select");
	const tCommon = useTranslations("kiosk.common");
	const tFilters = useTranslations("kiosk.filters");
	const layout = parseLayoutJson(template.layoutJson);
	const allowed =
		template.allowedFilters.length > 0
			? ALL_FILTERS.filter((f) => template.allowedFilters.includes(f))
			: ALL_FILTERS;
	// Guarantee a non-empty list so the default below is always a real filter,
	// even if allowedFilters holds only unrecognized values.
	const available = allowed.length > 0 ? allowed : ALL_FILTERS;
	const [selected, setSelected] = useState<FilterKind>(
		available.includes(layout?.filter ?? "none") ? (layout?.filter ?? "none") : available[0],
	);

	return (
		<div className="min-h-screen bg-black text-white p-8">
			<div className="max-w-3xl mx-auto">
				<div className="flex items-center justify-between mb-8">
					<Button variant="ghost" onClick={onBack} className="text-white" disabled={busy}>
						<ArrowLeft className="h-5 w-5 mr-2" />
						{tCommon("back")}
					</Button>
					<h1 className="text-2xl font-bold">{t("pickLook")}</h1>
					<div className="w-20" />
				</div>

				<div className="flex justify-center mb-8">
					<div className="rounded-xl overflow-hidden bg-white/5 h-[55vh] w-fit">
						{layout ? (
							<TemplateLivePreview
								layout={layout}
								coupleNames={coupleNames}
								eventName={eventName}
								date={eventDate}
								stream={stream}
								mirror={mirror}
								filter={selected}
								className="flex h-full items-center justify-center"
							/>
						) : null}
					</div>
				</div>

				<div className="flex flex-wrap justify-center gap-3 mb-10">
					{available.map((filter) => (
						<motion.button
							key={filter}
							type="button"
							onClick={() => setSelected(filter)}
							whileTap={{ scale: 0.95 }}
							className="flex flex-col items-center gap-2"
						>
							<span
								className="block h-16 w-16 rounded-full border-2"
								style={{
									backgroundImage: "linear-gradient(135deg, #f472b6, #60a5fa, #34d399)",
									filter: cssFilterFor(filter),
									borderColor: selected === filter ? primaryColor : "transparent",
								}}
							/>
							<span className="text-xs text-white/80">{tFilters(filter)}</span>
						</motion.button>
					))}
				</div>

				<div className="flex justify-center">
					<Button
						size="lg"
						onClick={() => onConfirm(selected)}
						disabled={busy}
						className="text-lg px-12 py-6 rounded-full"
						style={{ backgroundColor: primaryColor }}
					>
						{busy ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : null}
						{tCommon("start")}
					</Button>
				</div>
			</div>
		</div>
	);
}
