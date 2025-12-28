# rollup-plugin-import-cdn

Import ESM modules from URL for local use and be processed by rollup, allowing to apply tree-shaking on non-local resources.

Based on [rollup-plugin-import-url](https://github.com/UpperCod/rollup-plugin-import-url).

## Installation

```bash
npm install rollup-plugin-import-cdn
```

## Usage

```js
import { importCdn } from "rollup-plugin-import-cdn";

export default {
  plugins: [importCdn()],
};
```

## Options

### `fetchImpl`

A custom fetch implementation. If not provided, the global `fetch` will be used.

### `priority`

An array of CDN names or custom URL resolvers to try in order. Defaults to `["skypack"]`.

Available CDNs:
- `skypack` - Uses [Skypack CDN](https://www.skypack.dev/)

You can also provide custom URL resolvers:

```js
importCdn({
  priority: [
    "skypack",
    (packageName) => `https://esm.sh/${packageName}`,
  ],
});
```

### `versions`

An object mapping package names to specific versions:

```js
importCdn({
  versions: {
    lodash: "4.17.21",
    react: "18.2.0",
  },
});
```

## License

ISC
