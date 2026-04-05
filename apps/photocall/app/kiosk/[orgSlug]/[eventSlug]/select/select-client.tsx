"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { getPublicEvent } from "@/actions/events";
import { selectTemplate } from "@/actions/sessions";
import { listPublicTemplates } from "@/actions/templates";
import { Button } from "@/components/ui/button";

export default function KioskSelectPage() {
	const router = useRouter();
	const params = useParams();
	const searchParams = useSearchParams();
	const orgSlug = params.orgSlug as string;
	const eventSlug = params.eventSlug as string;
	const sessionId = searchParams.get("session");

	const { data: event, isLoading: eventLoading } = useSWR(
		["public-event", orgSlug, eventSlug],
		() => getPublicEvent(orgSlug, eventSlug),
	);

	const { data: templates, isLoading: templatesLoading } = useSWR(
		event ? ["public-templates", event.id] : null,
		() => listPublicTemplates(event!.id),
	);

	const handleSelect = async (templateId: string) => {
		if (!sessionId) return;

		try {
			await selectTemplate(sessionId, templateId);
			router.push(
				`/kiosk/${orgSlug}/${eventSlug}/capture?session=${sessionId}&template=${templateId}`,
			);
		} catch (error) {
			console.error("Failed to select template:", error);
		}
	};

	const handleSkip = () => {
		if (!sessionId) return;
		router.push(`/kiosk/${orgSlug}/${eventSlug}/capture?session=${sessionId}`);
	};

	if (eventLoading || templatesLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-black text-white">
				<Loader2 className="h-12 w-12 animate-spin" />
			</div>
		);
	}

	if (!event || !sessionId) {
		router.push(`/kiosk/${orgSlug}/${eventSlug}`);
		return null;
	}

	const primaryColor = event.primaryColor || "#6366f1";

	return (
		<div className="min-h-screen bg-black text-white p-8">
			<div className="max-w-6xl mx-auto">
				<div className="flex items-center justify-between mb-8">
					<Button
						variant="ghost"
						onClick={() => router.push(`/kiosk/${orgSlug}/${eventSlug}`)}
						className="text-white"
					>
						<ArrowLeft className="h-5 w-5 mr-2" />
						Back
					</Button>
					<h1 className="text-2xl font-bold">Choose a Frame</h1>
					<Button variant="ghost" onClick={handleSkip} className="text-white">
						Skip
					</Button>
				</div>

				{templates && templates.length === 0 ? (
					<div className="text-center py-16">
						<p className="text-xl mb-4">No templates available</p>
						<Button onClick={handleSkip} style={{ backgroundColor: primaryColor }}>
							Continue without frame
						</Button>
					</div>
				) : (
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
						{templates?.map((template) => (
							<button
								key={template.id}
								type="button"
								onClick={() => handleSelect(template.id)}
								className="aspect-3/4 rounded-lg overflow-hidden border-2 border-transparent hover:border-white transition-colors"
							>
								{template.thumbnailUrl && (
									<img
										src={template.thumbnailUrl}
										alt={template.name}
										className="w-full h-full object-cover"
									/>
								)}
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
