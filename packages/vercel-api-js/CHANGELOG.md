# vercel-api-js

## 1.1.0

### Minor Changes

- 2053ddf: Added a new variant to the UserEvent type and schema to include authentication methods, geolocation, user agent, environment, OS, and MFA factors information.
- 6e270cb: Added RateLimitNotice schema and type.
- c3a43ee: Add listEventTypes endpoint to allow listing all user-facing event types with descriptions.
- 5fbafa4: Add types, schemas, and API endpoints for Secure Compute networks, including list, create, delete, update, and read operations.
- 1e823d5: Added Drains endpoints for log drains: create, retrieve, update, delete, and test Drains.
- c3a43ee: Add getTld endpoint to fetch metadata for a specific TLD.
- 9b46913: Removed CreateSecret402 and GetSecret404 error types from API methods, types, and schemas.
- caa2d51: Added GET /v1/billing/contract-commitments endpoint to retrieve FOCUS v1.3 compliant contract commitments for a team.
- c28ed6f: Add listEventTypes API endpoint to list user-facing event types with descriptions.
- c3a43ee: Refactor ProjectsService: remove updateProjectDataCache and related types; add new rollback and update-description methods, and internal reordering.
- a9bae26: Allowed 'blob', 'postgres', and 'redis' fields in user events to use new blockReason variants and support a union type for block reasons.
- 6e270cb: Added reusable error schemas and types (VercelBaseError, VercelForbiddenError, etc).
- 85b4770: Add Sandboxes API: endpoints for managing, executing commands in, and handling files and snapshots inside Vercel sandboxes.
- 4be1a80: Added the GET /v1/installations/{integrationConfigurationId}/resources/{resourceId}/experimentation/edge-config endpoint to fetch the contents of a user-provided Edge Config when Edge Config syncing is enabled.
- 2f6c552: Added new endpoint to update the description for a rollback via PATCH /v1/projects/{projectId}/rollback/{deploymentId}/update-description.
- c3a43ee: Add finalizeInstallation endpoint for partners to finalize marketplace installations and allow uninstall.
- 2f6c552: Added new requestRollback endpoint to allow users to rollback to a deployment.
- 85b4770: Add Feature Flags API: endpoints for creating, updating, listing, and deleting feature flags, segments, and settings for projects and teams.
- c3a43ee: Add gETV1InstallationsIntegrationConfigurationIdResourcesResourceIdExperimentationEdgeConfig endpoint to fetch edge config data for experimentation resources.
- 1e823d5: Added endpoints for configuring Static IPs in a project and client certificate management for mTLS egress auth.
- 7eb8091: Added new payload objects for invoice refund and modification events, including fields for invoice IDs, refund reasons, line item count, and settlement method.
- 7eb8091: Added new user event types 'invoice-modified' and 'invoice-refunded' to the user event schema and types.
- c3a43ee: Add listBillingCharges and listContractCommitments endpoints to provide billing charge and contract commitment data.
- 7eb8091: Introduced 'payloadSettlementMethodEnum' with values 'refunded-paid' and 'credited-paid'.
- ec6d9df: Added a new enum type and key for data cache excess billing enabled state.
- 750dcd9: Add support for a new UserEvent variant containing project Git provider migration details with previous and next fields.
- 966252f: Added getTld endpoint to retrieve metadata for a specific TLD.
- 3b019a4: Added support for projectIds:'all' in UserEvent integration payloads.
- 906eeca: Added the finalizeInstallation endpoint to allow partners to mark an installation as finalized.
- 9b46913: Removed deprecated 'id' and 'projectId' fields from GetSecretsQueryParams type and related schemas.
- 1e823d5: Removed deprecated deprecated buyDomain function and related API types.
- a6aa4d7: Added pagination and search support to the listFlags API endpoint, including 'limit', 'cursor', and 'search' query parameters.
- 1e823d5: Added shared environment variable endpoints for teams: create, list, update, delete, retrieve by id, and unlink from project.
- 1e823d5: Added endpoint for team Directory Sync role mappings update.
- 8736008: Added new endpoints for managing project checks and deployment check runs, including list, create, get, update, and delete operations.
- 8ac6fd7: Added new event object types to userEventSchema, including analytics, domain, export, file, rule, and edge config related events.
- a9bae26: Added 'hard_blocked' as a possible value for blockReason in multiple resource-related schemas and types.
- 74ad091: Migrate OpenAPI clients to SferaDev monorepo with improved build configuration, updated dependencies, and enhanced TypeScript support.
- c3a43ee: Add pATCHV1ProjectsProjectIdRollbackDeploymentIdUpdateDescription endpoint to update rollback descriptions.
- 1e823d5: Added integration, billing, and git-related endpoints: marketplace billing plan listing, resource/project connections, update installation, git namespaces, and repo search.
- ec6d9df: Added new enum types and keys for enhanced builds, remote caching, SAML enforcement, membership states, roles, team permissions, and origin in team-related types.
- c3a43ee: Add requestRollback endpoint to allow projects to rollback to a deployment.
- 1e823d5: Added bulk redirects endpoints: staging, editing, deleting, restoring, versioning, and promoting project-level redirects.
- 1e823d5: Added endpoints for edge cache tag/image invalidation and dangerous deletes by tag and by src image.
- caa2d51: Added GET /v1/billing/charges endpoint to retrieve FOCUS v1.3 compliant usage cost metrics for a team.
- 1e823d5: Added Domains Registrar endpoints: supported TLDs, TLD price, domain availability and price, buy domains (single and multiple), renew, transfer-in, transfer status, order info, update auto-renew and nameservers, contact info schema.
- 8c10b95: Added a new variant to userEventSchema and UserEvent type with projectId, projectName, previous, and next objects.

### Patch Changes

