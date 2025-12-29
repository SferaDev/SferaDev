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

  # Attempt to publish, handling race condition where another CI run published first
  # The "already exists" error means the version is published (possibly by concurrent CI),
  # which is a success - the goal was to have this version published
  set +e
  PUBLISH_OUTPUT=$(pnpm vsce publish --packagePath ./*.vsix 2>&1)
  PUBLISH_EXIT_CODE=$?
  set -e

  if [ $PUBLISH_EXIT_CODE -ne 0 ]; then
    if echo "$PUBLISH_OUTPUT" | grep -q "already exists"; then
      echo "Version $LOCAL_VERSION was published by a concurrent CI run (was in 'verifying' state during version check)"
      echo "This is expected during concurrent releases - treating as success"
    else
      echo "$PUBLISH_OUTPUT"
      exit $PUBLISH_EXIT_CODE
    fi
  else
    echo "$PUBLISH_OUTPUT"
  fi
else
  echo "VSCode extension version $LOCAL_VERSION already published, skipping"
fi
