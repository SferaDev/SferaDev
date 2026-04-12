# nuki-api-js

## 1.0.0

### Major Changes

- 05e1980: Migrate from openapi-codegen to kubb for code generation.

  Breaking changes:

  - Generated code is now in `./src/generated/` instead of `./src/api/` or other locations
  - Export structure changed: now exports `Fetchers`, `Helpers`, `Schemas`, `Types` instead of previous structure
  - `FetcherExtraProps` renamed to `FetcherConfig`
  - Added new type exports: `ApiClient`, `ApiOperation`, `ApiOperationParams`, `ApiOperationResult`, `ApiOperationByMethod`

### Minor Changes

- 2b048c3: Added includeEmail optional field to GetSmartlockAuthsResourceQueryParams schema and type definition.
- 74ad091: Migrate OpenAPI clients to SferaDev monorepo with improved build configuration, updated dependencies, and enhanced TypeScript support.
- c615ad1: Added the optional field 'annotations' to AccountSettingWeb for storing additional generic settings.

### Patch Changes

- 5130e70: Re-ordered Metadata, CharacterSet, Encoding, Language, MediaType, and MetadataService types and schemas for clarity and consistency.
- bb09568: Update OpenAPI generated code version from 4.4.1 to 4.5.0 in components, requestBodies, and schemas files.
- 5130e70: Fixed the order of currentlyIssuingAuth and currentlyRevokingAuth fields in AddressReservation type and schema.
- 2b048c3: Reordered currentlyIssuingAuth and currentlyRevokingAuth fields in AddressReservation schema and type definition.
- bb09568: Reorder 'currentlyRevokingAuth' and 'currentlyIssuingAuth' in AddressReservation type to match updated schema.
- 9cd39b3: [BREAKING] Make body parameter required for several API resource mutation functions.
- 5130e70: Re-ordered fields in ObjectId type and schema to match usage consistency.
- bb09568: Reorder fields in Application, Request, Response, and Restlet types to match updated schema.
- 887d4d2: Changed the types for 'offset' and 'limit' in GetAccountUsersResourceQueryParams from undefined to void for increased type clarity.
- 8c8e5d6: Changed various API fields from number (int) to bigint (int64) for improved large integer support.
- c615ad1: Reordered some properties in Application, ClientInfo, Request, Response, Status, and related schemas/types to match updated model definitions.
- 5130e70: Moved RangeService schema and type to a new position for consistency with other services.
- 5130e70: Re-ordered properties in Status type and schema for sequential logic: error category booleans now appear before generic/global/error flags.
- 5130e70: Re-ordered and improved clarity for Protocol and Reference schemas and types.
- 2b048c3: Reordered machineIdentifier, processIdentifier, and timeSecond fields in ObjectId schema and type definition.
- c615ad1: Changed descriptions for smartlockLogSchema.trigger and smartlockLogSchema.state to add more trigger/state details.
- c615ad1: Reordered and refactored schema and type definitions for Protocol, Reference, Metadata, RangeService, and others to improve code structure.
- 5130e70: Moved confidential field to a better position in Request and Response schemas and types.
- 5130e70: Re-ordered properties in Application type and schema for consistency.
- 9cd39b3: [BREAKING] Replace all use of bigint with number for smartlockId and related fields in types and schemas.
- cec32f5: Reordered several optional properties in schemas and types for better consistency with generated API definitions.
- bb09568: Add 'identifier' field to Reference type and adjust field order to match updated schema.
- 5130e70: Moved upstreamAddress field in ClientInfo type and schema for better logical grouping.

## 0.2.1

### Patch Changes

- abac583: Update version to 3.13.1.

## 0.2.0

### Minor Changes

- e290087: Add pagination support for smartlock authorizations

## 0.1.1

### Patch Changes

- 3a8c590: Standardize import statements by changing single quotes to double quotes

## 0.1.0

### Minor Changes

- 3098c23: [BREAKING] Remove subscription-related APIs and data types

## 0.0.6

### Patch Changes

- 8e2667e: Bump version to 3.8.1

## 0.0.5

### Patch Changes

- c518729: Update API version to 3.8.0

## 0.0.4

### Patch Changes

- d5dedd9: Bump version to 3.7.0

## 0.0.3

### Patch Changes

- 66d3d00: Update API version to 3.6.0

## 0.0.2

### Patch Changes

- 236410a: Bump version to 3.5.1

## 0.0.1

### Patch Changes

- 5571d9d: Initial release
