import { connection } from "next/server";
import EventSettingsPage from "./event-settings-client";

export default async function Page() {
	await connection();
	return <EventSettingsPage />;
}
