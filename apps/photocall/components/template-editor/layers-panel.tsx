"use client";

import { ChevronDown, ChevronUp, Image as ImageIcon, Square, Trash2, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolveTokens } from "@/lib/compose/tokens";
import type { BoothLayout } from "@/lib/layout/types";
import { SAMPLE_TOKENS } from "./preview-tokens";
import type { NodeType, Selection } from "./selection";

interface LayersPanelProps {
	layout: BoothLayout;
	selection: Selection | null;
	onSelect: (selection: Selection) => void;
	onReorder: (type: NodeType, id: string, direction: "up" | "down") => void;
	onRemove: (type: NodeType, id: string) => void;
}

interface LayerEntry {
	type: NodeType;
	id: string;
	label: string;
}

/** A flat, reorderable list of every node (photos, graphics, text). */
export function LayersPanel({
	layout,
	selection,
	onSelect,
	onReorder,
	onRemove,
}: LayersPanelProps) {
	const entries: LayerEntry[] = [
		...layout.photoSlots.map(
			(slot, index): LayerEntry => ({
				type: "photo",
				id: slot.id,
				label: `Photo ${index + 1}`,
			}),
		),
		...layout.graphicLayers.map(
			(layer): LayerEntry => ({
				type: "graphic",
				id: layer.id,
				label: "Graphic",
			}),
		),
		...layout.textLayers.map(
			(layer): LayerEntry => ({
				type: "text",
				id: layer.id,
				label: resolveTokens(layer.content, SAMPLE_TOKENS).slice(0, 24) || "Text",
			}),
		),
	];

	return (
		<div className="space-y-1">
			<h3 className="mb-2 text-sm font-semibold">Layers</h3>
			{entries.length === 0 ? (
				<p className="text-xs text-muted-foreground">No layers yet.</p>
			) : null}
			{entries.map((entry) => {
				const active = selection?.type === entry.type && selection.id === entry.id;
				return (
					<div
						key={`${entry.type}-${entry.id}`}
						className={`flex items-center gap-1 rounded-md px-2 py-1 text-sm ${
							active ? "bg-accent" : "hover:bg-accent/50"
						}`}
					>
						<button
							type="button"
							className="flex flex-1 items-center gap-2 truncate rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card"
							onClick={() => onSelect({ type: entry.type, id: entry.id })}
						>
							<LayerIcon type={entry.type} />
							<span className="truncate">{entry.label}</span>
						</button>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							onClick={() => onReorder(entry.type, entry.id, "up")}
						>
							<ChevronUp className="h-3 w-3" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							onClick={() => onReorder(entry.type, entry.id, "down")}
						>
							<ChevronDown className="h-3 w-3" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6 text-destructive hover:text-destructive"
							onClick={() => onRemove(entry.type, entry.id)}
						>
							<Trash2 className="h-3 w-3" />
						</Button>
					</div>
				);
			})}
		</div>
	);
}

function LayerIcon({ type }: { type: NodeType }) {
	if (type === "photo") return <Square className="h-3.5 w-3.5 text-muted-foreground" />;
	if (type === "text") return <Type className="h-3.5 w-3.5 text-muted-foreground" />;
	return <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />;
}
