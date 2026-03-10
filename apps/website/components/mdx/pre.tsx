"use client";

import { Check, Copy } from "lucide-react";
import {
	type ComponentPropsWithoutRef,
	isValidElement,
	type ReactElement,
	useCallback,
	useState,
} from "react";

function getLanguageFromChildren(children: React.ReactNode): string | null {
	if (!isValidElement(children)) return null;
	const el = children as ReactElement<{ "data-language"?: string }>;
	return el.props?.["data-language"] ?? null;
}

function getCodeText(node: React.ReactNode): string {
	if (typeof node === "string") return node;
	if (!isValidElement(node)) return "";
	const el = node as ReactElement<{ children?: React.ReactNode }>;
	const children = el.props?.children;
	if (typeof children === "string") return children;
	if (Array.isArray(children)) return children.map(getCodeText).join("");
	return getCodeText(children);
}

const langLabels: Record<string, string> = {
	ts: "TypeScript",
	tsx: "TSX",
	js: "JavaScript",
	jsx: "JSX",
	bash: "Shell",
	sh: "Shell",
	sql: "SQL",
	json: "JSON",
	yaml: "YAML",
	yml: "YAML",
	go: "Go",
	py: "Python",
	rust: "Rust",
	css: "CSS",
	html: "HTML",
	md: "Markdown",
	mdx: "MDX",
	diff: "Diff",
	toml: "TOML",
	env: "ENV",
};

export function Pre(props: ComponentPropsWithoutRef<"pre">) {
	const [copied, setCopied] = useState(false);
	const lang = getLanguageFromChildren(props.children);
	const label = lang ? (langLabels[lang] ?? lang) : null;

	const handleCopy = useCallback(() => {
		const text = getCodeText(props.children);
		navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}, [props.children]);

	return (
		<div className="group relative my-8">
			{label && (
				<div className="flex items-center justify-between rounded-t-xl border border-b-0 border-gray-200 dark:border-gray-800 bg-gray-100/80 dark:bg-white/5 px-4 py-2">
					<span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
				</div>
			)}
			<pre
				{...props}
				className={`overflow-x-auto border border-gray-200 dark:border-gray-800 bg-[#fafafa] dark:bg-[#22272e] p-5 text-[13px] leading-7 shadow-sm ${
					label ? "rounded-b-xl" : "rounded-xl"
				}`}
			/>
			<button
				type="button"
				onClick={handleCopy}
				className="absolute right-3 top-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 p-1.5 text-gray-500 dark:text-gray-400 opacity-0 backdrop-blur-sm transition-all hover:text-gray-900 dark:hover:text-white group-hover:opacity-100"
				aria-label="Copy code"
			>
				{copied ? (
					<Check className="h-3.5 w-3.5 text-green-500" />
				) : (
					<Copy className="h-3.5 w-3.5" />
				)}
			</button>
		</div>
	);
}
