import { connection } from "next/server";
import EventDashboard from "./event-dashboard-client";

export default async function Page() {
	await connection();
	return <EventDashboard />;
}
