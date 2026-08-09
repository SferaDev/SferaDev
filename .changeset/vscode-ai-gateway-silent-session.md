---
"vscode-extension-vercel-ai": patch
---

Read the active session from our own authentication provider

Probing for models silently found no credential and reported no models, even with a valid session
stored. VS Code only hands a session back to a consumer once an access grant has been recorded, and
sessions created through the provider interface never take that path, so `authentication.getSession`
answered `undefined` in silent mode. The chat provider now reads the active session straight from
the authentication provider this extension registers, and only falls back to
`authentication.getSession` to start the sign-in flow when no session exists yet.
