import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import { Pre } from "./pre";
import { Table, Td, Th, Thead } from "./table";

export const mdxComponents: MDXRemoteProps["components"] = {
	pre: Pre,
	table: Table,
	thead: Thead,
	th: Th,
	td: Td,
};
