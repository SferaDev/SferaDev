import { connection } from "next/server";
import KioskAttractPage from "./kiosk-attract-client";

export default async function Page() {
	await connection();
	return <KioskAttractPage />;
}
