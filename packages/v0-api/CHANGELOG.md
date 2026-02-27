# v0-api

## 0.1.0

### Minor Changes

- a83f157: Added a metadata field to the chat detail schema, allowing arbitrary key-value data to be associated with a chat.
- 80a51db: Add API endpoint to delete source files from a specific chat version via POST /chats/{chatId}/versions/{versionId}/files/delete.
- af02574: Added the GET /reports/user-activity endpoint to retrieve aggregated user activity data for Enterprise team members.
- 74ad091: Migrate OpenAPI clients to SferaDev monorepo with improved build configuration, updated dependencies, and enhanced TypeScript support.
- 27942ed: Added 'design-mode' as a new enum value to message type schemas and types.

### Patch Changes

- c003f79: Added 'v0-auto' as a valid modelId value in schemas and types.
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
