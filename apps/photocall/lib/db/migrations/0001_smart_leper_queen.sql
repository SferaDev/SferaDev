CREATE TABLE "presets" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"kind" text NOT NULL,
	"shot_count" integer NOT NULL,
	"layout_json" text NOT NULL,
	"thumbnail_storage_key" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "photos" ALTER COLUMN "session_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "camera_device_id" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "camera_device_label" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "attract_title" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "attract_subtitle" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "cta_label" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "consent_text" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "accent_color" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "font_family" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "show_powered_by" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "album_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "album_token" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "album_access_mode" text DEFAULT 'link' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "album_pin_hash" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "album_pin_salt" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "allow_guest_upload" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "album_moderation" text DEFAULT 'instant' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "couple_names" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "capture_who_chooses_filter" text DEFAULT 'guest' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "capture_default_countdown" integer DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "capture_auto_shoot" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "boomerang_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "print_method" text DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "print_printer_id" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "print_paper_size" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "print_media_type" text DEFAULT 'photo_glossy' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "print_borderless" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "print_copies" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "print_orientation" text DEFAULT 'portrait' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "print_auto_print" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "print_bridge_url" text;--> statement-breakpoint
ALTER TABLE "kiosk_sessions" ADD COLUMN "captured_image_urls" text;--> statement-breakpoint
ALTER TABLE "kiosk_sessions" ADD COLUMN "shot_index" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "kiosk_sessions" ADD COLUMN "selected_filter" text;--> statement-breakpoint
ALTER TABLE "photos" ADD COLUMN "source" text DEFAULT 'kiosk' NOT NULL;--> statement-breakpoint
ALTER TABLE "photos" ADD COLUMN "uploader_id" text;--> statement-breakpoint
ALTER TABLE "photos" ADD COLUMN "uploader_name" text;--> statement-breakpoint
ALTER TABLE "photos" ADD COLUMN "status" text DEFAULT 'visible' NOT NULL;--> statement-breakpoint
ALTER TABLE "photos" ADD COLUMN "kind" text DEFAULT 'single' NOT NULL;--> statement-breakpoint
ALTER TABLE "photos" ADD COLUMN "raw_shots_json" text;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "layout_json" text;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "kind" text DEFAULT 'single' NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "shot_count" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "preset_id" text;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "allowed_filters" text;--> statement-breakpoint
CREATE INDEX "photos_event_status_idx" ON "photos" USING btree ("event_id","status");--> statement-breakpoint
CREATE INDEX "photos_uploader_idx" ON "photos" USING btree ("uploader_id");--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_album_token_unique" UNIQUE("album_token");