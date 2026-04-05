"use client";

import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { getPublicEvent } from "@/actions/events";
import { getKioskSession, personalizeSession } from "@/actions/sessions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function KioskPersonalizePage() {
	const router = useRouter();
	const params = useParams();
	const searchParams = useSearchParams();
	const orgSlug = params.orgSlug as string;
	const eventSlug = params.eventSlug as string;
	const sessionId = searchParams.get("session");
	const templateId = searchParams.get("template");

	const { data: event, isLoading: eventLoading } = useSWR(
		["public-event", orgSlug, eventSlug],
		() => getPublicEvent(orgSlug, eventSlug),
	);

	const { data: session, isLoading: sessionLoading } = useSWR(
		sessionId ? ["kiosk-session", sessionId] : null,
		() => getKioskSession(sessionId!),
	);

	const [caption, setCaption] = useState("");
	const [mirrored, setMirrored] = useState(event?.defaultCamera === "user");
	const [isProcessing, setIsProcessing] = useState(false);

	const handleContinue = async () => {
		if (!sessionId) return;

		setIsProcessing(true);
		try {
			await personalizeSession(sessionId, caption.trim() || undefined, mirrored);
			router.push(
				`/kiosk/${orgSlug}/${eventSlug}/result?session=${sessionId}${templateId ? `&template=${templateId}` : ""}`,
			);
		} catch (error) {
			console.error("Failed to personalize:", error);
		} finally {
			setIsProcessing(false);
		}
	};

	if (eventLoading || sessionLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-black text-white">
				<Loader2 className="h-12 w-12 animate-spin" />
			</div>
		);
	}

	if (!event || !sessionId || !session) {
		router.push(`/kiosk/${orgSlug}/${eventSlug}`);
		return null;
	}

	const primaryColor = event.primaryColor || "#6366f1";

	return (
		<div className="min-h-screen bg-black text-white p-8">
			<div className="max-w-4xl mx-auto">
				<div className="flex items-center justify-between mb-8">
					<Button
						variant="ghost"
						onClick={() =>
							router.push(
								`/kiosk/${orgSlug}/${eventSlug}/capture?session=${sessionId}${templateId ? `&template=${templateId}` : ""}`,
							)
						}
						className="text-white"
					>
						<ArrowLeft className="h-5 w-5 mr-2" />
						Retake
					</Button>
					<h1 className="text-2xl font-bold">Add a Caption</h1>
					<div className="w-24" />
				</div>

				<div className="grid md:grid-cols-2 gap-8">
					{/* Preview */}
					<div className="aspect-3/4 bg-muted rounded-lg overflow-hidden">
						{session.capturedImageUrl && (
							<img
								src={session.capturedImageUrl}
								alt="Captured preview"
								className="w-full h-full object-cover"
								style={{ transform: mirrored ? "scaleX(-1)" : "none" }}
							/>
						)}
					</div>

					{/* Controls */}
					<div className="flex flex-col justify-center space-y-6">
						<div>
							<label htmlFor="caption" className="block text-sm font-medium mb-2">
								Caption (optional)
							</label>
							<Input
								id="caption"
								value={caption}
								onChange={(e) => setCaption(e.target.value)}
								placeholder="Add a message..."
								className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
								maxLength={100}
							/>
							<p className="text-sm text-white/50 mt-1">{caption.length}/100</p>
						</div>

						<div className="flex items-center justify-between">
							<span className="text-sm font-medium">Mirror image</span>
							<Button
								variant={mirrored ? "default" : "outline"}
								size="sm"
								onClick={() => setMirrored(!mirrored)}
								className={mirrored ? "" : "border-white/20 text-white"}
							>
								{mirrored ? "On" : "Off"}
							</Button>
						</div>

						<Button
							size="lg"
							onClick={handleContinue}
							disabled={isProcessing}
							className="w-full"
							style={{ backgroundColor: primaryColor }}
						>
							{isProcessing ? (
								<Loader2 className="h-5 w-5 animate-spin" />
							) : (
								<>
									Continue
									<ArrowRight className="h-5 w-5 ml-2" />
								</>
							)}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
