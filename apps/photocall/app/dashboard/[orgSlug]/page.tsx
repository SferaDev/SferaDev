import { connection } from "next/server";
import OrganizationDashboard from "./org-dashboard-client";

export default async function Page() {
	await connection();
	return <OrganizationDashboard />;
}
