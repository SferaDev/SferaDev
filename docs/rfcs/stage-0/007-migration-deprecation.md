# RFC 007: Migration & Deprecation

**Status:** Draft  
**Author:** Vercel AI Team  
**Created:** 2026-01-27  
**Updated:** 2026-01-27

## Summary

Consolidate user migration, namespace transitions, and deprecation planning for the official Vercel VS Code extension. This RFC defines the migration script, configuration and identity changes, the 90-day parallel-operation timeline, and the user communication plan.

**Priority:** 3 of 3 in Vercel transition sequence.

## Motivation

RFC 001 (standalone repository) and RFC 002 (branding/identity) introduce breaking changes for existing users of the SferaDev extension. A single, authoritative migration plan ensures:

- Consistent settings migration across extension IDs and configuration namespaces
- Predictable deprecation timelines for marketplace and docs updates
- Clear user communication and support channels

## Detailed Design

### Migration Scope

This RFC covers all user-impacting transitions introduced by RFC 001 and RFC 002:

- **Configuration namespace:** `vercelAiGateway.*` → `vercel.ai.*`
- **Extension ID:** `SferaDev.vscode-extension-vercel-ai` → `vercel.vscode-ai-gateway`
- **Auth provider ID:** `vercelAiAuth` → `vercel.ai.auth`
- **Command prefix:** `vercelAiGateway.*` → `vercel.ai.*`

### Configuration Namespace Changes

| Area              | Old Prefix          | New Prefix       |
| ----------------- | ------------------- | ---------------- |
| Settings          | `vercelAiGateway.*` | `vercel.ai.*`    |
| Commands          | `vercelAiGateway.*` | `vercel.ai.*`    |
| Authentication ID | `vercelAiAuth`      | `vercel.ai.auth` |

### Extension ID Transition

The Vercel extension ships under a new Marketplace identity:

- **Old:** `SferaDev.vscode-extension-vercel-ai`
- **New:** `vercel.vscode-ai-gateway`

Users should be prompted to migrate settings and optionally uninstall the legacy extension. Marketplace listing updates and README redirects will point to the new ID.

### Auth Provider ID Transition

The authentication provider is re-registered under the new ID:

- **Old:** `vercelAiAuth`
- **New:** `vercel.ai.auth`

This requires re-authentication for existing users. The migration flow should explain why re-authentication is needed and provide a single-click path to sign in.

### Migration Script

```typescript
// src/migration.ts
import * as vscode from "vscode";

const OLD_EXTENSION_ID = "SferaDev.vscode-extension-vercel-ai";
const OLD_CONFIG_PREFIX = "vercelAiGateway";
const NEW_CONFIG_PREFIX = "vercel.ai";

export async function migrateFromSferaDev(): Promise<void> {
  const oldExtension = vscode.extensions.getExtension(OLD_EXTENSION_ID);

  if (oldExtension) {
    const result = await vscode.window.showInformationMessage(
      "Detected SferaDev Vercel AI Gateway extension. Would you like to migrate settings and uninstall the old extension?",
      "Migrate & Uninstall",
      "Migrate Only",
      "Skip",
    );

    if (result === "Skip") return;

    // Migrate settings
    const oldConfig = vscode.workspace.getConfiguration(OLD_CONFIG_PREFIX);
    const newConfig = vscode.workspace.getConfiguration(NEW_CONFIG_PREFIX);

    const settingsToMigrate = ["systemPrompt.enabled", "systemPrompt.message"];

    for (const setting of settingsToMigrate) {
      const value = oldConfig.get(setting);
      if (value !== undefined) {
        await newConfig.update(
          setting,
          value,
          vscode.ConfigurationTarget.Global,
        );
      }
    }

    if (result === "Migrate & Uninstall") {
      await vscode.commands.executeCommand(
        "workbench.extensions.uninstallExtension",
        OLD_EXTENSION_ID,
      );
    }

    vscode.window.showInformationMessage("Migration complete!");
  }
}
```

### Deprecation Timeline (90-Day Parallel Operation)

| Phase                         | Timeline  | Actions                                                            |
| ----------------------------- | --------- | ------------------------------------------------------------------ |
| Phase 1: Launch               | Day 0–7   | Publish new extension, announce availability, add migration prompt |
| Phase 2: Parallel Operation   | Day 7–60  | Keep both extensions available, monitor migration issues           |
| Phase 3: Deprecation Warnings | Day 60–90 | Add prominent warnings in legacy extension and docs                |
| Phase 4: Unlisting            | Day 90    | Unlist legacy extension from Marketplace, leave README redirect    |

### User Communication Plan

1. **In-product notice**: Show migration prompt on activation when legacy extension detected.
2. **Marketplace banner**: Add deprecation notice to SferaDev listing, link to new extension.
3. **README updates**: Update both repositories with migration instructions and FAQ.
4. **Release notes**: Publish release notes describing breaking changes and timeline.
5. **Support channels**: Provide a dedicated troubleshooting section and link to support.

## Drawbacks

1. **Re-authentication requirement**: Users must re-enter API keys under the new auth provider ID.
2. **Dual maintenance**: A short period of parallel operation increases operational overhead.

## Alternatives

### Alternative 1: Maintain Old IDs Indefinitely

Keep the legacy extension and namespaces alongside the new ones.

**Rejected because:** Creates long-term maintenance burden and user confusion.

### Alternative 2: Immediate Cutover

Unlist the legacy extension at launch without a parallel period.

**Rejected because:** Risks breaking existing users without adequate transition time.

## Implementation Plan

1. Implement migration prompt and settings copy logic.
2. Publish new extension and update documentation references.
3. Add legacy extension deprecation banner.
4. Monitor support requests and telemetry for migration issues.
5. Unlist legacy extension after 90 days.
