import { connection } from "next/server";
import BillingPage from "./billing-client";

export default async function Page() {
	await connection();
	return <BillingPage />;
}
