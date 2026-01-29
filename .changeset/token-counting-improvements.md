---
"vscode-extension-vercel-ai": minor
---

feat(vscode-ai-gateway): improved streaming and logging

- Add structured logging using VS Code's native LogOutputChannel
- Add proper stream chunk handling for text, reasoning, files, tool calls, and errors
- Add model identity parsing for better family/version extraction
- Add configurable endpoint and timeout settings
- Improve message conversion with proper tool result mapping
