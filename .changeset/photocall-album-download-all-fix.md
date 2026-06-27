---
"@sferadev/photocall": patch
---

Fix the album "Download all" button. The ZIP is now assembled server-side and
streamed back as an attachment, instead of being built in the browser — the
storage bucket has no CORS, so the client could never fetch the photos to zip
them and the download always failed.
