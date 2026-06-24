"use client";

import { Shield } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import { getPublicEvent } from "@/actions/events";
import { abandonSession } from "@/actions/sessions";
import { Button } from "@/components/ui/button";
import { useKioskFont } from "@/hooks/use-kiosk-font";
import { BRANDED_CTA_FEEDBACK, DEFAULT_BRAND_COLOR, PRIMARY_CTA_CLASS } from "@/lib/branding";
import { cn } from "@/lib/utils";

export default function KioskConsentPage() {
	const router = useRouter();
	const params = useParams();
	const searchParams = useSearchParams();
	const orgSlug = params.orgSlug as string;
	const eventSlug = params.eventSlug as string;
	const sessionId = searchParams.get("session");
	const t = useTranslations("kiosk.consent");

	const { data: event } = useSWR(["public-event", orgSlug, eventSlug], () =>
		getPublicEvent(orgSlug, eventSlug),
	);

	const headingFontFamily = useKioskFont(event?.fontFamily);

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
					<p className="text-muted-foreground">{t("loading")}</p>
				</div>
			</div>
		);
	}

	const primaryColor = event.primaryColor || DEFAULT_BRAND_COLOR;
	const accentColor = event.accentColor || primaryColor;
	// Admin override falls back to the i18n consent body when empty.
	const consentBody = event.consentText || t("description");

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8">
			<div className="max-w-2xl text-center">
				<Shield className="h-20 w-20 mx-auto mb-6 opacity-80" style={{ color: accentColor }} />

				<h1
					className="text-4xl md:text-5xl font-bold mb-6"
					style={headingFontFamily ? { fontFamily: headingFontFamily } : undefined}
				>
					{t("title")}
				</h1>

				<p className="text-2xl md:text-3xl mb-6 opacity-80 leading-relaxed">{consentBody}</p>

				{event.retentionDays && (
					<p className="text-xl mb-8 opacity-60">{t("retention", { days: event.retentionDays })}</p>
				)}

				<div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
					<Button
						size="xl"
						onClick={handleAgree}
						className={cn(PRIMARY_CTA_CLASS, BRANDED_CTA_FEEDBACK, "h-16 px-12 text-2xl")}
						style={{ backgroundColor: primaryColor }}
					>
						{t("agree")}
					</Button>
					<Button
						size="xl"
						variant="outline"
						onClick={handleDecline}
						className={cn(
							PRIMARY_CTA_CLASS,
							"h-16 px-12 text-2xl",
							"bg-transparent border-white/30 text-white hover:bg-white/10",
						)}
					>
						{t("decline")}
					</Button>
				</div>
			</div>
		</div>
	);
}
