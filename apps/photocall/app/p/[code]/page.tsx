import { notFound, redirect } from "next/navigation";
import { getPhotoByHumanCode } from "@/actions/photos";

export const dynamic = "force-dynamic";

export default async function ShortLinkPage({ params }: { params: Promise<{ code: string }> }) {
	const { code } = await params;
	const photo = await getPhotoByHumanCode(code);
	if (!photo) {
		notFound();
	}
	redirect(`/share/${photo.shareToken}`);
}
