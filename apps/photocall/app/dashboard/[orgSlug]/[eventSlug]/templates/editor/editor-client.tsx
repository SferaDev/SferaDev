"use client";

import { ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { getEventBySlug } from "@/actions/events";
import { createTemplate, getTemplate, listPresets, updateTemplate } from "@/actions/templates";
import { DashboardLanguagePicker } from "@/components/dashboard-language-picker";
import { blankLayout, deriveKind } from "@/components/template-editor/factory";
import { type PreviewTokens, SAMPLE_TOKENS } from "@/components/template-editor/preview-tokens";
import { TemplateEditor } from "@/components/template-editor/template-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth-client";
import { ALL_FILTERS, FILTER_LABELS } from "@/lib/compose/css-filters";
import { serializeLayout } from "@/lib/layout/parse";
import type { BoothLayout, FilterKind } from "@/lib/layout/types";

/**
 * Full-page WYSIWYG layout editor. Opened from the template manager either to
 * create a new layout template or to edit an existing one (`?templateId=`). The
 * editor owns a BoothLayout; on save it serializes and create/updates the
 * template, deriving kind/shotCount from the layout.
 */
export default function TemplateEditorClient() {
	const { data: session, isPending: authLoading } = useSession();
	const router = useRouter();
	const params = useParams();
	const searchParams = useSearchParams();
	const orgSlug = params.orgSlug as string;
	const eventSlug = params.eventSlug as string;
	const templateId = searchParams.get("templateId");
	const presetId = searchParams.get("preset");
	const t = useTranslations("dashboard.editor");
	const tc = useTranslations("dashboard.common");

	const { data: event } = useSWR(["events", orgSlug, eventSlug], () =>
		getEventBySlug(orgSlug, eventSlug),
	);
	const { data: presets } = useSWR("presets", () => listPresets());
	const { data: template } = useSWR(templateId ? ["template", templateId] : null, () =>
		getTemplate(templateId!),
	);

	// Resolve `{coupleNames}` `{date}` `{eventName}` in the preview using THIS
	// event's real values (falling back to sample copy for anything not set), so
	// the editor preview matches what guests will actually see.
	const previewTokens = useMemo<PreviewTokens | undefined>(
		() =>
			event
				? {
						coupleNames: event.coupleNames || event.name || SAMPLE_TOKENS.coupleNames,
						date: event.startDate
							? new Date(event.startDate).toLocaleDateString()
							: SAMPLE_TOKENS.date,
						eventName: event.name || SAMPLE_TOKENS.eventName,
					}
				: undefined,
		[event],
	);

	const [name, setName] = useState(() => t("newLayout"));
	const [allowedFilters, setAllowedFilters] = useState<FilterKind[]>([]);
	const [saving, setSaving] = useState(false);
	const [initialLayout, setInitialLayout] = useState<BoothLayout | null>(null);

	useEffect(() => {
		if (!authLoading && !session) router.push("/sign-in");
	}, [session, authLoading, router]);

	// Seed the editor once the template (edit mode) or presets (create mode) load.
	useEffect(() => {
		if (initialLayout) return;
		if (templateId) {
			if (template === undefined) return;
			setInitialLayout(template?.layout ?? blankLayout());
			if (template) {
				setName(template.name);
				setAllowedFilters(template.allowedFilters);
			}
		} else if (presetId) {
			// Create mode seeded from a preset (e.g. the manager's presets gallery).
			// Wait for the preset list, then start the canvas from the preset's
			// layout and default the name to the preset's name.
			if (presets === undefined) return;
			const preset = presets.find((p) => p.id === presetId);
			if (preset) {
				setInitialLayout({ ...preset.layout, id: crypto.randomUUID() });
				setName(preset.name);
			} else {
				setInitialLayout(blankLayout());
			}
		} else {
			setInitialLayout(blankLayout());
		}
	}, [templateId, template, presetId, presets, initialLayout]);

	const backHref = useMemo(
		() => `/dashboard/${orgSlug}/${eventSlug}/templates`,
		[orgSlug, eventSlug],
	);

	const handleSave = useCallback(
		async (layout: BoothLayout) => {
			if (!event) return;
			setSaving(true);
			try {
				// Bake the derived kind so stored metadata matches the layout's slot
				// count (e.g. a 4-slot layout must not persist as "single").
				const finalLayout = { ...layout, kind: deriveKind(layout) };
				const layoutJson = serializeLayout(finalLayout);
				if (templateId) {
					await updateTemplate(templateId, { name, layoutJson, allowedFilters });
				} else {
					await createTemplate({
						eventId: event.id,
						name,
						// Layout templates have no PNG overlay; the layout is the source of truth.
						storageKey: "",
						layoutJson,
						allowedFilters,
					});
				}
				router.push(backHref);
			} catch (error) {
				console.error("Failed to save template:", error);
				setSaving(false);
			}
		},
		[event, templateId, name, allowedFilters, router, backHref],
	);

	if (authLoading || event === undefined || presets === undefined || !initialLayout) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!event) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<h1 className="mb-2 text-2xl font-bold">{t("notFoundTitle")}</h1>
					<Button onClick={() => router.push(`/dashboard/${orgSlug}`)}>
						<ChevronLeft className="mr-2 h-4 w-4" /> {tc("back")}
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<header className="border-b">
				<div className="container mx-auto flex items-center gap-4 px-4 py-4">
					<Link href={backHref} className="text-muted-foreground hover:text-foreground">
						<ChevronLeft className="h-5 w-5" />
					</Link>
					<div className="flex-1">
						<Label htmlFor="layout-name" className="text-xs text-muted-foreground">
							{t("templateName")}
						</Label>
						<Input
							id="layout-name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="h-9 max-w-sm"
						/>
					</div>
					<div className="hidden md:block">
						<Label className="text-xs text-muted-foreground">{t("guestFilters")}</Label>
						<div className="flex flex-wrap gap-1">
							{ALL_FILTERS.map((filter) => {
								const active = allowedFilters.includes(filter);
								return (
									<Button
										key={filter}
										type="button"
										variant={active ? "default" : "outline"}
										size="sm"
										className="h-7 px-2 text-xs"
										onClick={() =>
											setAllowedFilters((current) =>
												active ? current.filter((f) => f !== filter) : [...current, filter],
											)
										}
									>
										{FILTER_LABELS[filter]}
									</Button>
								);
							})}
						</div>
					</div>
					<DashboardLanguagePicker />
				</div>
			</header>

			<TemplateEditor
				eventId={event.id}
				initialLayout={initialLayout}
				presets={presets}
				saving={saving}
				onSave={handleSave}
				previewTokens={previewTokens}
			/>
		</div>
	);
}
