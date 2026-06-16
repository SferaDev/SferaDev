"use client";

import { useEffect, useRef, useState } from "react";
import { composeStrip, loadLayoutFonts } from "@/lib/compose";
import type { BoothLayout } from "@/lib/layout/types";
import { shotCount } from "@/lib/layout/types";
import type { PreviewTokens } from "./preview-tokens";
import { makePlaceholderImage } from "./use-image";

interface EditorPreviewProps {
	layout: BoothLayout;
	tokens: PreviewTokens;
	/** Resolved URLs for graphic/background storage keys. */
	assetUrls: Record<string, string>;
}

/**
 * Live preview rendered via the real `composeStrip` compositor with gray sample
 * photos, so hosts see exactly what guests will get. Debounced and cancellable
 * so rapid edits don't thrash the canvas.
 */
export function EditorPreview({ layout, tokens, assetUrls }: EditorPreviewProps) {
	const [src, setSrc] = useState<string | null>(null);
	const objectUrl = useRef<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		const timer = setTimeout(() => {
			const render = async () => {
				const placeholder = makePlaceholderImage("Photo");
				const photoSrc = placeholder?.src ?? "";
				const photos = Array.from({ length: shotCount(layout) }, () => photoSrc);
				await loadLayoutFonts(layout);
				const result = await composeStrip({
					layout,
					photos,
					tokens,
					targetWidth: 360,
					resolveAssetUrl: (key) => assetUrls[key] ?? key,
				});
				if (cancelled) return;
				if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
				const url = URL.createObjectURL(result.blob);
				objectUrl.current = url;
				setSrc(url);
			};
			render().catch((error) => console.error("Preview render failed:", error));
		}, 250);

		return () => {
			cancelled = true;
			clearTimeout(timer);
		};
	}, [layout, tokens, assetUrls]);

	useEffect(() => {
		return () => {
			if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
		};
	}, []);

	return (
		<div className="space-y-2">
			<h3 className="text-sm font-semibold">Live preview</h3>
			<div className="flex justify-center rounded-lg border bg-muted/40 p-3">
				{src ? (
					<img src={src} alt="Live preview" className="max-h-[60vh] rounded shadow-sm" />
				) : (
					<div className="h-48 w-32 animate-pulse rounded bg-muted" />
				)}
			</div>
		</div>
	);
}
