import type Konva from "konva";
import { useEffect, useMemo, useRef } from "react";
import { Group, Image as KonvaImage, Rect } from "react-konva";
import type { PhotoSlot } from "@/lib/layout/types";
import { clamp, type PixelRect, type SnapGuide, snapRect, toPixels } from "./geometry";
import { makePlaceholderImage } from "./use-image";

interface PhotoSlotNodeProps {
	slot: PhotoSlot;
	index: number;
	stage: { width: number; height: number };
	selected: boolean;
	siblings: PixelRect[];
	onSelect: () => void;
	onChange: (patch: Partial<PhotoSlot>) => void;
	onSnap: (guides: SnapGuide[]) => void;
	/** Register the underlying Konva node so a shared Transformer can attach. */
	registerNode: (id: string, node: Konva.Node | null) => void;
}

/**
 * A draggable/resizable/rotatable photo slot rendered as a gray placeholder. It
 * registers its Konva node with the parent so a single shared Transformer can
 * attach to the selected slot.
 */
export function PhotoSlotNode({
	slot,
	index,
	stage,
	selected,
	siblings,
	onSelect,
	onChange,
	onSnap,
	registerNode,
}: PhotoSlotNodeProps) {
	const groupRef = useRef<Konva.Group>(null);
	const rect = toPixels(slot, stage);

	const placeholder = useMemo(() => makePlaceholderImage(`Photo ${index + 1}`), [index]);
	const cornerRadius = slot.cornerRadius * stage.width;
	const borderWidth = slot.borderWidth * stage.width;

	useEffect(() => {
		registerNode(slot.id, groupRef.current);
		return () => registerNode(slot.id, null);
	}, [slot.id, registerNode]);

	return (
		<Group
			ref={groupRef}
			id={`node-photo-${slot.id}`}
			name="editor-node"
			x={rect.x}
			y={rect.y}
			width={rect.width}
			height={rect.height}
			rotation={slot.rotation}
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
			{placeholder ? (
				<KonvaImage
					image={placeholder}
					width={rect.width}
					height={rect.height}
					cornerRadius={cornerRadius}
				/>
			) : (
				<Rect width={rect.width} height={rect.height} cornerRadius={cornerRadius} fill="#d4d4d8" />
			)}
			{slot.borderColor && borderWidth > 0 ? (
				<Rect
					x={borderWidth / 2}
					y={borderWidth / 2}
					width={rect.width - borderWidth}
					height={rect.height - borderWidth}
					cornerRadius={cornerRadius}
					stroke={slot.borderColor}
					strokeWidth={borderWidth}
					listening={false}
				/>
			) : null}
			{selected ? (
				<Rect
					width={rect.width}
					height={rect.height}
					cornerRadius={cornerRadius}
					stroke="#3b82f6"
					strokeWidth={1.5}
					dash={[4, 4]}
					listening={false}
				/>
			) : null}
		</Group>
	);
}
