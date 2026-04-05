import { connection } from "next/server";
import TemplateManager from "./template-manager-client";

export default async function Page() {
	await connection();
	return <TemplateManager />;
}
