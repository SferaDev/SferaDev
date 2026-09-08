import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";
import { loadGeistFonts, OgCard } from "../og-card";

export const alt = `${siteConfig.author.name} — Blog`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
	return new ImageResponse(
		<OgCard
			eyebrow={siteConfig.name}
			title="Blog"
			subtitle="Serverless databases, TypeScript, open source and developer tooling."
		/>,
		{ ...size, fonts: await loadGeistFonts() },
	);
}
