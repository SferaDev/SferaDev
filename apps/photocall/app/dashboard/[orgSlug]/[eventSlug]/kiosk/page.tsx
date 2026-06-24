import { connection } from "next/server";
import KioskSettingsPage from "./kiosk-settings-client";

export default async function Page() {
	await connection();
	return <KioskSettingsPage />;
}
