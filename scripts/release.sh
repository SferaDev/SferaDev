#!/bin/bash
set -e

# Build all packages
pnpm turbo run build

# Publish npm packages via changesets (skips private packages)
pnpm changeset publish

# Package and publish VSCode extension to marketplace
cd apps/vscode-ai-gateway
pnpm package
pnpm vsce publish --packagePath ./*.vsix