- 9200170: Add optional 'leakedAt' field to AuthToken schema and type to indicate when the token was marked as leaked.
- caa2458: Added a new object variant with 'id' and 'url' fields to the UserEvent schema and type definition.
- c3a43ee: Remove unused error type PatchUrlProtectionBypass500 from patchUrlProtectionBypass endpoint.
- 906eeca: Added runId field to a UserEvent object variant.
- f432baa: Added support for branch matcher details in custom environment objects in the user event schema and types.
- de7684d: Add user event tracking for gitForkProtection property changes in projects.
- 750dcd9: Change the order of values in the importFlowGitProvider enum to match a new preferred order.
- 2d3e1ea: Added ListCommands410 and ListCommands422 error types to the listCommands API endpoint.
- fb890e9: Added optional isEnterpriseManaged property to AuthUser and AuthUserLimited schemas and types to indicate enterprise management status.
- ecb9b84: Added new variants to the userEventSchema for additional event payloads, including concurrent builds, provider details, and recovery codes.
- 8ac6fd7: Made projectId and projectName fields optional in several user event object schemas.
- 0aee180: Added a regex pattern constraint for projectId in GetAllLogDrainsQueryParams to ensure valid project IDs.
- 0aee85e: Renamed and refactored the billing charges API from gETV1BillingCharges to listBillingCharges, updating request parameters and types.
- 418f7c1: Removed 'read-write:user' from payloadPermissionsEnum and userEvent schema permissions.
- 6e270cb: Removed the /certs list endpoint and related types and schemas.
- 6a04278: Added new UserEvent object variants for project-related Git information and deployment options.
- b5daff8: Added workflowStorage and workflowStep block information to user event schema.
- ecb9b84: Made the 'factors' field optional in several user event objects to better reflect the possible payloads.
- fa0ce4d: Added 'defaultPurchaseType' (with enum values 'standard', 'enhanced', 'turbo') to userEventSchema and authUserSchema.
- 9211d88: Added recommendation in documentation comments to prefer using 'invalidateByTag' and 'invalidateBySrcImage' methods over 'dangerouslyDeleteByTags' and 'dangerouslyDeleteBySrcImages' for advanced use cases.
- 71c8540: Re-organized imports in the generated API entrypoint to use direct endpoint types and schemas.
- 376450a: Added enum types for fields related to automatic code review settings (enabled, scope, includeDrafts).
- 5522d80: Changed CountryCode type from enum to generic string type.
- beb0866: Add new user event schema for enableAffectedProjectsDeployments field for projects.
- 418f7c1: Added skewProtectionBoundaryAt, skewProtectionMaxAge, and skewProtectionAllowedDomains objects to the userEvent schema.
- 3d27423: [BREAKING] Removed the updateProjectDataCache endpoint and all related types and schemas.
- c740263: Removed the acceptedPermissionSets and nextAcceptedPermissionSets fields from userEvent schema and UserEvent type.
- b284a0e: Adjusted joinedFrom.origin and related enums to move 'link' and 'import' to the beginning of the list for consistency.
- bced0dc: Added JSDoc comments for nonEmptyString to NonEmptyTrimmedString, EmailAddress, and phone number types in types.ts.
- 9b46913: Removed unnecessary 'headers' property from request calls in secret-related API methods.
- de7684d: Add support for user event tracking on changes to project issuerMode.
- 6e270cb: Removed the /data-cache/purge-all endpoint and related types and schemas.
- 47ad788: Add user event schema for functionDefaultTimeout update.
- d5a6981: Added optional prefix and suffix fields to AuthToken schema for identification.
- 9002dca: Extended UserEvent schema's factors and related enums for authentication origins and improved factor tracking.
- 966252f: Added 'nsnb-request-access' to joinedFromOrigin enums in user and team schemas.
- 3b7949f: Added optional nsnbConfig property with preference setting to Team schema and type.
- 3b019a4: [BREAKING] Removed all Secret-related API endpoints and types, including getSecrets, createSecret, renameSecret, getSecret, and deleteSecret.
- 1e823d5: Marked some domains endpoints as deprecated and noted their replacements in summary.
- 5253cb0: Added optional 'history' field to MFA configuration schema to track state changes and relevant details.
- de7684d: Add user event tracking for customerSupportCodeVisibility property changes in projects.
- 1e823d5: Added additional error type handling and enhanced error schemas throughout endpoints.
- 0cca541: Extended user event schema and types to support additional payloads for payment methods and subscription actions, including plan cancellation, resumption, mutation, and product aliases.
- 6c1a68b: Refactored mcp.ts to re-export all endpoint functions from components.ts, consolidating API surface and reducing boilerplate.
- c4bf629: Added 'nsnb-invite' value to joinedFromOriginEnum and related enum definitions and schemas.
- 92e10fb: Removed the description comment from CreateSandbox404 schema and type.
- b5daff8: Added enums and types for workflowStorage and workflowStep block reasons.
- b284a0e: Reordered enum values across multiple places to match updated canonical order (e.g., actions, scopes, types, environment, trustedIps, clientAuthenticationUsed, commitVerification, from/toAccountType).
- a68644f: Added optional syncState property to SAML SSO and Directory Sync configurations in team and teamLimited schemas to indicate processing state.
- 52113c6: Introduced payloadDirectoryListingEnum and associated type for directoryListing property.
- 048da32: Added import for CallToolResult type from utils/mcp.
- bd25f9b: Renamed payloadActionEnum7 and PayloadActionEnum7Key to payloadActionEnum8 and PayloadActionEnum8Key, and updated references accordingly.
- 0aee85e: Added enums and typings for build machine default types and integrated them into user, team, and auth user types and schemas.
- 6b31045: [BREAKING] Changed the registrantFieldSchema validation field to accept only strings instead of specific enums or patterns.
- 3d27423: Expanded countryCode to use a strict enum of ISO 3166-1 alpha-2 codes rather than a string regex.
- bd25f9b: Introduced payloadActionEnum6 with enabled and disabled values, and corresponding type PayloadActionEnum6Key.
- fbcc6f4: Added optional 'access' property with enum values 'public' and 'private' to userEventSchema and UserEvent type.
- f6e47b5: Added buildQueueConfiguration and oldBuildQueueConfiguration optional fields with enum values to user event schema.
- b284a0e: Moved teams.created property after createdAt in types to match schema order.
- 906eeca: Extended UserEvent type to add support for projectId, scope, source, and expiresAt fields.
- 6e270cb: Allowed arbitrary properties in teamSchema to support unexpected fields.
- 4b64934: Added new payload variants to userEventSchema and UserEvent type for plans, trial information, invoice details, email domain, invite code, and trial credits.
- 1e823d5: Set query parameter types to properly handle undefined/optional and removed | undefined where not needed.
- 6eeb9a5: Add a new provider-login object form to userEventSchema options, supporting providers github, github-limited, github-custom-host, gitlab, bitbucket, google, and apple.
- ec6ed6f: Added enum emu to payloadAuthMethodEnum and corresponding types to support new auth method.
- fedb792: Added optional 'leakedUrl' and 'suffix' fields to the AuthToken type and schema.
- 0cca541: Added new user event types related to payment methods and subscriptions (payment-method-added, payment-method-default-updated, payment-method-removed, subscription-created, subscription-product-added, subscription-product-removed, subscription-updated).
- 63eb4c1: Introduced PayloadPreviewDeploymentsEnabledEnum type for the previewDeploymentsEnabled property.
- 0534aa5: Update listEventTypes endpoint from /events/types to /v1/events/types for improved consistency and correctness.
- bd25f9b: Added a new object schema to userEventSchema with projectId, projectName, and action fields.
- 5522d80: Improved documentation for updateRollingReleaseConfig to clarify behavior when disabling with resolve-on-disable enabled.
- c3a43ee: Remove deprecated updateProjectDataCache endpoint from ProjectsService.
- 1bf6bba: Added 'standard' as a valid value for the build machine purchaseType and default enums.
- a9bae26: Added and described documentation for the meaning of the 'automated' and 'reason' fields in plan change and member removal event payloads.
- 2053ddf: Introduced enums and types for various authentication methods and MFA factors in generated types.
- 0aee85e: Renamed and refactored the contract commitments API from gETV1BillingContractCommitments to listContractCommitments, updating request parameters and types.
- c3a43ee: Include optional InviteUserToTeamQueryParams in inviteUserToTeam method and endpoint.
- fae7185: [BREAKING] Removed deprecated checkDomainPrice and checkDomainStatus API endpoints, along with related types and schemas.
- 3e6ad2c: Extended the list of possible values for getBillingPlansQueryParams 'source' field to a defined enum and updated the types accordingly.
- c4bf629: Added 429 (Too Many Requests) error type handling for Deployment and Team access endpoints.
- 5fb9f19: Exported userEventTypeEnum and UserEventTypeEnumKey for event type handling in UserEvent.
- 3b019a4: Added UpdateStaticIps409 error type to updateStaticIps mutation errors.
- c3a43ee: Add new error types such as CreateAuthToken404, GetDeployment429, CreateDeployment429, CreateDeployment503, GetTld429, GetTld500, RequestAccessToTeam429, and others to various endpoints for improved error handling.
- 8ac6fd7: Added PROJECT_GUEST as a new possible role in multiple membership and role enums and schemas.
- 0ff227e: Added support for the UpdateNetworkPolicy402 error type in the updateNetworkPolicy endpoint.
- 47ad788: Add user event schema for functionZeroConfigFailover update.
- beb0866: Add new user event schema for sourceFilesOutsideRootDirectory field for projects.
- ec6d9df: Updated Team, TeamLimited, and AuthUser types to utilize new enum keys for enhanced builds, remote caching, SAML enforcement, membership states, roles, team permissions, and origin.
- c3a43ee: Standardize URL parameter concatenation throughout API methods.
- 3b019a4: Removed ExchangeSsoToken404 error type from exchangeSsoToken mutation errors.
- 8c10b95: [BREAKING] skewProtectionAllowedDomains is now required in userEventSchema and UserEvent type next object.
- 0aee85e: Added schema definitions for listBillingCharges and listContractCommitments endpoints and responses.
- 52113c6: Added new user event type for projects with directoryListing property in userEventSchema and UserEvent type.
- 58d2f79: Added projectId field to several userEventSchema variants and corresponding UserEvent types.
- f2fd5bb: Removed 'read-write:team' from permissions enums and user event schema.
- 74d981f: Added 'nsnb-auto-approve' as a new option to various joinedFromOriginEnum and related schemas.
- fa99aa6: Added a new project event type with 'gitLFS' and 'projectId' to user event schema and types.
- 3d27423: Added strictDeploymentProtectionSettings property to the Team type and schema.
- a6aa4d7: Updated the description and summary of the listFlags API method to reflect new filtering and pagination support.
- 94a1c6d: Add explicit schemas and types for 200 responses for listBillingCharges and listContractCommitments endpoints.
- cd6129b: Introduced projectsRoleEnum constant and ProjectsRoleEnumKey type for project role handling.
- d5a6981: Reordered createdAt and expiresAt fields in AuthToken schema to align with API changes.
- 6e270cb: Removed the /data-cache/billing-settings endpoint and related types and schemas.
- de7684d: Add user event tracking for project expiration configuration changes.
- cd6129b: Added new variants to UserEvent type for project domain, redirects, roles, and configuration events.
- 47ad788: Add user event schema for functionDefaultRegions update.
- 6eeb9a5: Add payloadProviderEnum and PayloadProviderEnumKey for type safety around provider property.
- 94a1c6d: Refactor ListBillingChargesQueryResponse and ListContractCommitmentsQueryResponse types to use concrete response types instead of any.
- 144fcba: [BREAKING] Removed all client certificate management endpoints and types for project mTLS egress from the API.
- bd25f9b: Renamed payloadActionEnum6 and PayloadActionEnum6Key to payloadActionEnum7 and PayloadActionEnum7Key, and updated references accordingly.
- b284a0e: Reordered properties in user object schema and types, moving slug before username and email, for consistent property order.
- ecb9b84: Extended UserEvent and associated types to support new enums and properties, such as PayloadTotpEnum and PayloadActorTypeEnum.
- 4b64934: Added new enums PayloadPlanEnumKey and PayloadConvertedFromTrialEnumKey for plans and trial conversion status in types.
- aa354b2: Added buildQueueConfiguration filter to getProjects query parameters schema and types.
- 376450a: Added support for tracking automatic code review settings changes in user event schemas.
- f6e47b5: Added the ineligibleForAppeal boolean field to user event schema.
- fa0ce4d: Exported BuildMachineDefaultPurchaseTypeEnum and BuildMachineDefaultPurchaseTypeEnum2 types to reflect 'defaultPurchaseType' addition.
- f432baa: Introduced BranchMatcherTypeEnumKey type and branchMatcherTypeEnum constants.
- 9b46913: Simplified response types and schemas by replacing specific types (e.g., CreateSecret200, RenameSecret200) with generic unknown/any types.
- 9002dca: Added 'nsnb-viewer-upgrade' to joinedFromOriginEnum and related enums in Team schemas.
- c3a43ee: Remove support for CreateNetwork404 and DeleteNetwork404 as error types in the networking endpoints.
- 906eeca: Added new types and schema definitions for finalizeInstallation API, including path params and possible error responses.
- 5fb9f19: Added a 'type' property to userEventSchema and UserEvent type, representing the event type with a list of string-enum values.
- 4be1a80: Refactored schemas and types to represent booleans as literal true/false unions and enum types for improved type safety and API consistency, especially for fields throughout the event and configuration models.
- 6a04278: Added payloadGitProviderEnum and payloadCreateDeploymentsEnum types for additional enum validation.
- 9200170: Remove redundant JSDoc comments from GetProjects200 type and schema.
- 5522d80: Loosened countryCode schema from specific enum to generic string type for ISO 3166-1 alpha-2 country codes.
- 3e6ad2c: Added new user event object variants in userEventSchema and UserEvent type to support additional project and environment properties.
- 63eb4c1: Added a new UserEvent variant for project preview deployments with projectId, projectName, and previewDeploymentsEnabled fields.
- 966252f: Added languageCodeRequired schema and related types for punycode domains.
- 8dc64f0: Added a new variant to userEventSchema to support project webhook events with projectId, projectName, hookName, and ref fields.
- ec6ed6f: Added enum emu to scopesOriginEnum and corresponding types.
- 87cb3c0: Shortened and clarified descriptions for product listing and store creation endpoints in API documentation.
- 5c2329b: Added @ts-expect-error comments to suppress TypeScript errors for deep type instantiations in server.tool calls.
- a68644f: Added ConnectionSyncStateEnum and DirectorySyncStateEnum types to support syncState property for connection processing states.
- 6e270cb: Improved schema property descriptions for various team and firewall config path parameters.
- 361b463: Added support for 404 (Not Found) error handling in the createAuthToken API and related types.
- c3a43ee: Clarify and update JSDoc comments and endpoint descriptions for multiple endpoints.
- 0aee180: Updated description for InviteUserToTeam403 to clarify permission requirements.
- 47ad788: Add user event schema for functionDefaultMemoryType update.
- 4b64934: Made projectId and projectName optional in userEventSchema and UserEvent type.
- 16ad0b3: Added 'read-write:billing' permission to permission enums and schemas.
- ec6ed6f: Added isEnterpriseManaged field to user event schema and types to indicate if a user is an enterprise-managed user.
- b284a0e: Reordered some interface/type property declarations and object fields for better alignment with generated schema definitions (e.g., deployment.url and deployment.meta).
- 67ad211: Removed the PatchUrlProtectionBypass500 type and schema from the API.
- 52113c6: Added new user event type for deletedCount and inviteIds in userEventSchema and UserEvent type.
- a1028b0: Add support for user events with protectedSourcemaps property in the schema and types.
- 1e823d5: Improved JSDoc and description accuracy, particularly for new and existing endpoints.
- 6eeb9a5: Update the order of auth methods in payloadAuthMethodEnum.
- 67ad211: Removed the PatchUrlProtectionBypass500 response from the patchUrlProtectionBypass function.
- 3bdcf91: Removed documentation comment from CreateSandbox200Schema and CreateSandbox200 type.
- e02b18f: Removed the cronJobs property from UserEvent and AuthUser schemas and types.
- e50e15c: Made aws.securityGroupId optional in userEventSchema and UserEvent type.
- 9002dca: Added optional slug query parameter to inviteUserToTeam and getTeamMembers endpoints for specifying the Team slug.
- 20a3cc3: Added optional 'permissions' array to user event schema and UserEvent type for payload, before, and after objects.
- c4bf629: Removed 404 error type from createNetwork and deleteNetwork error types.
- de7684d: Add user event tracking for publicSource property changes in projects.

