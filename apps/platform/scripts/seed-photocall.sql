-- Seed the Photocall product, its billing plans, plan features, and usage meter.
--
-- The platform resolves entitlements from a product's *default* plan when an
-- account has no active subscription, so the free plan below is what every new
-- organization gets out of the box. Idempotent: safe to run repeatedly.
--
--   psql "$DATABASE_URL" -f apps/platform/scripts/seed-photocall.sql
--
-- Feature keys mirror what the photocall app checks via the platform SDK:
--   create_event, capture_photo, invite_member, storage_bytes (+ photos_captured meter).

BEGIN;

-- ── Product ──────────────────────────────────────────────────────────
INSERT INTO platform_products (id, name, slug)
VALUES ('photocall', 'Photocall', 'photocall')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug;

-- ── Plans ────────────────────────────────────────────────────────────
INSERT INTO platform_plans (id, product_id, name, slug, is_default, sort_order)
VALUES
  ('photocall_free', 'photocall', 'Free', 'free', true, 0),
  ('photocall_pro',  'photocall', 'Pro',  'pro',  false, 1)
ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name,
      slug = EXCLUDED.slug,
      is_default = EXCLUDED.is_default,
      sort_order = EXCLUDED.sort_order;

-- ── Plan features ────────────────────────────────────────────────────
-- Replace the feature rows for these plans so re-running reflects edits.
DELETE FROM platform_plan_features WHERE plan_id IN ('photocall_free', 'photocall_pro');

INSERT INTO platform_plan_features (id, plan_id, feature, enabled, limit_value, limit_window) VALUES
  -- Free tier
  ('pf_free_create_event',   'photocall_free', 'create_event',   true, 1,          NULL),
  ('pf_free_capture_photo',  'photocall_free', 'capture_photo',  true, 50,         NULL),
  ('pf_free_invite_member',  'photocall_free', 'invite_member',  true, 2,          NULL),
  ('pf_free_storage_bytes',  'photocall_free', 'storage_bytes',  true, 524288000,  NULL),
  -- Pro tier (per-event credits; limits are generous / unlimited)
  ('pf_pro_create_event',    'photocall_pro',  'create_event',   true, NULL,       NULL),
  ('pf_pro_capture_photo',   'photocall_pro',  'capture_photo',  true, 200,        NULL),
  ('pf_pro_invite_member',   'photocall_pro',  'invite_member',  true, NULL,       NULL),
  -- limit_value is int4; storage capped at ~2 GB. Larger tiers would need a
  -- bigint column on platform_plan_features.
  ('pf_pro_storage_bytes',   'photocall_pro',  'storage_bytes',  true, 2000000000, NULL);

-- ── Usage meter ──────────────────────────────────────────────────────
INSERT INTO platform_meters (id, product_id, name, stripe_meter_event_name)
VALUES ('photocall_photos_captured', 'photocall', 'photos_captured', 'photos_captured')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

COMMIT;
