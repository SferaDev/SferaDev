/* eslint-disable */
// This file is a stub for builds before running convex dev
// Running `npx convex dev` will generate the actual file with proper types

export {
	query,
	mutation,
	internalQuery,
	internalMutation,
	action,
	internalAction,
	httpAction,
} from "convex/server";

import type { GenericQueryCtx, GenericMutationCtx, GenericActionCtx } from "convex/server";
import type { DataModel } from "./dataModel";

export type QueryCtx = GenericQueryCtx<DataModel>;
export type MutationCtx = GenericMutationCtx<DataModel>;
export type ActionCtx = GenericActionCtx<DataModel>;