## 1.0.2

### Patch Changes

- 0477f31: Update constructor

## 1.0.1

### Patch Changes

- ee3042e: Fix baseUrl and updates

## 1.0.0

### Major Changes

- 24c9a11: Revamp Vercel API client

### Patch Changes

- 5b28378: Add Nitro support in project configuration.

## 0.25.3

### Patch Changes

- d186f87: Add AWS configuration options to user event and project responses
- e4a886b: Remove dangerous promotion from canary
- 9b061f2: Remove northstarMigration from AuthUser schema

## 0.25.2

### Patch Changes

- 36bb5d7: Add new 'connectConfigurations' field to 'UpdateProjectDataCacheResponse'
- afab785: Add `increasedOnDemandEmailSentAt`
- 85cfccd: Add environmentOverrides field to UpdateResourceSecretsRequestBody, UpdateResourceSecretsByIdRequestBody, and ImportResourceRequestBody types
- 26b0be3: Add edgeCacheNamespace to project related responses
- 0029939: Add removeRedirects field to RemoveProjectDomainRequestBody
- f8b866f: Rename createOrTransferDomain to postDomains for consistency

## 0.25.1

### Patch Changes

- ee2684f: Update buildMachineType field in resourceConfig and defaultResourceConfig

## 0.25.0

