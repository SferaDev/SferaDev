/**
 * Soft delete + recycling bin constants and helpers.
 *
 * Deleting a photo (or event) is reversible: instead of removing the DB row and
 * the R2 object immediately, we stamp `deletedAt`. The item then lives in the
 * per-event recycling bin and is hidden from every normal listing. The cleanup
 * cron permanently removes items whose `deletedAt` is older than
 * {@link RECYCLE_BIN_RETENTION_DAYS} — only then is the real R2 object deleted.
 */

/** How long a soft-deleted item stays recoverable before the cron purges it. */
export const RECYCLE_BIN_RETENTION_DAYS = 30;

const MS_PER_DAY = 86_400_000;

/** The instant a soft-deleted item becomes eligible for permanent purge. */
function recycleBinPurgeAt(deletedAt: Date): Date {
	return new Date(deletedAt.getTime() + RECYCLE_BIN_RETENTION_DAYS * MS_PER_DAY);
}

/**
 * Whole days remaining before a soft-deleted item is permanently purged.
 * Clamped at zero (never negative) and rounded up so "expires today" still
 * reads as a positive number until the cron actually runs.
 */
export function daysUntilPurge(deletedAt: Date, now: Date = new Date()): number {
	const remainingMs = recycleBinPurgeAt(deletedAt).getTime() - now.getTime();
	return Math.max(0, Math.ceil(remainingMs / MS_PER_DAY));
}
