"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

type CollagePhoto = { id: string; url: string | null };

interface KioskAttractCollageProps {
	photos: CollagePhoto[];
	safeMode: boolean;
}

/**
 * A single tile's position within a collage layout, expressed as percentages
 * of the container so layouts scale to any screen size. `rotate` adds a little
 * life to the "scattered" layouts; grid layouts leave it at 0.
 */
interface CollageTile {
	top: number;
	left: number;
	width: number;
	height: number;
	rotate: number;
}

/**
 * The set of layouts we rotate through. Each layout is a list of tiles; the
 * number of tiles determines how many photos a given layout consumes. Keeping
 * these as static data avoids recomputing geometry on every render and lets us
 * pick a layout deterministically by index.
 */
const LAYOUTS: CollageTile[][] = [
	// 2x2 grid
	[
		{ top: 0, left: 0, width: 50, height: 50, rotate: 0 },
		{ top: 0, left: 50, width: 50, height: 50, rotate: 0 },
		{ top: 50, left: 0, width: 50, height: 50, rotate: 0 },
		{ top: 50, left: 50, width: 50, height: 50, rotate: 0 },
	],
	// 3-up mosaic: one tall feature on the left, two stacked on the right
	[
		{ top: 0, left: 0, width: 60, height: 100, rotate: 0 },
		{ top: 0, left: 60, width: 40, height: 50, rotate: 0 },
		{ top: 50, left: 60, width: 40, height: 50, rotate: 0 },
	],
	// Filmstrip: three vertical panels
	[
		{ top: 0, left: 0, width: 33.34, height: 100, rotate: 0 },
		{ top: 0, left: 33.33, width: 33.34, height: 100, rotate: 0 },
		{ top: 0, left: 66.66, width: 33.34, height: 100, rotate: 0 },
	],
	// Off-grid scattered: overlapping cards with a slight tilt
	[
		{ top: 6, left: 4, width: 42, height: 54, rotate: -5 },
		{ top: 2, left: 52, width: 40, height: 46, rotate: 4 },
		{ top: 46, left: 30, width: 44, height: 50, rotate: 3 },
		{ top: 40, left: 2, width: 30, height: 42, rotate: -3 },
	],
];

const MIN_PHOTOS_FOR_COLLAGE = 4;
const CYCLE_MS = 6000;

/**
 * Picks `count` photos from `photos` starting at `offset`, wrapping around so
 * the rotation keeps surfacing fresh material on each cycle.
 */
function selectPhotos(photos: CollagePhoto[], offset: number, count: number): CollagePhoto[] {
	if (photos.length === 0) return [];
	return Array.from({ length: count }, (_, i) => photos[(offset + i) % photos.length]);
}

/**
 * Animated background showcase for the kiosk attract screen.
 *
 * - With fewer than four photos it falls back to a calm single-photo
 *   cross-fade (the original slideshow behaviour).
 * - With enough photos it cycles through varied collage layouts (grid, mosaic,
 *   filmstrip, scattered), rotating both the layout and the photo set every few
 *   seconds with staggered spring/fade animations so it never feels static.
 *
 * It is purely decorative chrome: dimmed, full-bleed, blurred in safe mode, and
 * inert to pointer events so it never interferes with the foreground content.
 */
export function KioskAttractCollage({ photos, safeMode }: KioskAttractCollageProps) {
	// Only photos with a resolvable URL can be rendered.
	const usablePhotos = useMemo(() => photos.filter((photo) => photo.url !== null), [photos]);

	const [cycle, setCycle] = useState(0);

	useEffect(() => {
		if (usablePhotos.length === 0) return;
		const interval = setInterval(() => setCycle((prev) => prev + 1), CYCLE_MS);
		return () => clearInterval(interval);
	}, [usablePhotos.length]);

	if (usablePhotos.length === 0) return null;

	const blurClass = safeMode ? "blur-xl" : "";

	// Few photos: keep the gentle single-photo cross-fade.
	if (usablePhotos.length < MIN_PHOTOS_FOR_COLLAGE) {
		const photo = usablePhotos[cycle % usablePhotos.length];
		return (
			<div className="pointer-events-none absolute inset-0" aria-hidden="true">
				<AnimatePresence>
					<motion.img
						key={photo.id}
						src={photo.url ?? undefined}
						alt=""
						className={`absolute inset-0 h-full w-full object-cover ${blurClass}`}
						initial={{ opacity: 0 }}
						animate={{ opacity: 0.5 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 1.2, ease: "easeInOut" }}
					/>
				</AnimatePresence>
			</div>
		);
	}

	// Enough photos: rotate through collage layouts.
	const layout = LAYOUTS[cycle % LAYOUTS.length];
	// Stride the offset by the largest layout so successive cycles surface a
	// different slice of the photo pool rather than just shuffling the layout.
	const offset = (cycle * MIN_PHOTOS_FOR_COLLAGE) % usablePhotos.length;
	const selected = selectPhotos(usablePhotos, offset, layout.length);

	return (
		<div className="pointer-events-none absolute inset-0 opacity-50" aria-hidden="true">
			<AnimatePresence mode="popLayout">
				<motion.div
					key={cycle}
					className="absolute inset-0"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 1 }}
				>
					{layout.map((tile, index) => {
						const photo = selected[index];
						if (!photo?.url) return null;
						return (
							<motion.div
								key={`${cycle}-${tile.left}-${tile.top}`}
								className="absolute overflow-hidden rounded-xl"
								style={{
									top: `${tile.top}%`,
									left: `${tile.left}%`,
									width: `${tile.width}%`,
									height: `${tile.height}%`,
								}}
								initial={{ opacity: 0, scale: 0.85, rotate: tile.rotate * 1.5 }}
								animate={{ opacity: 1, scale: 1, rotate: tile.rotate }}
								exit={{ opacity: 0, scale: 0.95 }}
								transition={{
									type: "spring",
									stiffness: 120,
									damping: 18,
									delay: index * 0.12,
								}}
							>
								<img src={photo.url} alt="" className={`h-full w-full object-cover ${blurClass}`} />
							</motion.div>
						);
					})}
				</motion.div>
			</AnimatePresence>
		</div>
	);
}
