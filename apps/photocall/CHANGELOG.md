# @sferadev/photocall

## 0.3.0

### Minor Changes

- 7e96529: Allow guests to upload video clips (MP4, WebM, QuickTime/MOV) to a shared album,
  not just photos. Videos are uploaded untouched (no canvas re-encode) under a
  larger 200 MB cap, with the image/video size limit enforced from the stored
  object's content type on confirm. The album grid, lightbox, host gallery,
  pending-moderation list and the public share page now render videos in an inline
  `<video>` player, and downloads/zip export keep the original container.

### Patch Changes

- e1403e3: Fix the album photo download button on mobile. Downloads now use a presigned
  `Content-Disposition: attachment` URL via a plain anchor click — the same
  approach already used by the share page — instead of a cross-origin `fetch` +
  blob + `download` attribute, which is ignored cross-origin and was silently
  failing on Android (and other mobile browsers).
