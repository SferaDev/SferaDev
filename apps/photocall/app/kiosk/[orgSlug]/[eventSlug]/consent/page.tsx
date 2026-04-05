import { connection } from "next/server";
import KioskConsentPage from "./consent-client";

export default async function Page() {
	await connection();
	return <KioskConsentPage />;
}
