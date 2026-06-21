"use client";

import { ImageIcon } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { listMyAlbums } from "@/actions/album";
import { Card } from "@/components/ui/card";

/**
 * Renders the guest's previously visited albums (read from the signed guest
 * cookie via a server action). A client component so it can sit on the static
 * marketing landing without opting the whole page into dynamic rendering.
 * Returns null when the visitor has none, so first-time visitors see nothing.
 */
export function MyAlbums({ heading, showEmpty }: { heading?: string; showEmpty?: boolean }) {
	const { data: albums, isLoading } = useSWR(["my-albums"], () => listMyAlbums());

	if (albums && albums.length === 0 && showEmpty) {
		return (
			<section className="container mx-auto px-4">
				<p className="mx-auto max-w-3xl text-muted-foreground">
					Open an album link or scan a QR code at an event to see it here.
				</p>
			</section>
		);
	}

	if (isLoading || !albums || albums.length === 0) return null;

	return (
		<section className="container mx-auto px-4 pt-8">
			<div className="mx-auto max-w-3xl">
				{heading && <h2 className="mb-3 text-lg font-semibold">{heading}</h2>}
				<div className="grid gap-3 sm:grid-cols-2">
					{albums.map((album) => (
						<Link key={album.token} href={`/a/${album.token}`}>
							<Card className="flex items-center gap-3 p-4 transition-colors hover:bg-accent">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900">
									<ImageIcon className="h-5 w-5 text-rose-500" />
								</div>
								<div className="min-w-0">
									<p className="truncate font-medium">{album.coupleNames || album.eventName}</p>
									<p className="truncate text-sm text-muted-foreground">View album</p>
								</div>
							</Card>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
