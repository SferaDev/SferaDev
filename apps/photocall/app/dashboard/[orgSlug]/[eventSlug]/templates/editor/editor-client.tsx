"use client";

import { ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { getEventBySlug } from "@/actions/events";
import { createTemplate, getTemplate, listPresets, updateTemplate } from "@/actions/templates";
import { blankLayout } from "@/components/template-editor/factory";
import { TemplateEditor } from "@/components/template-editor/template-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth-client";
import { ALL_FILTERS } from "@/lib/compose/css-filters";
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

	const { data: event } = useSWR(["events", orgSlug, eventSlug], () =>
		getEventBySlug(orgSlug, eventSlug),
	);
	const { data: presets } = useSWR("presets", () => listPresets());
	const { data: template } = useSWR(templateId ? ["template", templateId] : null, () =>
		getTemplate(templateId!),
	);

	const [name, setName] = useState("New layout");
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
		} else {
			setInitialLayout(blankLayout());
		}
	}, [templateId, template, initialLayout]);

	const backHref = useMemo(
		() => `/dashboard/${orgSlug}/${eventSlug}/templates`,
		[orgSlug, eventSlug],
	);

	const handleSave = useCallback(
		async (layout: BoothLayout) => {
			if (!event) return;
			setSaving(true);
			try {
				const layoutJson = serializeLayout(layout);
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
					<h1 className="mb-2 text-2xl font-bold">Event not found</h1>
					<Button onClick={() => router.push(`/dashboard/${orgSlug}`)}>
						<ChevronLeft className="mr-2 h-4 w-4" /> Back
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
							Template name
						</Label>
						<Input
							id="layout-name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="h-9 max-w-sm"
						/>
					</div>
					<div className="hidden md:block">
						<Label className="text-xs text-muted-foreground">Guest filters</Label>
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
										{filter}
									</Button>
								);
							})}
						</div>
					</div>
				</div>
			</header>

			<TemplateEditor
				eventId={event.id}
				initialLayout={initialLayout}
				presets={presets}
				saving={saving}
				onSave={handleSave}
			/>
		</div>
	);
}
