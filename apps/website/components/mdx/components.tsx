import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import { Blockquote } from "./blockquote";
import { Pre } from "./pre";
import { Table, Td, Th, Thead, Tr } from "./table";

export const mdxComponents: MDXRemoteProps["components"] = {
	pre: Pre,
	table: Table,
	thead: Thead,
	th: Th,
	tr: Tr,
	td: Td,
	blockquote: Blockquote,
};
