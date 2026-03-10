import type { ComponentPropsWithoutRef } from "react";

export function Table(props: ComponentPropsWithoutRef<"table">) {
	return (
		<div className="my-6 w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
			<table className="w-full text-sm" {...props} />
		</div>
	);
}

export function Thead(props: ComponentPropsWithoutRef<"thead">) {
	return <thead className="bg-gray-50 dark:bg-gray-800/50" {...props} />;
}

export function Th(props: ComponentPropsWithoutRef<"th">) {
	return (
		<th
			className="px-4 py-2.5 text-left font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800"
			{...props}
		/>
	);
}

export function Td(props: ComponentPropsWithoutRef<"td">) {
	return (
		<td
			className="px-4 py-2.5 text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800/50"
			{...props}
		/>
	);
}
