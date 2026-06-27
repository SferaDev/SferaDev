export interface CompositeOptions {
	photo: string; // data URL or blob URL
	template?: {
		url: string;
		safeArea?: {
			x: number; // 0-1 relative
			y: number;
			width: number;
			height: number;
		};
	};
	caption?: {
		text: string;
		position: {
			x: number;
			y: number;
			maxWidth: number;
			fontSize: number;
			color: string;
			align: "left" | "center" | "right";
		};
	};
	outputWidth?: number;
	outputHeight?: number;
	quality?: number;
	mirrored?: boolean;
}

export async function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = src;
	});
}

export async function compositePhoto(options: CompositeOptions): Promise<Blob> {
	const {
		photo,
		template,
		caption,
		outputWidth = 1200,
		outputHeight = 1600,
		quality = 0.9,
		mirrored = false,
	} = options;

	const canvas = document.createElement("canvas");
	canvas.width = outputWidth;
	canvas.height = outputHeight;
	const ctx = canvas.getContext("2d");

	if (!ctx) {
		throw new Error("Could not get canvas context");
	}

	// Load the photo
	const photoImg = await loadImage(photo);

	// Calculate photo placement
	let photoX = 0;
	let photoY = 0;
	let photoW = outputWidth;
	let photoH = outputHeight;

	if (template?.safeArea) {
		const sa = template.safeArea;
		photoX = sa.x * outputWidth;
		photoY = sa.y * outputHeight;
		photoW = sa.width * outputWidth;
		photoH = sa.height * outputHeight;
	}

	// Draw background (white)
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0, 0, outputWidth, outputHeight);

	// Handle mirroring
	ctx.save();
	if (mirrored) {
		ctx.translate(photoX + photoW, photoY);
		ctx.scale(-1, 1);
		ctx.translate(-photoX, -photoY);
	}

	// Draw photo with cover fit
	const photoAspect = photoImg.width / photoImg.height;
	const targetAspect = photoW / photoH;

	let sx = 0,
		sy = 0,
		sw = photoImg.width,
		sh = photoImg.height;

	if (photoAspect > targetAspect) {
		// Photo is wider - crop sides
		sw = photoImg.height * targetAspect;
		sx = (photoImg.width - sw) / 2;
	} else {
		// Photo is taller - crop top/bottom
		sh = photoImg.width / targetAspect;
		sy = (photoImg.height - sh) / 2;
	}

	ctx.drawImage(photoImg, sx, sy, sw, sh, photoX, photoY, photoW, photoH);
	ctx.restore();

	// Draw template overlay if provided
	if (template?.url) {
		const templateImg = await loadImage(template.url);
		ctx.drawImage(templateImg, 0, 0, outputWidth, outputHeight);
	}

	// Draw caption if provided
	if (caption?.text && caption.position) {
		const pos = caption.position;
		ctx.font = `bold ${pos.fontSize}px system-ui, -apple-system, sans-serif`;
		ctx.fillStyle = pos.color;
		ctx.textAlign = pos.align;
		ctx.textBaseline = "top";

		let textX = pos.x;
		if (pos.align === "center") {
			textX = pos.x + pos.maxWidth / 2;
		} else if (pos.align === "right") {
			textX = pos.x + pos.maxWidth;
		}

		// Word wrap
		const words = caption.text.split(" ");
		let line = "";
		let y = pos.y;
		const lineHeight = pos.fontSize * 1.2;

		for (const word of words) {
			const testLine = `${line}${word} `;
			const metrics = ctx.measureText(testLine);
			if (metrics.width > pos.maxWidth && line !== "") {
				ctx.fillText(line.trim(), textX, y);
				line = `${word} `;
				y += lineHeight;
			} else {
				line = testLine;
			}
		}
		ctx.fillText(line.trim(), textX, y);
	}

	// Convert to blob
	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (blob) {
					resolve(blob);
				} else {
					reject(new Error("Failed to create blob"));
				}
			},
			"image/jpeg",
			quality,
		);
	});
}

/**
 * Downscales and re-encodes an image file to JPEG for guest-album uploads.
 *
 * Re-drawing through a canvas strips all EXIF metadata (notably GPS), and the
 * long-edge cap keeps uploads fast and within storage limits. Returns the
 * encoded blob plus its final pixel dimensions.
 */
export async function resizeImageFile(
	file: File,
	maxDimension = 2048,
	quality = 0.85,
): Promise<{ blob: Blob; width: number; height: number }> {
	const objectUrl = URL.createObjectURL(file);
	try {
		const img = await loadImage(objectUrl);
		const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
		const width = Math.round(img.width * scale);
		const height = Math.round(img.height * scale);

		const canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext("2d");
		if (!ctx) throw new Error("Could not get canvas context");
		ctx.drawImage(img, 0, 0, width, height);

		const blob = await new Promise<Blob>((resolve, reject) => {
			canvas.toBlob(
				(result) => (result ? resolve(result) : reject(new Error("Failed to encode image"))),
				"image/jpeg",
				quality,
			);
		});
		return { blob, width, height };
	} finally {
		URL.revokeObjectURL(objectUrl);
	}
}

/**
 * Reads the intrinsic pixel dimensions of a video file by loading just its
 * metadata into a detached `<video>` element. Unlike images, guest videos are
 * uploaded untouched (no canvas re-encode), so this is only used to record the
 * frame size alongside the upload.
 */
export async function readVideoDimensions(file: File): Promise<{ width: number; height: number }> {
	const objectUrl = URL.createObjectURL(file);
	try {
		return await new Promise<{ width: number; height: number }>((resolve, reject) => {
			const video = document.createElement("video");
			video.preload = "metadata";
			video.onloadedmetadata = () =>
				resolve({ width: video.videoWidth, height: video.videoHeight });
			video.onerror = () => reject(new Error("Could not read video metadata"));
			video.src = objectUrl;
		});
	} finally {
		URL.revokeObjectURL(objectUrl);
	}
}

export function downloadBlob(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

/**
 * Open the browser print dialog for a single image (AirPrint "manual" path).
 *
 * `pageSize` is an optional CSS `@page size` hint (e.g. `"100mm 148mm"`) so the
 * OS print dialog defaults to the right paper; it is advisory only.
 */
export async function printImage(imageUrl: string, pageSize?: string) {
	const printWindow = window.open("", "_blank");
	if (!printWindow) {
		throw new Error("Could not open print window. Please allow popups.");
	}

	const pageRule = pageSize ? `@page { size: ${pageSize}; margin: 0; }` : "@page { margin: 0; }";

	printWindow.document.write(`
		<!DOCTYPE html>
		<html>
		<head>
			<title>Print Photo</title>
			<style>
				${pageRule}
				body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
				img { max-width: 100%; max-height: 100vh; object-fit: contain; }
			</style>
		</head>
		<body>
			<img src="${imageUrl}" onload="setTimeout(() => { window.print(); window.close(); }, 100)" />
		</body>
		</html>
	`);
	printWindow.document.close();
}
