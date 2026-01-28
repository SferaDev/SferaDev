import { ConfigService } from "../config";
import { ENRICHMENT_CACHE_TTL_MS, ENRICHMENT_ENDPOINT_PATTERN } from "../constants";
import { logger } from "../logger";
import { parseModelIdentity } from "./identity";

export interface EnrichmentResponse {
	data: {
		id: string;
		name: string;
		description?: string;
		architecture?: {
			modality?: string;
			input_modalities?: string[];
			output_modalities?: string[];
		};
		endpoints: ModelEndpoint[];
	};
}

export interface ModelEndpoint {
	name?: string;
	context_length?: number;
	max_completion_tokens?: number;
	supported_parameters?: string[];
	supports_implicit_caching?: boolean;
}

export interface EnrichedModelData {
	context_length: number | null;
	max_completion_tokens: number | null;
	supported_parameters: string[];
	supports_implicit_caching: boolean;
}

interface EnrichmentCacheEntry {
	fetchedAt: number;
	data: EnrichedModelData | null;
}

export function extractCreatorAndModel(modelId: string): { creator: string; model: string } | null {
	if (!modelId) return null;

	if (modelId.includes(":")) {
		const { provider, family } = parseModelIdentity(modelId);
		if (!provider || !family) return null;
		return { creator: provider, model: family };
	}

	if (modelId.includes("/")) {
		const [creator, model] = modelId.split("/");
		if (creator && model) return { creator, model };
	}

	return null;
}

export class ModelEnricher {
	private cache = new Map<string, EnrichmentCacheEntry>();
	private configService: ConfigService;

	constructor(configService: ConfigService = new ConfigService()) {
		this.configService = configService;
	}

	async enrichModel(modelId: string, apiKey: string): Promise<EnrichedModelData | null> {
		const cached = this.cache.get(modelId);
		if (cached && Date.now() - cached.fetchedAt < ENRICHMENT_CACHE_TTL_MS) {
			return cached.data;
		}

		if (cached) {
			this.cache.delete(modelId);
		}

		const parsed = extractCreatorAndModel(modelId);
		if (!parsed) {
			logger.warn(`Unable to extract creator/model from model id: ${modelId}`);
			return null;
		}

		const { creator, model } = parsed;
		const url = `${this.configService.endpoint}${ENRICHMENT_ENDPOINT_PATTERN}/${encodeURIComponent(
			creator,
		)}/${encodeURIComponent(model)}/endpoints`;

		try {
			const response = await fetch(url, {
				headers: apiKey
					? {
							Authorization: `Bearer ${apiKey}`,
						}
					: {},
			});

			if (!response.ok) {
				if (response.status === 404) {
					logger.warn(`Enrichment endpoint returned 404 for ${modelId}`);
					const entry = { fetchedAt: Date.now(), data: null };
					this.cache.set(modelId, entry);
					return null;
				}

				logger.warn(
					`Enrichment endpoint failed for ${modelId}: HTTP ${response.status} ${response.statusText}`,
				);
				return null;
			}

			const body = (await response.json()) as EnrichmentResponse;
			const endpoint = body?.data?.endpoints?.[0];
			if (!endpoint) {
				logger.warn(`No endpoints returned for ${modelId}`);
				const entry = { fetchedAt: Date.now(), data: null };
				this.cache.set(modelId, entry);
				return null;
			}

			const data: EnrichedModelData = {
				context_length: endpoint.context_length ?? null,
				max_completion_tokens: endpoint.max_completion_tokens ?? null,
				supported_parameters: endpoint.supported_parameters ?? [],
				supports_implicit_caching: endpoint.supports_implicit_caching ?? false,
			};

			this.cache.set(modelId, { fetchedAt: Date.now(), data });
			return data;
		} catch (error) {
			logger.warn(`Failed to fetch enrichment for ${modelId}`, error);
			return null;
		}
	}
}
