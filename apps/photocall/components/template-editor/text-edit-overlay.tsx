"use client";

import { useEffect, useRef } from "react";
import type { TextLayer } from "@/lib/layout/types";

interface TextEditOverlayProps {
	layer: TextLayer;
	stage: { width: number; height: number };
	onChange: (content: string) => void;
	onClose: () => void;
}

/**
 * An HTML textarea positioned over a text layer for inline editing. Edits the
 * raw content (including `{token}` placeholders); Escape or blur commits and
 * closes. Positioned in normalized→pixel stage space to line up with the node.
 */
export function TextEditOverlay({ layer, stage, onChange, onClose }: TextEditOverlayProps) {
	const ref = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		const element = ref.current;
		if (!element) return;
		element.focus();
		element.select();
	}, []);

	const left = layer.x * stage.width;
	const top = layer.y * stage.height;
	const width = layer.width * stage.width;
	const fontSize = layer.fontSize * stage.height;

	return (
		<textarea
			ref={ref}
			defaultValue={layer.content}
			onChange={(event) => onChange(event.target.value)}
			onBlur={onClose}
			onKeyDown={(event) => {
				if (event.key === "Escape") {
					event.preventDefault();
					onClose();
				}
			}}
			className="absolute z-10 resize-none overflow-hidden rounded border border-blue-500 bg-white/95 p-1 shadow"
			style={{
				left,
				top,
				width,
				fontSize,
				fontFamily: layer.fontFamily,
				fontWeight: layer.fontWeight,
				fontStyle: layer.fontStyle,
				color: layer.color,
				textAlign: layer.align,
				lineHeight: layer.lineHeight,
				transform: `rotate(${layer.rotation}deg)`,
				transformOrigin: "0 0",
			}}
		/>
	);
}
