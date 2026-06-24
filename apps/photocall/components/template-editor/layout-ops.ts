import { normalizeCaptureIndices } from "@/lib/layout/captures";
import type { BoothLayout, GraphicLayer, PhotoSlot, TextLayer } from "@/lib/layout/types";
import type { NodeType } from "./selection";

/**
 * Immutable update helpers over a `BoothLayout`. They all return a new layout
 * so React state updates stay predictable. Editor state IS the BoothLayout —
 * these are the only mutators, keeping the normalized invariant in one place.
 */

export function updatePhotoSlot(
	layout: BoothLayout,
	id: string,
	patch: Partial<PhotoSlot>,
): BoothLayout {
	// Normalize after editing a slot: changing/clearing a captureIndex (or a
	// reuse target) must never leave a dangling reference that renders blank.
	return normalizeCaptureIndices({
		...layout,
		photoSlots: layout.photoSlots.map((slot) => (slot.id === id ? { ...slot, ...patch } : slot)),
	});
}

export function updateTextLayer(
	layout: BoothLayout,
	id: string,
	patch: Partial<TextLayer>,
): BoothLayout {
	return {
		...layout,
		textLayers: layout.textLayers.map((layer) =>
			layer.id === id ? { ...layer, ...patch } : layer,
		),
	};
}

export function updateGraphicLayer(
	layout: BoothLayout,
	id: string,
	patch: Partial<GraphicLayer>,
): BoothLayout {
	return {
		...layout,
		graphicLayers: layout.graphicLayers.map((layer) =>
			layer.id === id ? { ...layer, ...patch } : layer,
		),
	};
}

export function addPhotoSlot(layout: BoothLayout, slot: PhotoSlot): BoothLayout {
	return { ...layout, photoSlots: [...layout.photoSlots, slot] };
}

export function addTextLayer(layout: BoothLayout, layer: TextLayer): BoothLayout {
	return { ...layout, textLayers: [...layout.textLayers, layer] };
}

export function addGraphicLayer(layout: BoothLayout, layer: GraphicLayer): BoothLayout {
	return { ...layout, graphicLayers: [...layout.graphicLayers, layer] };
}

export function removeNode(layout: BoothLayout, type: NodeType, id: string): BoothLayout {
	switch (type) {
		case "photo":
			return normalizeCaptureIndices({
				...layout,
				photoSlots: layout.photoSlots.filter((slot) => slot.id !== id),
			});
		case "text":
			return { ...layout, textLayers: layout.textLayers.filter((layer) => layer.id !== id) };
		case "graphic":
			return { ...layout, graphicLayers: layout.graphicLayers.filter((layer) => layer.id !== id) };
	}
}

/** Move a node up (toward front) or down (toward back) within its own list. */
export function reorderNode(
	layout: BoothLayout,
	type: NodeType,
	id: string,
	direction: "up" | "down",
): BoothLayout {
	const move = <T extends { id: string }>(items: T[]): T[] => {
		const index = items.findIndex((item) => item.id === id);
		if (index === -1) return items;
		const target = direction === "up" ? index + 1 : index - 1;
		if (target < 0 || target >= items.length) return items;
		const next = [...items];
		[next[index], next[target]] = [next[target], next[index]];
		return next;
	};

	switch (type) {
		case "photo":
			return normalizeCaptureIndices({ ...layout, photoSlots: move(layout.photoSlots) });
		case "text":
			return { ...layout, textLayers: move(layout.textLayers) };
		case "graphic":
			return { ...layout, graphicLayers: move(layout.graphicLayers) };
	}
}
