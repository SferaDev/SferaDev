---
"vscode-extension-vercel-ai": patch
---

Send the VS Code system prompt as instructions instead of a system message

VS Code sends its instructions as assistant messages before the first user message. Those were
rewritten to `system` role messages and left in the `messages` array, which the AI SDK rejects with
"System messages are not allowed in the prompt or messages fields", breaking every chat request.
They are now extracted and passed through the `instructions` option, leaving `messages` with only
user, assistant and tool turns.
