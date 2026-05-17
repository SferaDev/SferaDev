CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"start_date" timestamp,
	"end_date" timestamp,
	"status" text DEFAULT 'draft' NOT NULL,
	"kiosk_pin_hash" text,
	"kiosk_pin_salt" text,
	"slideshow_enabled" boolean DEFAULT true NOT NULL,
	"slideshow_safe_mode" boolean DEFAULT false NOT NULL,
	"idle_timeout_seconds" integer DEFAULT 120 NOT NULL,
	"default_camera" text DEFAULT 'user' NOT NULL,
	"photo_quality" real DEFAULT 0.9 NOT NULL,
	"max_photo_dimension" integer DEFAULT 1920 NOT NULL,
	"primary_color" text,
	"logo_storage_key" text,
	"welcome_message" text,
	"thank_you_message" text,
	"share_expiration_days" integer,
	"allow_download" boolean DEFAULT true NOT NULL,
	"allow_print" boolean DEFAULT true NOT NULL,
	"show_qr_code" boolean DEFAULT true NOT NULL,
	"retention_days" integer,
	"delete_after_date" timestamp,
	"photo_count" integer DEFAULT 0 NOT NULL,
	"session_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kiosk_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"status" text DEFAULT 'started' NOT NULL,
	"template_id" uuid,
	"captured_image_url" text,
	"caption" text,
	"mirrored" boolean,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "org_settings" (
	"organization_id" text PRIMARY KEY NOT NULL,
	"logo_storage_key" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"storage_key" text NOT NULL,
	"share_token" text NOT NULL,
	"human_code" text NOT NULL,
	"caption" text,
	"template_id" uuid,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"size_bytes" integer NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "photos_share_token_unique" UNIQUE("share_token")
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"name" text NOT NULL,
	"storage_key" text NOT NULL,
	"thumbnail_storage_key" text,
	"enabled" boolean DEFAULT true NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"caption_position_json" text,
	"safe_area_json" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usage_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"event_id" uuid,
	"type" text NOT NULL,
	"metadata" text,
	"bytes" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "kiosk_sessions" ADD CONSTRAINT "kiosk_sessions_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_session_id_kiosk_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."kiosk_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "events_org_idx" ON "events" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "events_org_slug_idx" ON "events" USING btree ("organization_id","slug");--> statement-breakpoint
CREATE INDEX "events_status_idx" ON "events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "kiosk_sessions_event_idx" ON "kiosk_sessions" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "kiosk_sessions_status_idx" ON "kiosk_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "photos_event_idx" ON "photos" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "photos_created_at_idx" ON "photos" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "templates_event_idx" ON "templates" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "usage_logs_org_idx" ON "usage_logs" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "usage_logs_created_at_idx" ON "usage_logs" USING btree ("created_at");