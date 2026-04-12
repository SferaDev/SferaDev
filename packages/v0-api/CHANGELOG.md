# v0-api

## 0.1.0

### Minor Changes

- fc77930: Add optional vercelProjectId field to chatDetail, chatSummary, and projectDetail schemas and types.
- a83f157: Added a metadata field to the chat detail schema, allowing arbitrary key-value data to be associated with a chat.
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
- 2e5e8b3: Added 'manual-commit' as a new message/event type to schemas and types enums.

## 0.0.4

### Patch Changes

- 0477f31: Update constructor

## 0.0.3

### Patch Changes

- ee3042e: Fix baseUrl and updates

## 0.0.2

### Patch Changes

- d0d14c3: Initial release
