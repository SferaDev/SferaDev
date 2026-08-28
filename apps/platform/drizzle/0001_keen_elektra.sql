-- better-auth 1.7 keys accounts on (issuer, accountId) instead of (providerId, accountId), and
-- marks `issuer` as required. Drizzle generates this as a single `ADD COLUMN ... NOT NULL`, which
-- fails on a populated table, so the column is added nullable, backfilled, then constrained.
--
-- The backfill reproduces the issuer better-auth itself would mint for each existing row:
-- credential accounts get `local:credential` (createLocalAccountIssuer) and the built-in social
-- providers get `local:oauth:<providerId>` (createOAuthAccountIssuer). Only generic-oauth
-- providers carry a real issuer, and this app configures none — just google and github.
ALTER TABLE "accounts" ADD COLUMN "issuer" text;--> statement-breakpoint
UPDATE "accounts" SET "issuer" = CASE
	WHEN "provider_id" = 'credential' THEN 'local:credential'
	ELSE 'local:oauth:' || "provider_id"
END WHERE "issuer" IS NULL;--> statement-breakpoint
ALTER TABLE "accounts" ALTER COLUMN "issuer" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "jwks" ADD COLUMN "alg" text;--> statement-breakpoint
ALTER TABLE "jwks" ADD COLUMN "crv" text;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_issuer_account_id_unique" UNIQUE("issuer","account_id");
