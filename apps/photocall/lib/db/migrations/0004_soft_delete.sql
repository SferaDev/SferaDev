ALTER TABLE "events" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "photos" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
CREATE INDEX "events_deleted_at_idx" ON "events" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "photos_deleted_at_idx" ON "photos" USING btree ("deleted_at");