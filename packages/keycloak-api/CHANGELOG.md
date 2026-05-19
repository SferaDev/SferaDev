# keycloak-api

## 1.0.0

### Major Changes

- 05e1980: Migrate from openapi-codegen to kubb for code generation.

  Breaking changes:

  - Generated code is now in `./src/generated/` instead of `./src/api/` or other locations
  - Export structure changed: now exports `Fetchers`, `Helpers`, `Schemas`, `Types` instead of previous structure
  - `FetcherExtraProps` renamed to `FetcherConfig`
  - Added new type exports: `ApiClient`, `ApiOperation`, `ApiOperationParams`, `ApiOperationResult`, `ApiOperationByMethod`

### Minor Changes

- fdb7908: Add organization groups endpoints for managing groups within organizations, including creation, update, delete, subgroup operations, and membership management.
- f930fc9: Added new organization invitation endpoints: list, get, delete, and resend invitations for organizations.
- fdb7908: Add ability to return group memberships for organization members.
- 887cbe1: Added new workflows API endpoints and types for managing workflows in admin realms.
- 887cbe1: Added types and endpoints for organization invitations.
- 74ad091: Migrate OpenAPI clients to SferaDev monorepo with improved build configuration, updated dependencies, and enhanced TypeScript support.
- fdb7908: Add a workflow migration endpoint to migrate scheduled resources between workflow steps.
- 887cbe1: Added postAdminRealmsRealmIdentityProviderUploadCertificate API for uploading identity provider certificates.
- fdb7908: Add identity provider group mapping endpoints for organizations.

### Patch Changes

- fdb7908: [BREAKING] Rename roles composite endpoints from 'clientUuid' to 'targetClientUuid' in both path parameters and function names.
- 02a9856: [BREAKING] Removed effect-based client for Admin API.
- fdb7908: Add description and code fields to policy provider representation.
- fdb7908: Add additional properties to schemas and representations, including fields for SCIM API enablement, secondary auth failures, and workflow step status.
- f930fc9: Removed the optional 'address' property from AccessToken and IDToken types.
- 887cbe1: Added 'capability' and 'type' filters to GetAdminRealmsRealmIdentityProviderInstancesQueryParams.
- 0b9d88a: [BREAKING] Removed enforcement mode, policy enforcer, installation adapter, path config, and related types and schemas from the API.
- 0075a59: Update some export types in schemas.ts to use void instead of undefined for better type semantics.
- 887cbe1: Updated AccessToken and IDToken address property to a generic object instead of AddressClaimSet.
- 887cbe1: Added webOrigins field to ClientInitialAccessCreatePresentation type.
- fdb7908: Add support for filtering users by creation date in user and user count queries.
- 887cbe1: Extended CertificateRepresentation with jwks property.
- 887cbe1: Updated and extended workflow-related types and fields, including WorkflowRepresentation and related subtypes.
- 0075a59: Refactor import statements and API method signatures in account and admin components for greater consistency and clarity.
- 5713c48: [BREAKING] Change 'body' parameter in several mutation requests from optional to required.
- 5713c48: [BREAKING] Change many API schema and type fields from bigint to int or number.
- fdb7908: Add providerId filter to components query parameters.
- b7b7071: [BREAKING] Change all int fields representing int64 values to bigint in generated types.
- 887cbe1: Expanded IdentityProviderRepresentation with 'types' property.
- 02a9856: [BREAKING] Removed effect-based client for Account API.
- b7b7071: [BREAKING] Change all optional int fields representing int64 values to bigint in generated schemas.

## 0.2.6

### Patch Changes

- 9301bf7: Add subGroupsCount parameter to GetAdminRealmsRealmGroupsQueryParams

## 0.2.5

### Patch Changes

- fa00357: Change dateFrom and dateTo to accept timestamps in milliseconds

## 0.2.4

### Patch Changes

- 0ffd14e: Add new query parameters 'direction', 'resourceType', and 'audience' to several endpoint definitions

## 0.2.3

### Patch Changes

- e9199f6: Remove realm from account pathParams

## 0.2.2

### Patch Changes

- 44ab118: Add accept header

## 0.2.1

### Patch Changes

- ae275d0: Export extra

## 0.2.0

### Minor Changes

- 7bbd2fd: Add account API

## 0.1.0

### Minor Changes

- 35374e2: Update bundle mechanism
