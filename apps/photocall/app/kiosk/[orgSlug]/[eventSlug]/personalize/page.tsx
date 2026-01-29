import { connection } from "next/server";
import KioskPersonalizePage from "./personalize-client";

export default async function Page() {
	await connection();
	return <KioskPersonalizePage />;
}
