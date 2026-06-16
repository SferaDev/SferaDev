import { connection } from "next/server";
import KioskBoomerangPage from "./boomerang-client";

export default async function Page() {
	await connection();
	return <KioskBoomerangPage />;
}
