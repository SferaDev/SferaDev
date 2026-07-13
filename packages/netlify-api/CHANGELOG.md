# netlify-api

## 1.2.0

### Minor Changes

- 85d8e5e: Added required_edge_functions and edge_functions fields to Deploy, Site, and related types, as well as to schemas to track edge-function bundles for deploys.
- 85d8e5e: Added support for the uploadDeployEdgeFunction API endpoint and related types, schemas, and exports.

## 1.1.0

### Minor Changes

- 1df64e3: Add CRUD API endpoints and type definitions for Site Agent Runner Hooks.

## 1.0.0

### Major Changes

- 05e1980: Migrate from openapi-codegen to kubb for code generation.

  Breaking changes:

  - Generated code is now in `./src/generated/` instead of `./src/api/` or other locations
  - Export structure changed: now exports `Fetchers`, `Helpers`, `Schemas`, `Types` instead of previous structure
  - `FetcherExtraProps` renamed to `FetcherConfig`
  - Added new type exports: `ApiClient`, `ApiOperation`, `ApiOperationParams`, `ApiOperationResult`, `ApiOperationByMethod`

### Minor Changes

- 084345c: Add functions_region and functions_region_overrides fields to site, deploy, and related schemas to specify deployment region information for functions.
- c1218f3: Add listing endpoint for all branches on a site's database, including status, compute, and metadata fields.
- 40a6757: Added an optional 'vcpu' property to function configuration schemas, allowing configuration of vCPUs for functions.
- f40175d: Added API endpoint to reset a non-production database branch by re-forking it from a source branch.
- f40175d: Added API endpoint to list all migrations for a specified site database branch.
- f40175d: Added API endpoint to fetch the contents of a named migration for a specified site database branch.
- d00bfdd: Add database management API, including endpoints for creating, listing, deleting, and restoring databases, branches, and snapshots for sites.
- 74ad091: Migrate OpenAPI clients to SferaDev monorepo with improved build configuration, updated dependencies, and enhanced TypeScript support.
- c1218f3: Add endpoint for running site database migrations, including support for dry-run, migration conflict, and validation errors.
- c1218f3: Allow role-based queries for database and branch connection strings via query parameters.
- 00ded01: Added new API endpoint getAccountAIGatewayToken to retrieve AI Gateway token scoped to an account.
- c1218f3: Add support for database branch and snapshot metadata, including new types and fields for branch and snapshot creation, retrieval, and listing.
- c1218f3: Add endpoints and types for managing database compute settings at the branch and project level, including get, set, and clear operations, and corresponding settings types.
- 084345c: Add region field to functionSchema, functionConfigSchema, and deployFilesSchema for specifying regional deployment of individual functions.
- 2914e61: Added support for specifying deploy-specific environment variable data in deploy APIs.
- 792bd66: Bump OpenAPI codegen version to 2.46.0 in generated API files.

### Patch Changes

- 4ef19de: Added or updated JSDoc comments on API functions for improved documentation.
- d925126: Added optional memory allocation (in MB) to function configuration objects in DeployFiles, FunctionConfig, CreateSiteDeployData, and UpdateSiteDeployData schemas and types.
- 0e8e708: Changed the BuildLogMsg.section type to use a multi-line union for clarity.
- 4ef19de: Changed several URL and documentation tags for consistency (e.g., @link /sites instead of {@link /sites}).
- 0e8e708: Refactored API function parameter formatting to use multi-line style for improved readability.
- c43fac7: Add CreateTicketMutationRequest type to support body when creating a ticket.
- 250ff6a: Updated types to allow null values and added min/max constraints for compute settings fields.
- 18d73c2: [BREAKING] Changed all schema and type definitions that used bigint for integer properties (such as size, ttl, priority, etc.) to use int/number instead.
- 4ef19de: Standardized argument passing and error handling across all generated API endpoint functions.
- 4ef19de: Added explicit passing of request headers (including spreading default and user headers) in all endpoint calls.
- 40a6757: Updated function memory description to clarify it is mutually exclusive with 'vcpu'.
- c43fac7: Improve error typing for createTicket endpoint to specify possible 401 and 422 errors.
- c43fac7: Add CreateTicket401 and CreateTicket422 error types for ticket creation endpoint.
- 4ef19de: Updated zod schemas to use 'bigint' and improved property optionality for better type safety on properties such as sizes, timestamps, and enum values.
- c43fac7: Update createTicket API function to accept and pass a body in the request.
- 4ef19de: Updated all function imports and response typings to match new generated API type conventions (e.g., Response instead of MutationResponse).
- 250ff6a: Removed duplicate setSiteDatabaseBranchComputeSettingsComputesettingsSchema and corresponding type definitions.
- ba7618b: Changed integer fields (such as size, ttl, priority, code, etc.) in schemas and types to bigint to support larger values.
- 744dda1: Added optional event_subscriptions field to DeployFiles, FunctionConfig, CreateSiteDeployMutationRequest, and UpdateSiteDeployMutationRequest schemas and types.
- 0e8e708: Reformated union string types in query parameters for better readability.
- c43fac7: Add createTicketMutationRequestSchema with optional message field for ticket creation.
- f2384dc: [BREAKING] Change is_secret field from optional to required in schemas and types for deploy environment variables and related objects.
- 250ff6a: Added validation for min and max values for min_cu, max_cu, and sleep_timeout_seconds in database compute settings schemas.
- c1218f3: Enhance branch, snapshot, and compute-related schemas and types for richer API response details and documentation.
- 4ef19de: Renamed schema and exported types for consistency and clarity in generated/types.ts and schemas.ts.
- 0e8e708: Ensured consistent ordering and grouping of exports in api/extra.ts for maintainability.
- 00ded01: Added type definitions and schemas for the getAccountAIGatewayToken endpoint and its responses.
- bcb7969: Bump generated OpenAPI version from 2.48.0 to 2.49.0 across API source files.
- 4ef19de: Refactored all API function signatures to use named arguments with destructuring and improved default values.
- 4ef19de: Updated query parameter shapes on API functions to inline objects instead of imported types.
- 18d73c2: [BREAKING] The body parameter is now required for several mutation functions in the API, instead of being optional.
- c1218f3: Change database branch identification from deploy_id to branch_id in branch-related endpoints, schemas, and types. [BREAKING]

