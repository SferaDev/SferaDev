import type {
	Background,
	BoothLayout,
	GraphicLayer,
	PhotoSlot,
	TextLayer,
} from "@/lib/layout/types";
import { applyFilter } from "./filters";
import { loadImageCached } from "./image-cache";
import { type LayoutTokens, resolveTokens } from "./tokens";

/** Options for composing a finished strip/postcard from captured photos. */
export interface ComposeOptions {
	layout: BoothLayout;
	/** Captured photos in slot order (Blob or URL). */
	photos: Array<Blob | string>;
	tokens: LayoutTokens;
	/** Output canvas width in pixels; height derives from the layout aspect. */
	targetWidth: number;
	/**
	 * Output canvas height in pixels. Defaults to `targetWidth * aspectRatio`.
	 * Pass this explicitly for print output: with a bleed margin the print pixel
	 * size adds bleed to both dimensions, so its height/width ratio no longer
	 * equals the layout's bare-paper aspect ratio and the derived height would be
	 * wrong. Percentage-based layers scale to whatever canvas size is used.
	 */
	targetHeight?: number;
	/** JPEG quality 0..1. */
	quality?: number;
	/** Map a layer/background `src` to a loadable URL. */
	resolveAssetUrl?: (src: string) => string;
}

export interface ComposeResult {
	blob: Blob;
	width: number;
	height: number;
}

/** Compose the full layout into a single JPEG blob. */
export async function composeStrip(options: ComposeOptions): Promise<ComposeResult> {
	const {
		layout,
		photos,
		tokens,
		targetWidth,
		targetHeight,
		quality = 0.92,
		resolveAssetUrl,
	} = options;

	const width = Math.round(targetWidth);
	const height = Math.round(targetHeight ?? targetWidth * layout.aspectRatio);

	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Could not get canvas context");

	const resolveSrc = (src: string): string => (resolveAssetUrl ? resolveAssetUrl(src) : src);

	// Track object URLs we mint from Blobs so we can revoke them afterwards.
	const createdUrls: string[] = [];
	const photoUrls = photos.map((photo) => {
		if (typeof photo === "string") return photo;
		const url = URL.createObjectURL(photo);
		createdUrls.push(url);
		return url;
	});

	try {
		await drawBackground(ctx, layout.background, width, height, resolveSrc);

		for (let i = 0; i < layout.photoSlots.length; i++) {
			const slot = layout.photoSlots[i];
			const photoUrl = photoUrls[i];
			if (!photoUrl) continue;
			const img = await loadImageCached(photoUrl);
			drawPhotoSlot(ctx, slot, img, layout.filter, width, height);
		}

		for (const graphic of layout.graphicLayers) {
			await drawGraphicLayer(ctx, graphic, width, height, resolveSrc);
		}

		for (const text of layout.textLayers) {
			drawTextLayer(ctx, text, tokens, width, height);
		}

		const blob = await canvasToBlob(canvas, quality);
		return { blob, width, height };
	} finally {
		for (const url of createdUrls) URL.revokeObjectURL(url);
	}
}

async function drawBackground(
	ctx: CanvasRenderingContext2D,
	background: Background,
	width: number,
	height: number,
	resolveSrc: (src: string) => string,
): Promise<void> {
	switch (background.type) {
		case "color": {
			ctx.fillStyle = background.color;
			ctx.fillRect(0, 0, width, height);
			break;
		}
		case "gradient": {
			// CSS/design-tool convention: 0deg = top->bottom, clockwise. Canvas
			// angles are measured from the +x axis, so shift by -90deg.
			const radians = ((background.angle - 90) * Math.PI) / 180;
			const cx = width / 2;
			const cy = height / 2;
			const halfDiagonal = Math.sqrt(width * width + height * height) / 2;
			const dx = Math.cos(radians) * halfDiagonal;
			const dy = Math.sin(radians) * halfDiagonal;
			const gradient = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
			for (const stop of background.stops) {
				gradient.addColorStop(stop.offset, stop.color);
			}
			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, width, height);
			break;
		}
		case "image": {
			const img = await loadImageCached(resolveSrc(background.src));
			coverOrContainImage(ctx, img, 0, 0, width, height, background.fit);
			break;
		}
	}
}