### Minor Changes

- 9df31d8: [BREAKING] Added configurationId field to CreateProjectResponse, GetProjectResponse, UpdateProjectResponse, and UpdateProjectDataCacheResponse

### Patch Changes

- 640279f: Add shared v0 token

## 0.24.3

### Patch Changes

- 52b71a8: Reduce maxLength constraint on project search field
- 158dcb6: Adjust type definition for GetDeploymentEvents response

## 0.24.2

### Patch Changes

- 6466a46: Add new 'fromRollingReleaseId' field to lastAliasRequest type
- 3dab4ff: Removed 'aiCredits' from UserEvent and AuthUser schemas
- 6feddf3: [BREAKING] Add new 'vercelAppInstallation' property to 'GetProjectsResponse', 'CreateProjectResponse', 'GetProjectResponse', and 'UpdateProjectResponse'
- 9298c0b: Make some changes to optional properties
- fbe45d4: Reorder 'handle' properties in 'CreateDeploymentResponse' to match alphabetical order
- 9ae5776: Remove 'abovePlan' field from UserEvent type
- 7dddb74: undefined
- 99819ef: Change ordering of 'type' values in matching options
- 80457f9: Update build machine type options in various API responses
- 37efdb6: Update customEnvironments type to include detailed properties for each environment
- 16764f0: Add patchAliasesIdProtectionBypass

