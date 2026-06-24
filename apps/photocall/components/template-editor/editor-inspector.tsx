"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { ALL_FILTERS, FILTER_LABELS } from "@/lib/compose/css-filters";
import { BUNDLED_FONTS } from "@/lib/compose/fonts";
import type {
	Background,
	BoothLayout,
	FitMode,
	GraphicLayer,
	PhotoSlot,
	TextAlign,
	TextLayer,
} from "@/lib/layout/types";
import type { ResolvedNode } from "./selection";
import { TOKEN_INSERTS } from "./tokens-ui";

interface EditorInspectorProps {
	layout: BoothLayout;
	selected: ResolvedNode | null;
	onUpdatePhotoSlot: (id: string, patch: Partial<PhotoSlot>) => void;
	onUpdateTextLayer: (id: string, patch: Partial<TextLayer>) => void;
	onUpdateGraphicLayer: (id: string, patch: Partial<GraphicLayer>) => void;
	onUpdateBackground: (background: Background) => void;
	onUploadBackgroundImage: () => void;
}

/** A normalized 0..1 value edited as a 0..100 percentage. */
function PercentField({
	label,
	value,
	onChange,
	min = 0,
	max = 100,
	step = 0.5,
}: {
	label: string;
	value: number;
	onChange: (value: number) => void;
	min?: number;
	max?: number;
	step?: number;
}) {
	return (
		<div>
			<Label className="text-xs text-muted-foreground">{label}</Label>
			<Input
				type="number"
				min={min}
				max={max}
				step={step}
				value={Number((value * 100).toFixed(2))}
				onChange={(event) => onChange(Number(event.target.value) / 100)}
				className="h-8"
			/>
		</div>
	);
}

function NumberField({
	label,
	value,
	onChange,
	min,
	max,
	step = 1,
}: {
	label: string;
	value: number;
	onChange: (value: number) => void;
	min?: number;
	max?: number;
	step?: number;
}) {
	return (
		<div>
			<Label className="text-xs text-muted-foreground">{label}</Label>
			<Input
				type="number"
				min={min}
				max={max}
				step={step}
				value={Number(value.toFixed(2))}
				onChange={(event) => onChange(Number(event.target.value))}
				className="h-8"
			/>
		</div>
	);
}

function ColorField({
	label,
	value,
	onChange,
}: {
	label: string;
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<div>
			<Label className="text-xs text-muted-foreground">{label}</Label>
			<Input
				type="color"
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className="h-8 p-1"
			/>
		</div>
	);
}

/**
 * Inspector for the selected node (position/size/rotation as normalized
 * percentages plus type-specific props) and the layout background when nothing
 * is selected.
 */
