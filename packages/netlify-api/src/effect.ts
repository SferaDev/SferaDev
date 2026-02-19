import { createEffectApi, createEffectByPath } from "@sferadev/openapi-utils/effect";
import { operationsByPath, operationsByTag } from "./generated/components";

export const ApiService = createEffectApi(operationsByTag);
export const effectByPath = createEffectByPath(operationsByPath);

export type { EffectApi } from "@sferadev/openapi-utils/effect";
export {
	ApiConfig,
	ApiError,
	makeApiLayer,
	NetworkError,
	ValidationError,
} from "@sferadev/openapi-utils/effect";
