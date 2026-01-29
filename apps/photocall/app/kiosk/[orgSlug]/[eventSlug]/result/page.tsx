import { connection } from "next/server";
import KioskResultPage from "./result-client";

export default async function Page() {
	await connection();
	return <KioskResultPage />;
}
