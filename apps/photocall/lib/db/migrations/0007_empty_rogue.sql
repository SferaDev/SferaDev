CREATE TABLE "bridge_printers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"printer_id" text NOT NULL,
	"name" text NOT NULL,
	"make_and_model" text,
	"state" text,
	"state_reasons" text,
	"marker_levels" text,
	"media_supported" text,
	"reachable" boolean DEFAULT true NOT NULL,
	"last_seen_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "print_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"photo_id" uuid,
	"image_storage_key" text NOT NULL,
	"printer_id" text NOT NULL,
	"paper_size" text NOT NULL,
	"media_type" text,
	"borderless" boolean DEFAULT true NOT NULL,
	"copies" integer DEFAULT 1 NOT NULL,
	"orientation" text DEFAULT 'portrait' NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"claimed_at" timestamp,
	"claimed_by" text,
	"printed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "bridge_pairing_token" text;--> statement-breakpoint
ALTER TABLE "bridge_printers" ADD CONSTRAINT "bridge_printers_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "print_jobs" ADD CONSTRAINT "print_jobs_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "print_jobs" ADD CONSTRAINT "print_jobs_photo_id_photos_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."photos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "bridge_printers_event_printer_idx" ON "bridge_printers" USING btree ("event_id","printer_id");--> statement-breakpoint
CREATE INDEX "print_jobs_event_idx" ON "print_jobs" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "print_jobs_event_status_idx" ON "print_jobs" USING btree ("event_id","status");--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_bridge_pairing_token_unique" UNIQUE("bridge_pairing_token");