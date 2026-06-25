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
	 * Gate for whether to render live slot previews at all. When present, each
	 * photo slot draws the live camera into a `<canvas>` so the guest sees
	 * themselves in the frame. When null, the component degrades to the plain
	 * {@link TemplatePreview} placeholder. The actual pixels come from
	 * {@link TemplateLivePreviewProps.sharedVideo}, not this stream.
	 */
	stream: MediaStream | null;
	/**
	 * The ONE shared, already-playing `<video>` element decoding the kiosk camera
	 * for the whole select screen. Every slot canvas draws frames from this single
	 * element. iOS Safari only lets one `<video>` play a given camera MediaStream
	 * at a time, so the select page must share a single decoded video across all
	 * slots/cards instead of creating one `<video>` per slot.
	 */
	sharedVideo: HTMLVideoElement | null;
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
 * graphic and text layers around the slots; the live canvases sit over the slot
 * rects (where the placeholder photos would otherwise be).
 *
 * Every slot draws from the SAME shared `<video>` element (passed in via
 * `sharedVideo`). The select page decodes the camera once into that single video
 * and shares it across all cards and slots, because iOS Safari only lets one
 * `<video>` play a given camera MediaStream at a time — many `<video>` elements
 * bound to the same stream render black on iPad. A `<canvas>` per slot has no
 * such limit, and the CSS filter applied to each canvas works on iOS.
 */
export function TemplateLivePreview({
	layout,
	coupleNames,
	eventName,
	date,
	className,
	stream,
	sharedVideo,
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
			    the box), keeping the canvas overlay aligned at any container size. */}
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
						<SlotCanvas
							key={slot.id}
							slot={slot}
							sharedVideo={sharedVideo}
							mirror={mirror}
							zoom={zoom}
							filter={previewFilter}
						/>
					))}
			</div>
		</div>
	);
}

interface SlotCanvasProps {
	slot: PhotoSlot;
	sharedVideo: HTMLVideoElement | null;
	mirror: boolean;
	zoom: number;
	filter: FilterKind;
}

/**
 * One `<canvas>` positioned over a single photo slot, painting frames from the
 * shared kiosk `<video>`. No `<video>` is created here: all slots read from the
 * one shared, already-decoding video so the iOS single-active-video limit is
 * respected (see {@link TemplateLivePreview}).
 */
function SlotCanvas({ slot, sharedVideo, mirror, zoom, filter }: SlotCanvasProps) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	// Continuously paint the mirrored, zoom-cropped camera frames into the canvas.
	// The CSS filter is applied to the CANVAS (in the markup below), NOT the
	// <video>: iOS Safari composites a transformed <video> onto its own GPU layer
	// that escapes any CSS-filter pass (whether on the video or an ancestor), so
	// the filtered preview was blank on iPad. A <canvas> is filtered reliably, so
	// drawing the frames here — with the mirror/zoom baked into the draw — makes
	// the live filter preview work on iPad Safari while matching the capture's
	// cover-crop framing. Throttled + resolution-capped to stay light when several
	// previews run at once (up to MAX_LIVE_PREVIEW_CARDS).
	useEffect(() => {
		const video = sharedVideo;
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext("2d");
		if (!video || !canvas || !ctx) return;

		const MAX_BACKING_PX = 720;
		const sizeCanvas = () => {
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			const w = canvas.clientWidth * dpr;
			const h = canvas.clientHeight * dpr;
			const fit = Math.min(1, MAX_BACKING_PX / Math.max(w, h, 1));
			const cw = Math.max(1, Math.round(w * fit));
			const ch = Math.max(1, Math.round(h * fit));
			if (canvas.width !== cw || canvas.height !== ch) {
				canvas.width = cw;
				canvas.height = ch;
			}
		};
		sizeCanvas();
		const observer = new ResizeObserver(sizeCanvas);
		observer.observe(canvas);

		let raf = 0;
		let last = 0;
		const FRAME_MS = 1000 / 20; // ~20fps — smooth enough for a preview, light on the iPad.
		const draw = (now: number) => {
			raf = requestAnimationFrame(draw);
			if (now - last < FRAME_MS) return;
			last = now;
			const vw = video.videoWidth;
			const vh = video.videoHeight;
			const cw = canvas.width;
			const ch = canvas.height;
			if (!vw || !vh || !cw || !ch) return;
			// Cover-crop to fill the slot (matches the old object-cover + the
			// compositor), with the digital zoom as a tighter center crop.
			const scale = Math.max(cw / vw, ch / vh) * Math.max(1, zoom);
			const dw = vw * scale;
			const dh = vh * scale;
			const dx = (cw - dw) / 2;
			const dy = (ch - dh) / 2;
			ctx.save();
			if (mirror) {
				ctx.translate(cw, 0);
				ctx.scale(-1, 1);
			}
			ctx.drawImage(video, dx, dy, dw, dh);
			ctx.restore();
		};
		raf = requestAnimationFrame(draw);

		return () => {
			cancelAnimationFrame(raf);
			observer.disconnect();
		};
	}, [sharedVideo, mirror, zoom]);

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
			{/* The visible <canvas> shows the mirrored + FILTERED result, painted from
			    the single shared <video> (see the effect above). */}
			<canvas
				ref={canvasRef}
				className="absolute inset-0 h-full w-full"
				style={{ filter: cssFilterFor(filter) }}
			/>
		</div>
	);
}
