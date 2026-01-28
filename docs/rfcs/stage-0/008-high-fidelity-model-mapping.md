# RFC 008: High-Fidelity Model Mapping

**Status:** Draft  
**Author:** Vercel AI Team  
**Created:** 2026-01-27  
**Updated:** 2026-01-27

## Summary

Improve the fidelity of model metadata fetching from Vercel AI Gateway and mapping to VS Code's LanguageModel API, ensuring accurate representation of model capabilities, context windows, and identity.

## Motivation

The current implementation has several fidelity gaps that affect user experience and VS Code's ability to manage models correctly:

1. **Incorrect `family` property** - Uses `creator` (org name) instead of model family, breaking VS Code selectors like `@family:gpt-4o`
2. **Hardcoded `version`** - Always `"1.0"` instead of actual model version
3. **Understated `maxInputTokens`** - Uses 85% of context window, triggering premature context compaction
4. **Missing model type filter** - Embedding and image models appear in chat model list
5. **Incomplete capability detection** - Only `vision` and `tool-use` tags used; `reasoning`, `web-search` ignored

These issues reduce the effectiveness of VS Code's model selection UI and can cause suboptimal behavior during conversations.

## Detailed Design

### Phase 1: Model Identity Parsing

Parse `family` and `version` from the model ID string:

```typescript
// Current: "openai:gpt-4o-2024-11-20"
// Desired: family = "gpt-4o", version = "2024-11-20"

interface ParsedModelIdentity {
  provider: string; // "openai"
  family: string; // "gpt-4o"
  version: string; // "2024-11-20"
  fullId: string; // "openai:gpt-4o-2024-11-20"
}

function parseModelIdentity(modelId: string): ParsedModelIdentity {
  const [provider, modelName] = modelId.split(":");

  // Extract version suffix (date pattern or version number)
  const versionMatch = modelName.match(
    /[-_](\d{4}-\d{2}-\d{2}|\d+\.\d+(?:\.\d+)?)$/,
  );
  const version = versionMatch?.[1] ?? "latest";
  const family = versionMatch
    ? modelName.slice(0, -versionMatch[0].length)
    : modelName;

  return { provider, family, version, fullId: modelId };
}
```

**Examples:**

| Model ID                               | Provider  | Family            | Version    |
| -------------------------------------- | --------- | ----------------- | ---------- |
| `openai:gpt-4o-2024-11-20`             | openai    | gpt-4o            | 2024-11-20 |
| `anthropic:claude-3.5-sonnet-20241022` | anthropic | claude-3.5-sonnet | 20241022   |
| `google:gemini-2.0-flash`              | google    | gemini-2.0-flash  | latest     |
| `mistral:mistral-large-2411`           | mistral   | mistral-large     | 2411       |

**Property-Based Test Strategy:**

Use property-based testing (via `fast-check` or similar) to validate:

1. **Roundtrip Property**: `parseModelIdentity(fullId).fullId === fullId`
2. **Version Pattern Property**: If version != 'latest', it matches `\d{4}-\d{2}-\d{2}` or semantic versioning pattern
3. **Family Suffix Property**: Family + parsed version == original modelName (accounting for separator)
4. **Provider Consistency**: Provider always maps to known AI provider names
5. **No-side-effects Property**: Multiple calls with same input produce identical output

Test edge cases:
- Models without version suffix (e.g., `anthropic:claude`)
- Models with date versions (e.g., `openai:gpt-4o-2024-11-20`)
- Models with semantic versions (e.g., `mistral:mistral-7b-0.1.0`)
- Unknown providers: gracefully set to input before colon
- Models with hyphens in family name (e.g., `google:gemini-2.0-flash`)

### Phase 2: Accurate Token Limits

Use the true `context_window` value for `maxInputTokens`:

```typescript
// Before (conservative but inaccurate)
maxInputTokens: Math.floor(model.context_window * 0.85);

// After (accurate, handle margins in preflight)
maxInputTokens: model.context_window;
```

Add preflight validation in the request path to warn when approaching limits:

