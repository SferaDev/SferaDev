import { connection } from "next/server";
import PreEventCheck from "./pre-event-check-client";

export default async function Page() {
	await connection();
	return <PreEventCheck />;
}
