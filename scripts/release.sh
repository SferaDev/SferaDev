#!/bin/bash
set -e

# Build all packages
pnpm turbo run build

# Publish npm packages via changesets (skips private packages)
pnpm changeset publish

# Package and publish VSCode extension to marketplace
cd apps/vscode-ai-gateway

# Get the local version from package.json
LOCAL_VERSION=$(node -p "require('./package.json').version")
EXTENSION_ID="SferaDev.vscode-extension-vercel-ai"

# Get the published version from the marketplace (returns empty if not found)
PUBLISHED_VERSION=$(npx @vscode/vsce show "$EXTENSION_ID" --json 2>/dev/null | node -e "process.stdin.on('data', d => { try { console.log(JSON.parse(d).versions[0]?.version || ''); } catch { console.log(''); } })" 2>/dev/null || echo "")

if [ "$LOCAL_VERSION" != "$PUBLISHED_VERSION" ]; then
  echo "Publishing VSCode extension: $LOCAL_VERSION (published: ${PUBLISHED_VERSION:-none})"
  pnpm package
  pnpm vsce publish --packagePath ./*.vsix
else
  echo "VSCode extension version $LOCAL_VERSION already published, skipping"
fi
