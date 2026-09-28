---
"netlify-api": patch
---

Changed form, submission, snippet, and pagination fields from z.int() to z.int32() in schemas to enforce 32-bit integer types.