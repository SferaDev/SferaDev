---
"@sferadev/photocall": minor
---

Allow guests to upload video clips (MP4, WebM, QuickTime/MOV) to a shared album,
not just photos. Videos are uploaded untouched (no canvas re-encode) under a
larger 200 MB cap, with the image/video size limit enforced from the stored
object's content type on confirm. The album grid, lightbox, host gallery,
pending-moderation list and the public share page now render videos in an inline
`<video>` player, and downloads/zip export keep the original container.
