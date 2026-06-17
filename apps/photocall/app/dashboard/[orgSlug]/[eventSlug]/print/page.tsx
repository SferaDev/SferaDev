import { connection } from "next/server";
import PrintManagement from "./print-client";

export default async function Page() {
	await connection();
	return <PrintManagement />;
}