## 0.24.1

### Patch Changes

- 14decee: Add new endpoint to move project domain to another project
- 93d6b84: Remove recommendedIps and recommendedCname fields from GetDomainConfigResponse
- 6c401f1: Add 'abovePlan' field to 'buildMachine' in UserEvent type
- 3d20390: [BREAKING] Add new field customEnvironmentsPerProject to UserEvent and AuthUser schemas
- de0d55c: [BREAKING] Add new 'google' type to user credentials and auth tokens
- b9da014: Update `requireApproval` and `minutesToRelease` fields

## 0.24.0

### Minor Changes

- 06a8f43: [BREAKING] New endpoint vercelRun to perform a new action

### Patch Changes

- fea55e7: Remove vsmValue

## 0.23.6

### Patch Changes

- 0214182: Add team member MFA status field to project responses

## 0.23.5

### Patch Changes

- a747080: Add body parameter to upload file endpoint

## 0.23.4

### Patch Changes

- c39ff4a: [BREAKING] Change structure of favoriteProjectsAndSpaces in UserEvent and AuthUser

## 0.23.3

### Patch Changes

- 320f4c8: Add new flags explorer overrides threshold and unlimited overrides
- 11e409a: Rename 'GetV1ExperimentationItems' type to 'QueryExperimentationItems'
- 9220b02: Add new optional fields to ImportResourceRequestBody

## 0.23.2

### Patch Changes

- a365114: [BREAKING] Change the order of 'type' options in CreateProjectEnvResponse
- ad484c6: [BREAKING] Change handle values in CreateDeploymentResponse

## 0.23.1

### Patch Changes

- 1331e24: Change handling for lambdas createdAt and readyState in CreateDeploymentResponse
- 4efc49f: Change readySubstate values and added a new 'ROLLING' state
- ad83874: [BREAKING] Change deliveryFormat options in log drain endpoints

## 0.23.0

### Minor Changes

- ecf56ca: Add recommended IPs and CNAME for the domain in GetDomainConfigResponse

## 0.22.1

### Patch Changes

- 5f0ac90: Update type for get custom deployment
- 15c6623: [BREAKING] Change type order in filterProjectEnvs and related functions
- e120dde: [BREAKING] Remove 'blobStores' field from resourceConfig in AuthUser schema
- c808605: Add 'partial' field to UpdateResourceSecretsRequestBody and UpdateResourceSecretsByIdRequestBody

## 0.22.0

### Minor Changes

- 8ce2794: Add support for managedRules in components

### Patch Changes

- 5f3f515: Add new field 'gitProviderOptions' to UpdateProjectDataCacheResponse
- c1f5210: Add new 'drain' property to various project-related API response types
- 2ccc455: Add 'UsageViewer' permission to teamPermissions
- 1550896: Add flagsExplorerSubscription field to project-related responses
- 3d4776c: Add teamRoles and teamPermissions fields to ReadAccessGroupResponse, UpdateAccessGroupResponse, and CreateAccessGroupResponse types

## 0.21.2

### Patch Changes

- 1aa4dec: Refactor managedRules structure in GetFirewallConfigResponse and PutFirewallConfigResponse
- f0f0865: Add projectRollingRelease field to various project endpoints
- 5169182: Add 'action' field to managedRules in PutFirewallConfigRequestBody

## 0.21.1

### Patch Changes

- 610c7dc: Add new tag 'tag_flags'
- fd37558: Move createProject endpoint from v10 to v11

## 0.21.0

### Minor Changes

- e80705b: Update spec

## 0.20.1

### Patch Changes

- 671ea25: Add integrationSSOSession field to project-related responses
- 5423343: Add new field 'imageOptimizationNewPrice' to project-related API responses
- 40d709b: Add new marketplace experimentation data to project responses
- 30188f2: Add defaultResourceConfig field to multiple API endpoints
- 05ee70e: Add new permissions for user, userConnection, webAuthn, and oauth2Connection

## 0.20.0

### Minor Changes

- f051ebf: Add new property 'routeObservabilityToDefaultApp' to UpdateProjectDataCacheResponse type

### Patch Changes

- 2353d03: [MINOR] Add new 'bypassSystem' field to firewall configuration variables
- 207b8ec: Add skipBillingData to GetConfigurationsQueryParams

## 0.19.5

### Patch Changes

- 1b2a9f5: Add response type for creating project transfer request
- 108a247: Change functionDefaultRegion type to accept null
- 75e9f57: Update descriptions

