---
"vscode-extension-vercel-ai": patch
---

fix(vscode-ai-gateway): refresh models after authentication

Subscribe to authentication session changes so the model list is re-queried after the user signs in via "Manage Authentication". Previously the provider declared `onDidChangeLanguageModelChatInformation` but never fired it, leaving the Copilot Chat model picker empty until the window was reloaded.
