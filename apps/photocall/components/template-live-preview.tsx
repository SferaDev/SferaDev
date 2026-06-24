"use client";

import { useEffect, useRef } from "react";
import { cssFilterFor } from "@/lib/compose/css-filters";
import type { BoothLayout, FilterKind, PhotoSlot } from "@/lib/layout/types";
import { TemplatePreview } from "./template-preview";

interface TemplateLivePreviewProps {
	layout: BoothLayout;
	coupleNames?: string;
	eventName?: string;
	date?: string;
	/** Applied to the outer wrapper (controls how the frame is sized/fitted). */
	className?: string;
	/**
	 * Shared kiosk camera stream. When present, a live `<video>` is rendered into
	 * each photo slot so the guest sees themselves in the frame. When null, the
	 * component degrades to the plain {@link TemplatePreview} placeholder.
	 */
	stream: MediaStream | null;
	/** Whether the live feed should be mirrored, matching the kiosk capture rule. */
	mirror: boolean;
	/** Digital zoom (center crop) applied to the live feed. 1 = no zoom. */
	zoom?: number;
	/**
	 * Filter to preview inside the slots. Falls back to the layout filter; a
	 * guest-chosen filter (in the picker) overrides it so the look updates live.
	 */
	filter?: FilterKind;
}

/**
 * Like {@link TemplatePreview}, but overlays the live kiosk camera feed inside
 * each photo slot so guests preview themselves — and the chosen filter — within
 * the frame. The composed `TemplatePreview` image still provides the background,
 * graphic and text layers around the slots; the live videos sit over the slot
 * rects (where the placeholder photos would otherwise be).
 *
 * A single `MediaStream` is shared across every slot's `<video>` (one element
 * per slot). Attaching the same stream to multiple `<video>` elements is allowed
 * and cheap, so no per-card or per-slot stream is ever created.
 */
export function TemplateLivePreview({
	layout,
	coupleNames,
	eventName,
	date,
	className,
	stream,
	mirror,
	zoom = 1,
	filter,
}: TemplateLivePreviewProps) {
	const previewFilter = filter ?? layout.filter;

	return (
		<div className={className}>
			{/* Aspect box matching the frame: slots are normalized to this rect, so
			    positioning them as percentages maps 1:1 onto the composed image.
			    `object-contain` on the image then becomes a no-op (it already fills
			    the box), keeping the video overlay aligned at any container size. */}
			<div
				className="relative mx-auto h-full max-w-full"
				style={{ aspectRatio: `1 / ${layout.aspectRatio}` }}
			>
				<TemplatePreview
					layout={layout}
					coupleNames={coupleNames}
					eventName={eventName}
					date={date}
					className="absolute inset-0 h-full w-full object-contain"
				/>

				{stream !== null &&
					layout.photoSlots.map((slot) => (
						<SlotVideo
							key={slot.id}
							slot={slot}
							stream={stream}
							mirror={mirror}
							zoom={zoom}
							filter={previewFilter}
						/>
					))}
			</div>
		</div>
	);
}

interface SlotVideoProps {
	slot: PhotoSlot;
	stream: MediaStream;
	mirror: boolean;
	zoom: number;
	filter: FilterKind;
}

/**
 * One live `<video>` positioned over a single photo slot. Every slot video
 * shares the same upstream `MediaStream` via `srcObject`, so attaching N of them
 * costs almost nothing beyond the single decode the browser already performs.
 */
function SlotVideo({ slot, stream, mirror, zoom, filter }: SlotVideoProps) {
	const videoRef = useRef<HTMLVideoElement | null>(null);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;
		if (video.srcObject !== stream) {
			video.srcObject = stream;
		}
		// play() can reject with AbortError when the element re-attaches mid-play;
		// the stream is already wired up in that case, so it is safe to ignore.
		void video.play().catch((err: unknown) => {
			if (err instanceof Error && err.name !== "AbortError") {
				console.error("Slot preview playback failed:", err);
			}
		});
	}, [stream]);

	// cornerRadius and borderWidth are normalized to the frame WIDTH (compositor
	// convention). Re-expressing them relative to the slot width lets a `cqw`
	// length on the slot container reproduce them at any rendered size.
	const radiusCqw = slot.width > 0 ? (slot.cornerRadius / slot.width) * 100 : 0;
	const borderCqw = slot.width > 0 ? (slot.borderWidth / slot.width) * 100 : 0;
	const hasBorder = slot.borderColor !== null && slot.borderWidth > 0;

	return (
		<div
			className="absolute overflow-hidden"
			style={{
				left: `${slot.x * 100}%`,
				top: `${slot.y * 100}%`,
				width: `${slot.width * 100}%`,
				height: `${slot.height * 100}%`,
				transform: slot.rotation !== 0 ? `rotate(${slot.rotation}deg)` : undefined,
				containerType: "size",
				borderRadius: `${radiusCqw}cqw`,
				border: hasBorder
					? `${borderCqw}cqw solid ${slot.borderColor ?? "transparent"}`
					: undefined,
			}}
		>
			<video
				ref={videoRef}
				autoPlay
				playsInline
				muted
				className="h-full w-full object-cover"
				style={{
					transform: `scale(${mirror ? -zoom : zoom}, ${zoom})`,
					filter: cssFilterFor(filter),
				}}
			/>
		</div>
	);
}
