-- Reverts 0001. better-auth 1.7.3 restored the 1.6 account schema: accounts are identified by
-- (providerId, accountId) again and `issuer` is gone from @better-auth/core's table definition.
-- Because the column is NOT NULL and better-auth never writes it, 1.7.3's schema validation
-- rejects every auth request with SchemaMismatchError until it is removed.
--
-- No backfill is needed in either direction: 0001 derived `issuer` deterministically from
-- `provider_id`, so nothing unrecoverable is dropped. The unique constraint goes first — the
-- upgrade guide notes MySQL rebuilds a compound index on its remaining columns, silently turning
-- it into a unique constraint on `account_id` alone.
-- https://www.better-auth.com/docs/guides/1-7-upgrade-guide
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_issuer_account_id_unique";--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN "issuer";
