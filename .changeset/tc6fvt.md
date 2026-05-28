---
"vercel-api-js": patch
---

[BREAKING] Changed the shapes of previous and next fields in UserEvent type: they are now generic objects instead of structured types with gitSources and deploymentSources properties.