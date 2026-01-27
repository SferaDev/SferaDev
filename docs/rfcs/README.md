# RFCs: Vercel VS Code AI Gateway Extension

This directory contains Request for Comments (RFC) documents for converting the SferaDev VS Code AI Gateway extension into an official Vercel extension.

## Implemented

| RFC                                 | Title                                 | Status      | Summary                                           | Depends On                                    |
| ----------------------------------- | ------------------------------------- | ----------- | ------------------------------------------------- | --------------------------------------------- |
| [003a](./003a-streaming-adapter.md) | Streaming Adapter Extraction          | Implemented | Extract stream adapter and chunk handling         | [ref-stream-mapping](./ref-stream-mapping.md) |
| [003b](./003b-token-estimation.md)  | Token Estimation & Message Conversion | Implemented | Hybrid token estimation, message conversion, MIME | —                                             |

## In Progress

| RFC                                         | Title                       | Status          | Summary                                             | Depends On |
| ------------------------------------------- | --------------------------- | --------------- | --------------------------------------------------- | ---------- |
| [005a](./005a-configuration-logging.md)     | Configuration & Logging     | Ready for Review | Configuration schema, model filters, logging system | —          |
| [008](./008-high-fidelity-model-mapping.md) | High-Fidelity Model Mapping | Draft           | Accurate model identity, token limits, capabilities | —          |

## Next Up

| RFC                                   | Title                           | Status | Summary                                              | Depends On                                                               |
| ------------------------------------- | ------------------------------- | ------ | ---------------------------------------------------- | ------------------------------------------------------------------------ |
| [002](./002-branding-identity.md)     | Branding and Identity           | Draft  | Rebrand from SferaDev to official Vercel identity    | [007](./007-migration-deprecation.md)                                    |
| [001](./001-standalone-repository.md) | Standalone Repository Structure | Draft  | Extract from monorepo to `vercel/vscode-ai-gateway`  | [007](./007-migration-deprecation.md)                                    |
| [007](./007-migration-deprecation.md) | Migration & Deprecation         | Draft  | Settings migration, ID transitions, deprecation plan | [001](./001-standalone-repository.md), [002](./002-branding-identity.md) |

## Triage

| RFC                                       | Title                         | Status | Summary                                         | Depends On                              |
| ----------------------------------------- | ----------------------------- | ------ | ----------------------------------------------- | --------------------------------------- |
| [005b](./005b-authentication.md)          | Authentication                | Triage | OIDC provider and API key auth                  | [005a](./005a-configuration-logging.md) |
| [005c](./005c-telemetry-privacy.md)       | Telemetry & Privacy           | Triage | Telemetry schema, opt-in flow, retention policy | [005a](./005a-configuration-logging.md) |
| [004](./004-openresponses-integration.md) | OpenResponses API Integration | Triage | Add support for OpenResponses specification     | —                                       |

## Reference Documents

| Document                                      | Status    | Summary                                      |
| --------------------------------------------- | --------- | -------------------------------------------- |
| [ref-stream-mapping](./ref-stream-mapping.md) | Reference | Stream chunk mapping, bug analysis, fix plan |

## Archived

- [003-streaming-package.md.archived](./003-streaming-package.md.archived)
- [005-configuration-enterprise.md.archived](./005-configuration-enterprise.md.archived)

## Dependencies

- RFC 007 consolidates migration and deprecation steps referenced by RFC 001 and RFC 002.
- RFC 005b and RFC 005c build on the configuration schema defined in RFC 005a.
- RFC 003a relies on the stream mapping reference in ref-stream-mapping.

## RFC Lifecycle

1. **Draft** — Initial proposal, open for discussion
2. **Review** — Under active review by stakeholders
3. **Accepted** — Approved for implementation
4. **Implemented** — Completed and released
5. **Rejected** — Not moving forward (with rationale)

## Contributing

To propose a new RFC:

1. Copy the template below
2. Create a new file: `NNN-short-title.md`
3. Fill in all sections
4. Open a PR for discussion

### RFC Template

```markdown
# RFC NNN: Title

**Status:** Draft  
**Author:** [Your Name]  
**Created:** YYYY-MM-DD  
**Updated:** YYYY-MM-DD

## Summary

[One paragraph summary]

## Motivation

[Why is this needed?]

## Detailed Design

[Technical details, code examples, diagrams]

## Drawbacks

[Potential downsides]

## Alternatives

[Other approaches considered]

## Unresolved Questions

[Open questions for discussion]

## Implementation Plan

[Phases, milestones, timeline]
```

## Related Resources

- [VS Code Language Model API](https://code.visualstudio.com/api/extension-guides/ai/language-model)
- [Vercel AI Gateway Documentation](https://vercel.com/docs/ai-gateway)
- [OpenResponses Specification](https://openresponses.org/)
- [Vercel AI SDK](https://ai-sdk.dev/)
