import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ImageResponse } from "next/og";
import { siteConfig, siteUrl } from "@/lib/site";

type ImageResponseOptions = NonNullable<ConstructorParameters<typeof ImageResponse>[1]>;
type FontOptions = NonNullable<ImageResponseOptions["fonts"]>;

const geistDirectory = path.join(process.cwd(), "node_modules/geist/dist/fonts/geist-sans");

/**
 * Reads Geist as raw font data for Satori, which cannot resolve web fonts.
 *
 * The files ship with the `geist` package that already provides the site's
 * typeface, so the social cards match the pages they represent.
 */
export async function loadGeistFonts(): Promise<FontOptions> {
	const [regular, bold] = await Promise.all([
		readFile(path.join(geistDirectory, "Geist-Regular.ttf")),
		readFile(path.join(geistDirectory, "Geist-Bold.ttf")),
	]);

	return [
		{ name: "Geist", data: regular, weight: 400, style: "normal" },
		{ name: "Geist", data: bold, weight: 700, style: "normal" },
	];
}

interface OgCardProps {
	/** Small label above the title, e.g. the section the page belongs to. */
	eyebrow: string;
	title: string;
	subtitle?: string;
}

/**
 * Shared layout for the generated social cards.
 *
 * Rendered by Satori, which supports a subset of CSS: every container needs an
 * explicit `display`, and layout has to be expressed with flexbox.
 */
export function OgCard({ eyebrow, title, subtitle }: OgCardProps) {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				width: "100%",
				height: "100%",
				padding: 80,
				fontFamily: "Geist",
				color: "#fafafa",
				backgroundColor: "#09090b",
				backgroundImage:
					"radial-gradient(circle at 15% 0%, rgba(37, 99, 235, 0.45), transparent 55%), radial-gradient(circle at 85% 100%, rgba(147, 51, 234, 0.4), transparent 55%)",
			}}
		>
			<div
				style={{
					display: "flex",
					fontSize: 28,
					fontWeight: 400,
					letterSpacing: 4,
					textTransform: "uppercase",
					color: "#a1a1aa",
				}}
			>
				{eyebrow}
			</div>

			<div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
				<div style={{ display: "flex", fontSize: 68, fontWeight: 700, lineHeight: 1.15 }}>
					{title}
				</div>
				{subtitle ? (
					<div style={{ display: "flex", fontSize: 32, fontWeight: 400, color: "#d4d4d8" }}>
						{subtitle}
					</div>
				) : null}
			</div>

			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					fontSize: 26,
					color: "#a1a1aa",
				}}
			>
				<div style={{ display: "flex" }}>
					{siteConfig.author.name} · {siteConfig.author.jobTitle}
				</div>
				<div style={{ display: "flex" }}>{new URL(siteUrl).host}</div>
			</div>
		</div>
	);
}
