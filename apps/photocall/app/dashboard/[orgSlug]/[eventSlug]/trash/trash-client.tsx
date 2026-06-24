"use client";

import { ChevronLeft, Loader2, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { getEventBySlug } from "@/actions/events";
import {
	type DeletedPhoto,
	listDeletedPhotos,
	purgePhotoNow,
	restorePhoto,
} from "@/actions/photos";
import { Button } from "@/components/ui/button";

/**
 * Recycling bin for an event. Lists soft-deleted photos with the date they were
 * removed and how many days remain before the cleanup cron permanently purges
 * them. Hosts can restore a photo (clears `deletedAt`) or delete it now
 * (permanent: removes the R2 object + row). Same admin access as the rest of
 * the event dashboard — the underlying server actions enforce it.
 */
export default function TrashManagement() {
	const params = useParams();
	const orgSlug = params.orgSlug as string;
	const eventSlug = params.eventSlug as string;

	const t = useTranslations("dashboard.trash");
	const format = useFormatter();
	const { mutate } = useSWRConfig();

	const { data: event } = useSWR(["events", orgSlug, eventSlug], () =>
		getEventBySlug(orgSlug, eventSlug),
	);

	const { data: photos } = useSWR(event ? ["deletedPhotos", event.id] : null, () =>
		listDeletedPhotos(event!.id),
	);

	const [busyId, setBusyId] = useState<string | null>(null);

	const refresh = () => {
		mutate((key) => Array.isArray(key) && key[0] === "deletedPhotos");
		// Restoring re-adds a photo to galleries and bumps the photo count.
		mutate((key) => Array.isArray(key) && key[0] === "photos");
		mutate((key) => Array.isArray(key) && key[0] === "eventStats");
	};

	const handleRestore = async (photoId: string) => {
		setBusyId(photoId);
		try {
			await restorePhoto(photoId);
			refresh();
		} finally {
			setBusyId(null);
		}
	};

	const handlePurge = async (photoId: string) => {
		if (!window.confirm(t("confirmPurge"))) return;
		setBusyId(photoId);
		try {
			await purgePhotoNow(photoId);
			refresh();
		} finally {
			setBusyId(null);
		}
	};

	if (event === undefined) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<header className="border-b">
				<div className="container mx-auto px-4 py-4 flex items-center gap-4">
					<Link
						href={`/dashboard/${orgSlug}/${eventSlug}`}
						className="text-muted-foreground hover:text-foreground"
					>
						<ChevronLeft className="h-5 w-5" />
					</Link>
					<div className="flex-1">
						<h1 className="font-bold text-xl">{t("title")}</h1>
						<p className="text-sm text-muted-foreground">{t("subtitle")}</p>
					</div>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8">
				{photos === undefined ? (
					<div className="flex justify-center py-16">
						<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
					</div>
				) : photos.length === 0 ? (
					<div className="text-center py-16 border rounded-lg bg-muted/50">
						<Trash2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
						<h2 className="text-xl font-semibold mb-2">{t("emptyTitle")}</h2>
						<p className="text-muted-foreground">{t("emptyDescription")}</p>
					</div>
				) : (
					<div className="space-y-4">
						<p className="text-muted-foreground">{t("count", { count: photos.length })}</p>
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
							{photos.map((photo) => (
								<TrashCard
									key={photo.id}
									photo={photo}
									busy={busyId === photo.id}
									deletedLabel={t("deletedOn", {
										date: format.dateTime(photo.deletedAt, { dateStyle: "medium" }),
									})}
									purgeLabel={t("purgesIn", { days: photo.daysUntilPurge })}
									onRestore={() => handleRestore(photo.id)}
									onPurge={() => handlePurge(photo.id)}
								/>
							))}
						</div>
					</div>
				)}
			</main>
		</div>
	);
}

function TrashCard({
	photo,
	busy,
	deletedLabel,
	purgeLabel,
	onRestore,
	onPurge,
}: {
	photo: DeletedPhoto;
	busy: boolean;
	deletedLabel: string;
	purgeLabel: string;
	onRestore: () => void;
	onPurge: () => void;
}) {
	const t = useTranslations("dashboard.trash");

	return (
		<div className="border rounded-lg overflow-hidden flex flex-col">
			<div className="relative aspect-square bg-muted">
				<img src={photo.url} alt={photo.humanCode} className="w-full h-full object-cover" />
				<div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
					{photo.humanCode}
				</div>
			</div>
			<div className="p-3 space-y-2">
				<p className="text-xs text-muted-foreground">{deletedLabel}</p>
				<p className="text-xs font-medium text-destructive">{purgeLabel}</p>
				<div className="flex gap-2 pt-1">
					<Button
						size="sm"
						variant="outline"
						className="flex-1"
						onClick={onRestore}
						disabled={busy}
					>
						{busy ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<>
								<RotateCcw className="h-4 w-4 mr-1" />
								{t("restore")}
							</>
						)}
					</Button>
					<Button
						size="icon"
						variant="ghost"
						className="text-destructive hover:text-destructive"
						onClick={onPurge}
						disabled={busy}
						title={t("deleteNow")}
						aria-label={t("deleteNow")}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
