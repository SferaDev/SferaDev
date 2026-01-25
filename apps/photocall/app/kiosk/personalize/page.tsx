"use client";

import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, ArrowRight, FlipHorizontal, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useIdleTimeout } from "@/hooks/use-idle-timeout";

function PersonalizePageContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const sessionId = searchParams.get("session") as Id<"sessions"> | null;
	const templateId = searchParams.get("template") as Id<"templates"> | null;

	const session = useQuery(api.sessions.get, sessionId ? { sessionId } : "skip");
	const template = useQuery(api.templates.get, templateId ? { templateId } : "skip");
	const settings = useQuery(api.settings.get);
	const personalize = useMutation(api.sessions.personalize);

	const [caption, setCaption] = useState("");
	const [mirrored, setMirrored] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);

	// Idle timeout
	useIdleTimeout({
		timeout: settings?.idleTimeoutSeconds ?? 60,
		onIdle: () => router.push("/kiosk"),
		enabled: true,
	});

	const handleContinue = async () => {
		if (!sessionId) return;

		setIsProcessing(true);
		try {
			await personalize({
				sessionId,
				caption: caption || undefined,
				mirrored,
			});
			router.push(`/kiosk/result?session=${sessionId}&template=${templateId ?? ""}`);
		} catch (error) {
			console.error("Failed to personalize:", error);
			setIsProcessing(false);
		}
	};

	if (!session) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-12 w-12 animate-spin text-rose-500" />
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col">
			{/* Header */}
			<div className="flex items-center justify-between p-4">
				<Link href={`/kiosk/capture?session=${sessionId}&template=${templateId ?? ""}`}>
					<Button variant="ghost" size="lg" className="gap-2">
						<ArrowLeft className="h-6 w-6" />
						Back
					</Button>
				</Link>
				<h1 className="text-xl font-bold md:text-2xl">Add a Caption</h1>
				<div className="w-24" />
			</div>

			{/* Preview Area */}
			<div className="flex flex-1 flex-col items-center justify-center gap-6 p-4 md:flex-row md:gap-10">
				{/* Photo Preview */}
				<div className="relative aspect-[3/4] w-full max-w-md overflow-hidden rounded-2xl bg-black shadow-2xl">
					{session.capturedImageUrl && (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={session.capturedImageUrl}
							alt="Captured preview"
							className={`h-full w-full object-cover ${mirrored ? "scale-x-[-1]" : ""}`}
						/>
					)}

					{/* Template Overlay */}
					{template?.url && (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={template.url}
							alt="Frame"
							className="pointer-events-none absolute inset-0 h-full w-full object-contain"
						/>
					)}

					{/* Caption Preview */}
					{caption && (
						<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
							<p className="text-center text-xl font-semibold text-white">{caption}</p>
						</div>
					)}
				</div>

				{/* Options */}
				<div className="w-full max-w-md space-y-6">
					<div className="space-y-3">
						<Label htmlFor="caption" className="text-lg">
							Caption (optional)
						</Label>
						<Input
							id="caption"
							value={caption}
							onChange={(e) => setCaption(e.target.value.slice(0, 40))}
							placeholder="Add a message..."
							className="h-14 text-lg"
							maxLength={40}
						/>
						<p className="text-sm text-muted-foreground">{caption.length}/40 characters</p>
					</div>

					<div className="flex items-center justify-between rounded-lg border p-4">
						<div className="flex items-center gap-3">
							<FlipHorizontal className="h-6 w-6 text-muted-foreground" />
							<div>
								<Label className="text-base">Mirror Photo</Label>
								<p className="text-sm text-muted-foreground">Flip the image horizontally</p>
							</div>
						</div>
						<Switch checked={mirrored} onCheckedChange={setMirrored} />
					</div>
				</div>
			</div>

			{/* Continue Button */}
			<div className="p-6">
				<div className="flex items-center justify-center gap-4">
					<Button variant="ghost" size="xl" onClick={handleContinue} disabled={isProcessing}>
						Skip
					</Button>

					<Button size="xl" onClick={handleContinue} disabled={isProcessing} className="gap-2">
						{isProcessing ? (
							<>
								<Loader2 className="h-6 w-6 animate-spin" />
								Processing...
							</>
						) : (
							<>
								Continue
								<ArrowRight className="h-6 w-6" />
							</>
						)}
					</Button>
				</div>
			</div>
		</div>
	);
}

export default function PersonalizePage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center">
					<Loader2 className="h-12 w-12 animate-spin text-rose-500" />
				</div>
			}
		>
			<PersonalizePageContent />
		</Suspense>
	);
}
