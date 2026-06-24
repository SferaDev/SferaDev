"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	generateTemplateAssetUploadUrl,
	type PresetSummary,
	resolveAssetUrls,
} from "@/actions/templates";
import { Card, CardContent } from "@/components/ui/card";
import type {
	Background,
	BoothLayout,
	GraphicLayer,
	PhotoSlot,
	TextLayer,
} from "@/lib/layout/types";
import { EditorInspector } from "./editor-inspector";
import { EditorPreview } from "./editor-preview";
import { EditorToolbar } from "./editor-toolbar";
import { createGraphicLayer, createPhotoSlot, createTextLayer } from "./factory";
import { LayersPanel } from "./layers-panel";
import {
	addGraphicLayer,
	addPhotoSlot,
	addTextLayer,
	removeNode,
	reorderNode,
	updateGraphicLayer,
	updatePhotoSlot,
	updateTextLayer,
} from "./layout-ops";
import { type PreviewTokens, SAMPLE_TOKENS } from "./preview-tokens";
import { resolveSelection, type Selection } from "./selection";

// react-konva must never run during SSR (it needs the DOM canvas). Loading the
// stage with `ssr: false` keeps the Next build from choking on the canvas.
const TemplateEditorCanvas = dynamic(
	() => import("./template-editor-canvas").then((mod) => mod.TemplateEditorCanvas),
	{
		ssr: false,
		loading: () => (
			<div className="flex h-[480px] w-full animate-pulse items-center justify-center rounded-lg border bg-muted/40 text-sm text-muted-foreground">
				Loading canvas…
			</div>
		),
	},
);

interface TemplateEditorProps {
	eventId: string;
	initialLayout: BoothLayout;
	presets: PresetSummary[];
	saving: boolean;
	onSave: (layout: BoothLayout) => void;
	/**
	 * Token values used to render `{coupleNames}` `{date}` `{eventName}` in the
	 * canvas + live preview. Defaults to generic sample copy; the editor page
	 * passes the current event's values so the preview matches the real event.
	 */
	previewTokens?: PreviewTokens;
}

/**
 * WYSIWYG layout editor. The editor state IS the BoothLayout — every mutation
 * goes through the normalized layout-ops helpers, and the Konva canvas only
 * scales by stage size for rendering. Asset uploads return storage keys stored
 * directly in the layout; their URLs are resolved on demand for rendering.
 */
