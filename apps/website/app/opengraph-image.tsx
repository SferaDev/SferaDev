import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";
import { loadGeistFonts, OgCard } from "./og-card";

export const alt = siteConfig.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
	return new ImageResponse(
		<OgCard
			eyebrow={siteConfig.name}
			title={siteConfig.author.name}
			subtitle={siteConfig.tagline}
		/>,
		{ ...size, fonts: await loadGeistFonts() },
	);
}
