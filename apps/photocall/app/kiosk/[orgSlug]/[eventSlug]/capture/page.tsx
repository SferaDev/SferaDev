import { connection } from "next/server";
import KioskCapturePage from "./capture-client";

export default async function Page() {
	await connection();
	return <KioskCapturePage />;
}
