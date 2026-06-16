import { connection } from "next/server";
import OrgSettingsPage from "./org-settings-client";

export default async function Page() {
	await connection();
	return <OrgSettingsPage />;
}
