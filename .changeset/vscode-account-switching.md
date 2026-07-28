---
"vscode-extension-vercel-ai": minor
---

Fix account switching, and declare the authentication provider

- Each authentication session now gets its own account id. Every session previously shared one
  ("vercel-ai-user" for API keys, "vercel-oidc-user" for OIDC), so VS Code could not tell accounts
  apart and switching the active session did not reliably change which credential was used. The
  provider also now declares `supportsMultipleAccounts`, honours the requested account in
  `getSessions`, and the chat provider asks for the active account explicitly instead of relying on
  VS Code's remembered preference. Existing sessions are migrated automatically; because account
  identity changes, VS Code may ask you to pick an account once after updating.
- Declare the `vercelAiGateway` authentication provider in the manifest, removing the "was not
  declared in the Extension Manifest" warning on activation.
- Detect model capabilities (vision, tool calling, reasoning) from the structured fields the
  gateway returns, falling back to tag matching only when a field is absent.
