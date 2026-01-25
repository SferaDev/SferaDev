"use client";

import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, ImageOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useIdleTimeout } from "@/hooks/use-idle-timeout";

type Template = { _id: Id<"templates">; name: string; url: string | null };

export default function TemplateSelectPage() {
	const router = useRouter();
	const templates = useQuery(api.templates.list, { enabledOnly: true });
	const settings = useQuery(api.settings.get);
	const createSession = useMutation(api.sessions.create);
	const selectTemplate = useMutation(api.sessions.selectTemplate);

	const [sessionId, setSessionId] = useState<Id<"sessions"> | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	// Idle timeout to return to attract screen
	useIdleTimeout({
		timeout: settings?.idleTimeoutSeconds ?? 60,
		onIdle: () => router.push("/kiosk"),
		enabled: true,
	});

	// Create session on mount
	useEffect(() => {
		const initSession = async () => {
			const id = await createSession({ language: "en" });
			setSessionId(id);
		};
		initSession();
	}, [createSession]);

	const handleSelectTemplate = async (templateId: Id<"templates">) => {
		if (!sessionId) return;
		setIsLoading(true);

		try {
			await selectTemplate({ sessionId, templateId });
			// Store session and template in URL params
			router.push(`/kiosk/capture?session=${sessionId}&template=${templateId}`);
		} catch (error) {
			console.error("Failed to select template:", error);
			setIsLoading(false);
		}
	};

	const handleSkipTemplate = () => {
		if (!sessionId) return;
		router.push(`/kiosk/capture?session=${sessionId}`);
	};

	if (!templates) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-12 w-12 animate-spin text-rose-500" />
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col p-6">
			{/* Header */}
			<div className="mb-6 flex items-center justify-between">
				<Link href="/kiosk">
					<Button variant="ghost" size="lg" className="gap-2">
						<ArrowLeft className="h-6 w-6" />
						Back
					</Button>
				</Link>
				<h1 className="text-2xl font-bold md:text-3xl">Choose a Frame</h1>
				<div className="w-24" /> {/* Spacer for centering */}
			</div>

			{/* Template Grid */}
			{templates.length === 0 ? (
				<div className="flex flex-1 flex-col items-center justify-center text-center">
					<ImageOff className="mb-4 h-16 w-16 text-muted-foreground" />
					<h2 className="mb-2 text-xl font-semibold">No Templates Available</h2>
					<p className="mb-6 text-muted-foreground">You can still take a photo without a frame.</p>
					<Button size="xl" onClick={handleSkipTemplate} disabled={!sessionId || isLoading}>
						Continue Without Frame
					</Button>
				</div>
			) : (
				<>
					<div className="mb-6 grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{templates.map((template: Template) => (
							<button
								type="button"
								key={template._id}
								onClick={() => handleSelectTemplate(template._id)}
								disabled={isLoading}
								className="group relative aspect-[3/4] overflow-hidden rounded-xl border-4 border-transparent bg-muted transition-all hover:border-rose-500 hover:shadow-xl focus:border-rose-500 focus:outline-none disabled:opacity-50"
							>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={template.url ?? ""}
									alt={template.name}
									className="h-full w-full object-contain transition-transform group-hover:scale-105"
								/>
								<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
									<p className="text-lg font-semibold text-white">{template.name}</p>
								</div>
							</button>
						))}
					</div>

					{/* Skip option */}
					<div className="text-center">
						<Button
							variant="ghost"
							size="lg"
							onClick={handleSkipTemplate}
							disabled={!sessionId || isLoading}
						>
							Skip - No Frame
						</Button>
					</div>
				</>
			)}

			{/* Loading overlay */}
			{isLoading && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
					<Loader2 className="h-12 w-12 animate-spin text-rose-500" />
				</div>
			)}
		</div>
	);
}