```typescript
const TOKEN_WARNING_THRESHOLD = 0.9; // 90% of limit

function validateTokenBudget(
  estimatedTokens: number,
  maxInputTokens: number,
  logger: Logger,
): void {
  const usage = estimatedTokens / maxInputTokens;
  if (usage > TOKEN_WARNING_THRESHOLD) {
    logger.warn(
      `Token usage at ${(usage * 100).toFixed(1)}% of limit. ` +
        `Consider summarizing context.`,
    );
  }
}
```

**Property-Based Test Strategy:**

Property-based tests should verify:

1. **Safety Margin Property**: For any estimatedTokens, `validateTokenBudget` warns only when `estimatedTokens / maxInputTokens > 0.9`
2. **Token Representation Property**: `maxInputTokens` always equals `context_window`, never less
3. **Consistency Property**: Given a fixed model and context_window, maxInputTokens remains constant across updates
4. **Preflight Prediction Property**: If `validateTokenBudget` warns, the actual request should fail 95% of the time with real token counting
5. **No-false-negatives Property**: If a request fails due to context overflow, `validateTokenBudget` should have warned beforehand

Test scenarios:
- Small context windows (4K tokens): Ensure warnings trigger correctly
- Large context windows (100K+ tokens): Test threshold boundaries
- Edge case: estimatedTokens exactly at threshold (0.9 * maxInputTokens)
- Boundary: estimatedTokens just over/under threshold
- Regression: Verify old 85% calculation would have incorrectly avoided warnings in some cases

### Phase 4: Model Type Filtering

Filter models by `type` field to only include language models in chat:

```typescript
interface VercelModel {
  id: string;
  name: string;
  type: "language" | "embedding" | "image";
  // ...
}

function filterChatModels(models: VercelModel[]): VercelModel[] {
  return models.filter((model) => model.type === "language");
}
```

**Property-Based Test Strategy:**

Property-based tests should verify:

1. **Filtering Property**: All returned models have `type === "language"`
2. **Completeness Property**: No language model is filtered out
3. **Type Safety Property**: Input models with invalid types (not in enum) are gracefully handled
4. **Determinism Property**: Multiple calls with same input produce identical output in same order
5. **Empty-handling Property**: Empty input array returns empty array without errors

Test scenarios:
- All models are language type: Returns all
- All models are embedding type: Returns empty array
- Mixed types: Returns only language models in original order
- Missing type field: Models without type property are treated as non-language (excluded)
- Unknown type values (future-proofing): Gracefully excluded
- Case sensitivity: 'Language' vs 'language' (should only match lowercase)

### Phase 3: Enhanced Capability Detection

Expand capability detection beyond `vision` and `tool-use`:

```typescript
interface ModelCapabilities {
  supportsVision: boolean;
  supportsToolUse: boolean;
  supportsReasoning: boolean; // NEW
  supportsWebSearch: boolean; // NEW
  supportsStreaming: boolean; // NEW (assume true for language models)
}

function detectCapabilities(model: VercelModel): ModelCapabilities {
  const tags = new Set(model.tags ?? []);

  return {
    supportsVision: tags.has("vision"),
    supportsToolUse: tags.has("tool-use"),
    supportsReasoning: tags.has("reasoning"),
    supportsWebSearch: tags.has("web-search"),
    supportsStreaming: true, // All Vercel Gateway language models support streaming
  };
}
```

**Property-Based Test Strategy:**

Property-based tests should verify:

1. **Capability Consistency Property**: If a tag is present, corresponding capability is always `true`
2. **No-false-positives Property**: If tag is absent, capability is `false` (unless streaming, which is always true)
3. **Idempotence Property**: Calling `detectCapabilities` multiple times produces identical results
4. **Subset Coverage Property**: All known capability tags (vision, tool-use, reasoning, web-search) are handled
5. **Unknown-tags Property**: Unknown tags don't cause errors, are silently ignored
6. **Capability Availability Property**: At least one of `supportsVision`, `supportsToolUse`, `supportsReasoning`, `supportsWebSearch` is often `true` for modern models

Test edge cases:
- Empty tag array: All false except streaming
- Duplicate tags: No duplication errors
- Case-sensitive tags: 'Vision' vs 'vision' (should only match lowercase)
- Unknown tags mixed with known: e.g., `["vision", "experimental-feature", "tool-use"]`
- All capabilities enabled
- No capabilities enabled (edge case)

