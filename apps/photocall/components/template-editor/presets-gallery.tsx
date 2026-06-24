"use client";

import Link from "next/link";
import type { PresetSummary } from "@/actions/templates";
import { TemplatePreview } from "@/components/template-preview";

interface PresetsGalleryProps {
	presets: PresetSummary[];
	/** Builds the editor href for a given preset (so the editor seeds from it). */
	editorHref: (presetId: string) => string;
	/** Localized "{n} photos" label for the preset's shot count. */
	shotCountLabel: (shotCount: number) => string;
}

/**
 * One-click presets gallery for the template manager. Each card renders a live
 * TemplatePreview of the preset and links straight into the WYSIWYG editor with
 * `?preset=<id>`, so the admin starts designing from a real layout instantly.
 */
export function PresetsGallery({ presets, editorHref, shotCountLabel }: PresetsGalleryProps) {
	return (
		<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
			{presets.map((preset) => (
				<Link
					key={preset.id}
					href={editorHref(preset.id)}
					className="group flex flex-col overflow-hidden rounded-lg border bg-card transition-colors hover:border-primary"
				>
					<div className="flex aspect-3/4 items-center justify-center bg-muted/40 p-2">
						<TemplatePreview layout={preset.layout} className="max-h-full w-auto" />
					</div>
					<div className="p-3">
						<p className="truncate text-sm font-medium group-hover:text-primary">{preset.name}</p>
						<p className="text-xs text-muted-foreground">{shotCountLabel(preset.shotCount)}</p>
					</div>
				</Link>
			))}
		</div>
	);
}
