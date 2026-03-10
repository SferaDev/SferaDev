import type { ComponentPropsWithoutRef } from "react";

export function Pre(props: ComponentPropsWithoutRef<"pre">) {
	return (
		<pre
			className="my-6 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1e1e2e] p-4 text-sm leading-relaxed"
			{...props}
		/>
	);
}
