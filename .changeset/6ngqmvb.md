---
"netlify-api": patch
---

[BREAKING] Changed all schema and type definitions that used bigint for integer properties (such as size, ttl, priority, etc.) to use int/number instead.