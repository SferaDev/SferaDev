# v0-api

## 0.1.1

### Patch Changes

- de0bcad: Expanded and clarified description for the 'limit' query parameter in reportsGetUsage.
- de0bcad: Added more detailed description to 'startDate' and 'endDate' in reportsGetUserActivity query parameters.

## 0.1.0

### Minor Changes

- e5834f1: Added new /mcp-servers/{mcpServerId}/oauth/authorize endpoint to create an OAuth authorization URL for MCP servers.
- 7df1e11: Refactor API response and error types for strict enums and schema typing.
- fc77930: Add optional vercelProjectId field to chatDetail, chatSummary, and projectDetail schemas and types.
- e5834f1: Added new /chats/{chatId}/tasks/resolve endpoint to resolve pending tasks in a chat.
- a83f157: Added a metadata field to the chat detail schema, allowing arbitrary key-value data to be associated with a chat.
- e5834f1: Added support for model IDs v0-opus-4.7 and v0-opus-4.7-fast in chat model configuration.
- e5834f1: Added new /chats/{chatId}/versions/{versionId}/restore endpoint to restore a chat block to a specific version.
- 0d767c3: Added the chatsStop endpoint to stop in-flight message generation in a chat.
- 977c417: Added filtering by Vercel project ID and Git branch to the chats list endpoint.
- 80a51db: Add API endpoint to delete source files from a specific chat version via POST /chats/{chatId}/versions/{versionId}/files/delete.
- af02574: Added the GET /reports/user-activity endpoint to retrieve aggregated user activity data for Enterprise team members.
- 74ad091: Migrate OpenAPI clients to SferaDev monorepo with improved build configuration, updated dependencies, and enhanced TypeScript support.
- 27942ed: Added 'design-mode' as a new enum value to message type schemas and types.
- 39a0e91: Added MCP Servers API endpoints for listing, creating, retrieving, updating, and deleting MCP server configurations.
- 173d136: Added the GET /reports/usage/ai endpoint for retrieving v0 AI usage events for the authenticated user or active team.

### Patch Changes

- c003f79: Added 'v0-auto' as a valid modelId value in schemas and types.
- 39a0e91: Added schema and types for the new MCP Servers API operations.
- e5834f1: Made projectId field optional in DeploymentDetail, DeploymentSummary, and deploymentsFind query parameters.
- 2e5e8b3: Added 'manual-commit' as a new message/event type to schemas and types enums.
- 7df1e11: Switch to stricter and more descriptive Zod schemas for all API objects and enums.
- 7df1e11: Replace deprecated export type names and redundant JSDoc comments in generated types.
- 7df1e11: Update API function signatures to accept destructured arguments and add stricter type checking.
- 4bd6171: Updated the description for the chatsResume endpoint to clarify it reconnects to an active assistant message stream and does not continue stopped generation.
- e5834f1: Updated description for modelId in chat model configuration to clarify its usage.

## 0.0.4

### Patch Changes

- 0477f31: Update constructor

## 0.0.3

### Patch Changes

- ee3042e: Fix baseUrl and updates

## 0.0.2

### Patch Changes

- d0d14c3: Initial release