### Phase 5: Optional Per-Model Enrichment

For selected models (e.g., user's preferred model), fetch additional metadata:

```typescript
// GET /v1/models/{creator}/{model}/endpoints
interface ModelEndpointDetails {
  context_length: number;
  max_completion_tokens: number;
  supported_parameters: string[];
  supports_implicit_caching: boolean;
}

async function enrichModelMetadata(
  modelId: string,
  baseMetadata: VercelModel,
): Promise<EnrichedModel> {
  // Only enrich on-demand to avoid rate limits
  const details = await fetchModelEndpoints(modelId);

  return {
    ...baseMetadata,
    contextLength: details.context_length ?? baseMetadata.context_window,
    maxCompletionTokens:
      details.max_completion_tokens ?? baseMetadata.max_output_tokens,
    supportedParameters: details.supported_parameters ?? [],
    supportsImplicitCaching: details.supports_implicit_caching ?? false,
  };
}
```

## Implementation Checklist

- [ ] Add `parseModelIdentity()` function with property-based tests
- [ ] Update `provideLanguageModels()` to use parsed `family` and `version`
- [ ] Change `maxInputTokens` to use true `context_window`
- [ ] Add preflight token budget validation with warning
- [ ] Create token budget validation tests (property-based)
- [ ] Filter models by `type === 'language'`
- [ ] Create model filtering tests (property-based)
- [ ] Expand capability detection to include `reasoning`, `web-search`
- [ ] Create capability detection tests (property-based)
- [ ] Integration tests: Verify all phases work together
- [ ] (Optional) Add on-demand endpoint enrichment for selected models

## Testing Philosophy

This RFC emphasizes **property-based testing** using tools like `fast-check` to complement unit tests. Each phase should be validated with:

1. **Unit Tests**: Individual functions tested with concrete examples
2. **Property-Based Tests**: General properties that should hold for all valid inputs
3. **Edge Case Tests**: Boundary conditions, empty inputs, malformed data
4. **Integration Tests**: Verify phases work correctly together
5. **Regression Tests**: Ensure existing functionality (streaming, token estimation) unaffected

### Test Coverage Goals

- **Phase 1 (Identity)**: 95%+ coverage, 20+ property tests
- **Phase 2 (Token Limits)**: 90%+ coverage, 15+ property tests
- **Phase 3 (Capabilities)**: 90%+ coverage, 15+ property tests
- **Phase 4 (Filtering)**: 95%+ coverage, 10+ property tests

### Continuous Validation

During implementation, maintain:
- Zero regression in existing tests
- All new tests green before merging
- Coverage reports tracked in CI/CD

## Drawbacks

1. **Breaking change for selectors** - Users who rely on current `family` values (org names) will need to update their selectors
2. **Token limit change** - Removing the 85% buffer may cause more context overflow errors initially
3. **Additional API calls** - Per-model enrichment adds latency and potential rate limit concerns

## Alternatives

### Alternative A: Server-side mapping

Have the Vercel AI Gateway return pre-parsed `family` and `version` fields. This would be more reliable but requires backend changes.

### Alternative B: Static model registry

Maintain a static mapping of known models to their families/versions. This is more predictable but requires updates when new models are released.

### Alternative C: Keep 85% buffer, add user setting

Instead of removing the token buffer, make it configurable via `vercelAiGateway.tokenBufferPercent`.

## Unresolved Questions

1. Should we cache parsed model identities, or parse on every registration?
2. How should we handle models that don't follow the `provider:name-version` pattern?
3. Should the per-model enrichment be opt-in via settings?

## Implementation Plan

**Phase 1: Model Identity** (1-2 hours)

- Implement `parseModelIdentity()` with comprehensive tests
- Update model registration to use parsed values

**Phase 2: Token Limits** (1 hour)

- Remove 85% multiplier
- Add preflight validation with logging

**Phase 3: Type Filtering** (30 minutes)

- Add `type` filter to model fetching
- Verify no embedding/image models in chat list

**Phase 4: Capabilities** (1 hour)

- Expand capability detection
- Update VS Code registration to include new capabilities

**Phase 5: Enrichment** (optional, 2 hours)

- Implement on-demand endpoint fetching
- Add caching to prevent repeated calls
