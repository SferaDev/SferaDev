# rollup-plugin-import-cdn

Import ESM modules from URLs for local processing by Rollup, enabling tree-shaking on non-local resources.

Based on [rollup-plugin-import-url](https://github.com/UpperCod/rollup-plugin-import-url).

## Features

- **CDN Imports** - Import npm packages directly from CDN URLs
- **Tree-shaking** - Full tree-shaking support for CDN modules
- **Multiple CDNs** - Support for Skypack with fallback chains
- **Version Pinning** - Pin specific package versions
- **Custom Resolvers** - Use any CDN with custom URL resolvers
- **Relative Import Resolution** - Automatically resolves relative imports within CDN modules

## Installation

```bash
npm install rollup-plugin-import-cdn
```

## Quick Start

```js
import { importCdn } from "rollup-plugin-import-cdn";

export default {
  input: "src/index.js",
  output: { file: "dist/bundle.js", format: "esm" },
  plugins: [importCdn()],
};
```

Now you can import packages directly from URLs in your source code:

```js
// Import from CDN (resolved via Skypack by default)
import { debounce } from "lodash-es";

// Or import directly from a URL
import confetti from "https://esm.sh/canvas-confetti";
```

## Configuration

### Basic Options

```js
importCdn({
  // Custom fetch implementation (uses global fetch by default)
  fetchImpl: customFetch,

  // CDN priority order (default: ["skypack"])
  priority: ["skypack"],

  // Pin specific package versions
  versions: {
    react: "18.2.0",
    lodash: "4.17.21",
  },
});
```

### Custom CDN Resolvers

Use any CDN by providing a custom resolver function:

```js
importCdn({
  priority: [
    // Try esm.sh first
    (packageName) => `https://esm.sh/${packageName}`,
    // Fall back to Skypack
    "skypack",
    // Then try unpkg
    (packageName) => `https://unpkg.com/${packageName}?module`,
  ],
});
```

### Version Pinning

Pin specific versions for reproducible builds:

```js
importCdn({
  versions: {
    react: "18.2.0",
    "react-dom": "18.2.0",
    lodash: "4.17.21",
  },
});
```

This generates URLs like `https://cdn.skypack.dev/react@18.2.0`.

### Custom Fetch Implementation

Provide a custom fetch for environments without global fetch or for adding custom headers:

```js
import nodeFetch from "node-fetch";

importCdn({
  fetchImpl: nodeFetch,
});

// Or with custom headers
importCdn({
  fetchImpl: (url, init) =>
    fetch(url, {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: "Bearer token",
      },
    }),
});
```

## How It Works

1. **Resolution**: When Rollup encounters an import, the plugin checks if it's a CDN-resolvable module
2. **Fetching**: The module is fetched from the configured CDN(s)
3. **Transformation**: Relative imports within the fetched module are resolved to absolute CDN URLs
4. **Bundling**: Rollup processes the module like any local file, enabling tree-shaking

### Import Resolution

The plugin handles different import types:

| Import Type         | Example                           | Behavior                        |
| ------------------- | --------------------------------- | ------------------------------- |
| Package name        | `import "lodash"`                 | Resolved via CDN                |
| Scoped package      | `import "@tanstack/react-query"`  | Resolved via CDN                |
| Direct URL          | `import "https://esm.sh/react"`   | Fetched directly                |
| Protocol-relative   | `import "//cdn.example.com/mod"`  | Fetched directly                |
| Local relative      | `import "./local"`                | Ignored (handled by Rollup)     |
| Absolute path       | `import "/absolute"`              | Ignored (handled by Rollup)     |

## Supported CDNs

### Built-in CDNs

- **Skypack** (`"skypack"`) - Default CDN, optimized for browsers

### Popular CDNs (via custom resolver)

```js
// esm.sh - Fast, global CDN
(pkg) => `https://esm.sh/${pkg}`

// unpkg - npm CDN
(pkg) => `https://unpkg.com/${pkg}?module`

// jsDelivr - Multi-CDN
(pkg) => `https://cdn.jsdelivr.net/npm/${pkg}/+esm`

// cdnjs - Community CDN
(pkg) => `https://cdnjs.cloudflare.com/ajax/libs/${pkg}/latest/esm/index.js`
```

## API Reference

### `importCdn(options?)`

Creates the Rollup plugin.

#### Options

| Option      | Type                                           | Default       | Description                                |
| ----------- | ---------------------------------------------- | ------------- | ------------------------------------------ |
| `fetchImpl` | `FetchImpl`                                    | `globalThis.fetch` | Fetch implementation for HTTP requests |
| `priority`  | `Array<AvailableCDNs \| (key: string) => string>` | `["skypack"]` | CDN resolution priority                    |
| `versions`  | `Record<string, string>`                       | `{}`          | Package version pinning                    |

#### Returns

A Rollup plugin object with `resolveId` and `load` hooks.

### Types

```typescript
import type {
  PluginOptions,
  FetchImpl,
  AvailableCDNs,
  Dependency,
} from "rollup-plugin-import-cdn";

// Available CDN names
type AvailableCDNs = "skypack";

// Fetch implementation type
type FetchImpl = (
  url: string,
  init?: { body?: string; headers?: Record<string, string>; method?: string }
) => Promise<{
  ok: boolean;
  text(): Promise<string>;
  url: string;
}>;

// Plugin options
interface PluginOptions {
  fetchImpl: FetchImpl;
  priority?: Array<AvailableCDNs | ((key: string) => string)>;
  versions?: Record<string, string>;
}
```

## Examples

### Vite Configuration

```js
// vite.config.js
import { defineConfig } from "vite";
import { importCdn } from "rollup-plugin-import-cdn";

export default defineConfig({
  build: {
    rollupOptions: {
      plugins: [
        importCdn({
          versions: {
            three: "0.160.0",
          },
        }),
      ],
    },
  },
});
```

### With External Dependencies

```js
// rollup.config.js
import { importCdn } from "rollup-plugin-import-cdn";

export default {
  input: "src/index.js",
  output: { file: "dist/bundle.js", format: "esm" },
  plugins: [importCdn()],
  // Mark some packages as external
  external: ["react", "react-dom"],
};
```

### Multi-CDN Fallback

```js
importCdn({
  priority: [
    // Try esm.sh first (fastest)
    (pkg) => `https://esm.sh/${pkg}`,
    // Fall back to Skypack
    "skypack",
    // Last resort: unpkg
    (pkg) => `https://unpkg.com/${pkg}?module`,
  ],
});
```

## Compatibility

- **Rollup**: 3.x, 4.x
- **Node.js**: 18+ (requires `fetch` or custom `fetchImpl`)
- **Environments**: Works in Node.js, browsers, and edge runtimes

## License

ISC
