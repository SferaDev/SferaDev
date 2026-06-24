import type Konva from "konva";
import { useEffect, useRef } from "react";
import { Group, Image as KonvaImage, Text as KonvaText, Rect } from "react-konva";
import type { GraphicLayer } from "@/lib/layout/types";
import { clamp, type PixelRect, type SnapGuide, snapRect, toPixels } from "./geometry";
import { useImageElement } from "./use-image";

interface GraphicLayerNodeProps {
	layer: GraphicLayer;
	stage: { width: number; height: number };
	/** Resolved URL for the layer's storage key (or null while loading). */
	src: string | null;
	selected: boolean;
	siblings: PixelRect[];
	onSelect: () => void;
	onChange: (patch: Partial<GraphicLayer>) => void;
	onSnap: (guides: SnapGuide[]) => void;
	registerNode: (id: string, node: Konva.Node | null) => void;
}

/** A draggable/resizable/rotatable image/sticker layer. */
export function GraphicLayerNode({
	layer,
	stage,
	src,
	selected,
	siblings,
	onSelect,
	onChange,
	onSnap,
	registerNode,
}: GraphicLayerNodeProps) {
	const groupRef = useRef<Konva.Group>(null);
	const rect = toPixels(layer, stage);
	const image = useImageElement(src);

	useEffect(() => {
		registerNode(layer.id, groupRef.current);
		return () => registerNode(layer.id, null);
	}, [layer.id, registerNode]);

	return (
		<Group
			ref={groupRef}
			id={`node-graphic-${layer.id}`}
			name="editor-node"
			x={rect.x}
			y={rect.y}
			width={rect.width}
			height={rect.height}
			rotation={layer.rotation}
			opacity={layer.opacity}
			draggable
			onMouseDown={onSelect}
			onTap={onSelect}
			onDragMove={(event) => {
				const node = event.target;
				const snapped = snapRect(
					{ x: node.x(), y: node.y(), width: rect.width, height: rect.height },
					siblings,
					stage,
				);
				node.x(snapped.x);
				node.y(snapped.y);
				onSnap(snapped.guides);
			}}
			onDragEnd={(event) => {
				onSnap([]);
				onChange({
					x: clamp(event.target.x() / stage.width, -0.5, 1.5),
					y: clamp(event.target.y() / stage.height, -0.5, 1.5),
				});
			}}
			onTransformEnd={() => {
				const node = groupRef.current;
				if (!node) return;
				const scaleX = node.scaleX();
				const scaleY = node.scaleY();
				node.scaleX(1);
				node.scaleY(1);
				onChange({
					x: node.x() / stage.width,
					y: node.y() / stage.height,
					width: Math.max(0.02, (rect.width * scaleX) / stage.width),
					height: Math.max(0.02, (rect.height * scaleY) / stage.height),
					rotation: node.rotation(),
				});
			}}
		>
			{image ? (
				<KonvaImage image={image} width={rect.width} height={rect.height} />
			) : (
				<>
					<Rect
						width={rect.width}
						height={rect.height}
						fill="#f4f4f5"
						stroke="#d4d4d8"
						dash={[4, 4]}
					/>
					<KonvaText
						text="Image"
						width={rect.width}
						height={rect.height}
						align="center"
						verticalAlign="middle"
						fontSize={12}
						fill="#71717a"
						listening={false}
					/>
				</>
			)}
			{selected ? (
				<Rect
					width={rect.width}
					height={rect.height}
					stroke="#e11d48"
					strokeWidth={1.5}
					dash={[4, 4]}
					listening={false}
				/>
			) : null}
		</Group>
	);
}
