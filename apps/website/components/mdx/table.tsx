import type { ComponentPropsWithoutRef } from "react";

export function Table(props: ComponentPropsWithoutRef<"table">) {
	return (
		<div className="my-8 w-full overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
			<table className="w-full text-sm" {...props} />
		</div>
	);
}

export function Thead(props: ComponentPropsWithoutRef<"thead">) {
	return (
		<thead
			className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-white/4"
			{...props}
		/>
	);
}

export function Th(props: ComponentPropsWithoutRef<"th">) {
	return (
		<th
			className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
			{...props}
		/>
	);
}

export function Tr(props: ComponentPropsWithoutRef<"tr">) {
	return (
		<tr
			className="border-b border-gray-100 dark:border-gray-800/60 last:border-b-0 transition-colors hover:bg-gray-50/50 dark:hover:bg-white/2"
			{...props}
		/>
	);
}

export function Td(props: ComponentPropsWithoutRef<"td">) {
	return <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap" {...props} />;
}