export function TemplateEditor({
	eventId,
	initialLayout,
	presets,
	saving,
	onSave,
	previewTokens,
}: TemplateEditorProps) {
	const tokens = previewTokens ?? SAMPLE_TOKENS;
	const [layout, setLayout] = useState<BoothLayout>(initialLayout);
	const [selection, setSelection] = useState<Selection | null>(null);
	const [assetUrls, setAssetUrls] = useState<Record<string, string>>({});
	const fileInputRef = useRef<HTMLInputElement>(null);
	const uploadTargetRef = useRef<"graphic" | "background">("graphic");

	// Collect every storage key referenced by the layout and resolve any not yet
	// in the cache to readable URLs for the canvas/preview.
	const referencedKeys = useMemo(() => {
		const keys: string[] = [];
		if (layout.background.type === "image" && layout.background.src) {
			keys.push(layout.background.src);
		}
		for (const graphic of layout.graphicLayers) {
			if (graphic.src) keys.push(graphic.src);
		}
		return keys;
	}, [layout.background, layout.graphicLayers]);

	useEffect(() => {
		const missing = referencedKeys.filter((key) => !(key in assetUrls));
		if (missing.length === 0) return;
		let cancelled = false;
		resolveAssetUrls(eventId, missing)
			.then((resolved) => {
				if (!cancelled) setAssetUrls((current) => ({ ...current, ...resolved }));
			})
			.catch((error) => console.error("Failed to resolve assets:", error));
		return () => {
			cancelled = true;
		};
	}, [referencedKeys, assetUrls, eventId]);

	const resolved = resolveSelection(layout, selection);

	const onUpdatePhotoSlot = useCallback(
		(id: string, patch: Partial<PhotoSlot>) =>
			setLayout((current) => updatePhotoSlot(current, id, patch)),
		[],
	);
	const onUpdateTextLayer = useCallback(
		(id: string, patch: Partial<TextLayer>) =>
			setLayout((current) => updateTextLayer(current, id, patch)),
		[],
	);
	const onUpdateGraphicLayer = useCallback(
		(id: string, patch: Partial<GraphicLayer>) =>
			setLayout((current) => updateGraphicLayer(current, id, patch)),
		[],
	);

	const onAddPhotoSlot = useCallback(() => {
		const slot = createPhotoSlot();
		setLayout((current) => addPhotoSlot(current, slot));
		setSelection({ type: "photo", id: slot.id });
	}, []);

	const onAddTextLayer = useCallback(() => {
		const layer = createTextLayer();
		setLayout((current) => addTextLayer(current, layer));
		setSelection({ type: "text", id: layer.id });
	}, []);

	const triggerUpload = useCallback((target: "graphic" | "background") => {
		uploadTargetRef.current = target;
		fileInputRef.current?.click();
	}, []);

	const handleFileSelected = useCallback(
		async (file: File) => {
			const { uploadUrl, storageKey } = await generateTemplateAssetUploadUrl(eventId, file.type);
			const response = await fetch(uploadUrl, {
				method: "PUT",
				headers: { "Content-Type": file.type },
				body: file,
			});
			if (!response.ok) throw new Error("Upload failed");

			// Optimistically map the new key to a local object URL for instant preview.
			const localUrl = URL.createObjectURL(file);
			setAssetUrls((current) => ({ ...current, [storageKey]: localUrl }));

			if (uploadTargetRef.current === "background") {
				setLayout((current) => ({
					...current,
					background: { type: "image", src: storageKey, fit: "cover" },
				}));
				setSelection(null);
			} else {
				const layer = createGraphicLayer(storageKey);
				setLayout((current) => addGraphicLayer(current, layer));
				setSelection({ type: "graphic", id: layer.id });
			}
		},
		[eventId],
	);

	const onUpdatePrint = useCallback(
		(patch: Partial<BoothLayout["print"]>) =>
			setLayout((current) => ({ ...current, print: { ...current.print, ...patch } })),
		[],
	);

	const onUpdateLayout = useCallback(
		(patch: Partial<Pick<BoothLayout, "filter" | "aspectRatio">>) =>
			setLayout((current) => ({ ...current, ...patch })),
		[],
	);

	const onUpdateBackground = useCallback(
		(background: Background) => setLayout((current) => ({ ...current, background })),
		[],
	);

	const onApplyPreset = useCallback((preset: PresetSummary) => {
		// Keep a fresh id; adopt the preset's slots/layers/print wholesale.
		setLayout((current) => ({ ...preset.layout, id: current.id }));
		setSelection(null);
	}, []);

	return (
		<div className="flex flex-col">
			<EditorToolbar
				layout={layout}
				presets={presets}
				saving={saving}
				onAddPhotoSlot={onAddPhotoSlot}
				onAddTextLayer={onAddTextLayer}
				onAddGraphic={() => triggerUpload("graphic")}
				onApplyPreset={onApplyPreset}
				onUpdatePrint={onUpdatePrint}
				onUpdateLayout={onUpdateLayout}
				onSave={() => onSave(layout)}
			/>

			<input
				ref={fileInputRef}
				type="file"
				accept="image/png,image/jpeg,image/webp"
				className="hidden"
				onChange={(event) => {
					const file = event.target.files?.[0];
					event.target.value = "";
					if (file) handleFileSelected(file).catch((error) => console.error(error));
				}}
			/>

			<div className="grid gap-4 p-4 lg:grid-cols-[16rem_1fr_18rem]">
				<Card className="order-2 lg:order-1">
					<CardContent className="p-3">
						<LayersPanel
							layout={layout}
							selection={selection}
							onSelect={setSelection}
							onReorder={(type, id, direction) =>
								setLayout((current) => reorderNode(current, type, id, direction))
							}
							onRemove={(type, id) => {
								setLayout((current) => removeNode(current, type, id));
								setSelection((current) =>
									current && current.type === type && current.id === id ? null : current,
								);
							}}
						/>
					</CardContent>
				</Card>

				<div className="order-1 flex flex-col items-center gap-4 lg:order-2">
					<TemplateEditorCanvas
						layout={layout}
						selection={selection}
						tokens={tokens}
						assetUrls={assetUrls}
						onSelect={setSelection}
						onUpdatePhotoSlot={onUpdatePhotoSlot}
						onUpdateTextLayer={onUpdateTextLayer}
						onUpdateGraphicLayer={onUpdateGraphicLayer}
					/>
					<EditorPreview layout={layout} tokens={tokens} assetUrls={assetUrls} />
				</div>

				<Card className="order-3">
					<CardContent className="p-3">
						<EditorInspector
							layout={layout}
							selected={resolved}
							onUpdatePhotoSlot={onUpdatePhotoSlot}
							onUpdateTextLayer={onUpdateTextLayer}
							onUpdateGraphicLayer={onUpdateGraphicLayer}
							onUpdateBackground={onUpdateBackground}
							onUploadBackgroundImage={() => triggerUpload("background")}
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
