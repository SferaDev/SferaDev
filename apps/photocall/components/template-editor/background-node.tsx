import { Image as KonvaImage, Rect } from "react-konva";
import type { Background } from "@/lib/layout/types";
import { useImageElement } from "./use-image";

interface BackgroundNodeProps {
	background: Background;
	stage: { width: number; height: number };
	/** Resolved URL for an image background's storage key (or null). */
	imageSrc: string | null;
	onSelect: () => void;
}

/**
 * Render the layout background on the Konva stage. Gradient direction matches
 * the compositor convention (0deg = top→bottom, clockwise) by deriving the
 * gradient start/end points from the angle.
 */
export function BackgroundNode({ background, stage, imageSrc, onSelect }: BackgroundNodeProps) {
	const image = useImageElement(background.type === "image" ? imageSrc : null);

	if (background.type === "color") {
		return (
			<Rect
				x={0}
				y={0}
				width={stage.width}
				height={stage.height}
				fill={background.color}
				onMouseDown={onSelect}
				onTap={onSelect}
			/>
		);
	}

	if (background.type === "gradient") {
		const radians = ((background.angle - 90) * Math.PI) / 180;
		const cx = stage.width / 2;
		const cy = stage.height / 2;
		const half = Math.sqrt(stage.width ** 2 + stage.height ** 2) / 2;
		const dx = Math.cos(radians) * half;
		const dy = Math.sin(radians) * half;
		const colorStops = background.stops.flatMap((stop) => [stop.offset, stop.color]);

		return (
			<Rect
				x={0}
				y={0}
				width={stage.width}
				height={stage.height}
				fillLinearGradientStartPoint={{ x: cx - dx, y: cy - dy }}
				fillLinearGradientEndPoint={{ x: cx + dx, y: cy + dy }}
				fillLinearGradientColorStops={colorStops}
				onMouseDown={onSelect}
				onTap={onSelect}
			/>
		);
	}

	// image background
	if (!image) {
		return (
			<Rect
				x={0}
				y={0}
				width={stage.width}
				height={stage.height}
				fill="#e4e4e7"
				onMouseDown={onSelect}
				onTap={onSelect}
			/>
		);
	}

	const imageAspect = image.width / image.height;
	const stageAspect = stage.width / stage.height;
	let drawWidth = stage.width;
	let drawHeight = stage.height;
	if (background.fit === "contain") {
		if (imageAspect > stageAspect) drawHeight = stage.width / imageAspect;
		else drawWidth = stage.height * imageAspect;
	}

	return (
		<>
			<Rect x={0} y={0} width={stage.width} height={stage.height} fill="#ffffff" />
			<KonvaImage
				image={image}
				x={(stage.width - drawWidth) / 2}
				y={(stage.height - drawHeight) / 2}
				width={drawWidth}
				height={drawHeight}
				onMouseDown={onSelect}
				onTap={onSelect}
			/>
		</>
	);
}
