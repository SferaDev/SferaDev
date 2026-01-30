import { connection } from "next/server";
import KioskSelectPage from "./select-client";

export default async function Page() {
	await connection();
	return <KioskSelectPage />;
}
