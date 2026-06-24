import { getPublicEvent } from "@/actions/events";
import { DEFAULT_BRAND_COLOR } from "@/lib/branding";

/**
 * Per-kiosk PWA manifest. The app-wide manifest (app/manifest.ts) has
 * `start_url: "/"`, so installing the kiosk to an iPad home screen opened the
 * site root instead of the kiosk. This serves a manifest scoped to THIS event
 * whose `start_url`/`scope` are the kiosk URL, so the installed icon launches
 * straight into the kiosk (fullscreen, named after the event). Linked from the
 * kiosk layout's `generateMetadata`, which overrides the inherited manifest for
 * these routes only.
 */
export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ orgSlug: string; eventSlug: string }> },
) {
	const { orgSlug, eventSlug } = await params;
	const base = `/kiosk/${orgSlug}/${eventSlug}`;

	let name = "Photocall";
	let themeColor = DEFAULT_BRAND_COLOR;
	try {
		const event = await getPublicEvent(orgSlug, eventSlug);
		if (event?.name) {
			name = event.name;
			themeColor = event.primaryColor || DEFAULT_BRAND_COLOR;
		}
	} catch {
		// Event not resolvable — fall back to the generic name/colour.
	}

	const manifest = {
		name: `${name} · Photocall`,
		short_name: name,
		description: "Photo booth kiosk",
		start_url: base,
		scope: base,
		display: "fullscreen",
		background_color: "#000000",
		theme_color: themeColor,
		icons: [
			{ src: "/icon", sizes: "32x32", type: "image/png" },
			{ src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "maskable" },
		],
	};

	return new Response(JSON.stringify(manifest), {
		headers: {
			"Content-Type": "application/manifest+json",
			"Cache-Control": "public, max-age=300",
		},
	});
}
