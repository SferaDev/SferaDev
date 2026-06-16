import { connection } from "next/server";
import TemplateEditorClient from "./editor-client";

export default async function Page() {
	await connection();
	return <TemplateEditorClient />;
}
