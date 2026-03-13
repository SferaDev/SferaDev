import type { ComponentPropsWithoutRef } from "react";

export function Blockquote(props: ComponentPropsWithoutRef<"blockquote">) {
	return (
		<blockquote
			className="my-8 rounded-r-xl border-l-4 border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-950/20 py-4 px-6 text-gray-700 dark:text-gray-300 [&>p]:m-0"
			{...props}
		/>
	);
}
