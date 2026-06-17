import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalPage } from "@/components/legal-page";
import { PRIVACY_SECTIONS } from "@/lib/legal-content";

type Props = {
	params: Promise<{ locale: string }>;
};

/** Date these policies were last revised (ISO); formatted per-locale at render. */
const LAST_UPDATED_ISO = "2026-06-17";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: "legal" });
	return { title: `${t("privacyTitle")} · Photocall` };
}

export default async function PrivacyPage({ params }: Props) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("legal");

	const lastUpdated = t("lastUpdated", {
		date: new Date(LAST_UPDATED_ISO).toLocaleDateString(locale, {
			year: "numeric",
			month: "long",
			day: "numeric",
		}),
	});

	return (
		<LegalPage
			title={t("privacyTitle")}
			lastUpdated={lastUpdated}
			backLabel={t("backToHome")}
			disclaimer={t("disclaimer")}
			sections={PRIVACY_SECTIONS}
		/>
	);
}
