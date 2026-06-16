import { useEffect, useState } from "react";

/**
 * Load an HTMLImageElement from a URL for use as a Konva `image` prop. Returns
 * null until loaded (or on error). Client-only: guards against SSR where
 * `window`/`Image` are unavailable.
 */
export function useImageElement(src: string | null): HTMLImageElement | null {
	const [image, setImage] = useState<HTMLImageElement | null>(null);

	useEffect(() => {
		if (!src || typeof window === "undefined") {
			setImage(null);
			return;
		}

		let cancelled = false;
		const element = new window.Image();
		element.crossOrigin = "anonymous";
		element.src = src;
		element.onload = () => {
			if (!cancelled) setImage(element);
		};
		element.onerror = () => {
			if (!cancelled) setImage(null);
		};

		return () => {
			cancelled = true;
		};
	}, [src]);

	return image;
}

/**
 * Build a neutral gray placeholder image with a "Photo N" label for empty photo
 * slots on the editor canvas. Memoized per index by the caller.
 */
export function makePlaceholderImage(label: string): HTMLImageElement | null {
	if (typeof document === "undefined") return null;
	const width = 400;
	const height = 400;
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	if (!ctx) return null;

	const gradient = ctx.createLinearGradient(0, 0, width, height);
	gradient.addColorStop(0, "#d4d4d8");
	gradient.addColorStop(1, "#a1a1aa");
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, width, height);

	ctx.fillStyle = "rgba(255,255,255,0.85)";
	ctx.font = "600 40px system-ui, sans-serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(label, width / 2, height / 2);

	const image = new window.Image();
	image.src = canvas.toDataURL("image/png");
	return image;
}
