"use client";

import { ArrowLeft, Clapperboard, Images, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { getPublicEvent } from "@/actions/events";
import { selectTemplate } from "@/actions/sessions";
import { listPublicTemplates } from "@/actions/templates";
import { TemplateLivePreview } from "@/components/template-live-preview";
import { Button } from "@/components/ui/button";
import { useKioskPreviewCamera } from "@/hooks/use-kiosk-preview-camera";
import { BRANDED_CTA_FEEDBACK, DEFAULT_BRAND_COLOR, PRIMARY_CTA_CLASS } from "@/lib/branding";
import { ALL_FILTERS, cssFilterFor, FILTER_ICONS } from "@/lib/compose/css-filters";
import { parseLayoutJson } from "@/lib/layout/parse";
import type { FilterKind } from "@/lib/layout/types";
import { cn } from "@/lib/utils";

type PublicTemplate = Awaited<ReturnType<typeof listPublicTemplates>>[number];

// Cap how many template cards get the live camera feed. All slot canvases draw
// from ONE shared `<video>` (a single decode — see `sharedVideoEl` below), but
// each canvas still runs its own draw loop, so we limit the live previews to
// roughly the first screenful of cards; the rest fall back to the static
// placeholder. The full-size FilterChooser preview always goes live.
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
	const tLoading = useTranslations("kiosk.loading");

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
	// Digital zoom for the live previews, matching what the capture screen applies.
	const previewZoom = Math.max(1, event?.captureZoom ?? 1);

	// ONE shared, hidden `<video>` decodes the camera for the WHOLE select screen.
	// iOS Safari only lets a single `<video>` play a given camera MediaStream at a
	// time, so every slot/card draws from this one element (via `<canvas>`) instead
	// of mounting its own video — otherwise the extra videos render black on iPad.
	// It is kept mounted across both the template grid and the FilterChooser step
	// (rendered at the component root below) so it never stops decoding mid-flow.
	// Tracked in state via a callback ref so the previews re-render once it exists.
	const [sharedVideoEl, setSharedVideoEl] = useState<HTMLVideoElement | null>(null);
	const setSharedVideo = useCallback((el: HTMLVideoElement | null) => {
		setSharedVideoEl(el);
	}, []);

	useEffect(() => {
		if (!sharedVideoEl) return;
		if (!previewStream) {
			if (sharedVideoEl.srcObject) sharedVideoEl.srcObject = null;
			return;
		}
		if (sharedVideoEl.srcObject !== previewStream) {
			sharedVideoEl.srcObject = previewStream;
		}
		// play() can reject with AbortError when the element re-attaches mid-play;
		// the stream is already wired up in that case, so it is safe to ignore.
		void sharedVideoEl.play().catch((err: unknown) => {
			if (err instanceof Error && err.name !== "AbortError") {
				console.error("Shared preview playback failed:", err);
			}
		});
	}, [sharedVideoEl, previewStream]);

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
		// Both modes use the same capture screen; boomerang just records a burst
		// instead of N stills. The `mode` param is what flips that branch on.
		const query = new URLSearchParams({ session: sessionId });
		if (template) query.set("template", template.id);
		query.set("filter", filter);
		if (mode === "boomerang") query.set("mode", "boomerang");
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

	// Boomerangs fill the WHOLE frame with the animated clip, so only single-slot
	// templates make sense — a multi-slot strip would leave the clip stuck in one
	// strip cell with the other cells empty. In boomerang mode we therefore offer
	// only templates whose parsed layout has exactly one photo slot; strip mode
	// shows every template as before. When the host has no single-slot template the
	// filtered list is empty and the empty-state ("continue without frame") lets a
	// plain, undecorated boomerang still happen.
	const visibleTemplates = useMemo(() => {
		if (!templates) return templates;
		if (mode !== "boomerang") return templates;
		return templates.filter((template) => {
			const layout = parseLayoutJson(template.layoutJson);
			return layout != null && layout.photoSlots.length === 1;
		});
	}, [templates, mode]);

	if (eventLoading || templatesLoading) {
		return (
			<div
				className="min-h-screen flex items-center justify-center bg-black text-white"
				role="status"
				aria-label={tLoading("label")}
			>
				<Loader2 className="h-12 w-12 animate-spin" />
			</div>
		);
	}

	if (!event || !sessionId) {
		router.push(`/kiosk/${orgSlug}/${eventSlug}`);
		return null;
	}

	const primaryColor = event.primaryColor || DEFAULT_BRAND_COLOR;

	// Capture-mode picker: shown first when the event offers boomerangs and the
	// guest hasn't chosen a mode yet. Boomerang now flows through the SAME
	// template grid + filter chooser as strips (only the final navigation target
	// differs); with no templates the grid offers a "continue without frame"
	// path that lands on a plain, undecorated boomerang.
	// Each step is computed into `content` (rather than early-returned) so the one
	// shared hidden <video> can sit alongside it in a single root fragment and stay
	// mounted — and decoding — across the grid AND the FilterChooser step.
	let content: ReactNode;
	if (event.boomerangEnabled && mode === null) {
		content = (
			<ModePicker
				primaryColor={primaryColor}
				busy={navigating}
				onBack={() => router.push(`/kiosk/${orgSlug}/${eventSlug}`)}
				onPickStrip={() => setMode("strip")}
				onPickBoomerang={() => setMode("boomerang")}
			/>
		);
	} else if (pendingTemplate) {
		content = (
			<FilterChooser
				template={pendingTemplate}
				primaryColor={primaryColor}
				coupleNames={event.coupleNames ?? event.name}
				eventName={event.name}
				eventDate={eventDate}
				stream={previewStream}
				sharedVideo={sharedVideoEl}
				mirror={previewMirror}
				zoom={previewZoom}
				onBack={() => setPendingTemplate(null)}
				onConfirm={(filter) => goToCapture(pendingTemplate, filter)}
				busy={navigating}
			/>
		);
	} else {
		content = (
			<div className="flex h-[100svh] flex-col bg-black text-white p-4 sm:p-6 lg:p-8">
				<div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col">
					<div className="flex shrink-0 items-center justify-between mb-4 sm:mb-6 lg:mb-8">
						<Button
							variant="ghost"
							disabled={navigating}
							onClick={() =>
								event.boomerangEnabled
									? setMode(null)
									: router.push(`/kiosk/${orgSlug}/${eventSlug}`)
							}
							className="text-white text-base sm:text-lg [&_svg]:size-6"
						>
							<ArrowLeft className="h-6 w-6 mr-2" />
							{tCommon("back")}
						</Button>
						<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">{t("chooseFrame")}</h1>
						<Button
							variant="ghost"
							disabled={navigating}
							onClick={handleSkip}
							className="text-white text-base sm:text-lg"
						>
							{tCommon("skip")}
						</Button>
					</div>

					{visibleTemplates && visibleTemplates.length === 0 ? (
						<div className="flex flex-1 flex-col items-center justify-center text-center">
							<p className="text-2xl sm:text-3xl font-semibold mb-3">{t("noTemplatesTitle")}</p>
							<p className="text-lg sm:text-xl text-white/70 mb-6">{t("noTemplatesSubtitle")}</p>
							<Button
								size="xl"
								onClick={handleSkip}
								className={cn(
									PRIMARY_CTA_CLASS,
									BRANDED_CTA_FEEDBACK,
									"h-14 px-10 text-xl sm:h-16 sm:px-12 sm:text-2xl",
								)}
								style={{ backgroundColor: primaryColor }}
							>
								{t("continueWithoutFrame")}
							</Button>
						</div>
					) : (
						<div className="grid min-h-0 flex-1 auto-rows-max grid-cols-2 gap-4 overflow-y-auto sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
							{visibleTemplates?.map((template, index) => {
								const layout = parseLayoutJson(template.layoutJson);
								return (
									<motion.button
										key={template.id}
										type="button"
										aria-label={template.name}
										onClick={() => handleSelectTemplate(template)}
										disabled={navigating}
										initial={{ opacity: 0, y: 16 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{
											delay: index * 0.04,
											type: "spring",
											stiffness: 260,
											damping: 24,
										}}
										whileHover={{ scale: 1.04 }}
										whileTap={{ scale: 0.97 }}
										className="aspect-3/4 rounded-lg overflow-hidden border-2 border-transparent hover:border-white transition-colors bg-white/5 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-50"
									>
										{layout ? (
											<TemplateLivePreview
												layout={layout}
												coupleNames={event.coupleNames ?? event.name}
												eventName={event.name}
												date={eventDate}
												stream={index < MAX_LIVE_PREVIEW_CARDS ? previewStream : null}
												sharedVideo={sharedVideoEl}
												mirror={previewMirror}
												zoom={previewZoom}
												className="flex h-full w-full items-center justify-center"
											/>
										) : template.thumbnailUrl ? (
											<img
												src={template.thumbnailUrl}
												alt={template.name}
												className="w-full h-full object-cover"
											/>
										) : (
											<span className="text-xl text-white/80">{template.name}</span>
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

	return (
		<>
			{/* The ONE shared hidden video for the whole select screen — see
			    `sharedVideoEl` above. A 1px, opacity-0 element is enough: it only needs
			    to decode the camera; the slot canvases handle the mirror + filter. */}
			<video
				ref={setSharedVideo}
				autoPlay
				playsInline
				muted
				className="pointer-events-none fixed h-px w-px opacity-0"
			/>
			{content}
		</>
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
		<div className="flex h-[100svh] flex-col overflow-hidden bg-black text-white p-4 sm:p-6 lg:p-8">
			<div className="flex shrink-0 items-center justify-between mb-4 sm:mb-6 lg:mb-8">
				<Button
					variant="ghost"
					onClick={onBack}
					className="text-white text-base sm:text-lg [&_svg]:size-6"
					disabled={busy}
				>
					<ArrowLeft className="h-6 w-6 mr-2" />
					{tCommon("back")}
				</Button>
				<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">{t("modeTitle")}</h1>
				<div className="w-16 sm:w-32" />
			</div>

			<div className="flex min-h-0 flex-1 items-center justify-center">
				<div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2 sm:gap-6">
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
								className="flex flex-col items-center gap-3 rounded-2xl border border-white/15 bg-white/5 p-6 text-center transition-colors hover:border-white/40 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:gap-4 sm:p-10"
							>
								<span
									className="flex h-16 w-16 items-center justify-center rounded-full sm:h-24 sm:w-24"
									style={{ backgroundColor: primaryColor }}
								>
									<Icon className="h-8 w-8 sm:h-12 sm:w-12" aria-hidden="true" />
								</span>
								<span className="text-2xl font-semibold sm:text-3xl">{option.title}</span>
								<span className="text-base text-white/70 sm:text-lg">{option.description}</span>
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
	sharedVideo: HTMLVideoElement | null;
	mirror: boolean;
	zoom: number;
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
	sharedVideo,
	mirror,
	zoom,
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
		<div className="flex h-[100svh] flex-col overflow-hidden bg-black text-white p-4 sm:p-6 lg:p-8">
			<div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col">
				<div className="flex shrink-0 items-center justify-between mb-4 sm:mb-6">
					<Button
						variant="ghost"
						onClick={onBack}
						className="text-white text-base sm:text-lg [&_svg]:size-6"
						disabled={busy}
					>
						<ArrowLeft className="h-6 w-6 mr-2" />
						{tCommon("back")}
					</Button>
					<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">{t("pickLook")}</h1>
					<div className="w-16 sm:w-32" />
				</div>

				<div className="flex min-h-0 flex-1 justify-center">
					<div className="h-full overflow-hidden rounded-xl bg-white/5">
						{layout ? (
							<TemplateLivePreview
								layout={layout}
								coupleNames={coupleNames}
								eventName={eventName}
								date={eventDate}
								stream={stream}
								sharedVideo={sharedVideo}
								mirror={mirror}
								zoom={zoom}
								filter={selected}
								className="flex h-full items-center justify-center"
							/>
						) : null}
					</div>
				</div>

				<div className="flex shrink-0 flex-wrap justify-center gap-2 my-4 sm:gap-3 sm:my-6">
					{available.map((filter) => {
						const FilterIcon = FILTER_ICONS[filter];
						return (
							<motion.button
								key={filter}
								type="button"
								aria-label={tFilters(filter)}
								aria-pressed={selected === filter}
								onClick={() => setSelected(filter)}
								whileTap={{ scale: 0.95 }}
								className="flex flex-col items-center gap-1 rounded-xl p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:gap-2"
							>
								<span className="relative block h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20">
									{/* Filtered gradient swatch conveys the color treatment. */}
									<span
										className="absolute inset-0 rounded-full border-2"
										style={{
											backgroundImage: "linear-gradient(135deg, #f472b6, #60a5fa, #34d399)",
											filter: cssFilterFor(filter),
											borderColor: selected === filter ? primaryColor : "transparent",
										}}
									/>
									{/* Icon sits above the swatch (unfiltered) so it stays legible. */}
									<span className="absolute inset-0 flex items-center justify-center">
										<FilterIcon
											aria-hidden
											className="size-6 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] sm:size-7 lg:size-9"
										/>
									</span>
								</span>
								<span className="text-sm text-white/80 sm:text-base">{tFilters(filter)}</span>
							</motion.button>
						);
					})}
				</div>

				<div className="flex shrink-0 justify-center">
					<Button
						size="xl"
						onClick={() => onConfirm(selected)}
						disabled={busy}
						className={cn(
							PRIMARY_CTA_CLASS,
							BRANDED_CTA_FEEDBACK,
							"h-14 px-10 text-xl sm:h-16 sm:px-12 sm:text-2xl",
						)}
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
