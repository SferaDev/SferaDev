import type { LegalSection } from "@/components/legal-page";

/**
 * Standard-template legal copy for the marketing privacy / terms pages.
 * Authored in English (most locales fall back to English) and intended as a
 * starting point for legal review — see the disclaimer rendered on each page.
 * Kept here so both the page and any future export share one source of truth.
 */

export const PRIVACY_SECTIONS: LegalSection[] = [
	{
		heading: "Overview",
		body: [
			"Photocall provides photo-booth kiosks for events. This policy explains what we collect when you use the service as an event organizer or as a guest taking a photo, and how that information is used.",
		],
	},
	{
		heading: "Information we collect",
		body: [
			"Organizers: account details such as name and email address, organization and event configuration, and billing information processed by our payment provider.",
			"Guests: the photos you capture at a kiosk, any optional caption you add, and basic technical data needed to deliver and share those photos (for example, the time of capture).",
		],
	},
	{
		heading: "How photos are used",
		body: [
			"Guest photos are stored so they can be shown in the event slideshow, downloaded, printed, and shared via a unique link or QR code. Photos are only associated with the event at which they were taken.",
			"Before capturing, guests are asked to consent to having their photo taken and stored for the event.",
		],
	},
	{
		heading: "Retention and deletion",
		body: [
			"Organizers can configure a retention period per event, after which photos are automatically and permanently deleted. Organizers may also delete an event and its photos at any time from the dashboard.",
		],
	},
	{
		heading: "Sharing and storage",
		body: [
			"Photos are stored in object storage and served over presigned or public URLs depending on the deployment. We do not sell personal information. Payment processing is handled by a third-party provider that receives only the data needed to complete a transaction.",
		],
	},
	{
		heading: "Your choices",
		body: [
			"Guests can decline the consent prompt to avoid having a photo stored. Organizers and guests can request deletion of photos by contacting the event organizer or the service operator.",
		],
	},
	{
		heading: "Contact",
		body: [
			"For privacy questions or deletion requests, contact the organization that operated the event, or the operator of this Photocall deployment.",
		],
	},
];

export const TERMS_SECTIONS: LegalSection[] = [
	{
		heading: "Acceptance of terms",
		body: [
			"By creating an account or using a Photocall kiosk, you agree to these terms. If you are using the service on behalf of an organization, you represent that you are authorized to accept these terms for it.",
		],
	},
	{
		heading: "The service",
		body: [
			"Photocall lets organizers set up photo-booth events and lets guests capture, personalize, and share photos. Features and limits depend on the plan selected by the organizer.",
		],
	},
	{
		heading: "Organizer responsibilities",
		body: [
			"Organizers are responsible for obtaining any consents required at their event, for the content captured at their kiosks, and for complying with applicable laws regarding guests' images and personal data.",
			"Organizers must not use the service to capture or distribute unlawful, infringing, or harmful content.",
		],
	},
	{
		heading: "Billing",
		body: [
			"Paid plans and per-event charges are billed through our payment provider. Fees are described at the point of purchase. Usage beyond an included allowance may incur additional charges as shown in the dashboard.",
		],
	},
	{
		heading: "Acceptable use",
		body: [
			"You agree not to misuse the service, attempt to disrupt it, access it in unauthorized ways, or use it to violate the rights of others.",
		],
	},
	{
		heading: "Disclaimer and liability",
		body: [
			"The service is provided “as is” without warranties of any kind. To the maximum extent permitted by law, the operator is not liable for indirect or consequential damages arising from use of the service.",
		],
	},
	{
		heading: "Changes",
		body: [
			"These terms may be updated from time to time. Continued use of the service after an update constitutes acceptance of the revised terms.",
		],
	},
];
