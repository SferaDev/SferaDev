"use client";

export const dynamic = "force-dynamic";

import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export default function KioskSelectPage() {
	const router = useRouter();
	const params = useParams();
	const searchParams = useSearchParams();
	const orgSlug = params.orgSlug as string;
	const eventSlug = params.eventSlug as string;
	const sessionId = searchParams.get("session") as Id<"sessions"> | null;

	const event = useQuery(api.events.getPublic, {
		organizationSlug: orgSlug,
		eventSlug: eventSlug,
	});

	const templates = useQuery(
		api.templates.listPublic,
		event ? { eventId: event.id as Id<"events"> } : "skip",
	);

	const selectTemplate = useMutation(api.sessions.selectTemplate);

	const handleSelect = async (templateId: Id<"templates">) => {
		if (!sessionId) return;

		try {
			await selectTemplate({ sessionId, templateId });
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

	if (event === undefined || templates === undefined) {
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

				{templates.length === 0 ? (
					<div className="text-center py-16">
						<p className="text-xl mb-4">No templates available</p>
						<Button onClick={handleSkip} style={{ backgroundColor: primaryColor }}>
							Continue without frame
						</Button>
					</div>
				) : (
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
						{templates.map((template: any) => (
							<button
								key={template._id}
								type="button"
								onClick={() => handleSelect(template._id as Id<"templates">)}
								className="aspect-[3/4] rounded-lg overflow-hidden border-2 border-transparent hover:border-white transition-colors"
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
