import type Konva from "konva";
import { useEffect, useRef } from "react";
import { Text as KonvaText } from "react-konva";
import { resolveTokens } from "@/lib/compose/tokens";
import type { TextLayer } from "@/lib/layout/types";
import { clamp, type PixelRect, type SnapGuide, snapRect } from "./geometry";
import type { PreviewTokens } from "./preview-tokens";

interface TextLayerNodeProps {
	layer: TextLayer;
	stage: { width: number; height: number };
	tokens: PreviewTokens;
	siblings: PixelRect[];
	onSelect: () => void;
	onChange: (patch: Partial<TextLayer>) => void;
	onSnap: (guides: SnapGuide[]) => void;
	onStartEdit: () => void;
	registerNode: (id: string, node: Konva.Node | null) => void;
}

/**
 * A draggable/resizable/rotatable text layer rendered with Konva.Text. Tokens
 * are resolved with sample values so the editor shows realistic copy; the
 * stored content keeps the raw `{token}` placeholders.
 */
export function TextLayerNode({
	layer,
	stage,
	tokens,
	siblings,
	onSelect,
	onChange,
	onSnap,
	onStartEdit,
	registerNode,
}: TextLayerNodeProps) {
	const textRef = useRef<Konva.Text>(null);
	const x = layer.x * stage.width;
	const y = layer.y * stage.height;
	const width = layer.width * stage.width;
	const fontSize = layer.fontSize * stage.height;
	const resolved = resolveTokens(layer.content, tokens) || " ";

	useEffect(() => {
		registerNode(layer.id, textRef.current);
		return () => registerNode(layer.id, null);
	}, [layer.id, registerNode]);

	return (
		<KonvaText
			ref={textRef}
			id={`node-text-${layer.id}`}
			name="editor-node"
			text={resolved}
			x={x}
			y={y}
			width={width}
			rotation={layer.rotation}
			fontFamily={layer.fontFamily}
			fontSize={fontSize}
			fontStyle={`${layer.fontStyle} ${layer.fontWeight}`.trim()}
			fill={layer.color}
			align={layer.align}
			lineHeight={layer.lineHeight}
			letterSpacing={layer.letterSpacing * stage.width}
			opacity={layer.opacity}
			draggable
			onMouseDown={onSelect}
			onTap={onSelect}
			onDblClick={onStartEdit}
			onDblTap={onStartEdit}
			onDragMove={(event) => {
				const node = event.target;
				const snapped = snapRect(
					{ x: node.x(), y: node.y(), width, height: node.height() },
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
				const node = textRef.current;
				if (!node) return;
				const scaleX = node.scaleX();
				const scaleY = node.scaleY();
				node.scaleX(1);
				node.scaleY(1);
				// Width follows horizontal scale; font size follows the vertical scale.
				onChange({
					x: node.x() / stage.width,
					y: node.y() / stage.height,
					width: Math.max(0.02, (width * scaleX) / stage.width),
					fontSize: Math.max(0.005, (fontSize * scaleY) / stage.height),
					rotation: node.rotation(),
				});
			}}
		/>
	);
}
