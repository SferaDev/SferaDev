ALTER TABLE "events" ADD COLUMN "skip_consent" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "capture_auto_start" boolean DEFAULT true NOT NULL;