function drawPhotoSlot(
	ctx: CanvasRenderingContext2D,
	slot: PhotoSlot,
	img: HTMLImageElement,
	layoutFilter: BoothLayout["filter"],
	canvasWidth: number,
	canvasHeight: number,
): void {
	const x = slot.x * canvasWidth;
	const y = slot.y * canvasHeight;
	const w = slot.width * canvasWidth;
	const h = slot.height * canvasHeight;
	const radius = slot.cornerRadius * canvasWidth;
	const filter = slot.filterOverride ?? layoutFilter;

	// Render the photo (with its filter) on an offscreen canvas, then draw it
	// into the slot through a rounded clip. Filters operate per-slot so each
	// photo can override the layout filter.
	const offscreen = document.createElement("canvas");
	offscreen.width = Math.max(1, Math.round(w));
	offscreen.height = Math.max(1, Math.round(h));
	const offCtx = offscreen.getContext("2d");
	if (!offCtx) return;

	coverOrContainImage(offCtx, img, 0, 0, offscreen.width, offscreen.height, slot.fit, slot);
	applyFilter(offCtx, filter, offscreen.width, offscreen.height);

	ctx.save();
	ctx.translate(x + w / 2, y + h / 2);
	if (slot.rotation !== 0) ctx.rotate((slot.rotation * Math.PI) / 180);
	ctx.translate(-w / 2, -h / 2);

	ctx.save();
	roundRect(ctx, 0, 0, w, h, radius);
	ctx.clip();
	ctx.drawImage(offscreen, 0, 0, w, h);
	ctx.restore();

	if (slot.borderColor && slot.borderWidth > 0) {
		const borderWidth = slot.borderWidth * canvasWidth;
		ctx.strokeStyle = slot.borderColor;
		ctx.lineWidth = borderWidth;
		roundRect(ctx, borderWidth / 2, borderWidth / 2, w - borderWidth, h - borderWidth, radius);
		ctx.stroke();
	}

	ctx.restore();
}

async function drawGraphicLayer(
	ctx: CanvasRenderingContext2D,
	graphic: GraphicLayer,
	canvasWidth: number,
	canvasHeight: number,
	resolveSrc: (src: string) => string,
): Promise<void> {
	const img = await loadImageCached(resolveSrc(graphic.src));
	const x = graphic.x * canvasWidth;
	const y = graphic.y * canvasHeight;
	const w = graphic.width * canvasWidth;
	const h = graphic.height * canvasHeight;

	ctx.save();
	ctx.globalAlpha = graphic.opacity;
	ctx.globalCompositeOperation = graphic.blendMode === "normal" ? "source-over" : graphic.blendMode;
	ctx.translate(x + w / 2, y + h / 2);
	if (graphic.rotation !== 0) ctx.rotate((graphic.rotation * Math.PI) / 180);
	ctx.drawImage(img, -w / 2, -h / 2, w, h);
	ctx.restore();
}

