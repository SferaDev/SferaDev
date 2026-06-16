import type { BoothLayout, GraphicLayer, PhotoSlot, TextLayer } from "@/lib/layout/types";

/** The kind of node a selection points at. */
export type NodeType = "photo" | "text" | "graphic";

/** A reference to the currently selected node, or null for the background. */
export interface Selection {
	type: NodeType;
	id: string;
}

/** A discriminated resolved node, used by the inspector/layers panel. */
export type ResolvedNode =
	| { type: "photo"; node: PhotoSlot; index: number }
	| { type: "text"; node: TextLayer; index: number }
	| { type: "graphic"; node: GraphicLayer; index: number };

/** Resolve a selection against the layout to the concrete node, or null. */
export function resolveSelection(
	layout: BoothLayout,
	selection: Selection | null,
): ResolvedNode | null {
	if (!selection) return null;
	switch (selection.type) {
		case "photo": {
			const index = layout.photoSlots.findIndex((slot) => slot.id === selection.id);
			return index === -1 ? null : { type: "photo", node: layout.photoSlots[index], index };
		}
		case "text": {
			const index = layout.textLayers.findIndex((layer) => layer.id === selection.id);
			return index === -1 ? null : { type: "text", node: layout.textLayers[index], index };
		}
		case "graphic": {
			const index = layout.graphicLayers.findIndex((layer) => layer.id === selection.id);
			return index === -1 ? null : { type: "graphic", node: layout.graphicLayers[index], index };
		}
	}
}
