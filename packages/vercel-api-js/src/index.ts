// Re-export generated files directly for tree-shaking

// Re-export client
export * from "./client";
export {
	operationsByPath,
	operationsByTag,
	tagDictionary,
} from "./generated/components";
export * from "./generated/schemas";
export * from "./generated/types";
