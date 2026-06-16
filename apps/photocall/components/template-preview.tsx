"use client";

import { useEffect, useRef, useState } from "react";
import { composeStrip, loadLayoutFonts } from "@/lib/compose";
import type { BoothLayout } from "@/lib/layout/types";
import { shotCount } from "@/lib/layout/types";

/** A neutral gray placeholder "photo" data URL used to preview empty slots. */
function placeholderPhoto(): string {
	if (typeof document === "undefined") return "";
	const size = 300;
	const canvas = document.createElement("canvas");
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext("2d");
	if (!ctx) return "";
	const gradient = ctx.createLinearGradient(0, 0, size, size);
	gradient.addColorStop(0, "#d4d4d8");
	gradient.addColorStop(1, "#a1a1aa");
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, size, size);
	ctx.fillStyle = "rgba(255,255,255,0.6)";
	ctx.font = "bold 120px system-ui, sans-serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("📸", size / 2, size / 2);
	return canvas.toDataURL("image/png");
}

interface TemplatePreviewProps {
	layout: BoothLayout;
	coupleNames?: string;
	eventName?: string;
	date?: string;
	className?: string;
}

/**
 * Render a small live preview of a layout by composing it with neutral gray
 * placeholder photos. Used in the template grid so guests/hosts see the actual
 * strip shape and styling before choosing.
 */
export function TemplatePreview({
	layout,
	coupleNames,
	eventName,
	date,
	className,
}: TemplatePreviewProps) {
	const [src, setSrc] = useState<string | null>(null);
	const objectUrl = useRef<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		const render = async () => {
			const placeholder = placeholderPhoto();
			const photos = Array.from({ length: shotCount(layout) }, () => placeholder);
			await loadLayoutFonts(layout);
			const result = await composeStrip({
				layout,
				photos,
				tokens: { coupleNames, eventName, date },
				targetWidth: 400,
			});
			if (cancelled) return;
			const url = URL.createObjectURL(result.blob);
			objectUrl.current = url;
			setSrc(url);
		};

		render().catch((error) => {
			console.error("Failed to render template preview:", error);
		});

		return () => {
			cancelled = true;
			if (objectUrl.current) {
				URL.revokeObjectURL(objectUrl.current);
				objectUrl.current = null;
			}
		};
	}, [layout, coupleNames, eventName, date]);

	if (!src) {
		return <div className={className} aria-hidden />;
	}

	return <img src={src} alt="Template preview" className={className} />;
}
