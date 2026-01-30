import { connection } from "next/server";
import TeamPage from "./team-client";

export default async function Page() {
	await connection();
	return <TeamPage />;
}
