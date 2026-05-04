/* eslint-disable */
// This file is a stub for TypeScript checking before running convex dev
// Running `npx convex dev` will generate the actual file with proper types

import type { GenericDataModel, GenericDocument, GenericId } from "convex/values";

export type Id<TableName extends string> = GenericId<TableName>;

export type Doc<_TableName extends string> = GenericDocument;

export type DataModel = GenericDataModel;
