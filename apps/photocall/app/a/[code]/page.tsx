import { notFound } from "next/navigation";
import { getAlbumView } from "@/actions/album";
import { AccessGate } from "./access-gate";
import { AlbumView } from "./album-view";

export const dynamic = "force-dynamic";

export default async function AlbumPage({ params }: { params: Promise<{ code: string }> }) {
	const { code } = await params;
	const result = await getAlbumView(code);

	if (result.status === "not_found") notFound();

	if (result.status === "locked") {
		return (
			<AccessGate
				token={code}
				mode={result.mode}
				eventName={result.eventName}
				coupleNames={result.coupleNames}
			/>
		);
	}

	return (
		<AlbumView
			token={code}
			album={result.album}
			initialPhotos={result.photos}
			canUpload={result.canUpload}
			guestName={result.guestName}
		/>
	);
}
