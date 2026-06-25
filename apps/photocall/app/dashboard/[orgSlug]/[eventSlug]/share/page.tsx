import { connection } from "next/server";
import ShareClient from "./share-client";

export default async function Page() {
	await connection();
	return <ShareClient />;
}