## 0.19.4

### Patch Changes

- e1ca271: Add fluid property to resourceConfig in multiple endpoints
- 2ace464: Add new image optimization metrics to AuthUser schema
- b32db47: Add new endpoint to retrieve active attack status within the last 24h window
- 6ba6722: Add new field customEnvironmentId to AddProjectDomainRequestBody type

## 0.19.3

### Patch Changes

- 1d85bc3: [BREAKING] Add 'functionZeroConfigFailover' to resourceConfig

## 0.19.2

### Patch Changes

- ae316fc: [BREAKING] Rename all custom environment API endpoints from V1 to V9

## 0.19.1

### Patch Changes

- c50aad5: Add tagIds field to getConfigurations endpoint
- 1986a5d: [BREAKING] Change field name from 'Project' to 'ProjectId' in getBypassIp response
- c0119ba: Change additionalPermissions to additionalRoles in GetTeamMembersResponse

## 0.19.0

### Minor Changes

- 52eee8a: Add 'additionalPermissions' field to GetTeamMembersResponse and TeamLimited types

## 0.18.3

### Patch Changes

- e267193: The user's default team field description updated
- fe9112f: Add bypass IP firewall endpoints

## 0.18.2

### Patch Changes

- 1ab789b: [OpenAPI] Spec updates for vercel-api-js

## 0.18.1

### Patch Changes

- 3c79610: Remove verification challenges from VerifyProjectDomainResponse

## 0.18.0

### Minor Changes

- 06f9c69: Add new qualities field to images in getDeployment, CreateDeploymentResponse, and CancelDeploymentResponse

## 0.17.0

### Minor Changes

- 35374e2: Update bundle mechanism

## 0.16.1

### Patch Changes

- 5d3c268: Add 'observabilityEvent' to AuthUser type

## 0.16.0

### Minor Changes

- bfcf8aa: Add support for microfrontends in the 'getDeployment' and 'createDeployment' endpoints
- 1e5d876: Add observabilityConfiguration and observabilityData to various project endpoints

### Patch Changes

- 445b9fc: Add new 'v0-web' option to source field in deployment API

## 0.15.0

### Minor Changes

- 6c01a57: Add firewallBypassIps field to project update and get responses

### Patch Changes

- 64d934c: [BREAKING] Change group to groupIds in project endpoints
- d8ac4ad: Add teamMicrofrontends field to project-related API responses

## 0.14.0

### Minor Changes

- 699dd5d: [BREAKING] Add new endpoint to get user info

### Patch Changes

- f27daa1: [BREAKING] Update field 'type' in AuthToken schema with new options 'otp' and 'sms'
- d4f12f9: Update customEnvironments type to use Record<string, any> instead of specific fields
- b7a8a1f: Add branchMatcher field to project responses

## 0.13.1

### Patch Changes

- badfb19: Add isInSystemBuildsQueue field to deployment response

## 0.13.0

### Minor Changes

- 31174d4: Add new deployment integration actions: cancel and cleanup

### Patch Changes

- d4bf41e: Adjust type enum to include 'secret'
- a6b9572: [BREAKING] Removed 'removedLogDrainsAt', 'removedProjectEnvsAt', 'removedTokensAt', and 'removedWebhooksAt' fields from getConfigurations and getConfiguration API endpoints
- 1690c07: Add defaultRoute field to GetDeploymentResponse and other related types
- f556dbb: Add 'issuerMode' field to 'oidcTokenConfig' in 'UpdateProjectDataCacheResponse'
- 0cf8bb2: [BREAKING] Change the order of 'type' enum values in CreateProjectResponse and UpdateProjectResponse

## 0.12.0

### Minor Changes

- 39fa39b: Add new 'hobby' and 'v0TeamSeats' fields to the CreateTeamResponse interface
- b7af1a2: Add entitlements field to UpdateAccessGroupResponse

### Patch Changes

- a5aaadb: Add support for IP buckets with expiration date in project responses
- 5ad752c: Add integrations field to getDeployment, createDeployment, cancelDeployment, CreateProjectResponse, UpdateProjectResponse, CreateProjectEnvResponse, removeProjectEnv, and editProjectEnv types
- 1f4b4fd: Add integrationIdOrSlug parameter to GetConfigurationsQueryParams

## 0.11.1

### Patch Changes

- 88045f8: Add installationType parameter to GetConfigurationsQueryParams
- fc395d2: Add allowServerlessConcurrency field to resourceConfig

## 0.11.0

### Minor Changes

- 90dbe51: Add new fields 'id', 'buildingAt', 'checksConclusion', 'checksState', 'oidcTokenClaims', and 'previewCommentsEnabled' to latestDeployments in UpdateProjectDataCacheResponse

### Patch Changes

- 15a5c36: [BREAKING] Update supported node versions to include 22.x
- c4f56ad: [BREAKING] Add 'wafRateLimitRequest' to AuthUser schema
- 05ff026: [BREAKING] Add new 'flags-connection-string' type to project environment variables
- c0aa464: Change response type of searchRepo endpoint
- dd7b469: Add new 'previewDeploymentsDisabled' field to UpdateProjectRequestBody
- f7231ed: Remove lambdaDefaultTimeout and lambdaDefaultMemoryType fields from resourceConfig in several endpoints

## 0.10.0

### Minor Changes

- 4bc222f: Add new endpoint to request a new login for a user to get a token
- a33712f: Add 'fasthtml' to supported project types

### Patch Changes

- f110dcf: [BREAKING] Change in CreateProjectRequestBody structure
- 6ce1455: Reorder 'type' enum values for 'lambdas' in CreateDeploymentResponse
- 7c541b7: Add 'fasthtml' to the list of available project types
- 7eec3fc: Change 'purpose' type to object with 'type' and 'projectId'
- 12b46d9: [BREAKING] Remove undocumented field 'membership' from 'TeamLimited'
- f39e026: [BREAKING] Change type field enum options and comments in components.ts
- ab2d48d: [BREAKING] Reorder 'type' enum values for consistency

