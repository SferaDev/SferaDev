import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://photocall.app";

	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: ["/api/", "/dashboard/", "/kiosk/", "/share/", "/_next/"],
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