## 0.10.2

### Patch Changes

- c65b4e0: Change single quotes to double quotes in code for consistency

## 0.10.1

### Patch Changes

- 33fce81: [BREAKING] Change GetAccountResponse type from array to object

## 0.10.0

### Minor Changes

- f169446: Bump API version to 2.37.0

## 0.9.2

### Patch Changes

- fc8b392: Bump version to 2.36.0

## 0.9.1

### Patch Changes

- b53c98c: Update API version to 2.35.1

## 0.9.0

### Minor Changes

- 35374e2: Update bundle mechanism

## 0.8.0

### Minor Changes

- f22345e: Bump version to 2.35.0

### Patch Changes

- 4e146a9: Add query parameters support to listAccountsForUser endpoint

## 0.7.0

### Minor Changes

- a64ae61: Add getAllCertificates endpoint to fetch SSL certificates for a site

## 0.6.1

### Patch Changes

- 8397d02: Remove mention of Enterprise plans from environment variable documentation

## 0.6.0

### Minor Changes

- 7478d2e: Bump API version to 2.34.0
- a86c18e: Add account_id field to Site and SiteSetup schemas

### Patch Changes

- c7990bb: Returns all environment variables for an account or site. An account corresponds to a team in the Netlify UI.

## 0.5.1

### Patch Changes

- 09038be: Update OpenAPI codegen to version 2.33.1

## 0.5.0

### Minor Changes

- 2c6c5a4: Bump version to 2.32.0
- 8580858: Bump API version to 2.33.0

## 0.4.2

### Patch Changes

- 14f1b45: Bump version to 2.31.0

## 0.4.1

### Patch Changes

- e6e9dd3: Update dependencies

## 0.4.0

### Minor Changes

- 213a4c0: Add new endpoint to list site dev servers

## 0.3.2

### Patch Changes

- 3584599: [BREAKING] Updated roles in AddMemberToAccount and UpdateAccountMember endpoints

## 0.3.1

### Patch Changes

- 1eaed14: Update OpenAPI codegen version to 2.28.0

## 0.3.0

### Minor Changes

- 201584c: Update site capabilities schema

### Patch Changes

- e3ad5fd: Update OpenAPI codegen version to 2.26.1

## 0.2.1

### Patch Changes

- d441527: [OpenAPI] Add site functions

## 0.2.0

### Minor Changes

- 8512044: Add new get site env vars

## 0.1.9

### Patch Changes

- 605bae6: [OpenAPI] Spec updates for netlify-api
- 0be29c9: Export `types`

## 0.1.8

### Patch Changes

- 5e1feed: [OpenAPI] Spec updates for netlify-api

## 0.1.7

### Patch Changes

- e922990: [OpenAPI] Spec updates for netlify-api

## 0.1.6

### Patch Changes

- 5da1e9e: [OpenAPI] Add context branch parameter

## 0.1.5

### Patch Changes

- bd49651: Add `branch_deploy_custom_domain` and `deploy_preview_custom_domain`

## 0.1.4

### Patch Changes

- 32af887: Update return type for refresh token

## 0.1.3

### Patch Changes

- 3400a10: Add `request` helper method

## 0.1.2

### Patch Changes

- ca612f6: Add refresh token helper
- 719f021: Add base path