## 0.9.1

### Patch Changes

- c45927e: Fix typo in CreateOrTransferDomainResponse type
- a6f10e2: Add enableProductionFeedback to UpdateProjectDataCacheResponse and other related types
- 719d78d: Add new 'name' field to CreateConfigurableLogDrainRequestBody
- d60cedc: Add new integrationResourceReplCommand field to project response types
- 04dfbc9: Add new field 'includedAllocationMiu' to 'components' and 'schemas'
- f963898: [BREAKING] Add new fields to the response of getConfiguration endpoint
- c842536: Add vpcPeeringConnection and sonar fields to responses
- 79de957: [BREAKING] Rename 'pro' to 'concurrentBuilds' in CreateTeamResponse
- 9d78c6b: Add new field 'imageOptimizationType' to AuthUser schema
- 651ab8b: New buy domain endpoint
- 9db31c8: Add new fields 'projectFlags', 'projectTier', and 'customEnvironment' to UpdateProjectDataCacheResponse

## 0.9.0

### Minor Changes

- 19b3382: Add support for new targets object in getDeployment and createDeployment APIs

### Patch Changes

- 23fbbe2: [BREAKING] Add new 'firewall' source option to log drains
- 1644eaf: Add ACLAction enum for resource actions
- 062bcd1: Add 'environment' field to the project data cache response
- 1f54229: Add 'firewall' as a source option for LogDrainRequestBody and ConfigurableLogDrainRequestBody
- 65c3e00: [BREAKING] Add vsmValue to project environment variables
- 63ac8ae: Add new AWS Marketplace field to AuthUser type
- 95bf70e: Add `teamId` and `userId` properties to domains responses
- 60d3771: Add 'environment' field to project response types

## 0.8.5

### Patch Changes

- 5640e39: Add new marketplace invoice endpoints
- 765c3c3: Update the deployment protection automation bypass for a project
- e07b4b0: Removed integrationStore from several API responses

## 0.8.4

### Patch Changes

- 611e148: Make deploymentExpiration fields optional
- cb67b7d: Add new fields to deployment expiration in UpdateProjectDataCacheResponse
- f86aa27: Add teamGitExclusivity field to project endpoints
- cd0ddde: Add integrationResource field to various API responses

## 0.8.3

### Patch Changes

- 5ef8f47: Add highestQuantity field to CreateTeamResponse and AuthUser types
- 0e0a7dc: [BREAKING] Change integrationResource to integrationStore in project endpoints
- cbfda3a: Add new fields expirationDaysCanceled and expirationDaysErrored to deploymentExpiration in GetProjectsResponse, CreateProjectResponse, GetProjectResponse, and UpdateProjectResponse types
- e5a70f3: [BREAKING] Modify emailInviteCodes type structure
- 7c3e6f3: Add new type UpdateAccessGroupRequestBody for updating access group details
- 1b099f6: [BREAKING] Change integrationStore to integrationResource in several endpoints

## 0.8.2

### Patch Changes

- fe996c7: Add 'account-plan-downgrade' to disabledReason enum
- 5124d55: [BREAKING] Update domain buy endpoint version from v4 to v5
- b8e920d: Add undeletedAt field to deployment response
- 7b2a03e: Add forceOrbMigration field to CreateTeamResponse and AuthUser types
- ed056ad: Add validation for minimum and maximum items in optionsAllowlist paths

## 0.8.1

### Patch Changes

- 2819f3c: Add new endpoint to create an access group

## 0.8.0

### Minor Changes

- e6e9dd3: Add new endpoints

### Patch Changes

- e6e9dd3: Update dependencies

## 0.7.2

### Patch Changes

- 3b348dc: Add new fields to AuthUser schema

## 0.7.1

### Patch Changes

- d90c29c: Refactor emailLogin function to support different response types
- ea16d5f: [BREAKING] Update disabledReason enum values

## 0.7.0

### Minor Changes

- 7d2d4b8: [BREAKING] Change endpoint URL for getting deployment events from v2 to v3

## 0.6.4

### Patch Changes

- 1734501: Add new 'nodeVersion' field to CreateDeploymentRequestBody
- 7253391: [BREAKING] Add new type 'integration-store-secret' to UpdateProjectDataCacheResponse, GetProjectsResponse, CreateProjectResponse, GetProjectResponse, UpdateProjectResponse, filterProjectEnvs, getProjectEnv, CreateProjectEnvResponse, removeProjectEnv, EditProjectEnvResponse
- dc191cf: Add new fields skewProtectionBoundaryAt and skewProtectionMaxAge to UpdateProjectRequestBody
- e096156: [BREAKING] Add new oauth2Connection field to multiple project-related API responses
- 9d8632b: Change viewPreference order in activeDashboardViews type

## 0.6.3

### Patch Changes

- 0b0194e: Add new field attackModeActiveUntil to project responses
- cd00645: Add oauth2Application field to project related responses
- 8920920: Remove planIteration from CreateTeamResponse and AuthUser
- 06e6e64: Add new property 'cronJobsPerProject' to 'AuthUser' type
- 44f20a3: Add skewProtectionBoundaryAt and skewProtectionMaxAge to project data cache and project response
- 224ec97: Update API endpoint to create project from v9 to v10
- 71615f0: Add new field 'planIteration' to AuthUser type
- 5bfccd9: Add optional field 'planIteration' to AuthUser type

## 0.6.2

### Patch Changes

- 79d46c2: Add 'dryRun' option to PatchEdgeConfigItems and PatchEdgeConfigSchema query params
- 364ba3e: Add projectAccessGroup field to project related responses
- 92880b3: [BREAKING] Add integrationStores to AuthUser in schemas.ts
- cda8a8e: Modified CreateProjectEnvVariables to specify that git branch must have target=preview

## 0.6.1

### Patch Changes

