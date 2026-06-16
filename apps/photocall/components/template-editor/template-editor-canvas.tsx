"use client";

import type Konva from "konva";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Layer, Line, Stage, Transformer } from "react-konva";
import type {
	Background,
	BoothLayout,
	GraphicLayer,
	PhotoSlot,
	TextLayer,
} from "@/lib/layout/types";
import { BackgroundNode } from "./background-node";
import { type PixelRect, type SnapGuide, stageSize, toPixels } from "./geometry";
import { GraphicLayerNode } from "./graphic-layer-node";
import { PhotoSlotNode } from "./photo-slot-node";
import type { PreviewTokens } from "./preview-tokens";
import type { Selection } from "./selection";
import { TextEditOverlay } from "./text-edit-overlay";
import { TextLayerNode } from "./text-layer-node";

interface TemplateEditorCanvasProps {
	layout: BoothLayout;
	selection: Selection | null;
	tokens: PreviewTokens;
	/** Resolved URLs for graphic/background storage keys. */
	assetUrls: Record<string, string>;
	onSelect: (selection: Selection | null) => void;
	onUpdatePhotoSlot: (id: string, patch: Partial<PhotoSlot>) => void;
	onUpdateTextLayer: (id: string, patch: Partial<TextLayer>) => void;
	onUpdateGraphicLayer: (id: string, patch: Partial<GraphicLayer>) => void;
}

const MAX_STAGE_WIDTH = 520;

/**
 * The Konva canvas: maps the normalized BoothLayout to stage pixels, hosts a
 * single shared Transformer that attaches to the selected node, draws snap
 * guides, and overlays an HTML textarea for inline text editing. Loaded with
 * `next/dynamic` (`ssr: false`) so it never runs server-side.
 */
export function TemplateEditorCanvas({
	layout,
	selection,
	tokens,
	assetUrls,
	onSelect,
	onUpdatePhotoSlot,
	onUpdateTextLayer,
	onUpdateGraphicLayer,
}: TemplateEditorCanvasProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [stageWidth, setStageWidth] = useState(MAX_STAGE_WIDTH);
	const [guides, setGuides] = useState<SnapGuide[]>([]);
	const [editingTextId, setEditingTextId] = useState<string | null>(null);

	const transformerRef = useRef<Konva.Transformer>(null);
	const nodeRegistry = useRef(new Map<string, Konva.Node>());

	// Fit the stage to the container width (height follows the aspect ratio).
	useEffect(() => {
		const element = containerRef.current;
		if (!element || typeof ResizeObserver === "undefined") return;
		const observer = new ResizeObserver((entries) => {
			const width = entries[0]?.contentRect.width ?? MAX_STAGE_WIDTH;
			setStageWidth(Math.min(MAX_STAGE_WIDTH, Math.max(160, width)));
		});
		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	const stage = useMemo(() => stageSize(layout, stageWidth), [layout, stageWidth]);

	const registerNode = useCallback((id: string, node: Konva.Node | null) => {
		if (node) nodeRegistry.current.set(id, node);
		else nodeRegistry.current.delete(id);
	}, []);

	// Attach the shared Transformer to whichever node is selected.
	useEffect(() => {
		const transformer = transformerRef.current;
		if (!transformer) return;
		const node = selection ? (nodeRegistry.current.get(selection.id) ?? null) : null;
		transformer.nodes(node ? [node] : []);
		transformer.getLayer()?.batchDraw();
	}, [selection, layout, stage]);

	const photoRects = useMemo<PixelRect[]>(
		() => layout.photoSlots.map((slot) => toPixels(slot, stage)),
		[layout.photoSlots, stage],
	);

	const editingLayer = editingTextId
		? (layout.textLayers.find((layer) => layer.id === editingTextId) ?? null)
		: null;

	return (
		<div ref={containerRef} className="relative w-full" style={{ maxWidth: MAX_STAGE_WIDTH }}>
			<Stage
				width={stage.width}
				height={stage.height}
				className="rounded-lg border bg-white shadow-sm"
				onMouseDown={(event) => {
					if (event.target === event.target.getStage()) onSelect(null);
				}}
				onTouchStart={(event) => {
					if (event.target === event.target.getStage()) onSelect(null);
				}}
			>
				<Layer>
					<BackgroundNode
						background={layout.background}
						stage={stage}
						imageSrc={backgroundSrc(layout.background, assetUrls)}
						onSelect={() => onSelect(null)}
					/>
				</Layer>

				<Layer>
					{layout.photoSlots.map((slot, index) => (
						<PhotoSlotNode
							key={slot.id}
							slot={slot}
							index={index}
							stage={stage}
							selected={selection?.type === "photo" && selection.id === slot.id}
							siblings={photoRects.filter((_, i) => i !== index)}
							onSelect={() => onSelect({ type: "photo", id: slot.id })}
							onChange={(patch) => onUpdatePhotoSlot(slot.id, patch)}
							onSnap={setGuides}
							registerNode={registerNode}
						/>
					))}

					{layout.graphicLayers.map((graphic) => (
						<GraphicLayerNode
							key={graphic.id}
							layer={graphic}
							stage={stage}
							src={assetUrls[graphic.src] ?? null}
							selected={selection?.type === "graphic" && selection.id === graphic.id}
							siblings={photoRects}
							onSelect={() => onSelect({ type: "graphic", id: graphic.id })}
							onChange={(patch) => onUpdateGraphicLayer(graphic.id, patch)}
							onSnap={setGuides}
							registerNode={registerNode}
						/>
					))}

					{layout.textLayers.map((text) => (
						<TextLayerNode
							key={text.id}
							layer={text}
							stage={stage}
							tokens={tokens}
							siblings={photoRects}
							onSelect={() => onSelect({ type: "text", id: text.id })}
							onChange={(patch) => onUpdateTextLayer(text.id, patch)}
							onSnap={setGuides}
							onStartEdit={() => setEditingTextId(text.id)}
							registerNode={registerNode}
						/>
					))}

					<Transformer
						ref={transformerRef}
						rotateEnabled
						keepRatio={false}
						ignoreStroke
						borderStroke="#3b82f6"
						anchorStroke="#3b82f6"
						anchorFill="#ffffff"
						anchorSize={8}
						boundBoxFunc={(oldBox, newBox) =>
							newBox.width < 8 || newBox.height < 8 ? oldBox : newBox
						}
					/>

					{guides.map((guide) =>
						guide.orientation === "vertical" ? (
							<Line
								key={`v-${guide.position}`}
								points={[guide.position, 0, guide.position, stage.height]}
								stroke="#ec4899"
								strokeWidth={1}
								dash={[4, 4]}
								listening={false}
							/>
						) : (
							<Line
								key={`h-${guide.position}`}
								points={[0, guide.position, stage.width, guide.position]}
								stroke="#ec4899"
								strokeWidth={1}
								dash={[4, 4]}
								listening={false}
							/>
						),
					)}
				</Layer>
			</Stage>

			{editingLayer ? (
				<TextEditOverlay
					layer={editingLayer}
					stage={stage}
					onChange={(content) => onUpdateTextLayer(editingLayer.id, { content })}
					onClose={() => setEditingTextId(null)}
				/>
			) : null}
		</div>
	);
}

/** Resolve a background image's storage key to a URL, when applicable. */
function backgroundSrc(background: Background, assetUrls: Record<string, string>): string | null {
	return background.type === "image" ? (assetUrls[background.src] ?? null) : null;
}
