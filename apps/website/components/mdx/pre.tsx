import type { ComponentPropsWithoutRef } from "react";

export function Pre(props: ComponentPropsWithoutRef<"pre">) {
	return (
		<pre
			className="my-8 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 bg-[#fafafa] dark:bg-[#22272e] p-5 text-[13px] leading-7 shadow-sm"
			{...props}
		/>
	);
}
