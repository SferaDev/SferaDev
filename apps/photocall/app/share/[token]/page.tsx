import { connection } from "next/server";
import SharePage from "./share-client";

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
	await connection();
	return <SharePage params={params} />;
}
