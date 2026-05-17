import { ImageResponse } from "next/og";

export const alt = "Photocall - Photo Booth Kiosk for Events";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				alignItems: "flex-start",
				justifyContent: "space-between",
				padding: 80,
				background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 45%, #831843 100%)",
				color: "#fff",
				fontFamily: "system-ui, sans-serif",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 18,
					fontSize: 36,
					fontWeight: 600,
				}}
			>
				<div
					style={{
						width: 56,
						height: 56,
						borderRadius: 14,
						background: "linear-gradient(135deg, #f43f5e, #ec4899)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						fontSize: 36,
						fontWeight: 800,
					}}
				>
					P
				</div>
				<span>Photocall</span>
			</div>
			<div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
				<div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>
					Photo booth kiosks for unforgettable events.
				</div>
				<div style={{ fontSize: 32, color: "rgba(255,255,255,0.8)" }}>
					Weddings · Parties · Corporate · Birthdays
				</div>
			</div>
		</div>,
		{ ...size },
	);
}
