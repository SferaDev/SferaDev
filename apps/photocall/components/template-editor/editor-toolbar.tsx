"use client";

import { ImagePlus, Loader2, Plus, Save, Type } from "lucide-react";
import type { PresetSummary } from "@/actions/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ALL_FILTERS, FILTER_LABELS } from "@/lib/compose/css-filters";
import type { BoothLayout, FilterKind, Orientation, PaperSize } from "@/lib/layout/types";
import { PAPER_SIZE_MM } from "@/lib/layout/types";

interface EditorToolbarProps {
	layout: BoothLayout;
	presets: PresetSummary[];
	saving: boolean;
	onAddPhotoSlot: () => void;
	onAddTextLayer: () => void;
	onAddGraphic: () => void;
	onApplyPreset: (preset: PresetSummary) => void;
	onUpdatePrint: (patch: Partial<BoothLayout["print"]>) => void;
	onUpdateLayout: (patch: Partial<Pick<BoothLayout, "filter">>) => void;
	onSave: () => void;
}

const PAPER_LABELS: Record<PaperSize, string> = {
	selphy_postcard: "Selphy Postcard",
	"4x6": '4×6"',
	"5x7": '5×7"',
	"2x6_strip": '2×6" Strip',
	"6x8": '6×8"',
	a4: "A4",
	letter: "Letter",
};

const PAPER_SIZES = Object.keys(PAPER_SIZE_MM) as PaperSize[];

/** The top toolbar: add nodes, start from a preset, paper/print + layout settings, save. */
export function EditorToolbar({
	layout,
	presets,
	saving,
	onAddPhotoSlot,
	onAddTextLayer,
	onAddGraphic,
	onApplyPreset,
	onUpdatePrint,
	onUpdateLayout,
	onSave,
}: EditorToolbarProps) {
	return (
		<div className="flex flex-wrap items-end gap-3 border-b bg-card p-3">
			<div className="flex items-center gap-1">
				<Button variant="outline" size="sm" onClick={onAddPhotoSlot}>
					<Plus className="mr-1 h-4 w-4" /> Photo
				</Button>
				<Button variant="outline" size="sm" onClick={onAddTextLayer}>
					<Type className="mr-1 h-4 w-4" /> Text
				</Button>
				<Button variant="outline" size="sm" onClick={onAddGraphic}>
					<ImagePlus className="mr-1 h-4 w-4" /> Graphic
				</Button>
			</div>

			<Separator orientation="vertical" className="h-9" />

			<div className="w-40">
				<Label className="text-xs text-muted-foreground">Start from preset</Label>
				<Select
					value=""
					onValueChange={(id) => {
						const preset = presets.find((p) => p.id === id);
						if (preset) onApplyPreset(preset);
					}}
				>
					<SelectTrigger className="h-8">
						<SelectValue placeholder="Choose preset…" />
					</SelectTrigger>
					<SelectContent>
						{presets.map((preset) => (
							<SelectItem key={preset.id} value={preset.id}>
								{preset.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="w-36">
				<Label className="text-xs text-muted-foreground">Paper size</Label>
				<Select
					value={layout.print.paperSize}
					onValueChange={(value) => onUpdatePrint({ paperSize: value as PaperSize })}
				>
					<SelectTrigger className="h-8">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{PAPER_SIZES.map((size) => (
							<SelectItem key={size} value={size}>
								{PAPER_LABELS[size]}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="w-28">
				<Label className="text-xs text-muted-foreground">Orientation</Label>
				<Select
					value={layout.print.orientation}
					onValueChange={(value) => onUpdatePrint({ orientation: value as Orientation })}
				>
					<SelectTrigger className="h-8">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="portrait">Portrait</SelectItem>
						<SelectItem value="landscape">Landscape</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="w-20">
				<Label className="text-xs text-muted-foreground">DPI</Label>
				<Input
					type="number"
					min={72}
					max={600}
					step={1}
					value={layout.print.dpi}
					onChange={(event) => onUpdatePrint({ dpi: Number(event.target.value) })}
					className="h-8"
				/>
			</div>

			{/* 2-up tiling only makes sense for a vertical strip (two portrait
			    strips fit side-by-side on one 4×6 sheet). */}
			{layout.kind === "strip_vertical" ? (
				<div className="flex items-center gap-2 pb-1.5">
					<Switch
						id="tile-two-up"
						checked={layout.print.tileTwoUp === true}
						onCheckedChange={(checked) => onUpdatePrint({ tileTwoUp: checked })}
					/>
					<Label htmlFor="tile-two-up" className="text-xs text-muted-foreground">
						Print 2 strips per sheet (2-up)
					</Label>
				</div>
			) : null}

			<div className="w-32">
				<Label className="text-xs text-muted-foreground">Layout filter</Label>
				<Select
					value={layout.filter}
					onValueChange={(value) => onUpdateLayout({ filter: value as FilterKind })}
				>
					<SelectTrigger className="h-8">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{ALL_FILTERS.map((filter) => (
							<SelectItem key={filter} value={filter}>
								{FILTER_LABELS[filter]}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="ml-auto">
				<Button size="sm" onClick={onSave} disabled={saving}>
					{saving ? (
						<Loader2 className="mr-1 h-4 w-4 animate-spin" />
					) : (
						<Save className="mr-1 h-4 w-4" />
					)}
					Save
				</Button>
			</div>
		</div>
	);
}
