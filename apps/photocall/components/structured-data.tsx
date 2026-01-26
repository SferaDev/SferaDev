import { getTranslations } from "next-intl/server";

interface StructuredDataProps {
	locale: string;
}

export async function StructuredData({ locale }: StructuredDataProps) {
	const t = await getTranslations();

	const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://photocall.app";

	// Organization schema
	const organizationSchema = {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: "Photocall",
		url: baseUrl,
		logo: `${baseUrl}/logo.png`,
		description: t("metadata.description"),
		sameAs: [],
	};

	// SoftwareApplication schema
	const softwareSchema = {
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		name: "Photocall",
		applicationCategory: "BusinessApplication",
		operatingSystem: "Web",
		description: t("metadata.description"),
		url: baseUrl,
		offers: [
			{
				"@type": "Offer",
				price: "0",
				priceCurrency: "USD",
				name: t("pricing.free.title"),
				description: "1 free event with 10 photos included",
			},
			{
				"@type": "Offer",
				price: "49",
				priceCurrency: "USD",
				name: t("pricing.paid.title"),
				description: "200 photos included per event with custom branding",
			},
		],
		featureList: [
			"Photo booth kiosk mode",
			"QR code sharing",
			"Custom templates and overlays",
			"Multi-event management",
			"Analytics dashboard",
		],
	};

	// WebPage schema
	const webPageSchema = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: t("metadata.title"),
		description: t("metadata.description"),
		url: `${baseUrl}/${locale}`,
		inLanguage: locale,
		isPartOf: {
			"@type": "WebSite",
			name: "Photocall",
			url: baseUrl,
		},
	};

	// FAQPage schema for common questions
	const faqSchema = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: [
			{
				"@type": "Question",
				name: "What is Photocall?",
				acceptedAnswer: {
					"@type": "Answer",
					text: "Photocall is a modern photo booth kiosk application for weddings, parties, corporate events, and celebrations. It provides easy photo capture, beautiful templates, and instant QR code sharing.",
				},
			},
			{
				"@type": "Question",
				name: "How much does Photocall cost?",
				acceptedAnswer: {
					"@type": "Answer",
					text: "Photocall offers a free tier with 1 event and 10 photos included. Paid events are $49 each with 200 photos included and additional photos at $0.25 each.",
				},
			},
			{
				"@type": "Question",
				name: "What events can I use Photocall for?",
				acceptedAnswer: {
					"@type": "Answer",
					text: "Photocall is perfect for weddings, birthday parties, corporate events, graduations, and any celebration where you want to capture and share memorable moments.",
				},
			},
			{
				"@type": "Question",
				name: "Do guests need to download an app?",
				acceptedAnswer: {
					"@type": "Answer",
					text: "No! Guests simply scan a QR code to instantly download and share their photos. No app installation required.",
				},
			},
		],
	};

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
			/>
		</>
	);
}
