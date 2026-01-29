/* eslint-disable */
// This file is a stub for TypeScript checking before running convex dev
// Running `npx convex dev` will generate the actual file with proper types

import type { GenericId, GenericDataModel } from "convex/values";

export type Id<TableName extends string> = GenericId<TableName>;

export type DataModel = GenericDataModel;
