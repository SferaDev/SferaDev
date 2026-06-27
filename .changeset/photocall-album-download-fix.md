---
"@sferadev/photocall": patch
---

Fix the album photo download button on mobile. Downloads now use a presigned
`Content-Disposition: attachment` URL via a plain anchor click — the same
approach already used by the share page — instead of a cross-origin `fetch` +
blob + `download` attribute, which is ignored cross-origin and was silently
failing on Android (and other mobile browsers).