export function EditorInspector({
	layout,
	selected,
	onUpdatePhotoSlot,
	onUpdateTextLayer,
	onUpdateGraphicLayer,
	onUpdateBackground,
	onUploadBackgroundImage,
}: EditorInspectorProps) {
	if (!selected) {
		return (
			<BackgroundInspector
				background={layout.background}
				onUpdateBackground={onUpdateBackground}
				onUploadBackgroundImage={onUploadBackgroundImage}
			/>
		);
	}

	if (selected.type === "photo") {
		const slot = selected.node;
		const update = (patch: Partial<PhotoSlot>) => onUpdatePhotoSlot(slot.id, patch);
		// "Repeat photo N" may only point at a NEW capture defined by an EARLIER
		// slot (one without its own captureIndex). That count bounds the options.
		// Mutations re-run normalizeCaptureIndices, so a slot's captureIndex is
		// always within this range — no need to surface an out-of-range value.
		const repeatOptionCount = layout.photoSlots
			.slice(0, selected.index)
			.filter((earlier) => earlier.captureIndex === undefined).length;
		return (
			<div className="space-y-4">
				<h3 className="text-sm font-semibold">Photo slot {selected.index + 1}</h3>
				<div>
					<Label className="text-xs text-muted-foreground">Photo source</Label>
					<Select
						value={slot.captureIndex === undefined ? "new" : String(slot.captureIndex)}
						onValueChange={(value) =>
							update({ captureIndex: value === "new" ? undefined : Number(value) })
						}
					>
						<SelectTrigger className="h-8">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="new">New photo</SelectItem>
							{Array.from({ length: repeatOptionCount }, (_, index) => index + 1).map(
								(captureNumber) => (
									<SelectItem key={captureNumber} value={String(captureNumber)}>
										Repeat photo {captureNumber}
									</SelectItem>
								),
							)}
						</SelectContent>
					</Select>
				</div>
				<div className="grid grid-cols-2 gap-2">
					<PercentField label="X %" value={slot.x} onChange={(v) => update({ x: v })} />
					<PercentField label="Y %" value={slot.y} onChange={(v) => update({ y: v })} />
					<PercentField label="Width %" value={slot.width} onChange={(v) => update({ width: v })} />
					<PercentField
						label="Height %"
						value={slot.height}
						onChange={(v) => update({ height: v })}
					/>
					<NumberField
						label="Rotation °"
						value={slot.rotation}
						min={-180}
						max={180}
						onChange={(v) => update({ rotation: v })}
					/>
					<PercentField
						label="Corner %"
						value={slot.cornerRadius}
						max={50}
						onChange={(v) => update({ cornerRadius: v })}
					/>
				</div>
				<div>
					<Label className="text-xs text-muted-foreground">Fit</Label>
					<Select value={slot.fit} onValueChange={(value) => update({ fit: value as FitMode })}>
						<SelectTrigger className="h-8">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="cover">Cover</SelectItem>
							<SelectItem value="contain">Contain</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div>
					<Label className="text-xs text-muted-foreground">Filter override</Label>
					<Select
						value={slot.filterOverride ?? "inherit"}
						onValueChange={(value) =>
							update({
								filterOverride: value === "inherit" ? null : (value as PhotoSlot["filterOverride"]),
							})
						}
					>
						<SelectTrigger className="h-8">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="inherit">Inherit layout</SelectItem>
							{ALL_FILTERS.map((filter) => (
								<SelectItem key={filter} value={filter}>
									{FILTER_LABELS[filter]}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<Separator />
				<div className="grid grid-cols-2 gap-2">
					<ColorField
						label="Border color"
						value={slot.borderColor ?? "#ffffff"}
						onChange={(v) => update({ borderColor: v })}
					/>
					<PercentField
						label="Border %"
						value={slot.borderWidth}
						max={10}
						step={0.1}
						onChange={(v) => update({ borderWidth: v })}
					/>
				</div>
				{slot.borderColor ? (
					<Button
						variant="outline"
						size="sm"
						onClick={() => update({ borderColor: null, borderWidth: 0 })}
					>
						Remove border
					</Button>
				) : null}
			</div>
		);
	}

	if (selected.type === "text") {
		const layer = selected.node;
		const update = (patch: Partial<TextLayer>) => onUpdateTextLayer(layer.id, patch);
		return (
			<div className="space-y-4">
				<h3 className="text-sm font-semibold">Text layer</h3>
				<div>
					<Label className="text-xs text-muted-foreground">Content</Label>
					<Textarea
						value={layer.content}
						onChange={(event) => update({ content: event.target.value })}
						rows={2}
						className="text-sm"
					/>
					<div className="mt-1 flex flex-wrap gap-1">
						{TOKEN_INSERTS.map((token) => (
							<Button
								key={token.value}
								variant="outline"
								size="sm"
								className="h-6 px-2 text-xs"
								onClick={() => update({ content: `${layer.content}${token.value}` })}
							>
								{token.label}
							</Button>
						))}
					</div>
				</div>
				<div className="grid grid-cols-2 gap-2">
					<PercentField label="X %" value={layer.x} onChange={(v) => update({ x: v })} />
					<PercentField label="Y %" value={layer.y} onChange={(v) => update({ y: v })} />
					<PercentField
						label="Width %"
						value={layer.width}
						onChange={(v) => update({ width: v })}
					/>
					<PercentField
						label="Font size %"
						value={layer.fontSize}
						max={30}
						step={0.1}
						onChange={(v) => update({ fontSize: v })}
					/>
					<NumberField
						label="Rotation °"
						value={layer.rotation}
						min={-180}
						max={180}
						onChange={(v) => update({ rotation: v })}
					/>
					<NumberField
						label="Opacity"
						value={layer.opacity}
						min={0}
						max={1}
						step={0.05}
						onChange={(v) => update({ opacity: v })}
					/>
				</div>
				<div>
					<Label className="text-xs text-muted-foreground">Font family</Label>
					<Select value={layer.fontFamily} onValueChange={(value) => update({ fontFamily: value })}>
						<SelectTrigger className="h-8">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{Object.keys(BUNDLED_FONTS).map((family) => (
								<SelectItem key={family} value={family}>
									{family}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="grid grid-cols-2 gap-2">
					<div>
						<Label className="text-xs text-muted-foreground">Weight</Label>
						<Select
							value={layer.fontWeight}
							onValueChange={(value) => update({ fontWeight: value as TextLayer["fontWeight"] })}
						>
							<SelectTrigger className="h-8">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="normal">Normal</SelectItem>
								<SelectItem value="bold">Bold</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div>
						<Label className="text-xs text-muted-foreground">Style</Label>
						<Select
							value={layer.fontStyle}
							onValueChange={(value) => update({ fontStyle: value as TextLayer["fontStyle"] })}
						>
							<SelectTrigger className="h-8">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="normal">Normal</SelectItem>
								<SelectItem value="italic">Italic</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
				<div className="grid grid-cols-2 gap-2">
					<ColorField label="Color" value={layer.color} onChange={(v) => update({ color: v })} />
					<div>
						<Label className="text-xs text-muted-foreground">Align</Label>
						<Select
							value={layer.align}
							onValueChange={(value) => update({ align: value as TextAlign })}
						>
							<SelectTrigger className="h-8">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="left">Left</SelectItem>
								<SelectItem value="center">Center</SelectItem>
								<SelectItem value="right">Right</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>
		);
	}

	const graphic = selected.node;
	const update = (patch: Partial<GraphicLayer>) => onUpdateGraphicLayer(graphic.id, patch);
	return (
		<div className="space-y-4">
			<h3 className="text-sm font-semibold">Graphic layer</h3>
			<div className="grid grid-cols-2 gap-2">
				<PercentField label="X %" value={graphic.x} onChange={(v) => update({ x: v })} />
				<PercentField label="Y %" value={graphic.y} onChange={(v) => update({ y: v })} />
				<PercentField
					label="Width %"
					value={graphic.width}
					onChange={(v) => update({ width: v })}
				/>
				<PercentField
					label="Height %"
					value={graphic.height}
					onChange={(v) => update({ height: v })}
				/>
				<NumberField
					label="Rotation °"
					value={graphic.rotation}
					min={-180}
					max={180}
					onChange={(v) => update({ rotation: v })}
				/>
				<NumberField
					label="Opacity"
					value={graphic.opacity}
					min={0}
					max={1}
					step={0.05}
					onChange={(v) => update({ opacity: v })}
				/>
			</div>
			<div>
				<Label className="text-xs text-muted-foreground">Blend mode</Label>
				<Select
					value={graphic.blendMode}
					onValueChange={(value) => update({ blendMode: value as GraphicLayer["blendMode"] })}
				>
					<SelectTrigger className="h-8">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{BLEND_MODES.map((mode) => (
							<SelectItem key={mode} value={mode}>
								{mode}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}

const BLEND_MODES: GraphicLayer["blendMode"][] = [
	"normal",
	"multiply",
	"screen",
	"overlay",
	"darken",
	"lighten",
	"color-dodge",
	"color-burn",
	"hard-light",
	"soft-light",
	"difference",
	"exclusion",
];

function BackgroundInspector({
	background,
	onUpdateBackground,
	onUploadBackgroundImage,
}: {
	background: Background;
	onUpdateBackground: (background: Background) => void;
	onUploadBackgroundImage: () => void;
}) {
	return (
		<div className="space-y-4">
			<h3 className="text-sm font-semibold">Background</h3>
			<div>
				<Label className="text-xs text-muted-foreground">Type</Label>
				<Select
					value={background.type}
					onValueChange={(value) => {
						if (value === "color") onUpdateBackground({ type: "color", color: "#ffffff" });
						else if (value === "gradient")
							onUpdateBackground({
								type: "gradient",
								angle: 180,
								stops: [
									{ color: "#ffffff", offset: 0 },
									{ color: "#e4e4e7", offset: 1 },
								],
							});
						else onUpdateBackground({ type: "image", src: "", fit: "cover" });
					}}
				>
					<SelectTrigger className="h-8">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="color">Solid color</SelectItem>
						<SelectItem value="gradient">Gradient</SelectItem>
						<SelectItem value="image">Image</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{background.type === "color" ? (
				<ColorField
					label="Color"
					value={background.color}
					onChange={(color) => onUpdateBackground({ type: "color", color })}
				/>
			) : null}

			{background.type === "gradient" ? (
				<div className="space-y-2">
					<NumberField
						label="Angle °"
						value={background.angle}
						min={0}
						max={360}
						onChange={(angle) => onUpdateBackground({ ...background, angle })}
					/>
					{background.stops.map((stop, index) => (
						<div key={`${stop.offset}-${index}`} className="grid grid-cols-2 gap-2">
							<ColorField
								label={`Stop ${index + 1}`}
								value={stop.color}
								onChange={(color) =>
									onUpdateBackground({
										...background,
										stops: background.stops.map((s, i) => (i === index ? { ...s, color } : s)),
									})
								}
							/>
							<PercentField
								label="Position %"
								value={stop.offset}
								onChange={(offset) =>
									onUpdateBackground({
										...background,
										stops: background.stops.map((s, i) => (i === index ? { ...s, offset } : s)),
									})
								}
							/>
						</div>
					))}
				</div>
			) : null}

			{background.type === "image" ? (
				<div className="space-y-2">
					<Button variant="outline" size="sm" onClick={onUploadBackgroundImage}>
						Upload image
					</Button>
					<div>
						<Label className="text-xs text-muted-foreground">Fit</Label>
						<Select
							value={background.fit}
							onValueChange={(value) =>
								onUpdateBackground({ ...background, fit: value as FitMode })
							}
						>
							<SelectTrigger className="h-8">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="cover">Cover</SelectItem>
								<SelectItem value="contain">Contain</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			) : null}
		</div>
	);
}
