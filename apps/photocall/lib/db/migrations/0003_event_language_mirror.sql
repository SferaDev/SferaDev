ALTER TABLE "events" ADD COLUMN "language" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "mirror_photos" boolean DEFAULT true NOT NULL;