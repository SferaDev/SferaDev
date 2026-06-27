/**
 * Pure guest-upload validation: the MIME types and size caps a guest may upload
 * to a shared album.
 *
 * Kept free of any server-only imports (no `next/headers`) so it can be shared by
 * both the album server actions and the client upload UI. The server remains the
 * source of truth — these helpers are re-checked there after the file lands.
 */

/**
 * Image MIME types a guest may upload. SVG is intentionally excluded — it can
 * carry script and would be a stored-XSS vector when served from storage.
 */
const ALLOWED_IMAGE_UPLOAD_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/heic",
	"image/heif",
] as const;

/**
 * Video MIME types a guest may upload. Kept to widely-supported, browser-playable
 * containers so the uploaded clips render in an inline `<video>` without
 * transcoding. QuickTime (`.mov`) is included because iOS records to it.
 */
const ALLOWED_VIDEO_UPLOAD_TYPES = ["video/mp4", "video/webm", "video/quicktime"] as const;

export type GuestImageUploadContentType = (typeof ALLOWED_IMAGE_UPLOAD_TYPES)[number];
export type GuestVideoUploadContentType = (typeof ALLOWED_VIDEO_UPLOAD_TYPES)[number];
export type GuestUploadContentType = GuestImageUploadContentType | GuestVideoUploadContentType;

/** Hard cap on a single guest image upload (enforced in the presigned PUT and on confirm). */
export const MAX_GUEST_UPLOAD_BYTES = 25 * 1024 * 1024; // 25 MB

/** Hard cap on a single guest video upload — larger than images, smaller than a film. */
export const MAX_GUEST_VIDEO_UPLOAD_BYTES = 200 * 1024 * 1024; // 200 MB

export function isAllowedImageType(
	contentType: string,
): contentType is GuestImageUploadContentType {
	return (ALLOWED_IMAGE_UPLOAD_TYPES as readonly string[]).includes(contentType);
}

export function isAllowedVideoType(
	contentType: string,
): contentType is GuestVideoUploadContentType {
	return (ALLOWED_VIDEO_UPLOAD_TYPES as readonly string[]).includes(contentType);
}

export function isAllowedUploadType(contentType: string): contentType is GuestUploadContentType {
	return isAllowedImageType(contentType) || isAllowedVideoType(contentType);
}

/** The size cap that applies to a given upload type (videos are allowed to be larger). */
export function maxUploadBytesFor(contentType: GuestUploadContentType): number {
	return isAllowedVideoType(contentType) ? MAX_GUEST_VIDEO_UPLOAD_BYTES : MAX_GUEST_UPLOAD_BYTES;
}