function drawTextLayer(
	ctx: CanvasRenderingContext2D,
	text: TextLayer,
	tokens: LayoutTokens,
	canvasWidth: number,
	canvasHeight: number,
): void {
	const content = resolveTokens(text.content, tokens).trim();
	if (!content) return;

	const x = text.x * canvasWidth;
	const y = text.y * canvasHeight;
	const maxWidth = text.width * canvasWidth;
	const fontSize = text.fontSize * canvasHeight;
	const lineHeight = fontSize * text.lineHeight;
	const letterSpacing = text.letterSpacing * canvasWidth;

	ctx.save();
	ctx.globalAlpha = text.opacity;
	ctx.fillStyle = text.color;
	ctx.font = `${text.fontStyle} ${text.fontWeight} ${fontSize}px "${text.fontFamily}", serif`;
	ctx.textAlign = text.align;
	ctx.textBaseline = "top";

	// letterSpacing is only available on newer engines (iOS17+/Chrome99+).
	if (letterSpacing > 0 && "letterSpacing" in ctx) {
		ctx.letterSpacing = `${letterSpacing}px`;
	}

	ctx.translate(x, y);
	if (text.rotation !== 0) ctx.rotate((text.rotation * Math.PI) / 180);

	let anchorX = 0;
	if (text.align === "center") anchorX = maxWidth / 2;
	else if (text.align === "right") anchorX = maxWidth;

	for (const [index, line] of wrapText(ctx, content, maxWidth).entries()) {
		ctx.fillText(line, anchorX, index * lineHeight);
	}

	ctx.restore();
}

/** Greedy word-wrap honoring the current context font. */
function wrapText(ctx: CanvasRenderingContext2D, content: string, maxWidth: number): string[] {
	const words = content.split(" ");
	const lines: string[] = [];
	let current = "";

	for (const word of words) {
		const candidate = current ? `${current} ${word}` : word;
		if (ctx.measureText(candidate).width > maxWidth && current) {
			lines.push(current);
			current = word;
		} else {
			current = candidate;
		}
	}
	if (current) lines.push(current);
	return lines;
}

/** Draw a rounded rectangle path (sub-pathing only — caller fills/strokes). */
function roundRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number,
): void {
	const r = Math.max(0, Math.min(radius, width / 2, height / 2));
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.arcTo(x + width, y, x + width, y + height, r);
	ctx.arcTo(x + width, y + height, x, y + height, r);
	ctx.arcTo(x, y + height, x, y, r);
	ctx.arcTo(x, y, x + width, y, r);
	ctx.closePath();
}

/**
 * Draw an image into a destination rect using cover/contain fit, applying the
 * optional per-slot crop pan/zoom for "cover".
 */
function coverOrContainImage(
	ctx: CanvasRenderingContext2D,
	img: HTMLImageElement,
	dx: number,
	dy: number,
	dWidth: number,
	dHeight: number,
	fit: PhotoSlot["fit"],
	slot?: PhotoSlot,
): void {
	const imgAspect = img.width / img.height;
	const dstAspect = dWidth / dHeight;

	if (fit === "contain") {
		let drawW = dWidth;
		let drawH = dHeight;
		if (imgAspect > dstAspect) drawH = dWidth / imgAspect;
		else drawW = dHeight * imgAspect;
		const offsetX = dx + (dWidth - drawW) / 2;
		const offsetY = dy + (dHeight - drawH) / 2;
		ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
		return;
	}

	// cover: crop the source so the destination is fully filled.
	const scale = slot?.cropScale && slot.cropScale > 0 ? slot.cropScale : 1;
	let sw = img.width;
	let sh = img.height;
	if (imgAspect > dstAspect) sw = img.height * dstAspect;
	else sh = img.width / dstAspect;
	sw /= scale;
	sh /= scale;

	// Pan offsets are normalized to the AVAILABLE crop range (-0.5..0.5 spans
	// the full pannable area), so panning behaves consistently across zoom
	// levels and image aspect ratios.
	const maxSx = img.width - sw;
	const maxSy = img.height - sh;
	const sx = clampRange(maxSx / 2 + (slot?.cropOffsetX ?? 0) * maxSx, 0, maxSx);
	const sy = clampRange(maxSy / 2 + (slot?.cropOffsetY ?? 0) * maxSy, 0, maxSy);

	ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dWidth, dHeight);
}

function clampRange(value: number, min: number, max: number): number {
	if (max <= min) return min;
	return Math.max(min, Math.min(max, value));
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
	return new Promise<Blob>((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (blob) resolve(blob);
				else reject(new Error("Failed to create blob"));
			},
			"image/jpeg",
			quality,
		);
	});
}
