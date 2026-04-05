import { connection } from "next/server";
import InviteAcceptClient from "./invite-accept-client";

export default async function Page() {
	await connection();
	return <InviteAcceptClient />;
}
