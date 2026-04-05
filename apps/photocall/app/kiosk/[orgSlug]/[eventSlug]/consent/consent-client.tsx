"use client";

import { Shield } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { getPublicEvent } from "@/actions/events";
import { abandonSession } from "@/actions/sessions";
import { Button } from "@/components/ui/button";

export default function KioskConsentPage() {
	const router = useRouter();
	const params = useParams();
	const searchParams = useSearchParams();
	const orgSlug = params.orgSlug as string;
	const eventSlug = params.eventSlug as string;
	const sessionId = searchParams.get("session");

	const { data: event } = useSWR(["public-event", orgSlug, eventSlug], () =>
		getPublicEvent(orgSlug, eventSlug),
	);

	const handleAgree = () => {
		if (!sessionId) return;
		router.push(`/kiosk/${orgSlug}/${eventSlug}/select?session=${sessionId}`);
	};

	const handleDecline = async () => {
		if (sessionId) {
			try {
				await abandonSession(sessionId);
			} catch (error) {
				console.error("Failed to abandon session:", error);
			}
		}
		router.push(`/kiosk/${orgSlug}/${eventSlug}`);
	};

	if (!event || !sessionId) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-black text-white">
				<div className="text-center">
					<p className="text-muted-foreground">Loading...</p>
				</div>
			</div>
		);
	}

	const primaryColor = event.primaryColor || "#6366f1";

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8">
			<div className="max-w-lg text-center">
				<Shield className="h-16 w-16 mx-auto mb-6 opacity-80" />

				<h1 className="text-3xl md:text-4xl font-bold mb-6">Photo Consent</h1>

				<p className="text-lg md:text-xl mb-6 opacity-80 leading-relaxed">
					By continuing, you agree to have your photo taken and stored for this event. Your photo
					may be displayed in the event slideshow and available for download via a unique link.
				</p>

				{event.retentionDays && (
					<p className="text-base mb-8 opacity-60">
						Photos will be automatically deleted after {event.retentionDays} days.
					</p>
				)}

				<div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
					<Button
						size="lg"
						onClick={handleAgree}
						className="text-lg px-10 py-6 rounded-full"
						style={{ backgroundColor: primaryColor }}
					>
						I Agree
					</Button>
					<Button
						size="lg"
						variant="outline"
						onClick={handleDecline}
						className="text-lg px-10 py-6 rounded-full border-white/30 text-white hover:bg-white/10"
					>
						No Thanks
					</Button>
				</div>
			</div>
		</div>
	);
}