- f002c7a: Add security information to project endpoints
- e59cf32: Add notificationStatementOfReasons to project-related API endpoints
- 5f5bea1: Add firewall settings to security object in project-related API endpoints
- cca589a: Add 'project' field to getDeployment and createDeployment response

## 0.6.0

### Minor Changes

- 46aa322: [BREAKING] Change structure of GetProjectEnvResponse

### Patch Changes

- 862b128: Change 'origin' values in GetTeamMembersResponse type

## 0.5.1

### Patch Changes

- 3d3fc73: [BREAKING] Remove migrateExistingEnvVariablesToSensitive field from PatchTeamRequestBody
- 58c0459: [BREAKING] Add new 'sensitive' type for ENV variables
- e7d1ddf: [BREAKING] Reduce maxLength of projectId in InviteUserToTeamRequestBody
- 286adc8: Update domain configuration response to include 'dns-01' option
- 580013f: Remove minimum limit requirement in GetTeamMembersQueryParams
- 5718437: Add web analytics object to project data endpoints

## 0.5.0

### Minor Changes

- 787cf84: Add new endpoints to manage Edge Config schema
- 4330f7c: Add migration status property to AuthUser schema for Northstar migration
- d0479f5: Add attribution information for the session or current page to CreateTeamRequestBody

### Patch Changes

- ed57233: Add serverlessFunctionZeroConfigFailover field to project related API endpoints
- 5aeca61: Add new properties to VerifyTokenQueryParams
- 3359159: Add crons field to deployment response
- 86aeaf6: Add new 'compression' field to log drain endpoints
- c6d4fd4: Add 'store.credentials-reset' to webhook events
- 9b75b8a: Add 'store.updated' to allowed webhook event types
- 446c95d: Update minimum value for limit parameter in GetTeamMembersQueryParams

## 0.4.0

### Minor Changes

- f75fb8d: [BREAKING] Add new fields to the project object in the API response

### Patch Changes

- f090e4a: [OpenAPI] Spec updates for vercel-api-js

## 0.3.0

### Minor Changes

- be76b72: Add 'role' field to InviteUserToTeamRequestBody

### Patch Changes

- 18f26af: [BREAKING] Remove teamId field from JoinTeamRequestBody

## 0.2.0

### Minor Changes

- ce46c2b: [BREAKING] Change endpoint URL from v6 to v7 for file retrieval
- 37f6643: [BREAKING] Add new request body for DeleteConfiguration
- 668433e: Add new request body type for cancelling deployment
- e4b3662: Add sampling rate option to CreateConfigurableLogDrainRequestBody

### Patch Changes

- 4991311: Remove redundant comment and re-order properties in AuthUser type
- 350a358: Add validation pattern for edgeConfigId in endpoint path params
- dd972a2: [BREAKING] Remove 'previousLogDrainId' field from 'CreateLogDrainRequestBody'

## 0.1.25

### Patch Changes

- 7405cf2: Add support for node 20

## 0.1.24

### Patch Changes

- 0be29c9: Export `types`

## 0.1.23

### Patch Changes

- 2da8330: [OpenAPI] Spec updates for vercel-api-js
- 73631f0: [OpenAPI] Add pause project endpoints

## 0.1.22

### Patch Changes

- 352a83a: [OpenAPI] Spec updates for vercel-api-js
- f587d3d: [OpenAPI] Spec updates for vercel-api-js
- a267e20: [OpenAPI] Spec updates for vercel-api-js
- 64b8c15: [OpenAPI] Spec updates for vercel-api-js

## 0.1.21

### Patch Changes

- 8faaa44: [OpenAPI] Add patch domain endpoint
- 3b9bfd6: [OpenAPI] Add getDomainTransfer endpoint

## 0.1.20

### Patch Changes

- 22694e7: [OpenAPI] Spec updates for vercel-api-js
- b0d9604: [OpenAPI] Spec updates for vercel-api-js
- c2b314e: [OpenAPI] Remove oauth configurations
- 7f508cc: [OpenAPI] Add new projects array response

## 0.1.19

### Patch Changes

- 1ab0e65: [OpenAPI] Spec updates for vercel-api-js

## 0.1.18

### Patch Changes

- 8570cfa: [OpenAPI] Spec updates for vercel-api-js

## 0.1.17

### Patch Changes

- 67bc9ee: [OpenAPI] Spec updates for vercel-api-js

## 0.1.16

### Patch Changes

- 43a95cc: Fix env variables

## 0.1.15

### Patch Changes

- d5f744b: [OpenAPI] Spec updates for vercel-api-js

## 0.1.14

### Patch Changes

- a8b7568: [OpenAPI] Remove `listDeploymentBuilds`
- 1f06b87: [OpenAPI] Spec updates for Vercel

## 0.1.13

### Patch Changes

- c903731: [OpenAPI] Spec updates

## 0.1.12

### Patch Changes

- 04b419b: [OpenAPI] Revert change to schema

## 0.1.11

### Patch Changes

- eacb118: [OpenAPI] Update schemas for projects and deployments

## 0.1.10

### Patch Changes

- 7445ccd: [OpenAPI] Update InviteUserToTeamResponse

## 0.1.9

### Patch Changes

- 8ca0e54: [OpenAPI] Spec updates

## 0.1.8

### Patch Changes

- 13148b3: Update accessToken result to match types

## 0.1.7

### Patch Changes

- 64b81ee: Update accessToken helper

## 0.1.6

### Patch Changes

- 53e14fe: Add accessToken auth method

## 0.1.5

### Patch Changes

- d535c65: Fix enum values

## 0.1.4

### Patch Changes

- 4264ad4: Fix return type of `request` method

## 0.1.3

### Patch Changes

- dd84ad5: Add `request` method with string literals"

## 0.1.2

### Patch Changes

- 660d05b: Add `connectConfigurationId` to schema

## 0.1.1

### Patch Changes

- 0e017b1: Schema updates for edge config endpoints

## 0.1.0

### Minor Changes

- 7278900: Initial release
