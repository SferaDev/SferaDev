import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Photocall",
		short_name: "Photocall",
		description: "Photo booth kiosk for unforgettable events.",
		start_url: "/",
		display: "standalone",
		background_color: "#000000",
		theme_color: "#0f172a",
		icons: [
			{
				src: "/icon",
				sizes: "32x32",
				type: "image/png",
			},
			{
				src: "/apple-icon",
				sizes: "180x180",
				type: "image/png",
				purpose: "maskable",
			},
		],
	};
}
