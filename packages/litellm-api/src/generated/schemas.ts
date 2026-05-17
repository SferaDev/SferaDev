// @ts-nocheck

import * as z from "zod";

export const checkoutResponseSchema = z.object({
	url: z.string().describe("Stripe Checkout URL — redirect the user here"),
});

export const freeTierResponseSchema = z.object({
	ip_hash: z.string(),
	requests_today: z.int(),
	daily_limit: z.int(),
	remaining: z.int(),
});

export const validationErrorSchema = z.object({
	loc: z.array(z.union([z.string(), z.int()])),
	msg: z.string(),
	type: z.string(),
	input: z.unknown().optional(),
	ctx: z.object({}).optional(),
});

export const HTTPValidationErrorSchema = z.object({
	detail: z.array(validationErrorSchema).optional(),
});

export const modelCatalogEntrySchema = z
	.object({
		id: z.string().describe("Canonical model identifier (e.g. 'gpt-4o')"),
		object: z.string().optional().default("model_catalog.entry"),
		provider: z
			.union([z.string(), z.null()])
			.optional()
			.describe("LiteLLM provider key (e.g. 'openai', 'azure')"),
		mode: z
			.union([z.string(), z.null()])
			.optional()
			.describe("Model mode: chat, embedding, completion, image_generation, etc."),
		max_input_tokens: z.union([z.int(), z.null()]).optional(),
		max_output_tokens: z.union([z.int(), z.null()]).optional(),
		max_tokens: z.union([z.int(), z.null()]).optional().describe("Legacy combined token limit"),
		input_cost_per_token: z.union([z.number(), z.null()]).optional(),
		output_cost_per_token: z.union([z.number(), z.null()]).optional(),
		cache_read_input_token_cost: z.union([z.number(), z.null()]).optional(),
		input_cost_per_audio_token: z.union([z.number(), z.null()]).optional(),
		output_cost_per_reasoning_token: z.union([z.number(), z.null()]).optional(),
		deprecation_date: z
			.union([z.string(), z.null()])
			.optional()
			.describe("ISO date when the model is deprecated (YYYY-MM-DD)"),
		supports_function_calling: z.union([z.boolean(), z.null()]).optional(),
		supports_parallel_function_calling: z.union([z.boolean(), z.null()]).optional(),
		supports_vision: z.union([z.boolean(), z.null()]).optional(),
		supports_audio_input: z.union([z.boolean(), z.null()]).optional(),
		supports_audio_output: z.union([z.boolean(), z.null()]).optional(),
		supports_prompt_caching: z.union([z.boolean(), z.null()]).optional(),
		supports_reasoning: z.union([z.boolean(), z.null()]).optional(),
		supports_response_schema: z.union([z.boolean(), z.null()]).optional(),
		supports_system_messages: z.union([z.boolean(), z.null()]).optional(),
		supports_web_search: z.union([z.boolean(), z.null()]).optional(),
	})
	.catchall(z.unknown())
	.describe("A single model in the catalog.");

export const modelCatalogListResponseSchema = z
	.object({
		object: z.string().optional().default("list"),
		data: z.array(modelCatalogEntrySchema),
		total_count: z.int().describe("Total models matching the filters"),
		has_more: z.boolean(),
		page: z.int(),
		page_size: z.int(),
	})
	.describe("Stripe-style list response.");

export const createCheckoutBillingCheckoutPostStatus200Schema = checkoutResponseSchema;

export const createCheckoutBillingCheckoutPostResponseSchema =
	createCheckoutBillingCheckoutPostStatus200Schema;

export const checkUsageBillingUsageGetStatus200Schema = freeTierResponseSchema;

export const checkUsageBillingUsageGetResponseSchema = checkUsageBillingUsageGetStatus200Schema;

export const listModelCatalogModelCatalogGetQueryProviderSchema = z
	.union([z.string(), z.null()])
	.optional()
	.describe("Filter by provider (e.g. 'openai', 'anthropic', 'bedrock'). Case-insensitive.");

export const listModelCatalogModelCatalogGetQueryModeSchema = z
	.union([z.string(), z.null()])
	.optional()
	.describe("Filter by mode (e.g. 'chat', 'embedding', 'image_generation').");

export const listModelCatalogModelCatalogGetQueryModelSchema = z
	.union([z.string(), z.null()])
	.optional()
	.describe("Filter by model name. Supports substring match or regex (prefix with 're:').");

export const listModelCatalogModelCatalogGetQuerySupportsVisionSchema = z
	.union([z.boolean(), z.null()])
	.optional();

export const listModelCatalogModelCatalogGetQuerySupportsFunctionCallingSchema = z
	.union([z.boolean(), z.null()])
	.optional();

export const listModelCatalogModelCatalogGetQuerySupportsReasoningSchema = z
	.union([z.boolean(), z.null()])
	.optional();

export const listModelCatalogModelCatalogGetQuerySupportsAudioInputSchema = z
	.union([z.boolean(), z.null()])
	.optional();

export const listModelCatalogModelCatalogGetQuerySupportsAudioOutputSchema = z
	.union([z.boolean(), z.null()])
	.optional();

export const listModelCatalogModelCatalogGetQuerySupportsPromptCachingSchema = z
	.union([z.boolean(), z.null()])
	.optional();

export const listModelCatalogModelCatalogGetQuerySupportsResponseSchemaSchema = z
	.union([z.boolean(), z.null()])
	.optional();

export const listModelCatalogModelCatalogGetQueryPageSchema = z
	.int()
	.min(1)
	.optional()
	.default(1)
	.describe("Page number (1-indexed)");

export const listModelCatalogModelCatalogGetQueryPageSizeSchema = z
	.int()
	.min(1)
	.max(500)
	.optional()
	.default(50)
	.describe("Number of results per page (max 500)");

export const listModelCatalogModelCatalogGetStatus200Schema =
	modelCatalogListResponseSchema.describe("Stripe-style list response.");

export const listModelCatalogModelCatalogGetStatus422Schema = HTTPValidationErrorSchema;

export const listModelCatalogModelCatalogGetResponseSchema = z.union([
	listModelCatalogModelCatalogGetStatus200Schema,
	listModelCatalogModelCatalogGetStatus422Schema,
]);

export const getModelCatalogEntryModelCatalogModelIdGetPathModelIdSchema = z.string();

export const getModelCatalogEntryModelCatalogModelIdGetStatus200Schema =
	modelCatalogEntrySchema.describe("A single model in the catalog.");

export const getModelCatalogEntryModelCatalogModelIdGetStatus422Schema = HTTPValidationErrorSchema;

export const getModelCatalogEntryModelCatalogModelIdGetResponseSchema = z.union([
	getModelCatalogEntryModelCatalogModelIdGetStatus200Schema,
	getModelCatalogEntryModelCatalogModelIdGetStatus422Schema,
]);
