# litellm-api

## 1.0.0

### Major Changes

- 05e1980: Migrate from openapi-codegen to kubb for code generation.

  Breaking changes:

  - Generated code is now in `./src/generated/` instead of `./src/api/` or other locations
  - Export structure changed: now exports `Fetchers`, `Helpers`, `Schemas`, `Types` instead of previous structure
  - `FetcherExtraProps` renamed to `FetcherConfig`
  - Added new type exports: `ApiClient`, `ApiOperation`, `ApiOperationParams`, `ApiOperationResult`, `ApiOperationByMethod`

### Minor Changes

- 74ad091: Migrate OpenAPI clients to SferaDev monorepo with improved build configuration, updated dependencies, and enhanced TypeScript support.

### Patch Changes

- 9c69bd2: Update video generation schemas to allow input_reference to accept File instances.
- 9c69bd2: Add documentation comments to type definitions in types file for improved clarity.

## 0.0.3

### Patch Changes

- 4140a48: Fix baseUrl injection

## 0.0.2

### Patch Changes

- 33a1365: Initial release
