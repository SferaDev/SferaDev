import { connection } from "next/server";
import TrashManagement from "./trash-client";

export default async function Page() {
	await connection();
	return <TrashManagement />;
}
