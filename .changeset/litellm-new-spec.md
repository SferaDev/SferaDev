---
"litellm-api": major
---

Switched the OpenAPI source from `www.demo.litellm.ai` (suspended) to the LiteLLM Model Catalog API at `api.litellm.ai`. The generated client now exposes `model_catalog` and `billing` endpoints instead of the previous proxy admin surface.
