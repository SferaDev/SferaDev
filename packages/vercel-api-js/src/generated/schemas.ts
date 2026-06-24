// @ts-nocheck

import * as z from "zod";

export const networkSchema = z.object({
	awsAccountId: z.string().describe("The ID of the AWS Account in which the network exists."),
	awsAvailabilityZoneIds: z
		.array(z.string())
		.optional()
		.describe(
			"The IDs of the AWS Availability Zones in which the network exists, if specified during creation.",
		),
	awsRegion: z.string().describe("The AWS Region in which the network exists."),
	cidr: z.string().describe("The CIDR range of the Network."),
	createdAt: z
		.number()
		.describe(
			"The date at which the Network was created, represented as a UNIX timestamp since EPOCH.",
		),
	egressIpAddresses: z.array(z.string()).optional(),
	hostedZones: z
		.object({
			count: z
				.number()
				.describe("The number of AWS Route53 Hosted Zones associated with the Network."),
		})
		.optional()
		.describe("Metadata about any AWS Route53 Hosted Zones associated with the Network."),
	id: z.string().describe("The unique identifier of the Network."),
	name: z.string().describe("The name of the network."),
	peeringConnections: z
		.object({
			count: z
				.number()
				.describe("The number of AWS Route53 Hosted Zones associated with the Network."),
		})
		.optional()
		.describe("Metadata about any AWS Route53 Hosted Zones associated with the Network."),
	projects: z
		.object({
			count: z.number(),
			ids: z.array(z.string()),
		})
		.optional()
		.describe("Metadata about any projects associated with the Network."),
	region: z.string().optional().describe("The Vercel region in which the Network exists."),
	status: z
		.enum(["create_in_progress", "delete_in_progress", "error", "ready"])
		.describe("The status of the Network."),
	teamId: z.string().describe("The unique identifier of the Team that owns the Network."),
	vpcId: z.string().optional().describe("The ID of the VPC which hosts the network."),
});

export const flagJSONValueSchema = z
	.union([
		z.string(),
		z.number(),
		z.array(z.unknown()),
		z.object({}).catchall(z.unknown()),
		z.union([z.literal(false), z.literal(true)]),
	])
	.nullable();

export const paginationSchema = z
	.object({
		count: z.number().describe("Amount of items in the current page."),
		next: z.number().nullable().describe("Timestamp that must be used to request the next page."),
		prev: z
			.number()
			.nullable()
			.describe("Timestamp that must be used to request the previous page."),
	})
	.describe(
		"This object contains information related to the pagination of the current request, including the necessary parameters to get the next or previous page of data.",
	);

export const tldNameSchema = z.string().describe("A valid TLD name");

export const httpApiDecodeErrorSchema = z
	.object({
		issues: z.array(z.unknown()),
		message: z.string(),
	})
	.strict()
	.describe("The request did not match the expected schema");

export const issueSchema = z
	.object({
		path: z.array(z.unknown()).describe("The path to the property where the issue occurred"),
		message: z.string().describe("A descriptive message explaining the issue"),
	})
	.strict()
	.describe("Represents an error encountered while parsing a value to match the schema");

export const propertyKeySchema = z.union([
	z.string(),
	z.number(),
	z
		.object({
			tag: z.enum(["symbol"]).optional(),
			key: z.string(),
		})
		.strict(),
]);

export const tooManyRequestsSchema = z
	.object({
		status: z.literal(429),
		code: z.enum(["too_many_requests"]),
		message: z.string(),
		retryAfter: z
			.object({
				value: z.number(),
				str: z.string(),
			})
			.strict(),
		limit: z
			.object({
				total: z.number(),
				remaining: z.number(),
				reset: z.number(),
			})
			.strict(),
	})
	.strict();

export const unauthorizedSchema = z
	.object({
		status: z.literal(401),
		code: z.enum(["unauthorized"]),
		message: z.string(),
	})
	.strict();

export const notAuthorizedForScopeSchema = z
	.object({
		status: z.literal(403),
		code: z.enum(["not_authorized_for_scope"]),
		message: z.string(),
	})
	.strict();

export const internalServerErrorSchema = z
	.object({
		status: z.literal(500),
		code: z.enum(["internal_server_error"]),
		message: z.string(),
	})
	.strict();

export const tldNotSupportedSchema = z
	.object({
		status: z.literal(400),
		code: z.enum(["tld_not_supported"]),
		message: z.string(),
	})
	.strict()
	.describe("The TLD is not currently supported.");

export const domainNameSchema = z.string().describe("A valid domain name");

export const notFoundSchema = z
	.object({
		status: z.literal(404),
		code: z.enum(["not_found"]),
		message: z.string(),
	})
	.strict();

export const domainTooShortSchema = z
	.object({
		status: z.literal(400),
		code: z.enum(["domain_too_short"]),
		message: z.string(),
	})
	.strict()
	.describe("The domain name (excluding the TLD) is too short.");

export const badRequestSchema = z
	.object({
		status: z.literal(400),
		code: z.enum(["bad_request"]),
		message: z.string(),
	})
	.strict();

export const domainNotRegisteredSchema = z
	.object({
		status: z.literal(400),
		code: z.enum(["domain_not_registered"]),
		message: z.string(),
	})
	.strict()
	.describe("The domain is not registered with Vercel.");

export const forbiddenSchema = z
	.object({
		status: z.literal(403),
		code: z.enum(["forbidden"]),
		message: z.string(),
	})
	.strict();

export const domainNotFoundSchema = z
	.object({
		status: z.literal(404),
		code: z.enum(["domain_not_found"]),
		message: z.string(),
	})
	.strict()
	.describe("The domain was not found in our system.");

export const domainCannotBeTransferedOutUntilSchema = z
	.object({
		status: z.literal(409),
		code: z.enum(["domain_cannot_be_transfered_out_until"]),
		message: z.string(),
	})
	.strict()
	.describe("The domain cannot be transfered out until the specified date.");

export const nonEmptyTrimmedStringSchema = z
	.string()
	.min(1)
	.regex(/^\S[\s\S]*\S$|^\S$|^$/)
	.describe("a non empty string");

export const emailAddressSchema = z.string().min(1).describe("A valid RFC 5322 email address");

export const e164PhoneNumberSchema = z
	.string()
	.min(1)
	.regex(/^(?=(?:\D*\d){8,15}$)\+[1-9]\d{0,2}\.?\d+$/)
	.describe("A valid E.164 phone number");

export const countryCodeSchema = z.string().describe("A valid ISO 3166-1 alpha-2 country code");

export const orderIdSchema = z.string().describe("A valid order ID");

export const languageCodeRequiredSchema = z
	.object({
		status: z.literal(400),
		code: z.enum(["language_code_required"]),
		message: z.string(),
	})
	.strict()
	.describe("A language code is required for punycode domains.");

export const domainNotAvailableSchema = z
	.object({
		status: z.literal(400),
		code: z.enum(["domain_not_available"]),
		message: z.string(),
	})
	.strict()
	.describe("The domain is not available.");

export const expectedPriceMismatchSchema = z
	.object({
		status: z.literal(400),
		code: z.enum(["expected_price_mismatch"]),
		message: z.string(),
	})
	.strict()
	.describe("The expected price passed does not match the actual price.");

export const additionalContactInfoRequiredSchema = z
	.object({
		status: z.literal(400),
		code: z.enum(["additional_contact_info_required"]),
		message: z.string(),
	})
	.strict()
	.describe("Additional contact information is required for the TLD.");

export const invalidAdditionalContactInfoSchema = z
	.object({
		status: z.literal(400),
		code: z.enum(["invalid_additional_contact_info"]),
		message: z.string(),
	})
	.strict()
	.describe("Additional contact information provided for the TLD is invalid.");

export const orderTooExpensiveSchema = z
	.object({
		status: z.literal(400),
		code: z.enum(["order_too_expensive"]),
		message: z.string(),
	})
	.strict()
	.describe("The total price of the order is too high.");

export const duplicateDomainsSchema = z
	.object({
		status: z.literal(400),
		code: z.enum(["duplicate_domains"]),
		message: z.string(),
	})
	.strict()
	.describe("Duplicate domains were provided.");

export const tooManyDomainsSchema = z
	.object({
		status: z.literal(400),
		code: z.enum(["too_many_domains"]),
		message: z.string(),
	})
	.strict()
	.describe("The number of domains in the order is too high.");

export const dNSSECEnabledSchema = z
	.object({
		status: z.literal(400),
		code: z.enum(["dnssec_enabled"]),
		message: z.string(),
	})
	.strict()
	.describe("The operation cannot be completed because DNSSEC is enabled for the domain.");

export const domainAlreadyOwnedSchema = z
	.object({
		status: z.literal(400),
		code: z.enum(["domain_already_owned"]),
		message: z.string(),
	})
	.strict()
	.describe("The domain is already owned by another team or user.");

export const domainNotRenewableSchema = z
	.object({
		status: z.literal(400),
		code: z.enum(["domain_not_renewable"]),
		message: z.string(),
	})
	.strict()
	.describe("The domain is not renewable.");

export const domainAlreadyRenewingSchema = z
	.object({
		status: z.literal(400),
		code: z.enum(["domain_already_renewing"]),
		message: z.string(),
	})
	.strict()
	.describe("The domain is already renewing.");

export const nameserverSchema = z.string().describe("A valid nameserver");

export const contactVerifiedSchema = z
	.object({
		verified: z.literal(true),
	})
	.strict()
	.describe("The registrant contact has been verified.");

export const contactPendingVerificationSchema = z
	.object({
		verified: z.literal(false),
		verifyBy: z.unknown(),
		email: z.string(),
	})
	.strict()
	.describe(
		"The registrant contact has not yet been verified. The contact must be verified by `verifyBy`, and a verification email is sent to `email`.",
	);

export const dateFromStringSchema = z.string().describe("a string to be decoded into a Date");

export const boughtTooRecentlySchema = z
	.object({
		status: z.literal(400),
		code: z.enum(["bought_too_recently"]),
		message: z.string(),
	})
	.strict()
	.describe("The domain was bought too recently to determine verification status.");

export const registrantFieldSchema = z
	.union([
		z
			.object({
				description: z.string(),
				required: z.boolean(),
				label: z.string().optional(),
				validation: z.string().optional(),
				requiredWhen: z
					.union([
						z.string(),
						z
							.object({
								valueIn: z.array(z.string()).optional(),
							})
							.strict(),
					])
					.optional(),
				type: z.enum(["string"]),
				options: z
					.array(
						z
							.object({
								value: z.string(),
								label: z.string(),
								fields: z.object({}).optional(),
							})
							.strict(),
					)
					.optional(),
				fields: z.object({}).optional(),
			})
			.strict(),
		z
			.object({
				description: z.string(),
				required: z.boolean(),
				label: z.string().optional(),
				validation: z.string().optional(),
				requiredWhen: z
					.union([
						z.string(),
						z
							.object({
								valueIn: z.array(z.string()).optional(),
							})
							.strict(),
					])
					.optional(),
				type: z.enum(["enum"]),
				options: z.array(
					z
						.object({
							value: z.string(),
							label: z.string(),
							fields: z.object({}).optional(),
						})
						.strict(),
				),
				fields: z.object({}).optional(),
			})
			.strict(),
		z
			.object({
				description: z.string(),
				required: z.boolean(),
				label: z.string().optional(),
				validation: z.string().optional(),
				requiredWhen: z
					.union([
						z.string(),
						z
							.object({
								valueIn: z.array(z.string()).optional(),
							})
							.strict(),
					])
					.optional(),
				type: z.enum(["acknowledgement"]),
				value: z.string().optional(),
			})
			.strict(),
		z
			.object({
				description: z.string(),
				required: z.boolean(),
				label: z.string().optional(),
				validation: z.string().optional(),
				requiredWhen: z
					.union([
						z.string(),
						z
							.object({
								valueIn: z.array(z.string()).optional(),
							})
							.strict(),
					])
					.optional(),
				type: z.enum(["notice"]),
			})
			.strict(),
	])
	.describe("Schema definition for registrant fields.");

export const edgeConfigItemValueSchema = z
	.union([
		z.string(),
		z.number(),
		z.object({}).catchall(z.unknown()),
		z.array(z.unknown()),
		z.union([z.literal(false), z.literal(true)]),
	])
	.nullable();

export const edgeConfigItemSchema = z
	.object({
		key: z.string(),
		value: z.unknown(),
		description: z.string().optional(),
		edgeConfigId: z.string(),
		createdAt: z.number(),
		updatedAt: z.number(),
	})
	.describe("The EdgeConfig.");

export const edgeConfigTokenSchema = z
	.object({
		partialToken: z
			.string()
			.describe(
				"A partially-masked representation of the token, safe to display in UIs. The format is the first 3 characters of the token followed by a fixed 8-character `*` mask (e.g. `550e8400-e29b-41d4-a716-446655440000` → `550********`). The mask length is intentionally fixed (not proportional to the original token length) to avoid leaking the token length. Prefer this field for display/reference in UIs and logs. The full, plaintext token is only disclosed once at creation time via `POST /v1/edge-config/:edgeConfigId/token`; use `id` to reference a token in subsequent calls (e.g. when deleting).",
			),
		label: z.string(),
		id: z
			.string()
			.describe("This is not the token itself, but rather an id to identify the token by"),
		edgeConfigId: z.string(),
		createdAt: z.number(),
		token: z
			.string()
			.optional()
			.describe(
				"Deprecated: the full, plaintext token. - Returned once by `POST /v1/edge-config/:edgeConfigId/token` (create). - Still returned by `GET /v1/edge-config/:edgeConfigId/token/:token` (detail) for backwards compatibility, but scheduled for removal. - **Not** returned by `GET /v1/edge-config/:edgeConfigId/tokens` (list); use `partialToken` for display and `id` to reference tokens. Do not rely on this field being present on read operations. Prefer `partialToken` for display and `id` for references.",
			),
	})
	.describe("The EdgeConfig.");

export const userEventSchema = z
	.object({
		id: z.string().describe("The unique identifier of the Event."),
		text: z.string().describe("The human-readable text of the Event."),
		entities: z
			.array(
				z.object({
					type: z
						.enum([
							"app",
							"author",
							"bitbucket_login",
							"bold",
							"deployment_host",
							"deployment_inspector",
							"dns_record",
							"edge-config",
							"env_var_name",
							"flag",
							"flags-segment",
							"flags-settings",
							"git_link",
							"github_login",
							"gitlab_login",
							"hook_name",
							"integration",
							"link",
							"project_name",
							"scaling_rules",
							"store",
							"system",
							"target",
						])
						.describe("The type of entity."),
					start: z
						.number()
						.describe("The index of where the entity begins within the `text` (inclusive)."),
					end: z
						.number()
						.describe("The index of where the entity ends within the `text` (non-inclusive)."),
				}),
			)
			.describe(
				'A list of "entities" within the event `text`. Useful for enhancing the displayed text with additional styling and links.',
			),
		type: z
			.enum([
				"access-group-created",
				"access-group-deleted",
				"access-group-project-updated",
				"access-group-updated",
				"access-group-user-added",
				"access-group-user-removed",
				"agentic-provisioning-account-blocked",
				"agentic-provisioning-account-linked",
				"agentic-provisioning-account-relinked",
				"agentic-provisioning-account-unlinked",
				"agentic-provisioning-credentials-rotated",
				"agentic-provisioning-plan-changed",
				"agentic-provisioning-team-created",
				"ai-alert-investigation",
				"ai-code-review",
				"ai-gateway-api-key-created",
				"ai-gateway-api-key-deleted",
				"ai-gateway-api-key-quota-updated",
				"ai-gateway-byok-credential-created",
				"ai-gateway-byok-credential-deleted",
				"ai-gateway-byok-credential-updated",
				"ai-gateway-provider-allowlist-providers-updated",
				"ai-gateway-provider-allowlist-toggled",
				"ai-gateway-rule-created",
				"ai-gateway-rule-deleted",
				"ai-gateway-rule-updated",
				"ai-gateway-virtual-model-config-archived",
				"ai-gateway-virtual-model-config-created",
				"ai-gateway-virtual-model-config-restored",
				"ai-gateway-virtual-model-config-updated",
				"ai-omniagent",
				"alert-rule-created",
				"alert-rule-deleted",
				"alert-rule-updated",
				"alias",
				"alias-chown",
				"alias-delete",
				"alias-invite-created",
				"alias-invite-joined",
				"alias-invite-revoked",
				"alias-protection-bypass-created",
				"alias-protection-bypass-exception",
				"alias-protection-bypass-regenerated",
				"alias-protection-bypass-revoked",
				"alias-system",
				"alias-user-scoped-access-denied",
				"alias-user-scoped-access-granted",
				"alias-user-scoped-access-requested",
				"alias-user-scoped-access-revoked",
				"aliases-assigned",
				"attack-mode-disabled",
				"attack-mode-enabled",
				"audit-log-export-downloaded",
				"audit-log-export-requested",
				"authorize-git-deployment",
				"auto-expose-system-envs",
				"avatar",
				"bulk-redirects-settings-updated",
				"bulk-redirects-version-promoted",
				"bulk-redirects-version-restored",
				"cert",
				"cert-autorenew",
				"cert-chown",
				"cert-clone",
				"cert-delete",
				"cert-renew",
				"cert-replace",
				"cert-system-create",
				"concurrent-builds-update",
				"connect-attach-project",
				"connect-bitbucket",
				"connect-bitbucket-app",
				"connect-configuration-created",
				"connect-configuration-deleted",
				"connect-configuration-link-updated",
				"connect-configuration-linked",
				"connect-configuration-unlinked",
				"connect-configuration-updated",
				"connect-create-connector",
				"connect-delete-connector",
				"connect-delete-installation",
				"connect-detach-project",
				"connect-github",
				"connect-github-custom-host",
				"connect-github-limited",
				"connect-gitlab",
				"connect-gitlab-app",
				"connect-import-tokens",
				"connect-revoke-all-tokens",
				"connect-update-connector",
				"connect-update-trigger-destinations",
				"connect-upsert-installation",
				"custom-alert-created",
				"custom-alert-deleted",
				"custom-alert-updated",
				"custom-suffix-clear",
				"custom-suffix-disable",
				"custom-suffix-enable",
				"custom-suffix-pending",
				"custom-suffix-ready",
				"deploy-hook-created",
				"deploy-hook-deduped",
				"deploy-hook-deleted",
				"deploy-hook-processed",
				"deployment",
				"deployment-check-created",
				"deployment-check-deleted",
				"deployment-check-updated",
				"deployment-chown",
				"deployment-creation-blocked",
				"deployment-delete",
				"deployment-policy-blocked",
				"deployment-undeleted",
				"disabled-integration-installation-removed",
				"disconnect-bitbucket-app",
				"disconnect-github",
				"disconnect-github-custom-host",
				"disconnect-github-limited",
				"disconnect-gitlab-app",
				"dns-add",
				"dns-delete",
				"dns-record-internal",
				"dns-update",
				"dns-zonefile-import",
				"domain",
				"domain-buy",
				"domain-cdn",
				"domain-chown",
				"domain-custom-ns-change",
				"domain-delegated",
				"domain-delete",
				"domain-move-in",
				"domain-move-out",
				"domain-move-out-request-sent",
				"domain-renew-change",
				"domain-service-type-updated",
				"domain-transfer-in",
				"domain-transfer-in-canceled",
				"domain-transfer-in-completed",
				"domain-zone-change",
				"drain-created",
				"drain-deleted",
				"drain-disabled",
				"drain-enabled",
				"drain-updated",
				"edge-cache-dangerously-delete-by-src-images",
				"edge-cache-dangerously-delete-by-tags",
				"edge-cache-invalidate-by-src-images",
				"edge-cache-invalidate-by-tags",
				"edge-cache-purge-all",
				"edge-cache-rollback-purge",
				"edge-config-backup-restored",
				"edge-config-created",
				"edge-config-deleted",
				"edge-config-items-updated",
				"edge-config-schema-deleted",
				"edge-config-schema-updated",
				"edge-config-token-created",
				"edge-config-token-deleted",
				"edge-config-transfer-in",
				"edge-config-transfer-out",
				"edge-config-updated",
				"email",
				"email-notification-rule-removed",
				"email-notification-rule-updated",
				"enforce-sensitive-environment-variables",
				"env-variable-add",
				"env-variable-delete",
				"env-variable-edit",
				"env-variable-masked",
				"env-variable-read",
				"env-variable-read:cli:dev",
				"env-variable-read:cli:env:add",
				"env-variable-read:cli:env:ls",
				"env-variable-read:cli:env:pull",
				"env-variable-read:cli:env:rm",
				"env-variable-read:cli:pull",
				"env-variable-read:unknown-source",
				"env-variable-read:v0:env:pull",
				"env-variable-rotated",
				"firewall-bypass-created",
				"firewall-bypass-deleted",
				"firewall-config-modified",
				"firewall-config-promoted",
				"firewall-config-removed",
				"firewall-managed-rulegroup-updated",
				"firewall-managed-ruleset-updated",
				"flag",
				"flag-archived",
				"flag-created",
				"flag-deleted",
				"flag-unarchived",
				"flag-updated",
				"flags-explorer-subscription",
				"flags-sdk-key",
				"flags-sdk-key-added",
				"flags-sdk-key-deleted",
				"flags-sdk-key-read",
				"flags-segment",
				"flags-settings",
				"flags-transferred",
				"git_account_integration_link_added",
				"instant-rollback-created",
				"integration-configuration-owner-changed",
				"integration-configuration-scope-change-confirmed",
				"integration-configuration-transfer-in-success",
				"integration-configuration-transfer-out-success",
				"integration-configurations-disabled",
				"integration-installation-billing-plan-updated",
				"integration-installation-completed",
				"integration-installation-permission-updated",
				"integration-installation-removed",
				"integration-resource-sql-query-executed",
				"integration-scope-changed",
				"invoice-modified",
				"invoice-refunded",
				"log-drain-created",
				"log-drain-deleted",
				"log-drain-disabled",
				"log-drain-enabled",
				"login",
				"manual-deployment-promotion-created",
				"marketplace-integration-allowlist-updated",
				"microfrontend-group-added",
				"microfrontend-group-deleted",
				"microfrontend-group-updated",
				"microfrontend-project-added-to-group",
				"microfrontend-project-removed-from-group",
				"microfrontend-project-updated",
				"monitoring-alert-updated",
				"monitoring-disabled",
				"monitoring-enabled",
				"oauth-app-connection-created",
				"oauth-app-connection-removed",
				"oauth-app-connection-updated",
				"oauth-app-created",
				"oauth-app-deleted",
				"oauth-app-secret-deleted",
				"oauth-app-secret-generated",
				"oauth-app-token-created",
				"oauth-app-updated",
				"observability-disabled",
				"observability-enabled",
				"observability-plus-project-disabled",
				"observability-plus-project-enabled",
				"organization-team-add",
				"owner-blocked",
				"owner-soft-blocked",
				"owner-soft-unblocked",
				"owner-unblocked",
				"page-integrity-config-updated",
				"page-integrity-header-approved",
				"page-integrity-header-rejected",
				"page-integrity-inventory-cleared",
				"page-integrity-resource-approved",
				"page-integrity-resource-deleted",
				"page-integrity-resource-rejected",
				"passkey-created",
				"passkey-deleted",
				"passkey-updated",
				"password-protection-disabled",
				"password-protection-enabled",
				"payment-method-added",
				"payment-method-default-updated",
				"payment-method-removed",
				"plan",
				"preview-deployment-suffix-disabled",
				"preview-deployment-suffix-enabled",
				"preview-deployment-suffix-update",
				"privatelink-endpoint-created",
				"privatelink-endpoint-deleted",
				"privatelink-endpoint-updated",
				"production-branch-updated",
				"project-add-alias",
				"project-add-redirect",
				"project-affected-projects-deployments-updated",
				"project-alias-configured-change",
				"project-analytics-disabled",
				"project-analytics-enabled",
				"project-auto-assign-custom-production-domains-updated",
				"project-automation-bypass",
				"project-avatar-update",
				"project-build-command-updated",
				"project-build-logs-and-source-protection-updated",
				"project-build-machine-updated",
				"project-client-cert-delete",
				"project-client-cert-upload",
				"project-connect-configurations",
				"project-consolidated-git-commit-status-updated",
				"project-created",
				"project-cron-jobs-toggled",
				"project-custom-environment-created",
				"project-custom-environment-deleted",
				"project-custom-environment-updated",
				"project-customer-success-code-visibility-updated",
				"project-delete",
				"project-deployment-policy-updated",
				"project-deployment-retention-updated",
				"project-directory-listing",
				"project-domain-deleted",
				"project-domain-moved",
				"project-domain-unverified",
				"project-domain-updated",
				"project-domain-verified",
				"project-elastic-concurrency-updated",
				"project-expiration-locked",
				"project-expiration-reached",
				"project-expiration-scheduled",
				"project-expiration-unlocked",
				"project-external-rewrite-caching-updated",
				"project-framework-updated",
				"project-function-cpu-memory",
				"project-function-failover",
				"project-function-max-duration",
				"project-function-regions",
				"project-functions-beta-updated",
				"project-functions-fluid-disabled",
				"project-functions-fluid-enabled",
				"project-git-commit-comments-toggled",
				"project-git-commit-status-toggled",
				"project-git-create-deployments-toggled",
				"project-git-fork-protection-updated",
				"project-git-lfs-toggled",
				"project-git-pr-comments-toggled",
				"project-git-repository-connected",
				"project-git-repository-disconnected",
				"project-git-repository-dispatch-events-toggled",
				"project-git-require-verified-commits-toggled",
				"project-ignored-build-step-updated",
				"project-install-command-updated",
				"project-member-added",
				"project-member-invited",
				"project-member-removed",
				"project-member-removed-batch",
				"project-member-updated",
				"project-move-in-success",
				"project-move-out-failed",
				"project-move-out-started",
				"project-move-out-success",
				"project-name",
				"project-node-version-updated",
				"project-oidc-issuer-mode-updated",
				"project-oidc-token-created",
				"project-options-allowlist",
				"project-output-directory-updated",
				"project-passport-updated",
				"project-password-protection",
				"project-paused",
				"project-preview-deployment-suffix",
				"project-preview-environment-branch-tracking-updated",
				"project-prioritize-production-builds-updated",
				"project-program-enrollment-changed",
				"project-protected-sourcemaps-updated",
				"project-rollback-description-updated",
				"project-rolling-release-aborted",
				"project-rolling-release-approved",
				"project-rolling-release-completed",
				"project-rolling-release-configured",
				"project-rolling-release-continued",
				"project-rolling-release-disabled",
				"project-rolling-release-enabled",
				"project-rolling-release-paused",
				"project-rolling-release-started",
				"project-rolling-release-suggested-actions-generated",
				"project-rolling-release-timer",
				"project-root-directory-updated",
				"project-routes-version-promoted",
				"project-routes-version-restored",
				"project-sandbox-url-protection-updated",
				"project-skew-protection-allowed-domains-updated",
				"project-skew-protection-max-age-updated",
				"project-skew-protection-threshold-updated",
				"project-source-files-outside-root-directory-updated",
				"project-speed-insights-disabled",
				"project-speed-insights-enabled",
				"project-sso-protection",
				"project-static-ips-updated",
				"project-trusted-ips",
				"project-trusted-sources",
				"project-unpaused",
				"project-web-analytics-disabled",
				"project-web-analytics-enabled",
				"protected-git-scope-added",
				"protected-git-scope-removed",
				"runtime-cache-purge-all",
				"sandbox-alias-assigned",
				"sandbox-alias-delete",
				"scale",
				"scale-auto",
				"secondary-email-added",
				"secondary-email-removed",
				"secondary-email-verified",
				"secret-add",
				"secret-delete",
				"secret-rename",
				"security-plus-updated",
				"set-bio",
				"set-name",
				"set-profiles",
				"set-scale",
				"shared-env-variable-create",
				"shared-env-variable-delete",
				"shared-env-variable-read",
				"shared-env-variable-update",
				"show-ip-addresses",
				"signup",
				"signup-via-bitbucket",
				"signup-via-github",
				"signup-via-gitlab",
				"speed-insights-settings-updated",
				"spend-created",
				"spend-deleted",
				"spend-updated",
				"storage-accept-tos",
				"storage-access-token-set",
				"storage-accessed-data-browser",
				"storage-connect-project",
				"storage-create",
				"storage-delete",
				"storage-disconnect-project",
				"storage-disconnect-projects",
				"storage-inactive-store-deleted",
				"storage-reset-credentials",
				"storage-resource-repl-command",
				"storage-set-locked",
				"storage-transfer-in-success",
				"storage-transfer-out-success",
				"storage-transfer-request-created",
				"storage-update",
				"storage-update-project-connection",
				"storage-upgrade-project-connection-to-oidc",
				"storage-view-secret",
				"strict-deployment-protection-settings",
				"strict-shareable-links",
				"subscription-created",
				"subscription-product-added",
				"subscription-product-removed",
				"subscription-updated",
				"team",
				"team-avatar-update",
				"team-default-build-machine-updated",
				"team-default-passport-updated",
				"team-delete",
				"team-deployment-policy-updated",
				"team-domain-verification-created",
				"team-domain-verification-deleted",
				"team-domain-verification-verified",
				"team-email-domain-update",
				"team-emu-account-split",
				"team-emu-updated",
				"team-ended-trial",
				"team-git-repository-dispatch-events-toggled",
				"team-git-require-verified-commits-toggled",
				"team-invite-bulk-delete",
				"team-invite-code-reset",
				"team-invite-link-created",
				"team-invite-link-deleted",
				"team-ip-blocking-rules-created",
				"team-ip-blocking-rules-removed",
				"team-member-add",
				"team-member-confirm-request",
				"team-member-decline-request",
				"team-member-delete",
				"team-member-entitlement-added",
				"team-member-entitlement-canceled",
				"team-member-entitlement-reactivated",
				"team-member-entitlement-removed",
				"team-member-join",
				"team-member-leave",
				"team-member-request-access",
				"team-member-role-update",
				"team-member-sso-authorization-attempt",
				"team-mfa-enforcement-updated",
				"team-name-update",
				"team-paid-invoice",
				"team-program-enrollment-changed",
				"team-remote-caching-update",
				"team-saml-enforced",
				"team-saml-roles",
				"team-slug-update",
				"team-tokens-invalidated",
				"unlink-login-connection",
				"user-delete",
				"user-emu-account-archived",
				"user-emu-account-recovered",
				"user-mfa-challenge-verified",
				"user-mfa-configuration-updated",
				"user-mfa-recovery-codes-regenerated",
				"user-mfa-removed",
				"user-mfa-setup-skipped",
				"user-mfa-totp-verification-started",
				"user-mfa-totp-verified",
				"user-primary-email-updated",
				"user-token-created",
				"user-token-deleted",
				"user-tokens-deleted",
				"username",
				"v0-chat-ai-usage",
				"v0-chat-created",
				"v0-chat-message-sent",
				"vercel-agent-elevated-permissions-approved",
				"vercel-agent-elevated-permissions-requested",
				"vercel-agent-session-created",
				"vercel-agent-team-trial-credits-applied",
				"vercel-app-installation-request-dismissed",
				"vercel-app-installation-requested",
				"vercel-app-installation-updated",
				"vercel-app-installed",
				"vercel-app-tokens-revoked",
				"vercel-app-uninstalled",
				"vercel-toolbar",
				"vpc-peering-connection-accepted",
				"vpc-peering-connection-deleted",
				"vpc-peering-connection-rejected",
				"vpc-peering-connection-updated",
				"vulnerability-banner-dismissed",
				"web-analytics-tier-updated",
				"webhook-created",
				"webhook-deleted",
				"webhook-updated",
				"workflow-deployment-key-accessed",
			])
			.optional()
			.describe("The type of the event."),
		categories: z
			.array(
				z.enum([
					"account",
					"ai",
					"ai-gateway",
					"billing",
					"deployment",
					"domain",
					"edge",
					"env-variable",
					"feature-flags",
					"firewall",
					"integration",
					"microfrontends",
					"network",
					"observability",
					"other",
					"project",
					"security",
					"storage",
					"team",
					"v0",
					"vercel-app",
					"workflow",
				]),
			)
			.optional()
			.describe(
				'The categories that group this event with related event types. An event can belong to multiple categories (e.g. a firewall event is both Firewall and Security). The first entry is the "primary" category. Use the `/events/types` endpoint to discover the full list of categories.',
			),
		createdAt: z.number().describe("Timestamp (in milliseconds) of when the event was generated."),
		user: z
			.object({
				slug: z.string().optional(),
				avatar: z.string(),
				uid: z.string(),
				email: z.string(),
				username: z.string(),
			})
			.optional()
			.describe("Metadata for {@link userId}."),
		principal: z
			.union([
				z
					.object({
						type: z.enum(["user"]).optional(),
						avatar: z.string(),
						email: z.string(),
						slug: z.string().optional(),
						uid: z.string(),
						username: z.string(),
					})
					.strict(),
				z
					.object({
						type: z.enum(["app"]),
						clientId: z.string(),
						name: z.string(),
					})
					.strict(),
				z
					.object({
						type: z.enum(["system"]),
					})
					.strict(),
			])
			.optional(),
		via: z
			.array(
				z.union([
					z
						.object({
							type: z.enum(["user"]).optional(),
							avatar: z.string(),
							email: z.string(),
							slug: z.string().optional(),
							uid: z.string(),
							username: z.string(),
						})
						.strict(),
					z
						.object({
							type: z.enum(["app"]),
							clientId: z.string(),
							name: z.string(),
						})
						.strict(),
					z
						.object({
							type: z.enum(["system"]),
						})
						.strict(),
				]),
			)
			.optional()
			.describe("Metadata for {@link viaIds}."),
		userId: z
			.string()
			.optional()
			.describe(
				"When the principal who generated the event is a user, this is their ID; otherwise, it is empty.",
			),
		principalId: z
			.string()
			.describe(
				"The ID of the principal who generated the event. The principal is typically a user, but it could also be an app, an integration, etc. The principal may have delegated its authority to an acting party, and so {@link viaIds} should be checked as well.",
			),
		viaIds: z
			.array(z.string())
			.optional()
			.describe(
				'If the principal delegated its authority (for example, a user delegating to an app), then this array contains the ID of the current actor. For example, if `principalId` is "user123" and `viaIds` is `["app456"]`, we can say the event was triggered by - "app456 on behalf of user123", or - "user123 via app4556". Both are equivalent. Arbitrarily long chains of delegation can be represented. For example, if `principalId` is "user123" and `viaIds` is `["service1", "service2"]`, we can say the event was triggered by "user123 via service1 via service2".',
			),
		payload: z
			.union([
				z.object({}).strict(),
				z
					.object({
						action: z.enum(["archived", "created", "deleted", "unarchived", "updated"]),
						id: z.string(),
						slug: z.string(),
						projectId: z.string(),
						projectName: z.string().optional(),
					})
					.strict(),
				z
					.object({
						action: z.enum(["added", "deleted", "rotated"]),
						label: z.string().optional(),
						projectName: z.string().optional(),
						projectId: z.string().optional(),
						environment: z.string(),
					})
					.strict(),
				z
					.object({
						action: z.enum(["read"]),
						projectName: z.string().optional(),
						projectId: z.string().optional(),
						environment: z.array(z.string()),
					})
					.strict(),
				z
					.object({
						provider: z
							.enum(["chatgpt", "stripe"])
							.optional()
							.describe('Present on new events only. Equivalent to "stripe" when absent.'),
						providerAccount: z
							.string()
							.optional()
							.describe("Present on new events only. Equivalent to `stripeAccount` when absent."),
						stripeAccount: z
							.string()
							.optional()
							.describe('Present when `provider` is "stripe". Equivalent to `providerAccount`.'),
						stripeOrganisation: z
							.string()
							.optional()
							.describe('Present when `provider` is "stripe".'),
						teamId: z.string(),
						accountRequestId: z.string(),
					})
					.strict(),
				z
					.object({
						provider: z
							.enum(["chatgpt", "stripe"])
							.optional()
							.describe('Present on new events only. Equivalent to "stripe" when absent.'),
						providerAccount: z
							.string()
							.optional()
							.describe("Present on new events only. Equivalent to `stripeAccount` when absent."),
						stripeAccount: z
							.string()
							.optional()
							.describe('Present when `provider` is "stripe". Equivalent to `providerAccount`.'),
						stripeOrganisation: z
							.string()
							.optional()
							.describe('Present when `provider` is "stripe".'),
						teamId: z.string(),
					})
					.strict(),
				z
					.object({
						provider: z
							.enum(["chatgpt", "stripe"])
							.optional()
							.describe('Present on new events only. Equivalent to "stripe" when absent.'),
						providerAccount: z
							.string()
							.optional()
							.describe("Present on new events only. Equivalent to `stripeAccount` when absent."),
						stripeAccount: z
							.string()
							.optional()
							.describe('Present when `provider` is "stripe". Equivalent to `providerAccount`.'),
						stripeOrganisation: z
							.string()
							.optional()
							.describe('Present when `provider` is "stripe".'),
						teamId: z.string(),
						teamSlug: z.string(),
					})
					.strict(),
				z
					.object({
						provider: z
							.enum(["chatgpt", "stripe"])
							.optional()
							.describe('Present on new events only. Equivalent to "stripe" when absent.'),
						providerAccount: z
							.string()
							.optional()
							.describe("Present on new events only. Equivalent to `stripeAccount` when absent."),
						stripeAccount: z
							.string()
							.optional()
							.describe('Present when `provider` is "stripe". Equivalent to `providerAccount`.'),
						stripeOrganisation: z
							.string()
							.optional()
							.describe('Present when `provider` is "stripe".'),
						reason: z.string(),
						blockCode: z.string(),
					})
					.strict(),
				z
					.object({
						provider: z
							.enum(["chatgpt", "stripe"])
							.optional()
							.describe('Present on new events only. Equivalent to "stripe" when absent.'),
						providerAccount: z
							.string()
							.optional()
							.describe("Present on new events only. Equivalent to `stripeAccount` when absent."),
						stripeAccount: z
							.string()
							.optional()
							.describe('Present when `provider` is "stripe". Equivalent to `providerAccount`.'),
						resourceId: z.string(),
						projectName: z.string(),
					})
					.strict(),
				z
					.object({
						provider: z
							.enum(["chatgpt", "stripe"])
							.optional()
							.describe('Present on new events only. Equivalent to "stripe" when absent.'),
						providerAccount: z
							.string()
							.optional()
							.describe("Present on new events only. Equivalent to `stripeAccount` when absent."),
						stripeAccount: z
							.string()
							.optional()
							.describe('Present when `provider` is "stripe". Equivalent to `providerAccount`.'),
						stripeOrganisation: z
							.string()
							.optional()
							.describe('Present when `provider` is "stripe".'),
						teamId: z.string(),
						resourceId: z.string(),
						fromPlan: z.enum(["hobby", "pro"]),
						toPlan: z.enum(["hobby", "pro"]),
					})
					.strict(),
				z
					.object({
						apiKey: z.object({
							id: z.string(),
							name: z.string(),
						}),
						budget: z
							.object({
								limitAmount: z.number().describe("Spend cap, in dollars."),
								refreshPeriod: z.enum(["daily", "monthly", "none", "weekly"]),
							})
							.nullish()
							.describe(
								"Spend budget on an AI Gateway API key, as surfaced in activity messages. Defined locally (rather than imported from `@api/pubsub-types`) because `@api/pubsub-types` already depends on `@api/events`; importing it here would create a circular dependency. Must stay structurally aligned with `APIKeyBudget` in `@api/pubsub-types/event-payloads/api-keys`.",
							),
					})
					.strict(),
				z
					.object({
						apiKey: z.object({
							id: z.string(),
							name: z.string(),
						}),
					})
					.strict(),
				z
					.object({
						apiKey: z.object({
							id: z.string(),
							name: z.string(),
						}),
						budget: z
							.object({
								limitAmount: z.number().describe("Spend cap, in dollars."),
								refreshPeriod: z.enum(["daily", "monthly", "none", "weekly"]),
							})
							.nullish()
							.describe(
								"Spend budget on an AI Gateway API key, as surfaced in activity messages. Defined locally (rather than imported from `@api/pubsub-types`) because `@api/pubsub-types` already depends on `@api/events`; importing it here would create a circular dependency. Must stay structurally aligned with `APIKeyBudget` in `@api/pubsub-types/event-payloads/api-keys`.",
							),
						change: z.enum(["disable", "enable", "remove", "set"]),
					})
					.strict(),
				z
					.object({
						credential: z.object({
							id: z.string(),
							name: z.string(),
							providerSlug: z.string(),
						}),
					})
					.strict(),
				z
					.object({
						enabled: z.union([z.literal(false), z.literal(true)]),
					})
					.strict(),
				z
					.object({
						added: z.array(z.string()),
						removed: z.array(z.string()),
					})
					.strict(),
				z
					.object({
						rule: z.object({
							id: z.string(),
							type: z.string(),
							model: z.string().optional(),
							rewriteModel: z.string().optional(),
						}),
					})
					.strict(),
				z
					.object({
						rule: z.object({
							id: z.string(),
							type: z.string(),
							model: z.string().optional(),
						}),
					})
					.strict(),
				z
					.object({
						rule: z.object({
							id: z.string(),
							type: z.string(),
							model: z.string().optional(),
						}),
						enabled: z.union([z.literal(false), z.literal(true)]).optional(),
					})
					.strict(),
				z
					.object({
						virtualModelConfig: z.object({
							id: z.string(),
							displayName: z.string().optional(),
							modelSlug: z.string(),
						}),
					})
					.strict(),
				z
					.object({
						accessGroup: z.object({
							id: z.string(),
							name: z.string(),
						}),
						teamRoles: z.array(z.string()).optional(),
						teamPermissions: z.array(z.string()).optional(),
						entitlements: z.array(z.string()).optional(),
					})
					.strict(),
				z
					.object({
						author: z.string(),
						accessGroup: z.object({
							id: z.string(),
							name: z.string(),
						}),
					})
					.strict(),
				z
					.object({
						accessGroup: z.object({
							id: z.string(),
							name: z.string(),
						}),
						project: z.object({
							id: z.string(),
							name: z.string().optional(),
						}),
						nextRole: z
							.enum(["ADMIN", "PROJECT_DEVELOPER", "PROJECT_GUEST", "PROJECT_VIEWER"])
							.nullish(),
						previousRole: z
							.enum(["ADMIN", "PROJECT_DEVELOPER", "PROJECT_GUEST", "PROJECT_VIEWER"])
							.optional(),
					})
					.strict(),
				z
					.object({
						accessGroup: z.object({
							id: z.string(),
							name: z.string(),
						}),
						name: z.string().optional(),
						previousName: z.string().optional(),
						teamRoles: z.array(z.string()).optional(),
						previousTeamRoles: z.array(z.string()).optional(),
						teamPermissions: z.array(z.string()).optional(),
						previousTeamPermissions: z.array(z.string()).optional(),
						entitlementsAdded: z.array(z.string()).optional(),
						entitlementsRemoved: z.array(z.string()).optional(),
					})
					.strict(),
				z
					.object({
						accessGroup: z.object({
							id: z.string(),
							name: z.string().optional(),
						}),
						user: z.object({
							id: z.string(),
							username: z.string().optional(),
						}),
						directoryType: z.string().optional(),
					})
					.strict(),
				z
					.object({
						price: z.number().optional(),
						currency: z.string().optional(),
					})
					.strict(),
				z
					.object({
						alias: z.string().optional(),
						deployment: z
							.object({
								id: z.string(),
								name: z.string(),
								url: z.string(),
								meta: z.object({}).catchall(z.string()),
								readyState: z.string().optional(),
								allowListedReadyStateReasonInternal: z
									.enum([
										"EARLY_IGNORE_STEP",
										"IGNORE_STEP",
										"NAMESPACE_PRUNED",
										"UNAFFECTED_PROJECT",
										"UNVERIFIED_COMMIT",
									])
									.optional()
									.describe(
										"A narrowed subset of the deployment's `readyStateReasonInternal` — only values in the public allowlist are permitted here. Callers should run their raw reason through `toAllowListedReadyStateReasonInternal` from `@api/events` before assigning. This keeps abuse / moderation / admin reasons out of the public activity log.",
									),
							})
							.nullish(),
						ruleCount: z.number().optional(),
						deploymentUrl: z.string().optional(),
						aliasId: z.string().optional(),
						deploymentId: z.string().nullish(),
						oldDeploymentId: z.string().nullish(),
						redirect: z.string().optional(),
						redirectStatusCode: z.number().nullish(),
						target: z.string().nullish(),
						system: z.union([z.literal(false), z.literal(true)]).optional(),
						aliasUpdatedAt: z.number().optional(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						aliasCount: z.number(),
						deployment: z
							.object({
								id: z.string(),
								name: z.string(),
								url: z.string(),
								meta: z.object({}).catchall(z.string()),
								readyState: z.string().optional(),
								allowListedReadyStateReasonInternal: z
									.enum([
										"EARLY_IGNORE_STEP",
										"IGNORE_STEP",
										"NAMESPACE_PRUNED",
										"UNAFFECTED_PROJECT",
										"UNVERIFIED_COMMIT",
									])
									.optional()
									.describe(
										"A narrowed subset of the deployment's `readyStateReasonInternal` — only values in the public allowlist are permitted here. Callers should run their raw reason through `toAllowListedReadyStateReasonInternal` from `@api/events` before assigning. This keeps abuse / moderation / admin reasons out of the public activity log.",
									),
							})
							.nullish(),
					})
					.strict(),
				z
					.object({
						name: z.string().optional(),
						alias: z.string(),
						oldTeam: z
							.object({
								name: z.string(),
							})
							.optional(),
						newTeam: z
							.object({
								name: z.string(),
							})
							.optional(),
					})
					.strict(),
				z
					.object({
						name: z.string().optional(),
						alias: z.string(),
						aliasId: z.string(),
						deploymentId: z.string().nullable(),
					})
					.strict(),
				z
					.object({
						alias: z.string().optional(),
						email: z.string().optional(),
						username: z.string().optional(),
					})
					.strict(),
				z
					.object({
						alias: z.string().optional(),
					})
					.strict(),
				z
					.object({
						alias: z.string().optional(),
						email: z.string().optional(),
					})
					.strict(),
				z
					.object({
						aliasId: z.string().optional(),
						alias: z.string().optional(),
						projectId: z.string().optional(),
						projectName: z.string().optional(),
					})
					.strict(),
				z
					.object({
						projectId: z.string().optional(),
						projectName: z.string(),
						alias: z.string(),
						action: z.enum(["created", "removed"]),
					})
					.strict(),
				z
					.object({
						alias: z.string(),
						deploymentUrl: z.string(),
					})
					.strict(),
				z
					.object({
						alias: z.string().optional(),
						userId: z.string().optional(),
						username: z.string().optional(),
					})
					.strict(),
				z
					.object({
						alias: z.string().optional(),
						aliasId: z.string().optional(),
						userId: z.string().optional(),
						username: z.string().optional(),
					})
					.strict(),
				z
					.object({
						appName: z.string(),
						appId: z.string().optional(),
						scopes: z.array(z.enum(["email", "offline_access", "openid", "profile"])),
						permissions: z
							.array(
								z.enum([
									"read-write:ai-gateway-api-key",
									"read-write:ai-gateway-rules",
									"read-write:alerts",
									"read-write:billing",
									"read-write:blob",
									"read-write:deployment",
									"read-write:domain",
									"read-write:domain-registrar",
									"read-write:drains",
									"read-write:edge-cache",
									"read-write:edge-config",
									"read-write:integration-configuration",
									"read-write:integration-resource",
									"read-write:kms",
									"read-write:project",
									"read-write:project-env-vars",
									"read-write:project-env-vars-non-production",
									"read-write:project-env-vars-production",
									"read-write:project-flags-non-production",
									"read-write:project-flags-production",
									"read-write:project-protection-bypass",
									"read-write:remote-cache",
									"read-write:sandbox",
									"read:access-group",
									"read:ai-gateway-rules",
									"read:alerts",
									"read:billing",
									"read:deployment",
									"read:domain",
									"read:event",
									"read:integration-configuration",
									"read:kms",
									"read:monitoring",
									"read:project",
									"read:project-env-vars-non-production",
									"read:project-env-vars-production",
									"read:sandbox",
									"read:team",
									"read:user",
									"use:ai-gateway",
								]),
							)
							.optional(),
					})
					.strict(),
				z
					.object({
						appName: z.string(),
						appId: z.string().optional(),
					})
					.strict(),
				z
					.object({
						appName: z.string(),
						appId: z.string().optional(),
						nextScopes: z.array(z.enum(["email", "offline_access", "openid", "profile"])),
						nextPermissions: z
							.array(
								z.enum([
									"read-write:ai-gateway-api-key",
									"read-write:ai-gateway-rules",
									"read-write:alerts",
									"read-write:billing",
									"read-write:blob",
									"read-write:deployment",
									"read-write:domain",
									"read-write:domain-registrar",
									"read-write:drains",
									"read-write:edge-cache",
									"read-write:edge-config",
									"read-write:integration-configuration",
									"read-write:integration-resource",
									"read-write:kms",
									"read-write:project",
									"read-write:project-env-vars",
									"read-write:project-env-vars-non-production",
									"read-write:project-env-vars-production",
									"read-write:project-flags-non-production",
									"read-write:project-flags-production",
									"read-write:project-protection-bypass",
									"read-write:remote-cache",
									"read-write:sandbox",
									"read:access-group",
									"read:ai-gateway-rules",
									"read:alerts",
									"read:billing",
									"read:deployment",
									"read:domain",
									"read:event",
									"read:integration-configuration",
									"read:kms",
									"read:monitoring",
									"read:project",
									"read:project-env-vars-non-production",
									"read:project-env-vars-production",
									"read:sandbox",
									"read:team",
									"read:user",
									"use:ai-gateway",
								]),
							)
							.optional(),
					})
					.strict(),
				z
					.object({
						appName: z.string(),
						appId: z.string().optional(),
						installationId: z.string().optional(),
						before: z
							.object({
								resources: z
									.object({
										projectIds: z
											.object({
												type: z.enum(["list"]),
												required: z.literal(true),
												items: z.object({
													type: z.enum(["string"]),
												}),
											})
											.describe("Specific project IDs or all projects on the team (`['*']`)."),
									})
									.optional(),
								permissions: z
									.array(
										z.enum([
											"read-write:ai-gateway-api-key",
											"read-write:ai-gateway-rules",
											"read-write:alerts",
											"read-write:billing",
											"read-write:blob",
											"read-write:deployment",
											"read-write:domain",
											"read-write:domain-registrar",
											"read-write:drains",
											"read-write:edge-cache",
											"read-write:edge-config",
											"read-write:integration-configuration",
											"read-write:integration-resource",
											"read-write:kms",
											"read-write:project",
											"read-write:project-env-vars",
											"read-write:project-env-vars-non-production",
											"read-write:project-env-vars-production",
											"read-write:project-flags-non-production",
											"read-write:project-flags-production",
											"read-write:project-protection-bypass",
											"read-write:remote-cache",
											"read-write:sandbox",
											"read:access-group",
											"read:ai-gateway-rules",
											"read:alerts",
											"read:billing",
											"read:deployment",
											"read:domain",
											"read:event",
											"read:integration-configuration",
											"read:kms",
											"read:monitoring",
											"read:project",
											"read:project-env-vars-non-production",
											"read:project-env-vars-production",
											"read:sandbox",
											"read:team",
											"use:ai-gateway",
										]),
									)
									.optional(),
							})
							.optional(),
						after: z
							.object({
								resources: z
									.object({
										projectIds: z
											.object({
												type: z.enum(["list"]),
												required: z.literal(true),
												items: z.object({
													type: z.enum(["string"]),
												}),
											})
											.describe("Specific project IDs or all projects on the team (`['*']`)."),
									})
									.optional(),
								permissions: z
									.array(
										z.enum([
											"read-write:ai-gateway-api-key",
											"read-write:ai-gateway-rules",
											"read-write:alerts",
											"read-write:billing",
											"read-write:blob",
											"read-write:deployment",
											"read-write:domain",
											"read-write:domain-registrar",
											"read-write:drains",
											"read-write:edge-cache",
											"read-write:edge-config",
											"read-write:integration-configuration",
											"read-write:integration-resource",
											"read-write:kms",
											"read-write:project",
											"read-write:project-env-vars",
											"read-write:project-env-vars-non-production",
											"read-write:project-env-vars-production",
											"read-write:project-flags-non-production",
											"read-write:project-flags-production",
											"read-write:project-protection-bypass",
											"read-write:remote-cache",
											"read-write:sandbox",
											"read:access-group",
											"read:ai-gateway-rules",
											"read:alerts",
											"read:billing",
											"read:deployment",
											"read:domain",
											"read:event",
											"read:integration-configuration",
											"read:kms",
											"read:monitoring",
											"read:project",
											"read:project-env-vars-non-production",
											"read:project-env-vars-production",
											"read:sandbox",
											"read:team",
											"use:ai-gateway",
										]),
									)
									.optional(),
							})
							.optional(),
					})
					.strict(),
				z
					.object({
						appName: z.string(),
						appId: z.string().optional(),
						resources: z
							.object({
								projectIds: z
									.object({
										type: z.enum(["list"]),
										required: z.literal(true),
										items: z.object({
											type: z.enum(["string"]),
										}),
									})
									.describe("Specific project IDs or all projects on the team (`['*']`)."),
							})
							.optional(),
						permissions: z
							.array(
								z.enum([
									"read-write:ai-gateway-api-key",
									"read-write:ai-gateway-rules",
									"read-write:alerts",
									"read-write:billing",
									"read-write:blob",
									"read-write:deployment",
									"read-write:domain",
									"read-write:domain-registrar",
									"read-write:drains",
									"read-write:edge-cache",
									"read-write:edge-config",
									"read-write:integration-configuration",
									"read-write:integration-resource",
									"read-write:kms",
									"read-write:project",
									"read-write:project-env-vars",
									"read-write:project-env-vars-non-production",
									"read-write:project-env-vars-production",
									"read-write:project-flags-non-production",
									"read-write:project-flags-production",
									"read-write:project-protection-bypass",
									"read-write:remote-cache",
									"read-write:sandbox",
									"read:access-group",
									"read:ai-gateway-rules",
									"read:alerts",
									"read:billing",
									"read:deployment",
									"read:domain",
									"read:event",
									"read:integration-configuration",
									"read:kms",
									"read:monitoring",
									"read:project",
									"read:project-env-vars-non-production",
									"read:project-env-vars-production",
									"read:sandbox",
									"read:team",
									"use:ai-gateway",
								]),
							)
							.optional(),
					})
					.strict(),
				z
					.object({
						appName: z.string(),
						appId: z.string().optional(),
						secretLastFourChars: z.string().optional(),
					})
					.strict(),
				z
					.object({
						appName: z
							.string()
							.describe(
								"The App's name at the moment this even was published (it may have changed since then).",
							),
						appId: z
							.string()
							.optional()
							.describe("The App's ID. Note that not all historical events have this field."),
						app: z
							.object({
								id: z.string().describe("The App's ID."),
								name: z
									.string()
									.describe(
										"The App's name at the moment this even was published (it may have changed since then).",
									),
							})
							.optional()
							.describe("Note that not all historical events have this field."),
						issuedBefore: z
							.number()
							.optional()
							.describe(
								"UNIX timestamp in seconds. Tokens issued before this timestamp will be revoked. Note that not all historical events have this field.",
							),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						prevAttackModeEnabled: z.union([z.literal(false), z.literal(true)]).optional(),
						prevAttackModeActiveUntil: z.number().nullish(),
						attackModeEnabled: z.union([z.literal(false), z.literal(true)]),
						attackModeActiveUntil: z.number().nullish(),
					})
					.strict(),
				z
					.object({
						projectId: z.string().optional(),
						projectName: z.string(),
						autoExposeSystemEnvs: z.union([z.literal(false), z.literal(true)]),
					})
					.strict(),
				z
					.object({
						avatar: z.string().optional(),
					})
					.strict(),
				z
					.object({
						invoiceId: z.string(),
						amount: z.number(),
						refundReason: z.string(),
						lineItemCount: z.number(),
					})
					.strict(),
				z
					.object({
						invoiceId: z.string(),
						newInvoiceId: z.string(),
						settlementMethod: z.enum([
							"credited-paid",
							"credited-payment-pending",
							"refunded-paid",
							"refunded-payment-pending",
						]),
						amount: z.number(),
					})
					.strict(),
				z
					.object({
						paymentMethodId: z.string(),
						brand: z.string().optional(),
						last4: z.string().optional(),
					})
					.strict(),
				z
					.object({
						subscriptionId: z.string().optional(),
						planSlug: z.string(),
					})
					.strict(),
				z
					.object({
						subscriptionId: z.string().optional(),
						action: z.enum(["cancel_plan"]),
						data: z.object({
							planSlug: z.enum(["v0_business", "v0_teams"]),
							reason: z.enum(["non-payment"]).optional(),
						}),
					})
					.strict(),
				z
					.object({
						subscriptionId: z.string().optional(),
						action: z.enum(["resume_plan"]),
						data: z.object({
							planSlug: z.enum(["v0_business", "v0_teams"]),
						}),
					})
					.strict(),
				z
					.object({
						subscriptionId: z.string().optional(),
						action: z.enum(["mutate"]),
						data: z.object({}).catchall(z.unknown()),
					})
					.strict(),
				z
					.object({
						subscriptionId: z.string().optional(),
						productAliases: z.array(z.string()),
					})
					.strict(),
				z
					.object({
						project: z.object({
							id: z.string(),
							name: z.string(),
						}),
						bulkRedirectsLimit: z.number(),
						prevBulkRedirectsLimit: z.number(),
					})
					.strict(),
				z
					.object({
						project: z.object({
							id: z.string(),
							name: z.string(),
						}),
						versionId: z.string(),
					})
					.strict(),
				z
					.object({
						cn: z.string().optional(),
						cns: z.array(z.string()).optional(),
						custom: z.union([z.literal(false), z.literal(true)]),
						id: z.string().optional(),
					})
					.strict(),
				z
					.object({
						id: z.string(),
						cns: z.array(z.string()),
						custom: z.union([z.literal(false), z.literal(true)]),
					})
					.strict(),
				z
					.object({
						cn: z.string().optional(),
						cns: z.array(z.string()).optional(),
						id: z.string().optional(),
					})
					.strict(),
				z
					.object({
						id: z.string(),
						oldTeam: z
							.object({
								name: z.string(),
							})
							.optional(),
						newTeam: z
							.object({
								name: z.string(),
							})
							.optional(),
					})
					.strict(),
				z
					.object({
						src: z.string(),
						dst: z.string(),
					})
					.strict(),
				z
					.object({
						id: z.string(),
						cn: z.string().optional(),
						cns: z.array(z.string()).optional(),
					})
					.strict(),
				z
					.object({
						cn: z.string().optional(),
						cns: z.array(z.string()).optional(),
					})
					.strict(),
				z
					.object({
						configuration: z.object({
							id: z.string(),
							name: z.string(),
						}),
					})
					.strict(),
				z
					.object({
						team: z.object({
							id: z.string(),
							name: z.string(),
						}),
						configuration: z.object({
							id: z.string(),
							name: z.string().optional(),
						}),
						project: z.object({
							id: z.string(),
							name: z.string().optional(),
						}),
						buildsEnabled: z.union([z.literal(false), z.literal(true)]).optional(),
					})
					.strict(),
				z
					.object({
						team: z.object({
							id: z.string(),
							name: z.string(),
						}),
						configuration: z.object({
							id: z.string(),
							name: z.string().optional(),
						}),
						project: z.object({
							id: z.string(),
							name: z.string().optional(),
						}),
						buildsEnabled: z.union([z.literal(false), z.literal(true)]).optional(),
						passive: z.union([z.literal(false), z.literal(true)]).optional(),
					})
					.strict(),
				z
					.object({
						team: z.object({
							id: z.string(),
							name: z.string(),
						}),
						configuration: z.object({
							id: z.string(),
							name: z.string().optional(),
						}),
						project: z.object({
							id: z.string(),
							name: z.string().optional(),
						}),
					})
					.strict(),
				z
					.object({
						team: z.object({
							id: z.string(),
							name: z.string(),
						}),
						configuration: z.object({
							id: z.string(),
							name: z.string().optional(),
						}),
						newName: z.string(),
					})
					.strict(),
				z
					.object({
						githubLogin: z.string(),
						host: z.string().optional(),
					})
					.strict(),
				z
					.object({
						githubLogin: z.string(),
					})
					.strict(),
				z
					.object({
						githubLogin: z.string(),
						host: z.string(),
					})
					.strict(),
				z
					.object({
						gitlabLogin: z.string(),
						gitlabEmail: z.string(),
						gitlabName: z.string().optional(),
						zeitAccount: z.string().optional(),
						zeitAccountType: z.string().optional(),
					})
					.strict(),
				z
					.object({
						gitlabLogin: z.string(),
						gitlabUserId: z.number(),
					})
					.strict(),
				z
					.object({
						bitbucketEmail: z.string(),
						bitbucketLogin: z.string(),
						bitbucketName: z.string().optional(),
					})
					.strict(),
				z
					.object({
						bitbucketLogin: z.string(),
						bitbucketAccountId: z.string(),
					})
					.strict(),
				z
					.object({
						clientId: z.string().optional(),
						clientUid: z.string().optional(),
						clientName: z.string().optional(),
						projectId: z.string().optional(),
						installationId: z.string().optional(),
						subjectType: z.enum(["app", "user"]).optional(),
						fields: z.array(z.string()).optional(),
						triggerDestinationCount: z.number().optional(),
						tokenCount: z.number().optional(),
						acceptedTokenCount: z.number().optional(),
						importedTokenCount: z.number().optional(),
						tokensDeleted: z.number().optional(),
					})
					.strict(),
				z
					.object({
						reason: z.string().optional(),
						suffix: z.string(),
					})
					.strict(),
				z
					.object({
						status: z.string(),
						suffix: z.string(),
					})
					.strict(),
				z
					.object({
						suffix: z.string(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						hookName: z.string(),
						ref: z.string(),
					})
					.strict(),
				z
					.object({
						project: z.object({
							name: z.string(),
						}),
						job: z.object({
							deployHook: z.object({
								createdAt: z.number(),
								id: z.string(),
								name: z.string(),
								ref: z.string(),
							}),
							state: z.string(),
						}),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						checkId: z.string(),
						checkName: z.string(),
					})
					.strict(),
				z
					.object({
						name: z.string().optional(),
						alias: z.array(z.string()).optional(),
						target: z.string().nullish(),
						deployment: z
							.object({
								id: z.string(),
								name: z.string(),
								url: z.string(),
								meta: z.object({}).catchall(z.string()),
								readyState: z.string().optional(),
								allowListedReadyStateReasonInternal: z
									.enum([
										"EARLY_IGNORE_STEP",
										"IGNORE_STEP",
										"NAMESPACE_PRUNED",
										"UNAFFECTED_PROJECT",
										"UNVERIFIED_COMMIT",
									])
									.optional()
									.describe(
										"A narrowed subset of the deployment's `readyStateReasonInternal` — only values in the public allowlist are permitted here. Callers should run their raw reason through `toAllowListedReadyStateReasonInternal` from `@api/events` before assigning. This keeps abuse / moderation / admin reasons out of the public activity log.",
									),
							})
							.nullish(),
						url: z.string(),
						forced: z.union([z.literal(false), z.literal(true)]).optional(),
						deploymentId: z.string().optional(),
						plan: z.string().optional(),
						project: z.string().optional(),
						projectId: z.string().optional(),
						regions: z.array(z.string()).optional(),
						type: z.string().optional(),
					})
					.strict(),
				z
					.object({
						job: z.union([
							z
								.object({
									type: z.enum(["bitbucket-push"]),
									authorized: z.union([z.literal(false), z.literal(true)]).optional(),
									authorizedBy: z.string().optional(),
									jobProjectIds: z
										.array(z.string())
										.optional()
										.describe(
											"Since December 2022 All project ids associated to this job. Think monorepo. This job will be for one of these project.",
										),
									jobPairs: z
										.array(
											z
												.array(z.union([z.string(), z.string()]))
												.min(2)
												.max(2),
										)
										.optional()
										.describe(
											"Since December 2022 Pairs of projects and owner ids to build for this build request.",
										),
									skippedJobPairs: z
										.array(
											z
												.array(z.union([z.string(), z.string()]))
												.min(2)
												.max(2),
										)
										.optional()
										.describe(
											"Since June 2024 Pairs of projects and owner ids to immediately finish (without building) because we want to create them in a skipped state.",
										),
									gitHashtagVercel: z
										.array(z.string())
										.optional()
										.describe(
											"Since February 2022 All the hashtag-vercel tags found in the commit message triggering the deploy. For example, #VERCEL_DO_SOMETHING",
										),
									connectedProjectCount: z
										.number()
										.optional()
										.describe(
											"Since April 2023 Cached count of how many projects are connected to the repo. Saves a few Cosmos queries down the road in the main flow.",
										),
									prIdOrZero: z
										.number()
										.optional()
										.describe(
											"Since April 2023 If set then it is a cached result of asking the remote for the PR ID the commit that triggered this Job. Or zero if it was not a PR. This prevents a few git round trips by the git updater.",
										),
									gitComments: z
										.object({
											onPullRequest: z.union([z.literal(false), z.literal(true)]),
											onCommit: z.union([z.literal(false), z.literal(true)]),
										})
										.optional()
										.describe(
											"Since June 2023 Determines if comments should be posted to the git host. Replaces `github.silent` in the vercel.json.",
										),
									isManualGitDeploy: z
										.union([z.literal(false), z.literal(true)])
										.optional()
										.describe(
											"Since 28 Feb 2024 If set to true, identifies that the git job was created for a manual git deployment",
										),
									commitVerification: z
										.enum(["unknown", "unverified", "verified"])
										.optional()
										.describe(
											"Since 6 Nov 2025 The verification status of the commit. - 'verified' if the commit is verified - 'unverified' if the commit is not verified - 'unknown' if the commit verification status is unknown or not supported",
										),
									nsnbSideEffect: z
										.object({
											action: z.enum(["auto-approved-member", "auto-approved-pending-invite"]),
											gitUserLogin: z.string(),
										})
										.optional()
										.describe(
											"Since March 2026 Records a successful NSNB auto-add result so later GitHub PR comments can deterministically explain why this SHA was allowed to deploy.",
										),
									createdAt: z.number().optional(),
									deploymentId: z.string().optional(),
									deployHook: z
										.object({
											createdAt: z.number(),
											id: z.string(),
											name: z.string(),
											ref: z.string(),
										})
										.optional(),
									eventful: z.union([z.literal(false), z.literal(true)]).optional(),
									forceNew: z.union([z.literal(false), z.literal(true)]).optional(),
									headInfo: z.object({
										owner: z.string(),
										ref: z.string(),
										repoUuid: z.string(),
										sha: z.string(),
										slug: z.string(),
									}),
									linkedProjectId: z.string().optional(),
									name: z.string(),
									owner: z.string(),
									prId: z.number().optional(),
									projectId: z.string().optional(),
									customEnvId: z.string().nullish(),
									ref: z.string(),
									repoPushedAt: z.number().nullish(),
									repoUuid: z.string(),
									sha: z.string(),
									silent: z.union([z.literal(false), z.literal(true)]).optional(),
									slug: z.string(),
									target: z.string().nullish(),
									url: z.string().optional(),
									withCache: z.union([z.literal(false), z.literal(true)]).optional(),
									workspaceUuid: z.string(),
									provider: z.enum(["bitbucket"]),
								})
								.strict(),
							z
								.object({
									createdAt: z.number().optional(),
									eventful: z.union([z.literal(false), z.literal(true)]).optional(),
									headInfo: z.object({
										owner: z.string(),
										ref: z.string(),
										repoUuid: z.string(),
										sha: z.string(),
										slug: z.string(),
									}),
									linkedProjectId: z.string().optional(),
									name: z.string(),
									owner: z.string(),
									prId: z.number(),
									projectId: z.string().optional(),
									customEnvId: z.string().nullish(),
									ref: z.string(),
									repoUuid: z.string(),
									sha: z.string(),
									slug: z.string(),
									type: z.enum(["bitbucket-now-comment"]),
									workspaceUuid: z.string(),
									gitComments: z
										.object({
											onPullRequest: z.union([z.literal(false), z.literal(true)]),
											onCommit: z.union([z.literal(false), z.literal(true)]),
										})
										.optional(),
									provider: z.enum(["bitbucket"]),
								})
								.strict(),
							z
								.object({
									prId: z.number(),
									type: z.enum(["pr"]),
									authorized: z.union([z.literal(false), z.literal(true)]).optional(),
									authorizedBy: z.string().optional(),
									jobProjectIds: z
										.array(z.string())
										.optional()
										.describe(
											"Since December 2022 All project ids associated to this job. Think monorepo. This job will be for one of these project.",
										),
									jobPairs: z
										.array(
											z
												.array(z.union([z.string(), z.string()]))
												.min(2)
												.max(2),
										)
										.optional()
										.describe(
											"Since December 2022 Pairs of projects and owner ids to build for this build request.",
										),
									skippedJobPairs: z
										.array(
											z
												.array(z.union([z.string(), z.string()]))
												.min(2)
												.max(2),
										)
										.optional()
										.describe(
											"Since June 2024 Pairs of projects and owner ids to immediately finish (without building) because we want to create them in a skipped state.",
										),
									gitHashtagVercel: z
										.array(z.string())
										.optional()
										.describe(
											"Since February 2022 All the hashtag-vercel tags found in the commit message triggering the deploy. For example, #VERCEL_DO_SOMETHING",
										),
									connectedProjectCount: z
										.number()
										.optional()
										.describe(
											"Since April 2023 Cached count of how many projects are connected to the repo. Saves a few Cosmos queries down the road in the main flow.",
										),
									prIdOrZero: z
										.number()
										.optional()
										.describe(
											"Since April 2023 If set then it is a cached result of asking the remote for the PR ID the commit that triggered this Job. Or zero if it was not a PR. This prevents a few git round trips by the git updater.",
										),
									gitComments: z
										.object({
											onPullRequest: z.union([z.literal(false), z.literal(true)]),
											onCommit: z.union([z.literal(false), z.literal(true)]),
										})
										.optional()
										.describe(
											"Since June 2023 Determines if comments should be posted to the git host. Replaces `github.silent` in the vercel.json.",
										),
									isManualGitDeploy: z
										.union([z.literal(false), z.literal(true)])
										.optional()
										.describe(
											"Since 28 Feb 2024 If set to true, identifies that the git job was created for a manual git deployment",
										),
									commitVerification: z
										.enum(["unknown", "unverified", "verified"])
										.optional()
										.describe(
											"Since 6 Nov 2025 The verification status of the commit. - 'verified' if the commit is verified - 'unverified' if the commit is not verified - 'unknown' if the commit verification status is unknown or not supported",
										),
									nsnbSideEffect: z
										.object({
											action: z.enum(["auto-approved-member", "auto-approved-pending-invite"]),
											gitUserLogin: z.string(),
										})
										.optional()
										.describe(
											"Since March 2026 Records a successful NSNB auto-add result so later GitHub PR comments can deterministically explain why this SHA was allowed to deploy.",
										),
									committerGitUserId: z
										.number()
										.optional()
										.describe(
											"Remote account id of the committer details (github id etc, not vercel). Note that the committer name/email are user input verbatim and not verified. Github does appear to resolve the given email to the username so we can trust that. If the username matches that of the sender, which is verified info, then we can use the account id and account type. See api-incoming, where we determine and set this property Note that even with that, the account may still have been spoofed.",
										),
									committerGitUserType: z
										.string()
										.optional()
										.describe(
											"Remote account type of the committer details (github type etc, not vercel). Note that the committer name/email are user input verbatim and not verified. Github does appear to resolve the given email to the username so we can trust that. If the username matches that of the sender, which is verified info, then we can use the account id and account type. See api-incoming, where we determine and set this property Note that even with that, the account may still have been spoofed.",
										),
									createdAt: z.number().optional(),
									forceNew: z.union([z.literal(false), z.literal(true)]).optional(),
									deploymentId: z.string().optional(),
									deployHook: z
										.object({
											createdAt: z.number(),
											id: z.string(),
											name: z.string(),
											ref: z.string(),
										})
										.optional(),
									beforeSha: z.string().optional(),
									defaultBranch: z.string().optional(),
									eventful: z.union([z.literal(false), z.literal(true)]).optional(),
									githubDeploymentId: z.string().optional(),
									headInfo: z
										.object({
											org: z.string(),
											ref: z.string(),
											repo: z.string(),
											repoId: z.number(),
											sha: z.string(),
										})
										.describe("Information about the head commit/branch for a GitHub repository"),
									installationId: z.number(),
									isPrivate: z.union([z.literal(false), z.literal(true)]),
									linkedProjectId: z.string().optional(),
									org: z.string(),
									projectId: z.string().optional(),
									customEnvId: z.string().nullish(),
									repo: z.string(),
									repoId: z.number(),
									target: z.string().nullish(),
									url: z.string().optional(),
									withCache: z.union([z.literal(false), z.literal(true)]).optional(),
									provider: z.enum(["github", "github-custom-host", "github-limited"]),
									customHost: z.string().optional(),
								})
								.strict(),
							z
								.object({
									repoPushedAt: z.number().nullable(),
									commitInfo: z
										.object({
											total: z.number(),
											earliestSha: z.string().optional(),
										})
										.optional(),
									forced: z.union([z.literal(false), z.literal(true)]).optional(),
									type: z.enum(["push"]),
									authorized: z.union([z.literal(false), z.literal(true)]).optional(),
									authorizedBy: z.string().optional(),
									jobProjectIds: z
										.array(z.string())
										.optional()
										.describe(
											"Since December 2022 All project ids associated to this job. Think monorepo. This job will be for one of these project.",
										),
									jobPairs: z
										.array(
											z
												.array(z.union([z.string(), z.string()]))
												.min(2)
												.max(2),
										)
										.optional()
										.describe(
											"Since December 2022 Pairs of projects and owner ids to build for this build request.",
										),
									skippedJobPairs: z
										.array(
											z
												.array(z.union([z.string(), z.string()]))
												.min(2)
												.max(2),
										)
										.optional()
										.describe(
											"Since June 2024 Pairs of projects and owner ids to immediately finish (without building) because we want to create them in a skipped state.",
										),
									gitHashtagVercel: z
										.array(z.string())
										.optional()
										.describe(
											"Since February 2022 All the hashtag-vercel tags found in the commit message triggering the deploy. For example, #VERCEL_DO_SOMETHING",
										),
									connectedProjectCount: z
										.number()
										.optional()
										.describe(
											"Since April 2023 Cached count of how many projects are connected to the repo. Saves a few Cosmos queries down the road in the main flow.",
										),
									prIdOrZero: z
										.number()
										.optional()
										.describe(
											"Since April 2023 If set then it is a cached result of asking the remote for the PR ID the commit that triggered this Job. Or zero if it was not a PR. This prevents a few git round trips by the git updater.",
										),
									gitComments: z
										.object({
											onPullRequest: z.union([z.literal(false), z.literal(true)]),
											onCommit: z.union([z.literal(false), z.literal(true)]),
										})
										.optional()
										.describe(
											"Since June 2023 Determines if comments should be posted to the git host. Replaces `github.silent` in the vercel.json.",
										),
									isManualGitDeploy: z
										.union([z.literal(false), z.literal(true)])
										.optional()
										.describe(
											"Since 28 Feb 2024 If set to true, identifies that the git job was created for a manual git deployment",
										),
									commitVerification: z
										.enum(["unknown", "unverified", "verified"])
										.optional()
										.describe(
											"Since 6 Nov 2025 The verification status of the commit. - 'verified' if the commit is verified - 'unverified' if the commit is not verified - 'unknown' if the commit verification status is unknown or not supported",
										),
									nsnbSideEffect: z
										.object({
											action: z.enum(["auto-approved-member", "auto-approved-pending-invite"]),
											gitUserLogin: z.string(),
										})
										.optional()
										.describe(
											"Since March 2026 Records a successful NSNB auto-add result so later GitHub PR comments can deterministically explain why this SHA was allowed to deploy.",
										),
									committerGitUserId: z
										.number()
										.optional()
										.describe(
											"Remote account id of the committer details (github id etc, not vercel). Note that the committer name/email are user input verbatim and not verified. Github does appear to resolve the given email to the username so we can trust that. If the username matches that of the sender, which is verified info, then we can use the account id and account type. See api-incoming, where we determine and set this property Note that even with that, the account may still have been spoofed.",
										),
									committerGitUserType: z
										.string()
										.optional()
										.describe(
											"Remote account type of the committer details (github type etc, not vercel). Note that the committer name/email are user input verbatim and not verified. Github does appear to resolve the given email to the username so we can trust that. If the username matches that of the sender, which is verified info, then we can use the account id and account type. See api-incoming, where we determine and set this property Note that even with that, the account may still have been spoofed.",
										),
									createdAt: z.number().optional(),
									forceNew: z.union([z.literal(false), z.literal(true)]).optional(),
									deploymentId: z.string().optional(),
									deployHook: z
										.object({
											createdAt: z.number(),
											id: z.string(),
											name: z.string(),
											ref: z.string(),
										})
										.optional(),
									beforeSha: z.string().optional(),
									defaultBranch: z.string().optional(),
									eventful: z.union([z.literal(false), z.literal(true)]).optional(),
									githubDeploymentId: z.string().optional(),
									headInfo: z
										.object({
											org: z.string(),
											ref: z.string(),
											repo: z.string(),
											repoId: z.number(),
											sha: z.string(),
										})
										.describe("Information about the head commit/branch for a GitHub repository"),
									installationId: z.number(),
									isPrivate: z.union([z.literal(false), z.literal(true)]),
									linkedProjectId: z.string().optional(),
									org: z.string(),
									prId: z.number().nullable(),
									projectId: z.string().optional(),
									customEnvId: z.string().nullish(),
									repo: z.string(),
									repoId: z.number(),
									target: z.string().nullish(),
									url: z.string().optional(),
									withCache: z.union([z.literal(false), z.literal(true)]).optional(),
									provider: z.enum(["github", "github-custom-host", "github-limited"]),
									customHost: z.string().optional(),
								})
								.strict(),
							z
								.object({
									createdAt: z.number().optional(),
									eventful: z.union([z.literal(false), z.literal(true)]).optional(),
									headInfo: z
										.object({
											org: z.string(),
											ref: z.string(),
											repo: z.string(),
											repoId: z.number(),
											sha: z.string(),
										})
										.describe("Information about the head commit/branch for a GitHub repository"),
									beforeSha: z.string().optional(),
									installationId: z.number(),
									isPrivate: z.union([z.literal(false), z.literal(true)]),
									linkedProjectId: z.string().optional(),
									org: z.string(),
									prId: z.number(),
									projectId: z.unknown().nullable(),
									customEnvId: z.unknown().nullish(),
									repo: z.string(),
									repoId: z.number(),
									type: z.enum(["now-comment"]),
									gitComments: z
										.object({
											onPullRequest: z.union([z.literal(false), z.literal(true)]),
											onCommit: z.union([z.literal(false), z.literal(true)]),
										})
										.optional(),
									provider: z.enum(["github", "github-custom-host", "github-limited"]),
									customHost: z.string().optional(),
								})
								.strict(),
							z
								.object({
									type: z.enum(["gitlab-push"]),
									authorized: z.union([z.literal(false), z.literal(true)]).optional(),
									authorizedBy: z.string().optional(),
									jobProjectIds: z
										.array(z.string())
										.optional()
										.describe(
											"Since December 2022 All project ids associated to this job. Think monorepo. This job will be for one of these project.",
										),
									jobPairs: z
										.array(
											z
												.array(z.union([z.string(), z.string()]))
												.min(2)
												.max(2),
										)
										.optional()
										.describe(
											"Since December 2022 Pairs of projects and owner ids to build for this build request.",
										),
									skippedJobPairs: z
										.array(
											z
												.array(z.union([z.string(), z.string()]))
												.min(2)
												.max(2),
										)
										.optional()
										.describe(
											"Since June 2024 Pairs of projects and owner ids to immediately finish (without building) because we want to create them in a skipped state.",
										),
									gitHashtagVercel: z
										.array(z.string())
										.optional()
										.describe(
											"Since February 2022 All the hashtag-vercel tags found in the commit message triggering the deploy. For example, #VERCEL_DO_SOMETHING",
										),
									connectedProjectCount: z
										.number()
										.optional()
										.describe(
											"Since April 2023 Cached count of how many projects are connected to the repo. Saves a few Cosmos queries down the road in the main flow.",
										),
									prIdOrZero: z
										.number()
										.optional()
										.describe(
											"Since April 2023 If set then it is a cached result of asking the remote for the PR ID the commit that triggered this Job. Or zero if it was not a PR. This prevents a few git round trips by the git updater.",
										),
									gitComments: z
										.object({
											onPullRequest: z.union([z.literal(false), z.literal(true)]),
											onCommit: z.union([z.literal(false), z.literal(true)]),
										})
										.optional()
										.describe(
											"Since June 2023 Determines if comments should be posted to the git host. Replaces `github.silent` in the vercel.json.",
										),
									isManualGitDeploy: z
										.union([z.literal(false), z.literal(true)])
										.optional()
										.describe(
											"Since 28 Feb 2024 If set to true, identifies that the git job was created for a manual git deployment",
										),
									commitVerification: z
										.enum(["unknown", "unverified", "verified"])
										.optional()
										.describe(
											"Since 6 Nov 2025 The verification status of the commit. - 'verified' if the commit is verified - 'unverified' if the commit is not verified - 'unknown' if the commit verification status is unknown or not supported",
										),
									nsnbSideEffect: z
										.object({
											action: z.enum(["auto-approved-member", "auto-approved-pending-invite"]),
											gitUserLogin: z.string(),
										})
										.optional()
										.describe(
											"Since March 2026 Records a successful NSNB auto-add result so later GitHub PR comments can deterministically explain why this SHA was allowed to deploy.",
										),
									commit: z
										.object({
											id: z.string(),
											authorAvatar: z.string().nullish(),
											authorEmail: z.string().nullish(),
											authorId: z.number().nullish(),
											authorLogin: z.string().nullish(),
											authorName: z.string().nullish(),
										})
										.optional(),
									createdAt: z.number().optional(),
									deployHook: z
										.object({
											createdAt: z.number(),
											id: z.string(),
											name: z.string(),
											ref: z.string(),
										})
										.optional(),
									deploymentId: z.string().optional(),
									eventful: z.union([z.literal(false), z.literal(true)]).optional(),
									forceNew: z.union([z.literal(false), z.literal(true)]).optional(),
									headInfo: z
										.object({
											project: z.object({
												defaultBranch: z.string().nullish(),
												id: z.string(),
												name: z.string().nullish(),
												namespace: z.string().nullish(),
												path: z.string().nullish(),
												url: z.string().nullish(),
											}),
											ref: z.string(),
											sha: z.string(),
										})
										.describe("GitLab"),
									linkedProjectId: z.string().optional(),
									prId: z.number().optional(),
									project: z.object({
										defaultBranch: z.string().nullish(),
										id: z.string(),
										name: z.string().nullish(),
										namespace: z.string().nullish(),
										path: z.string().nullish(),
										url: z.string().nullish(),
									}),
									projectId: z.string().optional(),
									customEnvId: z.string().nullish(),
									ref: z.string(),
									repoPushedAt: z.number().nullish(),
									sha: z.string(),
									silent: z.union([z.literal(false), z.literal(true)]).optional(),
									target: z.string().nullish(),
									url: z.string().optional(),
									withCache: z.union([z.literal(false), z.literal(true)]).optional(),
									provider: z.enum(["gitlab"]),
								})
								.strict(),
							z
								.object({
									createdAt: z.number().optional(),
									eventful: z.union([z.literal(false), z.literal(true)]).optional(),
									headInfo: z
										.object({
											project: z.object({
												defaultBranch: z.string().nullish(),
												id: z.string(),
												name: z.string().nullish(),
												namespace: z.string().nullish(),
												path: z.string().nullish(),
												url: z.string().nullish(),
											}),
											ref: z.string(),
											sha: z.string(),
										})
										.describe("GitLab"),
									linkedProjectId: z.string().optional(),
									prId: z.number(),
									project: z.object({
										defaultBranch: z.string().nullish(),
										id: z.string(),
										name: z.string().nullish(),
										namespace: z.string().nullish(),
										path: z.string().nullish(),
										url: z.string().nullish(),
									}),
									projectId: z.string().optional(),
									customEnvId: z.string().nullish(),
									ref: z.string(),
									sha: z.string(),
									type: z.enum(["gitlab-now-comment"]),
									gitComments: z
										.object({
											onPullRequest: z.union([z.literal(false), z.literal(true)]),
											onCommit: z.union([z.literal(false), z.literal(true)]),
										})
										.optional(),
									provider: z.enum(["gitlab"]),
								})
								.strict(),
							z
								.object({
									type: z.enum(["vercel-push"]),
									ref: z.string(),
									repo: z.string(),
									sha: z.string(),
									repoPushedAt: z.number().nullish(),
									deployHook: z
										.object({
											createdAt: z.number(),
											id: z.string(),
											name: z.string(),
											ref: z.string(),
										})
										.optional(),
									url: z.string().optional(),
									target: z.string().nullish(),
									deploymentId: z.string().optional(),
									linkedProjectId: z.string().optional(),
									projectId: z.string().optional(),
									authorized: z.union([z.literal(false), z.literal(true)]).optional(),
									authorizedBy: z.string().optional(),
									jobProjectIds: z
										.array(z.string())
										.optional()
										.describe(
											"Since December 2022 All project ids associated to this job. Think monorepo. This job will be for one of these project.",
										),
									jobPairs: z
										.array(
											z
												.array(z.union([z.string(), z.string()]))
												.min(2)
												.max(2),
										)
										.optional()
										.describe(
											"Since December 2022 Pairs of projects and owner ids to build for this build request.",
										),
									skippedJobPairs: z
										.array(
											z
												.array(z.union([z.string(), z.string()]))
												.min(2)
												.max(2),
										)
										.optional()
										.describe(
											"Since June 2024 Pairs of projects and owner ids to immediately finish (without building) because we want to create them in a skipped state.",
										),
									gitHashtagVercel: z
										.array(z.string())
										.optional()
										.describe(
											"Since February 2022 All the hashtag-vercel tags found in the commit message triggering the deploy. For example, #VERCEL_DO_SOMETHING",
										),
									connectedProjectCount: z
										.number()
										.optional()
										.describe(
											"Since April 2023 Cached count of how many projects are connected to the repo. Saves a few Cosmos queries down the road in the main flow.",
										),
									prIdOrZero: z
										.number()
										.optional()
										.describe(
											"Since April 2023 If set then it is a cached result of asking the remote for the PR ID the commit that triggered this Job. Or zero if it was not a PR. This prevents a few git round trips by the git updater.",
										),
									gitComments: z
										.object({
											onPullRequest: z.union([z.literal(false), z.literal(true)]),
											onCommit: z.union([z.literal(false), z.literal(true)]),
										})
										.optional()
										.describe(
											"Since June 2023 Determines if comments should be posted to the git host. Replaces `github.silent` in the vercel.json.",
										),
									isManualGitDeploy: z
										.union([z.literal(false), z.literal(true)])
										.optional()
										.describe(
											"Since 28 Feb 2024 If set to true, identifies that the git job was created for a manual git deployment",
										),
									commitVerification: z
										.enum(["unknown", "unverified", "verified"])
										.optional()
										.describe(
											"Since 6 Nov 2025 The verification status of the commit. - 'verified' if the commit is verified - 'unverified' if the commit is not verified - 'unknown' if the commit verification status is unknown or not supported",
										),
									nsnbSideEffect: z
										.object({
											action: z.enum(["auto-approved-member", "auto-approved-pending-invite"]),
											gitUserLogin: z.string(),
										})
										.optional()
										.describe(
											"Since March 2026 Records a successful NSNB auto-add result so later GitHub PR comments can deterministically explain why this SHA was allowed to deploy.",
										),
									headInfo: z
										.object({
											org: z.string(),
											ref: z.string(),
											repo: z.string(),
											sha: z.string(),
										})
										.describe("Vercel"),
									org: z.string(),
									provider: z.enum(["vercel"]),
									customEnvId: z.string().nullish(),
									prId: z.number().nullish(),
								})
								.strict(),
						]),
					})
					.strict(),
				z
					.object({
						url: z.string(),
						oldTeam: z
							.object({
								name: z.string(),
							})
							.optional(),
						newTeam: z
							.object({
								name: z.string(),
							})
							.optional(),
					})
					.strict(),
				z
					.object({
						sha: z.string(),
						gitUserPlatform: z.string(),
						projectId: z.string().optional(),
						projectName: z.string(),
						gitCommitterName: z.string(),
						source: z.string(),
					})
					.strict(),
				z
					.object({
						deployment: z.object({
							id: z.string(),
							name: z.string(),
							meta: z.object({}).catchall(z.string()),
							url: z.string(),
						}),
						deploymentId: z.string(),
						url: z.string(),
					})
					.strict(),
				z
					.object({
						projectId: z.string().optional(),
						projectName: z.string(),
						deploymentId: z
							.string()
							.optional()
							.describe(
								"The blocked deployment's id (e.g. `dpl_…`). When present, the message links it to the deployment details (inspector) page. Optional so events emitted before this field was added still render.",
							),
						source: z
							.string()
							.describe("Classified deploy source, e.g. 'cli', 'git', 'integration'."),
						ruleName: z
							.enum(["deploymentSources", "gitSources"])
							.describe("Which rule blocked the deploy."),
						ruleProvenance: z
							.enum(["default", "project", "team"])
							.describe("Team-level or project-level rule."),
					})
					.strict(),
				z
					.object({
						deploymentId: z.string(),
						deploymentUrl: z.string().nullable(),
						deploymentName: z.string().nullable(),
						projectId: z.string(),
						projectName: z.string(),
					})
					.strict(),
				z
					.object({
						integrationId: z.string(),
						configurationId: z.string(),
						integrationSlug: z.string(),
						integrationName: z.string(),
						ownerId: z.string(),
						projectIds: z.array(z.string()).optional(),
					})
					.strict(),
				z
					.object({
						id: z.string(),
						value: z.string(),
						name: z.string(),
						domain: z.string(),
						type: z.string(),
						mxPriority: z.number().optional(),
					})
					.strict(),
				z
					.object({
						action: z.enum(["add", "delete", "update"]),
						initiator: z.enum(["system", "user"]),
						id: z.string(),
						domain: z.string(),
						name: z.string(),
						type: z.string(),
						value: z.string(),
						mxPriority: z.number().optional(),
						previousValue: z.string().optional(),
						source: z.string().optional(),
					})
					.strict(),
				z
					.object({
						id: z.string(),
						value: z.string(),
						name: z.string(),
						domain: z.string(),
						type: z.string(),
					})
					.strict(),
				z
					.object({
						name: z.string(),
					})
					.strict(),
				z
					.object({
						name: z.string(),
						price: z.number(),
						currency: z.string().optional(),
					})
					.strict(),
				z
					.object({
						name: z.string(),
						cdnEnabled: z.union([z.literal(false), z.literal(true)]),
					})
					.strict(),
				z
					.object({
						name: z.string(),
						oldTeam: z
							.object({
								name: z.string(),
							})
							.optional(),
						newTeam: z
							.object({
								name: z.string(),
							})
							.optional(),
					})
					.strict(),
				z
					.object({
						name: z.string(),
						userId: z.string(),
						teamId: z.string(),
						ownerName: z.string(),
					})
					.strict(),
				z
					.object({
						domainId: z.string(),
						name: z.string(),
					})
					.strict(),
				z
					.object({
						previousServiceType: z.string(),
						serviceType: z.string(),
						id: z.string(),
						name: z.string(),
						nameservers: z.array(z.string()),
					})
					.strict(),
				z
					.object({
						domain: z.string(),
						customNameservers: z.array(z.string()).nullable(),
						prevCustomNameservers: z.array(z.string()).nullable(),
					})
					.strict(),
				z
					.object({
						domain: z.string(),
					})
					.strict(),
				z
					.object({
						domain: z.string(),
						zone: z.union([z.literal(false), z.literal(true)]),
					})
					.strict(),
				z
					.object({
						name: z.string(),
						fromId: z.string().nullable(),
						fromName: z.string().nullable(),
					})
					.strict(),
				z
					.object({
						name: z.string(),
						destinationId: z.string().nullable(),
						destinationName: z.string().nullable(),
					})
					.strict(),
				z
					.object({
						name: z.string(),
						destinationId: z.string(),
						destinationName: z.string(),
					})
					.strict(),
				z
					.object({
						renew: z.union([z.literal(false), z.literal(true)]).optional(),
						domain: z.string(),
					})
					.strict(),
				z
					.object({
						name: z.string(),
						price: z.number().optional(),
						currency: z.string().optional(),
					})
					.strict(),
				z
					.object({
						drainUrl: z.string().nullable(),
						drainName: z.string().nullable(),
						integrationName: z.string().optional(),
					})
					.strict(),
				z
					.object({
						drainUrl: z.string().nullable(),
						integrationName: z.string().optional(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						srcImages: z.array(z.string()),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						tags: z.array(z.string()),
						target: z.string().optional(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
					})
					.strict(),
				z
					.object({
						edgeConfigId: z.string(),
						edgeConfigSlug: z.string(),
						edgeConfigDigest: z.string(),
					})
					.strict(),
				z
					.object({
						edgeConfigId: z.string(),
						edgeConfigSlug: z.string(),
						edgeConfigDigest: z.string(),
						edgeConfigBackupVersionId: z.string(),
					})
					.strict(),
				z
					.object({
						edgeConfigId: z.string(),
						edgeConfigSlug: z.string(),
						edgeConfigSchema: z.object({}).optional(),
					})
					.strict(),
				z
					.object({
						edgeConfigId: z.string(),
						edgeConfigSlug: z.string(),
						edgeConfigDigest: z.string().optional(),
					})
					.strict(),
				z
					.object({
						edgeConfig: z.object({
							id: z.string(),
							slug: z.string(),
						}),
						fromAccount: z.object({
							id: z.string(),
							type: z.enum(["team", "user"]),
							slug: z.string().optional(),
							username: z.string().optional(),
						}),
						toAccount: z.object({
							id: z.string(),
							type: z.enum(["team", "user"]),
							slug: z.string().optional(),
							username: z.string().optional(),
						}),
					})
					.strict(),
				z
					.object({
						edgeConfigId: z.string(),
						edgeConfigSlug: z.string(),
						edgeConfigTokenId: z.string(),
						label: z.string(),
					})
					.strict(),
				z
					.object({
						edgeConfigId: z.string(),
						edgeConfigSlug: z.string(),
						edgeConfigTokenIds: z.array(z.string()).describe("ids of deleted tokens"),
					})
					.strict(),
				z
					.object({
						email: z.string(),
						name: z.string(),
					})
					.strict(),
				z
					.object({
						team: z.object({
							id: z.string(),
							name: z.string().optional(),
						}),
						previousRule: z.object({
							email: z.string(),
						}),
					})
					.strict(),
				z
					.object({
						team: z.object({
							id: z.string(),
							name: z.string().optional(),
						}),
						previousRule: z
							.object({
								email: z.string(),
							})
							.optional(),
						nextRule: z
							.object({
								email: z.string(),
							})
							.optional(),
					})
					.strict(),
				z
					.object({
						key: z.string().optional(),
						projectId: z.string().optional(),
						projectName: z.string().optional(),
						target: z.union([z.string(), z.array(z.string())]).optional(),
						customEnvironmentSlugs: z.array(z.string()).optional(),
						id: z.string().optional(),
						gitBranch: z.string().optional(),
						edgeConfigId: z.string().nullish(),
						edgeConfigTokenId: z.string().nullish(),
						source: z.string().optional(),
						ipAddress: z.string().optional(),
					})
					.strict(),
				z
					.object({
						key: z.string().optional(),
						projectId: z.string().optional(),
						projectName: z.string().optional(),
						target: z.union([z.string(), z.array(z.string())]).optional(),
						customEnvironmentSlugs: z.array(z.string()).optional(),
						id: z.string().optional(),
						gitBranch: z.string().optional(),
						edgeConfigId: z.string().nullish(),
						edgeConfigTokenId: z.string().nullish(),
						source: z.string().optional(),
						ipAddress: z.string().optional(),
						deploymentId: z.string(),
						deploymentUrl: z.string(),
					})
					.strict(),
				z
					.object({
						created: z.iso
							.datetime()
							.optional()
							.describe("The date when the Shared Env Var was created."),
						key: z.string().optional().describe("The name of the Shared Env Var."),
						ownerId: z
							.string()
							.nullish()
							.describe(
								"The unique identifier of the owner (team) the Shared Env Var was created for.",
							),
						id: z.string().optional().describe("The unique identifier of the Shared Env Var."),
						createdBy: z
							.string()
							.nullish()
							.describe("The unique identifier of the user who created the Shared Env Var."),
						deletedBy: z
							.string()
							.nullish()
							.describe("The unique identifier of the user who deleted the Shared Env Var."),
						updatedBy: z
							.string()
							.nullish()
							.describe("The unique identifier of the user who last updated the Shared Env Var."),
						createdAt: z
							.number()
							.optional()
							.describe("Timestamp for when the Shared Env Var was created."),
						deletedAt: z
							.number()
							.optional()
							.describe("Timestamp for when the Shared Env Var was (soft) deleted."),
						updatedAt: z
							.number()
							.optional()
							.describe("Timestamp for when the Shared Env Var was last updated."),
						value: z.string().optional().describe("The value of the Shared Env Var."),
						projectId: z
							.array(z.string())
							.optional()
							.describe(
								"The unique identifiers of the projects which the Shared Env Var is linked to.",
							),
						type: z
							.enum(["encrypted", "plain", "sensitive", "system"])
							.optional()
							.describe("The type of this cosmos doc instance, if blank, assume secret."),
						target: z
							.array(z.enum(["development", "preview", "production"]))
							.optional()
							.describe("environments this env variable targets"),
						applyToAllCustomEnvironments: z
							.union([z.literal(false), z.literal(true)])
							.optional()
							.describe("whether or not this env varible applies to custom environments"),
						customEnvironmentIds: z
							.array(z.string())
							.optional()
							.describe("The custom environment IDs that this Shared Env Var is scoped to."),
						decrypted: z
							.union([z.literal(false), z.literal(true)])
							.optional()
							.describe("whether or not this env variable is decrypted"),
						comment: z
							.string()
							.optional()
							.describe("A user provided comment that describes what this Shared Env Var is for."),
						lastEditedByDisplayName: z
							.string()
							.optional()
							.describe("The last editor full name or username."),
						projectNames: z.array(z.string()).optional(),
						ipAddress: z.string().optional(),
					})
					.strict(),
				z
					.object({
						oldEnvVar: z
							.object({
								created: z.iso
									.datetime()
									.optional()
									.describe("The date when the Shared Env Var was created."),
								key: z.string().optional().describe("The name of the Shared Env Var."),
								ownerId: z
									.string()
									.nullish()
									.describe(
										"The unique identifier of the owner (team) the Shared Env Var was created for.",
									),
								id: z.string().optional().describe("The unique identifier of the Shared Env Var."),
								createdBy: z
									.string()
									.nullish()
									.describe("The unique identifier of the user who created the Shared Env Var."),
								deletedBy: z
									.string()
									.nullish()
									.describe("The unique identifier of the user who deleted the Shared Env Var."),
								updatedBy: z
									.string()
									.nullish()
									.describe(
										"The unique identifier of the user who last updated the Shared Env Var.",
									),
								createdAt: z
									.number()
									.optional()
									.describe("Timestamp for when the Shared Env Var was created."),
								deletedAt: z
									.number()
									.optional()
									.describe("Timestamp for when the Shared Env Var was (soft) deleted."),
								updatedAt: z
									.number()
									.optional()
									.describe("Timestamp for when the Shared Env Var was last updated."),
								value: z.string().optional().describe("The value of the Shared Env Var."),
								projectId: z
									.array(z.string())
									.optional()
									.describe(
										"The unique identifiers of the projects which the Shared Env Var is linked to.",
									),
								type: z
									.enum(["encrypted", "plain", "sensitive", "system"])
									.optional()
									.describe("The type of this cosmos doc instance, if blank, assume secret."),
								target: z
									.array(z.enum(["development", "preview", "production"]))
									.optional()
									.describe("environments this env variable targets"),
								applyToAllCustomEnvironments: z
									.union([z.literal(false), z.literal(true)])
									.optional()
									.describe("whether or not this env varible applies to custom environments"),
								customEnvironmentIds: z
									.array(z.string())
									.optional()
									.describe("The custom environment IDs that this Shared Env Var is scoped to."),
								decrypted: z
									.union([z.literal(false), z.literal(true)])
									.optional()
									.describe("whether or not this env variable is decrypted"),
								comment: z
									.string()
									.optional()
									.describe(
										"A user provided comment that describes what this Shared Env Var is for.",
									),
								lastEditedByDisplayName: z
									.string()
									.optional()
									.describe("The last editor full name or username."),
							})
							.optional(),
						newEnvVar: z
							.object({
								created: z.iso
									.datetime()
									.optional()
									.describe("The date when the Shared Env Var was created."),
								key: z.string().optional().describe("The name of the Shared Env Var."),
								ownerId: z
									.string()
									.nullish()
									.describe(
										"The unique identifier of the owner (team) the Shared Env Var was created for.",
									),
								id: z.string().optional().describe("The unique identifier of the Shared Env Var."),
								createdBy: z
									.string()
									.nullish()
									.describe("The unique identifier of the user who created the Shared Env Var."),
								deletedBy: z
									.string()
									.nullish()
									.describe("The unique identifier of the user who deleted the Shared Env Var."),
								updatedBy: z
									.string()
									.nullish()
									.describe(
										"The unique identifier of the user who last updated the Shared Env Var.",
									),
								createdAt: z
									.number()
									.optional()
									.describe("Timestamp for when the Shared Env Var was created."),
								deletedAt: z
									.number()
									.optional()
									.describe("Timestamp for when the Shared Env Var was (soft) deleted."),
								updatedAt: z
									.number()
									.optional()
									.describe("Timestamp for when the Shared Env Var was last updated."),
								value: z.string().optional().describe("The value of the Shared Env Var."),
								projectId: z
									.array(z.string())
									.optional()
									.describe(
										"The unique identifiers of the projects which the Shared Env Var is linked to.",
									),
								type: z
									.enum(["encrypted", "plain", "sensitive", "system"])
									.optional()
									.describe("The type of this cosmos doc instance, if blank, assume secret."),
								target: z
									.array(z.enum(["development", "preview", "production"]))
									.optional()
									.describe("environments this env variable targets"),
								applyToAllCustomEnvironments: z
									.union([z.literal(false), z.literal(true)])
									.optional()
									.describe("whether or not this env varible applies to custom environments"),
								customEnvironmentIds: z
									.array(z.string())
									.optional()
									.describe("The custom environment IDs that this Shared Env Var is scoped to."),
								decrypted: z
									.union([z.literal(false), z.literal(true)])
									.optional()
									.describe("whether or not this env variable is decrypted"),
								comment: z
									.string()
									.optional()
									.describe(
										"A user provided comment that describes what this Shared Env Var is for.",
									),
								lastEditedByDisplayName: z
									.string()
									.optional()
									.describe("The last editor full name or username."),
							})
							.optional(),
						updateDiff: z
							.object({
								id: z.string(),
								key: z.string().optional(),
								newKey: z.string().optional(),
								oldTarget: z.array(z.enum(["development", "preview", "production"])).optional(),
								newTarget: z.array(z.enum(["development", "preview", "production"])).optional(),
								oldType: z.string().optional(),
								newType: z.string().optional(),
								oldProjects: z
									.array(
										z.object({
											projectName: z.string().optional(),
											projectId: z.string(),
										}),
									)
									.optional(),
								newProjects: z
									.array(
										z.object({
											projectName: z.string().optional(),
											projectId: z.string(),
										}),
									)
									.optional(),
								oldCustomEnvironmentIds: z.array(z.string()).optional(),
								newCustomEnvironmentIds: z.array(z.string()).optional(),
								changedValue: z.union([z.literal(false), z.literal(true)]),
							})
							.optional(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						scope: z.string(),
						source: z.string(),
						expiresAt: z.number().nullish(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						scope: z.string(),
						source: z.string(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						configVersion: z.union([z.string(), z.number()]),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string().optional(),
						restore: z.union([z.literal(false), z.literal(true)]),
						configVersion: z.number(),
						configChangeCount: z.number(),
						configChanges: z.array(z.object({})),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						rulesetName: z.string(),
						ruleGroups: z.object({}).catchall(
							z.object({
								active: z.union([z.literal(false), z.literal(true)]),
								action: z.enum(["challenge", "deny", "log"]).optional(),
							}),
						),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						rulesetName: z.string(),
						active: z.union([z.literal(false), z.literal(true)]),
						action: z.enum(["challenge", "deny", "log"]).optional(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						previousOwnerId: z.string(),
						newOwnerId: z.string(),
					})
					.strict(),
				z
					.object({
						action: z.enum(["disable", "enable"]),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						fromDeploymentId: z.string(),
						toDeploymentId: z.string(),
						projectName: z.string(),
						reason: z.string().optional(),
					})
					.strict(),
				z
					.object({
						userId: z.string(),
						integrationId: z.string(),
						configurationId: z.string(),
						integrationSlug: z.string(),
						integrationName: z.string().optional(),
						newOwner: z
							.object({
								abuse: z
									.object({
										blockHistory: z
											.array(
												z.object({
													action: z.enum(["blocked", "hard-blocked", "soft-blocked", "unblocked"]),
													createdAt: z.number(),
													caseId: z.string().optional(),
													reason: z.string(),
													actor: z.string().optional(),
													statusCode: z.number().optional(),
													comment: z.string().optional(),
													ineligibleForAppeal: z
														.union([z.literal(false), z.literal(true)])
														.optional(),
												}),
											)
											.optional()
											.describe("Since June 2023"),
										gitAuthHistory: z
											.array(z.string())
											.optional()
											.describe(
												"Since March 2022. Helps abuse checks by tracking git auths. Format: `<platform>:<detail>:<value>`",
											),
										history: z
											.array(
												z.object({
													scanner: z.string(),
													reason: z.string(),
													by: z.string(),
													byId: z.string(),
													at: z.number(),
												}),
											)
											.optional()
											.describe("(scanner history). Since November 2021. First element is newest."),
										gitLineageBlocks: z
											.number()
											.optional()
											.describe(
												"Since September 2023. How often did this owner trigger an actual git lineage deploy block?",
											),
										gitLineageBlocksDry: z
											.number()
											.optional()
											.describe(
												"Since September 2023. How often did this owner trigger a git lineage deploy block dry run?",
											),
										scanner: z
											.string()
											.optional()
											.describe(
												"Since November 2021. Guides the abuse scanner in build container.",
											),
										scheduledUnblockAt: z
											.string()
											.optional()
											.describe(
												'Since December 2025. UTC timestamp string of when an auto-unblock is scheduled. Format: "Wed, 03 Dec 2025 20:32:13 GMT"',
											),
										scheduledBlock: z
											.object({
												executeAt: z
													.number()
													.describe("Unix ms timestamp of the scheduled EventBridge execution."),
												reason: z
													.string()
													.describe("Violation reason (string value of the `Violation` enum)."),
												source: z
													.string()
													.describe(
														"What triggered the scheduled block (string value of `TeamBlockSource`).",
													),
												createdAt: z
													.number()
													.describe("Unix ms timestamp of when the marker was written."),
												caseId: z
													.string()
													.optional()
													.describe(
														"Absent from the automated evaluation path, which has no case.",
													),
												scheduleName: z
													.string()
													.optional()
													.describe(
														"EventBridge schedule name, persisted so the pending event can be cancelled.",
													),
											})
											.optional()
											.describe(
												'Since June 2026. A hard block that is scheduled (the delay varies by source; see `executeAt`) but not yet executed. Powers admin visibility, scheduler dedup, and cancellation. Cleared on execution or when the team is unblocked/reviewed before `executeAt`; the executor treats its absence as "block cancelled".',
											),
										updatedAt: z.number().describe("Since November 2021"),
										creationUserAgent: z.string().optional(),
										creationIp: z.string().optional(),
										removedPhoneNumbers: z.string().optional(),
									})
									.optional(),
								acceptanceState: z.string().optional(),
								acceptedAt: z.number().optional(),
								avatar: z.string().optional(),
								billing: z.object({
									plan: z.enum(["enterprise", "hobby", "pro"]),
								}),
								blocked: z.number().nullable(),
								blockReason: z.string().optional(),
								created: z.number().optional(),
								createdAt: z.number(),
								credentials: z
									.array(
										z.union([
											z
												.object({
													type: z.enum([
														"apple",
														"bitbucket",
														"chatgpt",
														"github-oauth",
														"github-oauth-limited",
														"gitlab",
														"google",
														"vercel",
													]),
													id: z.string(),
												})
												.strict(),
											z
												.object({
													type: z.enum(["github-oauth-custom-host"]),
													host: z.string(),
													id: z.string(),
												})
												.strict(),
										]),
									)
									.optional(),
								customerId: z.string().nullish(),
								orbCustomerId: z.string().nullish(),
								dataCache: z
									.object({
										excessBillingEnabled: z.union([z.literal(false), z.literal(true)]).optional(),
									})
									.optional(),
								deletedAt: z.number().nullish(),
								deploymentSecret: z.string(),
								dismissedTeams: z.array(z.string()).optional(),
								dismissedToasts: z
									.array(
										z.object({
											name: z.string(),
											dismissals: z.array(
												z.object({
													scopeId: z.string(),
													createdAt: z.number(),
												}),
											),
										}),
									)
									.optional(),
								favoriteProjectsAndSpaces: z
									.array(
										z.object({
											teamId: z.string(),
											projectId: z.string(),
										}),
									)
									.optional(),
								email: z.string(),
								id: z.string(),
								importFlowGitNamespace: z.union([z.string(), z.number()]).nullish(),
								importFlowGitNamespaceId: z.union([z.string(), z.number()]).nullish(),
								importFlowGitProvider: z
									.enum([
										"bitbucket",
										"github",
										"github-custom-host",
										"github-limited",
										"gitlab",
										"vercel",
									])
									.nullish(),
								preferredScopesAndGitNamespaces: z
									.array(
										z.object({
											scopeId: z.string(),
											gitNamespaceId: z.union([z.string(), z.number()]).nullable(),
										}),
									)
									.optional(),
								isDomainReseller: z.union([z.literal(false), z.literal(true)]).optional(),
								isZeitPub: z.union([z.literal(false), z.literal(true)]).optional(),
								testAccountExpiresAt: z.number().optional(),
								maxActiveSlots: z.number().optional(),
								name: z.string().optional(),
								phoneNumber: z.string().optional(),
								platformVersion: z.number().nullable(),
								preventAutoBlocking: z
									.union([z.number(), z.union([z.literal(false), z.literal(true)])])
									.optional(),
								projectDomainsLimit: z
									.number()
									.optional()
									.describe(
										"Overrides our DEFAULT project domains limit per account or per project.",
									),
								remoteCaching: z
									.object({
										enabled: z.union([z.literal(false), z.literal(true)]).optional(),
									})
									.optional()
									.describe("Represents configuration for remote caching"),
								removedAliasesAt: z.number().optional(),
								removedBillingSubscriptionAt: z.number().optional(),
								removedConfigurationsAt: z.number().optional(),
								removedDeploymentsAt: z.number().optional(),
								removedDomiansAt: z.number().optional(),
								removedEventsAt: z.number().optional(),
								removedProjectsAt: z.number().optional(),
								removedSecretsAt: z.number().optional(),
								removedSharedEnvVarsAt: z.number().optional(),
								removedEdgeConfigsAt: z.number().optional(),
								resourceConfig: z
									.object({
										nodeType: z.string().optional(),
										concurrentBuilds: z.number().optional(),
										elasticConcurrencyEnabled: z
											.union([z.literal(false), z.literal(true)])
											.optional(),
										buildEntitlements: z
											.object({
												enhancedBuilds: z.union([z.literal(false), z.literal(true)]).optional(),
											})
											.optional(),
										buildQueue: z
											.object({
												configuration: z
													.enum(["SKIP_NAMESPACE_QUEUE", "WAIT_FOR_NAMESPACE_QUEUE"])
													.optional(),
											})
											.optional(),
										awsAccountType: z.string().optional(),
										awsAccountIds: z.array(z.string()).optional(),
										cfZoneName: z.string().optional(),
										imageOptimizationType: z.string().optional(),
										edgeConfigs: z.number().optional(),
										edgeConfigSize: z.number().optional(),
										edgeFunctionMaxSizeBytes: z.number().optional(),
										edgeFunctionExecutionTimeoutMs: z.number().optional(),
										serverlessFunctionMaxMemorySize: z.number().optional(),
										kvDatabases: z.number().optional(),
										postgresDatabases: z.number().optional(),
										blobStores: z.number().optional(),
										integrationStores: z.number().optional(),
										cronJobsPerProject: z.number().optional(),
										microfrontendGroupsPerTeam: z.number().optional(),
										microfrontendProjectsPerGroup: z.number().optional(),
										flagsExplorerOverridesThreshold: z.number().optional(),
										flagsExplorerUnlimitedOverrides: z
											.union([z.literal(false), z.literal(true)])
											.optional(),
										customEnvironmentsPerProject: z.number().optional(),
										security: z
											.object({
												customRules: z.number().optional(),
												ipBlocks: z.number().optional(),
												ipBypass: z.number().optional(),
												rateLimit: z.number().optional(),
											})
											.optional(),
										bulkRedirectsFreeLimitOverride: z.number().optional(),
										buildMachine: z
											.object({
												default: z
													.enum(["elastic", "enhanced", "standard", "turbo"])
													.optional()
													.describe(
														'Default build machine type for new deployments. This must be used in combination with the buildEntitlements field. It is respected over Vercel\'s notion of the default build machine, and was originally implemented to allow Teams to "downgrade". - Hobby customers cannot set this, because they only have access to one machine type - Pro customers get Turbo machines by default, so this field is effectively for downgrading - ENT customers cannot set this (yet), because their default is based on their contract. https://linear.app/vercel/project/self-serve-build-machines-for-enterprise-customers-0cbc357e26d2/overview',
													),
											})
											.optional()
											.describe(
												"Build machine configuration recorded on a team or user `resourceConfig`. This is deliberately separate from the build machine config recorded on a deployment (`DeploymentBuildMachine` in `@api/deployments-types`). A team/user only expresses its default machine for new deployments; the per-build fields (`purchaseType`, `defaultPurchaseType`, `machineSelectionType`, `cores`, `memory`) are recorded on the deployment record when a build actually runs and never belong on a team/user document.",
											),
									})
									.optional(),
								resourceLimits: z
									.object({})
									.catchall(
										z.object({
											max: z.number(),
											duration: z.number(),
										}),
									)
									.optional()
									.describe("User | Team resource limits"),
								activeDashboardViews: z
									.array(
										z.object({
											scopeId: z.string(),
											viewPreference: z.enum(["cards", "list"]).nullish(),
											favoritesViewPreference: z.enum(["closed", "open"]).nullish(),
											recentsViewPreference: z.enum(["closed", "open"]).nullish(),
										}),
									)
									.optional(),
								secondaryEmails: z
									.array(
										z.object({
											email: z.string(),
											verified: z.union([z.literal(false), z.literal(true)]),
										}),
									)
									.optional(),
								emailDomains: z.array(z.string()).optional(),
								emailNotifications: z
									.object({
										rules: z
											.object({})
											.catchall(
												z.object({
													email: z.string(),
												}),
											)
											.optional(),
									})
									.optional(),
								siftScore: z.number().optional(),
								siftScores: z
									.object({})
									.catchall(
										z.object({
											score: z.number(),
											reasons: z.array(
												z.object({
													name: z.string(),
													value: z.string(),
												}),
											),
										}),
									)
									.optional(),
								siftRoute: z
									.object({
										name: z.enum(["string"]),
									})
									.optional(),
								sfdcId: z.string().optional(),
								softBlock: z
									.object({
										blockedAt: z.number(),
										reason: z.enum([
											"BLOCKED_FOR_PLATFORM_ABUSE",
											"ENTERPRISE_TRIAL_ENDED",
											"ENTERPRISE_UNPAID_INVOICE",
											"EXPOSURE_CAP_EXCEEDED",
											"FAIR_USE_LIMITS_EXCEEDED",
											"SUBSCRIPTION_CANCELED",
											"SUBSCRIPTION_EXPIRED",
											"UNPAID_INVOICE",
										]),
										blockedDueToOverageType: z
											.enum([
												"analyticsUsage",
												"artifacts",
												"bandwidth",
												"blobDataTransfer",
												"blobTotalAdvancedRequests",
												"blobTotalAvgSizeInBytes",
												"blobTotalGetResponseObjectSizeInBytes",
												"blobTotalSimpleRequests",
												"connectDataTransfer",
												"dataCacheRead",
												"dataCacheWrite",
												"edgeConfigRead",
												"edgeConfigWrite",
												"edgeFunctionExecutionUnits",
												"edgeMiddlewareInvocations",
												"edgeRequest",
												"edgeRequestAdditionalCpuDuration",
												"elasticConcurrencyBuildSlots",
												"fastDataTransfer",
												"fastOriginTransfer",
												"fluidCpuDuration",
												"fluidDuration",
												"functionDuration",
												"functionInvocation",
												"imageOptimizationCacheRead",
												"imageOptimizationCacheWrite",
												"imageOptimizationTransformation",
												"logDrainsVolume",
												"monitoringMetric",
												"observabilityEvent",
												"onDemandConcurrencyMinutes",
												"runtimeCacheRead",
												"runtimeCacheWrite",
												"serverlessFunctionExecution",
												"sourceImages",
												"wafOwaspExcessBytes",
												"wafOwaspRequests",
												"wafRateLimitRequest",
												"webAnalyticsEvent",
											])
											.optional(),
									})
									.nullish(),
								stagingPrefix: z.string(),
								sysToken: z.string(),
								teams: z
									.array(
										z.object({
											teamId: z.string(),
											createdAt: z.number(),
											role: z.enum([
												"BILLING",
												"CONTRIBUTOR",
												"DEVELOPER",
												"MEMBER",
												"OWNER",
												"SECURITY",
												"VIEWER",
												"VIEWER_FOR_PLUS",
											]),
											confirmed: z.literal(true),
											confirmedAt: z.number(),
											accessRequestedAt: z.number().optional(),
											teamRoles: z
												.array(
													z.enum([
														"BILLING",
														"CONTRIBUTOR",
														"DEVELOPER",
														"MEMBER",
														"OWNER",
														"SECURITY",
														"VIEWER",
														"VIEWER_FOR_PLUS",
													]),
												)
												.optional(),
											teamPermissions: z
												.array(
													z.enum([
														"CreateProject",
														"EnvVariableManager",
														"EnvironmentManager",
														"FullProductionDeployment",
														"IntegrationManager",
														"OrgAdmin",
														"OrgViewer",
														"UsageViewer",
														"V0Builder",
														"V0Chatter",
														"V0Viewer",
													]),
												)
												.optional(),
											created: z.number(),
											joinedFrom: z
												.object({
													origin: z.enum([
														"account-update",
														"bitbucket",
														"dsync",
														"feedback",
														"github",
														"gitlab",
														"import",
														"link",
														"mail",
														"nsnb-auto-approve",
														"nsnb-hobby-upgrade",
														"nsnb-invite",
														"nsnb-redeploy",
														"nsnb-redeploy-attribution-card",
														"nsnb-request-access",
														"nsnb-viewer-upgrade",
														"organization-teams",
														"saml",
														"teams",
													]),
													commitId: z.string().optional(),
													repoId: z.string().optional(),
													repoPath: z.string().optional(),
													gitUserId: z.union([z.string(), z.number()]).optional(),
													gitUserLogin: z.string().optional(),
													ssoUserId: z.string().optional(),
													ssoConnectedAt: z.number().optional(),
													idpUserId: z.string().optional(),
													dsyncUserId: z.string().optional(),
													dsyncConnectedAt: z.number().optional(),
												})
												.optional(),
										}),
									)
									.optional()
									.describe(
										"A helper that allows to describe a relationship attribute. It receives the shape of a relationship plus the foreignKey name to make it mandatory in the resulting type.",
									),
								trialTeamIds: z
									.array(z.string())
									.optional()
									.describe(
										"Introduced 2022-04-12 An array of teamIds (for trial teams created after 2022-04-01), created by the user in question. Used in determining whether the team has a trial available in utils/api-teams/user-has-trial-available.ts.",
									),
								maxTrials: z
									.number()
									.optional()
									.describe(
										"Introduced 2022-04-19 Number of maximum trials to allocate to a user. When undefined, defaults to MAX_TRIALS in utils/api-teams/user-has-trial-available.ts. This is set to trialTeamIds + 1 by services/api-backoffice/src/handlers/add-additional-trial.ts.",
									),
								trialTeamId: z
									.string()
									.optional()
									.describe(
										"Deprecated on 2022-04-12 in favor of trialTeamIds and using utils/api-teams/user-has-trial-available.ts.",
									),
								type: z.enum(["user"]),
								usageAlerts: z
									.object({
										warningAt: z.number().nullish(),
										blockingAt: z.number().nullish(),
									})
									.nullish()
									.describe("Contains the timestamps when a user was notified about their usage"),
								overageUsageAlerts: z
									.object({
										analyticsUsage: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										artifacts: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										bandwidth: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										blobTotalAdvancedRequests: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										blobTotalAvgSizeInBytes: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										blobTotalGetResponseObjectSizeInBytes: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										blobTotalSimpleRequests: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										connectDataTransfer: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										dataCacheRead: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										dataCacheWrite: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										edgeConfigRead: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										edgeConfigWrite: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										edgeFunctionExecutionUnits: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										edgeMiddlewareInvocations: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										edgeRequestAdditionalCpuDuration: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										edgeRequest: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										elasticConcurrencyBuildSlots: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										fastDataTransfer: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										fastOriginTransfer: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										fluidCpuDuration: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										fluidDuration: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										functionDuration: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										functionInvocation: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										imageOptimizationCacheRead: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										imageOptimizationCacheWrite: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										imageOptimizationTransformation: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										logDrainsVolume: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										monitoringMetric: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										blobDataTransfer: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										observabilityEvent: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										onDemandConcurrencyMinutes: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										runtimeCacheRead: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										runtimeCacheWrite: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										serverlessFunctionExecution: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										sourceImages: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										wafOwaspExcessBytes: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										wafOwaspRequests: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										wafRateLimitRequest: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
										webAnalyticsEvent: z
											.object({
												currentThreshold: z.number(),
												warningAt: z.number().nullish(),
												blockedAt: z.number().nullish(),
											})
											.optional(),
									})
									.optional(),
								overageMetadata: z
									.object({
										firstTimeOnDemandNotificationSentAt: z
											.number()
											.optional()
											.describe("Tracks if the first time on-demand overage email has been sent."),
										dailyOverageSummaryEmailSentAt: z
											.number()
											.optional()
											.describe("Tracks the last time we sent a daily summary email."),
										weeklyOverageSummaryEmailSentAt: z
											.number()
											.optional()
											.describe("Tracks the last time we sent a weekly summary email."),
										overageSummaryExpiresAt: z
											.number()
											.optional()
											.describe(
												"Tracks when the overage summary email will stop auto-sending. We currently lock the user into email for a month after the last on-demand usage.",
											),
										increasedOnDemandEmailSentAt: z
											.number()
											.optional()
											.describe("Tracks the last time we sent a increased on-demand email."),
										increasedOnDemandEmailAttemptedAt: z
											.number()
											.optional()
											.describe(
												"Tracks the last time we attempted to send an increased on-demand email. This check is to limit the number of attempts per day.",
											),
									})
									.optional()
									.describe("Contains the timestamps for usage summary emails."),
								username: z.string(),
								updatedAt: z.number(),
								enablePreviewFeedback: z
									.enum(["default", "default-force", "off", "off-force", "on", "on-force"])
									.optional()
									.describe("Whether the Vercel Toolbar is enabled for preview deployments."),
								featureBlocks: z
									.object({
										webAnalytics: z
											.object({
												updatedAt: z.number(),
												blockedFrom: z.number().optional(),
												blockedUntil: z.number().optional(),
												blockReason: z.enum(["admin_override", "hard_blocked", "limits_exceeded"]),
												graceEmailSentAt: z.number().optional(),
											})
											.optional(),
										monitoring: z
											.object({
												updatedAt: z.number(),
												blockedFrom: z.number().optional(),
												blockedUntil: z.number().optional(),
												blockReason: z.enum(["admin_override", "hard_blocked", "limits_exceeded"]),
												blockType: z.enum(["hard", "soft"]),
											})
											.optional()
											.describe(
												"A soft block indicates a temporary pause in data collection (ex limit exceeded for the current cycle) A hard block indicates a stoppage in data collection that requires manual intervention (ex upgrading a pro trial)",
											),
										observabilityPlus: z
											.object({
												updatedAt: z.number(),
												blockedFrom: z.number().optional(),
												blockedUntil: z.number().optional(),
												blockReason: z.enum(["admin_override", "hard_blocked", "limits_exceeded"]),
												blockType: z.enum(["hard", "soft"]),
											})
											.optional(),
										dataCache: z
											.object({
												updatedAt: z.number(),
												blockedFrom: z.number().optional(),
												blockedUntil: z.number().optional(),
												blockReason: z.enum(["admin_override", "hard_blocked", "limits_exceeded"]),
											})
											.optional(),
										imageOptimizationTransformation: z
											.object({
												updatedAt: z.number(),
												blockedFrom: z.number().optional(),
												blockedUntil: z.number().optional(),
												blockReason: z.enum(["admin_override", "hard_blocked", "limits_exceeded"]),
											})
											.optional(),
										sourceImages: z
											.object({
												updatedAt: z.number(),
												blockedFrom: z.number().optional(),
												blockedUntil: z.number().optional(),
												blockReason: z.enum(["admin_override", "hard_blocked", "limits_exceeded"]),
											})
											.optional(),
										blob: z
											.union([
												z
													.object({
														updatedAt: z.number(),
														blockedFrom: z.number().optional(),
														blockedUntil: z.number().optional(),
														blockReason: z.enum(["limits_exceeded"]),
														overageReason: z.enum([
															"analyticsUsage",
															"artifacts",
															"bandwidth",
															"blobDataTransfer",
															"blobTotalAdvancedRequests",
															"blobTotalAvgSizeInBytes",
															"blobTotalGetResponseObjectSizeInBytes",
															"blobTotalSimpleRequests",
															"connectDataTransfer",
															"dataCacheRead",
															"dataCacheWrite",
															"edgeConfigRead",
															"edgeConfigWrite",
															"edgeFunctionExecutionUnits",
															"edgeMiddlewareInvocations",
															"edgeRequest",
															"edgeRequestAdditionalCpuDuration",
															"elasticConcurrencyBuildSlots",
															"fastDataTransfer",
															"fastOriginTransfer",
															"fluidCpuDuration",
															"fluidDuration",
															"functionDuration",
															"functionInvocation",
															"imageOptimizationCacheRead",
															"imageOptimizationCacheWrite",
															"imageOptimizationTransformation",
															"logDrainsVolume",
															"monitoringMetric",
															"observabilityEvent",
															"onDemandConcurrencyMinutes",
															"runtimeCacheRead",
															"runtimeCacheWrite",
															"serverlessFunctionExecution",
															"sourceImages",
															"wafOwaspExcessBytes",
															"wafOwaspRequests",
															"wafRateLimitRequest",
															"webAnalyticsEvent",
														]),
													})
													.strict(),
												z
													.object({
														updatedAt: z.number(),
														blockedFrom: z.number().optional(),
														blockedUntil: z.number().optional(),
														blockReason: z.enum(["admin_override", "hard_blocked"]),
													})
													.strict(),
											])
											.optional(),
										postgres: z
											.union([
												z
													.object({
														updatedAt: z.number(),
														blockedFrom: z.number().optional(),
														blockedUntil: z.number().optional(),
														blockReason: z.enum(["limits_exceeded"]),
														overageReason: z.enum([
															"analyticsUsage",
															"artifacts",
															"bandwidth",
															"blobDataTransfer",
															"blobTotalAdvancedRequests",
															"blobTotalAvgSizeInBytes",
															"blobTotalGetResponseObjectSizeInBytes",
															"blobTotalSimpleRequests",
															"connectDataTransfer",
															"dataCacheRead",
															"dataCacheWrite",
															"edgeConfigRead",
															"edgeConfigWrite",
															"edgeFunctionExecutionUnits",
															"edgeMiddlewareInvocations",
															"edgeRequest",
															"edgeRequestAdditionalCpuDuration",
															"elasticConcurrencyBuildSlots",
															"fastDataTransfer",
															"fastOriginTransfer",
															"fluidCpuDuration",
															"fluidDuration",
															"functionDuration",
															"functionInvocation",
															"imageOptimizationCacheRead",
															"imageOptimizationCacheWrite",
															"imageOptimizationTransformation",
															"logDrainsVolume",
															"monitoringMetric",
															"observabilityEvent",
															"onDemandConcurrencyMinutes",
															"runtimeCacheRead",
															"runtimeCacheWrite",
															"serverlessFunctionExecution",
															"sourceImages",
															"wafOwaspExcessBytes",
															"wafOwaspRequests",
															"wafRateLimitRequest",
															"webAnalyticsEvent",
														]),
													})
													.strict(),
												z
													.object({
														updatedAt: z.number(),
														blockedFrom: z.number().optional(),
														blockedUntil: z.number().optional(),
														blockReason: z.enum(["admin_override", "hard_blocked"]),
													})
													.strict(),
											])
											.optional(),
										redis: z
											.union([
												z
													.object({
														updatedAt: z.number(),
														blockedFrom: z.number().optional(),
														blockedUntil: z.number().optional(),
														blockReason: z.enum(["limits_exceeded"]),
														overageReason: z.enum([
															"analyticsUsage",
															"artifacts",
															"bandwidth",
															"blobDataTransfer",
															"blobTotalAdvancedRequests",
															"blobTotalAvgSizeInBytes",
															"blobTotalGetResponseObjectSizeInBytes",
															"blobTotalSimpleRequests",
															"connectDataTransfer",
															"dataCacheRead",
															"dataCacheWrite",
															"edgeConfigRead",
															"edgeConfigWrite",
															"edgeFunctionExecutionUnits",
															"edgeMiddlewareInvocations",
															"edgeRequest",
															"edgeRequestAdditionalCpuDuration",
															"elasticConcurrencyBuildSlots",
															"fastDataTransfer",
															"fastOriginTransfer",
															"fluidCpuDuration",
															"fluidDuration",
															"functionDuration",
															"functionInvocation",
															"imageOptimizationCacheRead",
															"imageOptimizationCacheWrite",
															"imageOptimizationTransformation",
															"logDrainsVolume",
															"monitoringMetric",
															"observabilityEvent",
															"onDemandConcurrencyMinutes",
															"runtimeCacheRead",
															"runtimeCacheWrite",
															"serverlessFunctionExecution",
															"sourceImages",
															"wafOwaspExcessBytes",
															"wafOwaspRequests",
															"wafRateLimitRequest",
															"webAnalyticsEvent",
														]),
													})
													.strict(),
												z
													.object({
														updatedAt: z.number(),
														blockedFrom: z.number().optional(),
														blockedUntil: z.number().optional(),
														blockReason: z.enum(["admin_override", "hard_blocked"]),
													})
													.strict(),
											])
											.optional(),
										microfrontendsRequest: z
											.object({
												updatedAt: z.number(),
												blockedFrom: z.number().optional(),
												blockedUntil: z.number().optional(),
												blockReason: z.enum(["admin_override", "hard_blocked", "limits_exceeded"]),
											})
											.optional(),
										workflowStorage: z
											.object({
												updatedAt: z.number(),
												blockedFrom: z.number().optional(),
												blockedUntil: z.number().optional(),
												blockReason: z.enum(["admin_override", "hard_blocked", "limits_exceeded"]),
											})
											.optional(),
										workflowStep: z
											.object({
												updatedAt: z.number(),
												blockedFrom: z.number().optional(),
												blockedUntil: z.number().optional(),
												blockReason: z.enum(["admin_override", "hard_blocked", "limits_exceeded"]),
											})
											.optional(),
										connexTokenRequests: z
											.object({
												updatedAt: z.number(),
												blockedFrom: z.number().optional(),
												blockedUntil: z.number().optional(),
												blockReason: z.enum(["admin_override", "hard_blocked", "limits_exceeded"]),
											})
											.optional(),
									})
									.optional()
									.describe(
										"Information about which features are blocked for a user. Blocks can be either soft (the user can still access the feature, but with a warning, e.g. prompting an upgrade) or hard (the user cannot access the feature at all).",
									),
								defaultTeamId: z.string().optional(),
								version: z.enum(["northstar"]),
								isMFAEnforced: z
									.union([z.literal(false), z.literal(true)])
									.optional()
									.describe(
										"Whether MFA is enforced for this user. Set to true when the user has a",
									),
								northstarMigration: z
									.object({
										teamId: z.string().describe("The ID of the team we created for this user."),
										projects: z.number().describe("The number of projects migrated for this user."),
										stores: z.number().describe("The number of stores migrated for this user."),
										integrationConfigurations: z
											.number()
											.describe("The number of integration configurations migrated for this user."),
										integrationClients: z
											.number()
											.describe("The number of integration clients migrated for this user."),
										startTime: z
											.number()
											.describe("The migration start time timestamp for this user."),
										endTime: z.number().describe("The migration end time timestamp for this user."),
									})
									.optional()
									.describe(
										"An archive of information about the Northstar migration, derived from the old (deprecated) property, `northstarMigrationEvents`.",
									),
								opportunityId: z
									.string()
									.optional()
									.describe(
										"The salesforce opportunity ID that this user is linked to. This is used to automatically associate a team of the user's choosing with the opportunity.",
									),
								mfaConfiguration: z
									.object({
										enabled: z.union([z.literal(false), z.literal(true)]),
										enabledAt: z.number().optional(),
										recoveryCodes: z.array(z.string()),
										totp: z
											.object({
												secret: z.string(),
												createdAt: z.number(),
											})
											.optional(),
										history: z
											.array(
												z.object({
													action: z
														.enum(["disabled", "enabled"])
														.describe("The action that occurred"),
													timestamp: z
														.number()
														.nullable()
														.describe(
															"Unix timestamp (milliseconds) when the change occurred. May be null for events that occurred before history tracking was implemented.",
														),
													method: z
														.enum(["admin_removal", "passkey", "totp", "unknown", "user_disabled"])
														.describe(
															"Method used for the state change - 'totp': User set up TOTP authenticator - 'passkey': User registered a passkey - 'user_disabled': User disabled their own MFA - 'admin_removal': Admin removed MFA via backoffice - 'unknown': Method unknown (for pre-tracking events)",
														),
													actorId: z
														.string()
														.describe(
															"ID of the actor who made the change - For user actions: the user's own ID - For admin actions: the admin's user ID",
														),
													actorType: z.enum(["admin", "user"]).describe("Type of actor"),
													reason: z
														.string()
														.optional()
														.describe(
															'Optional: Additional context or reason e.g., "Account recovery request - ticket #12345"',
														),
												}),
											)
											.optional()
											.describe(
												"History of MFA state changes (enabled/disabled events). Most recent events first.",
											),
									})
									.optional()
									.describe(
										"MFA configuration. When enabled, the user will be required to provide a second factor of authentication when logging in.",
									),
								isEnterpriseManaged: z
									.union([z.literal(false), z.literal(true)])
									.optional()
									.describe(
										"Indicates that the underlying user entity is a managed user for the enterprise it's associated with The intention is that this field is only set to true for users that are provisioned by the enterprise which means that the domain associated with the user's email is the same domain associated with the team Allowing us to query information about the user's team at login time through the domain verification service",
									),
							})
							.nullable(),
					})
					.strict(),
				z
					.object({
						integrationId: z.string(),
						configurationId: z.string(),
						integrationSlug: z.string(),
						integrationName: z.string(),
						ownerId: z.string(),
						projectIds: z.array(z.string()).optional(),
						confirmedScopes: z.array(z.string()),
					})
					.strict(),
				z
					.object({
						integration: z.object({
							id: z.string(),
							slug: z.string(),
							name: z.string(),
							configurationId: z.string(),
						}),
						destinationTeamId: z.string(),
						destinationTeamName: z.string(),
					})
					.strict(),
				z
					.object({
						integration: z.object({
							id: z.string(),
							slug: z.string(),
							name: z.string(),
							configurationId: z.string(),
						}),
						originTeamId: z.string(),
						originTeamName: z.string(),
					})
					.strict(),
				z
					.object({
						configurations: z.array(
							z.object({
								integrationId: z.string(),
								configurationId: z.string(),
								integrationSlug: z.string(),
								integrationName: z.string().optional(),
							}),
						),
						ownerId: z.string(),
					})
					.strict(),
				z
					.object({
						integrationId: z.string(),
						configurationId: z.string(),
						integrationSlug: z.string(),
						integrationName: z.string(),
						ownerId: z.string(),
						billingPlanId: z.string(),
						billingPlanName: z.string().optional(),
					})
					.strict(),
				z
					.object({
						integrationId: z.string(),
						configurationId: z.string(),
						integrationSlug: z.string(),
						integrationName: z.string(),
						ownerId: z.string(),
						projectIds: z.union([z.array(z.string()), z.enum(["all"])]).optional(),
					})
					.strict(),
				z
					.object({
						resourceId: z.string(),
						integrationId: z.string(),
						integrationSlug: z.string(),
						integrationProductSlug: z.string(),
						configurationId: z.string(),
						databaseName: z.string(),
						queryType: z.enum(["data-edit", "data-view", "schema", "user"]),
						readonly: z.union([z.literal(false), z.literal(true)]),
						rolledBack: z.union([z.literal(false), z.literal(true)]),
						failedQueryIndex: z.number().nullable(),
						errorCode: z.string().nullable(),
						queryCount: z.number(),
						queries: z.array(
							z.object({
								command: z.string().nullable(),
								rowCount: z.number().optional(),
								tables: z.array(z.string()).optional(),
								primaryKey: z
									.array(
										z.object({
											column: z.string(),
											value: z.string().nullable(),
										}),
									)
									.optional(),
							}),
						),
					})
					.strict(),
				z
					.object({
						integrationId: z.string(),
						integrationSlug: z.string(),
						integrationName: z.string(),
					})
					.strict(),
				z
					.object({
						logDrainUrl: z.string().nullable(),
						integrationName: z.string().optional(),
					})
					.strict(),
				z
					.object({
						logDrainUrl: z.string(),
						integrationName: z.string().optional(),
					})
					.strict(),
				z
					.object({
						userAgent: z.string().optional(),
						geolocation: z
							.object({
								city: z
									.object({
										names: z.object({
											en: z.string(),
										}),
									})
									.optional(),
								country: z.object({
									names: z.object({
										en: z.string(),
									}),
								}),
								mostSpecificSubdivision: z
									.object({
										names: z.object({
											en: z.string(),
										}),
									})
									.optional(),
								regionName: z.string().optional(),
							})
							.nullish(),
						env: z.string().optional(),
						os: z.string().optional(),
						username: z.string().optional(),
						ssoType: z.string().optional(),
						factors: z
							.union([
								z
									.array(
										z
											.object({
												origin: z.enum([
													"apple",
													"bitbucket",
													"chatgpt",
													"email",
													"github",
													"gitlab",
													"google",
													"invite",
													"magic-link",
													"otp",
													"otp-link",
													"saml",
													"webauthn",
												]),
												username: z.string().optional(),
												teamId: z.string().optional(),
												legacy: z.union([z.literal(false), z.literal(true)]).optional(),
												ssoType: z.string().optional(),
											})
											.strict(),
									)
									.min(1)
									.max(1),
								z
									.array(
										z.union([
											z
												.object({
													origin: z.enum([
														"apple",
														"bitbucket",
														"chatgpt",
														"email",
														"github",
														"gitlab",
														"google",
														"invite",
														"magic-link",
														"otp",
														"otp-link",
														"saml",
														"webauthn",
													]),
													username: z.string().optional(),
													teamId: z.string().optional(),
													legacy: z.union([z.literal(false), z.literal(true)]).optional(),
													ssoType: z.string().optional(),
												})
												.strict(),
											z
												.object({
													origin: z.enum(["recovery-code", "totp", "webauthn"]),
												})
												.strict(),
										]),
									)
									.min(2)
									.max(2),
							])
							.optional(),
						viaOTP: z.union([z.literal(false), z.literal(true)]).optional(),
						viaGithub: z.union([z.literal(false), z.literal(true)]).optional(),
						viaGitlab: z.union([z.literal(false), z.literal(true)]).optional(),
						viaBitbucket: z.union([z.literal(false), z.literal(true)]).optional(),
						viaGoogle: z.union([z.literal(false), z.literal(true)]).optional(),
						viaApple: z.union([z.literal(false), z.literal(true)]).optional(),
						viaSamlSso: z.union([z.literal(false), z.literal(true)]).optional(),
						viaPasskey: z.union([z.literal(false), z.literal(true)]).optional(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						toDeploymentId: z.string(),
						projectName: z.string(),
					})
					.strict(),
				z
					.object({
						enabled: z.union([z.literal(false), z.literal(true)]),
						allowedIntegrationCount: z.number().optional(),
						allowedIntegrationIds: z.array(z.string()).optional(),
					})
					.strict(),
				z
					.object({
						id: z.string(),
						slug: z.string(),
						name: z.string(),
					})
					.strict(),
				z
					.object({
						id: z.string(),
						slug: z.string().optional(),
						name: z.string().optional(),
						fallbackEnvironment: z.string().optional(),
						prev: z.object({
							name: z.string(),
							slug: z.string(),
							fallbackEnvironment: z.string(),
						}),
					})
					.strict(),
				z
					.object({
						project: z.object({
							id: z.string(),
							name: z.string(),
						}),
						group: z.object({
							id: z.string(),
							slug: z.string(),
							name: z.string(),
						}),
					})
					.strict(),
				z
					.object({
						project: z.object({
							id: z.string(),
							name: z.string(),
							microfrontends: z
								.union([
									z
										.object({
											isDefaultApp: z.literal(true),
											updatedAt: z
												.number()
												.describe("Timestamp when the microfrontends settings were last updated."),
											groupIds: z
												.array(z.string())
												.min(1)
												.describe(
													"The group IDs of microfrontends that this project belongs to. Each microfrontend project must belong to a microfrontends group that is the set of microfrontends that are used together.",
												),
											enabled: z
												.literal(true)
												.describe("Whether microfrontends are enabled for this project."),
											defaultRoute: z
												.string()
												.optional()
												.describe(
													"A path that is used to take screenshots and as the default path in preview links when a domain for this microfrontend is shown in the UI. Includes the leading slash, e.g. `/docs`",
												),
											freeProjectForLegacyLimits: z
												.union([z.literal(false), z.literal(true)])
												.optional()
												.describe(
													"Whether the project was part of the legacy limits for hobby and pro-trial before billing was added. This field is only set when the team is upgraded to a paid plan and we are backfilling the subscription status. We cap the subscription to 2 projects and set this field for the 3rd project. When this field is set, the project is not charged for and we do not call any billing APIs for this project.",
												),
										})
										.strict(),
									z
										.object({
											isDefaultApp: z.literal(false).optional(),
											routeObservabilityToThisProject: z
												.union([z.literal(false), z.literal(true)])
												.optional()
												.describe(
													"Whether observability data should be routed to this microfrontend project or a root project.",
												),
											doNotRouteWithMicrofrontendsRouting: z
												.union([z.literal(false), z.literal(true)])
												.optional()
												.describe(
													"Whether to add microfrontends routing to aliases. This means domains in this project will route as a microfrontend.",
												),
											updatedAt: z
												.number()
												.describe("Timestamp when the microfrontends settings were last updated."),
											groupIds: z
												.array(z.string())
												.min(1)
												.describe(
													"The group IDs of microfrontends that this project belongs to. Each microfrontend project must belong to a microfrontends group that is the set of microfrontends that are used together.",
												),
											enabled: z
												.literal(true)
												.describe("Whether microfrontends are enabled for this project."),
											defaultRoute: z
												.string()
												.optional()
												.describe(
													"A path that is used to take screenshots and as the default path in preview links when a domain for this microfrontend is shown in the UI. Includes the leading slash, e.g. `/docs`",
												),
											freeProjectForLegacyLimits: z
												.union([z.literal(false), z.literal(true)])
												.optional()
												.describe(
													"Whether the project was part of the legacy limits for hobby and pro-trial before billing was added. This field is only set when the team is upgraded to a paid plan and we are backfilling the subscription status. We cap the subscription to 2 projects and set this field for the 3rd project. When this field is set, the project is not charged for and we do not call any billing APIs for this project.",
												),
										})
										.strict(),
									z
										.object({
											updatedAt: z.number(),
											groupIds: z
												.array(z.union([z.string(), z.string()]))
												.min(2)
												.max(2),
											enabled: z.literal(false),
											freeProjectForLegacyLimits: z
												.union([z.literal(false), z.literal(true)])
												.optional(),
										})
										.strict(),
								])
								.optional(),
						}),
						prev: z.object({
							project: z.object({
								microfrontends: z
									.union([
										z
											.object({
												isDefaultApp: z.literal(true),
												updatedAt: z
													.number()
													.describe(
														"Timestamp when the microfrontends settings were last updated.",
													),
												groupIds: z
													.array(z.string())
													.min(1)
													.describe(
														"The group IDs of microfrontends that this project belongs to. Each microfrontend project must belong to a microfrontends group that is the set of microfrontends that are used together.",
													),
												enabled: z
													.literal(true)
													.describe("Whether microfrontends are enabled for this project."),
												defaultRoute: z
													.string()
													.optional()
													.describe(
														"A path that is used to take screenshots and as the default path in preview links when a domain for this microfrontend is shown in the UI. Includes the leading slash, e.g. `/docs`",
													),
												freeProjectForLegacyLimits: z
													.union([z.literal(false), z.literal(true)])
													.optional()
													.describe(
														"Whether the project was part of the legacy limits for hobby and pro-trial before billing was added. This field is only set when the team is upgraded to a paid plan and we are backfilling the subscription status. We cap the subscription to 2 projects and set this field for the 3rd project. When this field is set, the project is not charged for and we do not call any billing APIs for this project.",
													),
											})
											.strict(),
										z
											.object({
												isDefaultApp: z.literal(false).optional(),
												routeObservabilityToThisProject: z
													.union([z.literal(false), z.literal(true)])
													.optional()
													.describe(
														"Whether observability data should be routed to this microfrontend project or a root project.",
													),
												doNotRouteWithMicrofrontendsRouting: z
													.union([z.literal(false), z.literal(true)])
													.optional()
													.describe(
														"Whether to add microfrontends routing to aliases. This means domains in this project will route as a microfrontend.",
													),
												updatedAt: z
													.number()
													.describe(
														"Timestamp when the microfrontends settings were last updated.",
													),
												groupIds: z
													.array(z.string())
													.min(1)
													.describe(
														"The group IDs of microfrontends that this project belongs to. Each microfrontend project must belong to a microfrontends group that is the set of microfrontends that are used together.",
													),
												enabled: z
													.literal(true)
													.describe("Whether microfrontends are enabled for this project."),
												defaultRoute: z
													.string()
													.optional()
													.describe(
														"A path that is used to take screenshots and as the default path in preview links when a domain for this microfrontend is shown in the UI. Includes the leading slash, e.g. `/docs`",
													),
												freeProjectForLegacyLimits: z
													.union([z.literal(false), z.literal(true)])
													.optional()
													.describe(
														"Whether the project was part of the legacy limits for hobby and pro-trial before billing was added. This field is only set when the team is upgraded to a paid plan and we are backfilling the subscription status. We cap the subscription to 2 projects and set this field for the 3rd project. When this field is set, the project is not charged for and we do not call any billing APIs for this project.",
													),
											})
											.strict(),
										z
											.object({
												updatedAt: z.number(),
												groupIds: z
													.array(z.union([z.string(), z.string()]))
													.min(2)
													.max(2),
												enabled: z.literal(false),
												freeProjectForLegacyLimits: z
													.union([z.literal(false), z.literal(true)])
													.optional(),
											})
											.strict(),
									])
									.optional(),
							}),
						}),
						group: z.object({
							id: z.string(),
							slug: z.string(),
							name: z.string(),
						}),
					})
					.strict(),
				z
					.object({
						alertId: z.string(),
						alertName: z.string(),
					})
					.strict(),
				z
					.object({
						projectId: z.string().optional(),
						projectName: z.string(),
					})
					.strict(),
				z
					.object({
						organizationId: z.string(),
						teamId: z.string(),
						billingPlan: z.enum(["enterprise", "platform"]),
					})
					.strict(),
				z
					.object({
						ownerId: z.string(),
						source: z.string(),
						cause: z.string(),
						blockReason: z.string().optional(),
						siftRoute: z
							.object({
								name: z.string(),
							})
							.optional(),
					})
					.strict(),
				z
					.object({
						ownerId: z.string(),
						source: z.string(),
						cause: z.string(),
						reason: z.string().nullish(),
					})
					.strict(),
				z
					.object({
						ownerId: z.string(),
						source: z.string(),
						cause: z.string(),
						blockReason: z.string().optional(),
					})
					.strict(),
				z
					.object({
						ownerId: z.string(),
						source: z.string(),
						cause: z.string(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						previous: z
							.object({
								enabled: z.union([z.literal(false), z.literal(true)]),
								mode: z.string(),
								enforcePercentage: z.number(),
								newResourceBlockingPolicy: z.enum(["allow", "block"]),
								allowUnsafeScriptSrcKeywords: z.union([z.literal(false), z.literal(true)]),
							})
							.nullable(),
						next: z.object({
							enabled: z.union([z.literal(false), z.literal(true)]),
							mode: z.string(),
							enforcePercentage: z.number(),
							newResourceBlockingPolicy: z.enum(["allow", "block"]),
							allowUnsafeScriptSrcKeywords: z.union([z.literal(false), z.literal(true)]),
						}),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						headerName: z.string(),
						previousStatus: z.string(),
						justification: z.string(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						headerName: z.string(),
						previousStatus: z.string(),
						justification: z.string().nullable(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						deletedCount: z.number(),
						scriptCount: z.number(),
						connectSrcCount: z.number(),
						connectSrcOriginCount: z.number(),
						headerCount: z.number(),
						connectSrcUserNormalizationRuleCount: z.number().optional(),
						connectSrcNormalizationRulesCleared: z
							.union([z.literal(false), z.literal(true)])
							.optional(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						url: z.string(),
						previousStatus: z.string(),
						justification: z.string(),
						kind: z.enum(["connectSrc", "script"]).optional(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						type: z.enum(["script"]),
						resourceUrl: z.string(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						type: z.enum(["header"]),
						headerName: z.string(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						type: z.enum(["connectSrc"]),
						resourceUrl: z.string(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						url: z.string().optional(),
						headerName: z.string().optional(),
						previousStatus: z.string(),
						justification: z.string().nullable(),
						kind: z.enum(["connectSrc", "script"]).optional(),
					})
					.strict(),
				z
					.object({
						oldName: z.string(),
						newName: z.string(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						previous: z.object({
							passport: z
								.object({
									connectorId: z.string(),
									deploymentType: z.enum([
										"all",
										"all_except_custom_domains",
										"preview",
										"prod_deployment_urls_and_all_previews",
									]),
								})
								.nullish(),
						}),
						next: z.object({
							passport: z
								.object({
									connectorId: z.string(),
									deploymentType: z.enum([
										"all",
										"all_except_custom_domains",
										"preview",
										"prod_deployment_urls_and_all_previews",
									]),
								})
								.nullish(),
						}),
					})
					.strict(),
				z
					.object({
						previous: z.object({
							passport: z
								.object({
									connectorId: z.string(),
									deploymentType: z.enum([
										"all",
										"all_except_custom_domains",
										"preview",
										"prod_deployment_urls_and_all_previews",
									]),
								})
								.nullish(),
						}),
						next: z.object({
							passport: z
								.object({
									connectorId: z.string(),
									deploymentType: z.enum([
										"all",
										"all_except_custom_domains",
										"preview",
										"prod_deployment_urls_and_all_previews",
									]),
								})
								.nullish(),
						}),
					})
					.strict(),
				z
					.object({
						plan: z.string(),
						removedUsers: z
							.object({})
							.catchall(
								z.object({
									role: z.enum([
										"BILLING",
										"CONTRIBUTOR",
										"DEVELOPER",
										"MEMBER",
										"OWNER",
										"SECURITY",
										"VIEWER",
										"VIEWER_FOR_PLUS",
									]),
									confirmed: z.union([z.literal(false), z.literal(true)]),
									confirmedAt: z.number().optional(),
									joinedFrom: z
										.object({
											origin: z.enum([
												"account-update",
												"bitbucket",
												"dsync",
												"feedback",
												"github",
												"gitlab",
												"import",
												"link",
												"mail",
												"nsnb-auto-approve",
												"nsnb-hobby-upgrade",
												"nsnb-invite",
												"nsnb-redeploy",
												"nsnb-redeploy-attribution-card",
												"nsnb-request-access",
												"nsnb-viewer-upgrade",
												"organization-teams",
												"saml",
												"teams",
											]),
											commitId: z.string().optional(),
											repoId: z.string().optional(),
											repoPath: z.string().optional(),
											gitUserId: z.union([z.string(), z.number()]).optional(),
											gitUserLogin: z.string().optional(),
											ssoUserId: z.string().optional(),
											ssoConnectedAt: z.number().optional(),
											idpUserId: z.string().optional(),
											dsyncUserId: z.string().optional(),
											dsyncConnectedAt: z.number().optional(),
										})
										.optional(),
								}),
							)
							.optional(),
						prevPlan: z.string().optional(),
						priorPlan: z.string().optional(),
						isDowngrade: z.union([z.literal(false), z.literal(true)]).optional(),
						userAgent: z.string().optional(),
						isReactivate: z.union([z.literal(false), z.literal(true)]).optional(),
						isTrialUpgrade: z.union([z.literal(false), z.literal(true)]).optional(),
						automated: z
							.union([z.literal(false), z.literal(true)])
							.optional()
							.describe(
								"Whether the plan change was system-initiated rather than human-initiated.",
							),
						reason: z
							.string()
							.optional()
							.describe(
								"Why the plan changed. For downgrades, this is a {@link DowngradeReason} from `@api/pubsub-types` (e.g. `user_downgrade`, `trial_expired`).",
							),
						timestamp: z.number().optional(),
						removedMemberCount: z.number().optional(),
					})
					.strict(),
				z
					.object({
						price: z.number().optional(),
						currency: z.string().optional(),
						enabled: z.union([z.literal(false), z.literal(true)]).optional(),
					})
					.strict(),
				z
					.object({
						previewDeploymentSuffix: z.string().nullish(),
						previousPreviewDeploymentSuffix: z.string().nullish(),
					})
					.strict(),
				z
					.object({
						endpoint: z.object({
							id: z.string(),
							name: z.string(),
							projectId: z.string(),
							vercelRegion: z.string(),
							awsServiceName: z.string(),
							privateDnsNames: z.array(z.string()).optional(),
						}),
					})
					.strict(),
				z
					.object({
						privateLinkEndpoint: z.object({
							id: z.string(),
							name: z.string(),
						}),
						projectId: z.string(),
					})
					.strict(),
				z
					.object({
						prev: z.object({
							id: z.string(),
							name: z.string(),
							projectId: z.string(),
							vercelRegion: z.string(),
							awsServiceName: z.string(),
							privateDnsNames: z.array(z.string()).optional(),
						}),
						current: z.object({
							id: z.string(),
							name: z.string(),
							projectId: z.string(),
							vercelRegion: z.string(),
							awsServiceName: z.string(),
							privateDnsNames: z.array(z.string()).optional(),
						}),
					})
					.strict(),
				z
					.object({
						privateLinkEndpoint: z.object({
							id: z.string(),
							name: z.string(),
							environmentIds: z.array(z.string()).optional(),
							privateDnsNames: z.array(z.string()).optional(),
						}),
						projectId: z.string(),
						previousEndpoint: z.object({
							name: z.string(),
							environmentIds: z.array(z.string()).optional(),
							privateDnsNames: z.array(z.string()).optional(),
						}),
					})
					.strict(),
				z
					.object({
						projectId: z.string().optional(),
						projectName: z.string(),
						branch: z.string(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						directoryListing: z.union([z.literal(false), z.literal(true)]),
					})
					.strict(),
				z
					.object({
						projectName: z.string().optional(),
						projectId: z.string(),
						projectAnalytics: z
							.object({
								id: z.string(),
								canceledAt: z.number().nullish(),
								disabledAt: z.number(),
								enabledAt: z.number(),
								paidAt: z.number().optional(),
								sampleRatePercent: z.number().nullish(),
								spendLimitInDollars: z.number().nullish(),
							})
							.nullable(),
						prevProjectAnalytics: z
							.object({
								id: z.string(),
								canceledAt: z.number().nullish(),
								disabledAt: z.number(),
								enabledAt: z.number(),
								paidAt: z.number().optional(),
								sampleRatePercent: z.number().nullish(),
								spendLimitInDollars: z.number().nullish(),
							})
							.nullable(),
					})
					.strict(),
				z
					.object({
						projectName: z.string().optional(),
						projectId: z.string(),
						projectAnalytics: z.object({}).catchall(z.unknown()).optional(),
						prevProjectAnalytics: z.object({}).catchall(z.unknown()).nullish(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						action: z.enum(["disabled", "enabled", "regenerated", "updated"]),
						isEnvVar: z.union([z.literal(false), z.literal(true)]).optional(),
						note: z.string().optional(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						avatar: z.string().nullish(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						enableAffectedProjectsDeployments: z.union([z.literal(false), z.literal(true)]),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						enableExternalRewriteCaching: z.union([z.literal(false), z.literal(true)]),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						previous: z.object({}),
						next: z.object({}),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						productionDeploymentsFastLane: z.union([z.literal(false), z.literal(true)]),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						sourceFilesOutsideRootDirectory: z.union([z.literal(false), z.literal(true)]),
					})
					.strict(),
				z
					.object({
						projectId: z.string().optional(),
						projectName: z.string(),
						previousBuildMachineType: z.string().optional(),
						nextBuildMachineType: z.string(),
						previousBuildMachineSelection: z.string(),
						nextBuildMachineSelection: z.string(),
						isSystemInitiated: z.union([z.literal(false), z.literal(true)]).optional(),
					})
					.strict(),
				z
					.object({
						projectId: z.string().optional(),
						projectName: z.string().optional(),
						certId: z.string().optional(),
						origin: z.string().optional(),
					})
					.strict(),
				z
					.object({
						projectId: z.string().optional(),
						projectName: z.string().optional(),
						target: z.array(z.string()).optional(),
						updated: z.union([z.literal(false), z.literal(true)]).optional(),
					})
					.strict(),
				z
					.object({
						team: z.object({
							id: z.string(),
							name: z.string(),
						}),
						project: z.object({
							id: z.string(),
							name: z.string().optional(),
							oldConnectConfigurations: z
								.array(
									z.object({
										envId: z.string(),
										connectConfigurationId: z.string(),
										dc: z.string().optional(),
										passive: z.union([z.literal(false), z.literal(true)]),
										buildsEnabled: z.union([z.literal(false), z.literal(true)]),
										aws: z
											.object({
												subnetIds: z.array(z.string()),
												securityGroupId: z.string().optional(),
											})
											.optional(),
										createdAt: z.number(),
										updatedAt: z.number(),
									}),
								)
								.nullable(),
							newConnectConfigurations: z
								.array(
									z.object({
										envId: z.string(),
										connectConfigurationId: z.string(),
										dc: z.string().optional(),
										passive: z.union([z.literal(false), z.literal(true)]),
										buildsEnabled: z.union([z.literal(false), z.literal(true)]),
										aws: z
											.object({
												subnetIds: z.array(z.string()),
												securityGroupId: z.string().optional(),
											})
											.optional(),
										createdAt: z.number(),
										updatedAt: z.number(),
									}),
								)
								.nullable(),
						}),
					})
					.strict(),
				z
					.object({
						projectName: z.string().optional(),
						projectId: z.string(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						action: z.enum(["disabled", "enabled"]),
					})
					.strict(),
				z
					.object({
						name: z.string(),
						ownerId: z.string(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						elasticConcurrencyEnabled: z.union([z.literal(false), z.literal(true)]),
						oldElasticConcurrencyEnabled: z.union([z.literal(false), z.literal(true)]),
						buildQueueConfiguration: z
							.enum(["SKIP_NAMESPACE_QUEUE", "WAIT_FOR_NAMESPACE_QUEUE"])
							.optional(),
						oldBuildQueueConfiguration: z
							.enum(["SKIP_NAMESPACE_QUEUE", "WAIT_FOR_NAMESPACE_QUEUE"])
							.optional(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						autoAssignCustomDomains: z.union([z.literal(false), z.literal(true)]),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						previewDeploymentsEnabled: z.union([z.literal(false), z.literal(true)]),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						customEnvironmentId: z.string(),
						customEnvironmentSlug: z.string(),
						previous: z.object({
							branchMatcher: z
								.object({
									type: z
										.enum(["endsWith", "equals", "startsWith"])
										.describe("The type of matching to perform"),
									pattern: z.string().describe("The pattern to match against branch names"),
								})
								.optional(),
						}),
						next: z.object({
							branchMatcher: z
								.object({
									type: z
										.enum(["endsWith", "equals", "startsWith"])
										.describe("The type of matching to perform"),
									pattern: z.string().describe("The pattern to match against branch names"),
								})
								.optional(),
						}),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						customEnvironmentId: z.string(),
						customEnvironmentSlug: z.string(),
					})
					.strict(),
				z
					.object({
						projectName: z.string().optional(),
						projectId: z.string(),
						enableFunctionsBeta: z.union([z.literal(false), z.literal(true)]),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						previous: z.object({
							functionDefaultTimeout: z.number().nullable(),
						}),
						next: z.object({
							functionDefaultTimeout: z.number(),
						}),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						previous: z.object({
							functionDefaultMemoryType: z.string().nullable(),
						}),
						next: z.object({
							functionDefaultMemoryType: z.string(),
						}),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						previous: z.object({
							functionDefaultRegions: z.array(z.string()).nullable(),
						}),
						next: z.object({
							functionDefaultRegions: z.array(z.string()),
						}),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						previous: z.object({
							functionZeroConfigFailover: z.union([z.literal(false), z.literal(true)]).nullable(),
						}),
						next: z.object({
							functionZeroConfigFailover: z.union([z.literal(false), z.literal(true)]),
						}),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						previewDeploymentSuffix: z.string().nullable(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						newProjectName: z.string(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						previous: z
							.object({
								gitProvider: z.enum([
									"bitbucket",
									"github",
									"github-custom-host",
									"github-limited",
									"gitlab",
									"vercel",
								]),
								gitRepoId: z.string(),
								gitRepositoryName: z.string(),
							})
							.optional(),
						next: z.object({
							gitProvider: z.enum([
								"bitbucket",
								"github",
								"github-custom-host",
								"github-limited",
								"gitlab",
								"vercel",
							]),
							gitRepoId: z.string(),
							gitRepositoryName: z.string(),
						}),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						gitProvider: z.enum([
							"bitbucket",
							"github",
							"github-custom-host",
							"github-limited",
							"gitlab",
							"vercel",
						]),
						gitRepoId: z.string(),
						gitRepositoryName: z.string(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						onPullRequest: z.union([z.literal(false), z.literal(true)]),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						onCommit: z.union([z.literal(false), z.literal(true)]),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						disableRepositoryDispatchEvents: z.union([z.literal(false), z.literal(true)]),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						createDeployments: z.enum(["disabled", "enabled"]),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						requireVerifiedCommits: z.union([z.literal(false), z.literal(true)]).nullable(),
					})
					.strict(),
				z
					.object({
						requireVerifiedCommits: z.union([z.literal(false), z.literal(true)]),
					})
					.strict(),
				z
					.object({
						disableRepositoryDispatchEvents: z.union([z.literal(false), z.literal(true)]),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						gitCommitStatus: z.union([z.literal(false), z.literal(true)]),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						gitLFS: z.union([z.literal(false), z.literal(true)]),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						consolidatedGitCommitStatus: z
							.object({
								enabled: z.union([z.literal(false), z.literal(true)]),
								propagateFailures: z.union([z.literal(false), z.literal(true)]),
							})
							.nullable(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						previous: z.object({
							commandForIgnoringBuildStep: z.string().optional(),
						}),
						next: z.object({
							commandForIgnoringBuildStep: z.string().optional(),
						}),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						domain: z.string(),
						target: z.string(),
						redirect: z.string().nullable(),
						redirectStatusCode: z.number().nullable(),
						gitBranch: z.string().nullable(),
						configuredBy: z.string().optional(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						domain: z.string(),
						target: z.string(),
						redirect: z.string().nullish(),
						redirectStatusCode: z.number().nullish(),
					})
					.strict(),
				z
					.object({
						oldProjectId: z.string(),
						oldProjectName: z.string(),
						newProjectId: z.string(),
						newProjectName: z.string(),
						domain: z.string(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						domain: z.string(),
						redirect: z.string().nullish(),
						redirectStatusCode: z.number().nullish(),
					})
					.strict(),
				z
					.object({
						projects: z.array(
							z.object({
								projectId: z.string(),
								role: z.enum(["ADMIN", "PROJECT_DEVELOPER", "PROJECT_GUEST", "PROJECT_VIEWER"]),
								membershipCreatedAt: z.number(),
							}),
						),
						teamMembership: z
							.object({
								uid: z.string(),
								username: z.string().optional(),
							})
							.optional(),
						directoryType: z.string().optional(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						target: z.string(),
						domain: z.string(),
						configuredBy: z.string().nullish(),
						prevConfiguredBy: z.string().nullish(),
					})
					.strict(),
				z
					.object({
						project: z.object({
							name: z.string(),
							id: z.string().optional(),
						}),
						projectMembership: z
							.object({
								role: z.enum(["ADMIN", "PROJECT_DEVELOPER", "PROJECT_GUEST", "PROJECT_VIEWER"]),
								uid: z.string(),
								createdAt: z.number(),
								username: z.string().optional(),
							})
							.nullable(),
					})
					.strict(),
				z
					.object({
						project: z.object({
							name: z.string(),
							role: z.enum(["ADMIN", "PROJECT_DEVELOPER", "PROJECT_GUEST", "PROJECT_VIEWER"]),
							invitedUserName: z.string(),
							id: z.string().optional(),
							invitedUserId: z.string().optional(),
						}),
					})
					.strict(),
				z
					.object({
						project: z.object({
							name: z.string(),
							id: z.string().optional(),
						}),
						removedMembership: z.object({
							role: z.enum(["ADMIN", "PROJECT_DEVELOPER", "PROJECT_GUEST", "PROJECT_VIEWER"]),
							uid: z.string(),
							createdAt: z.number(),
							username: z.string().optional(),
						}),
					})
					.strict(),
				z
					.object({
						project: z.object({
							id: z.string(),
							name: z.string(),
						}),
						projectMembership: z.object({
							role: z
								.enum(["ADMIN", "PROJECT_DEVELOPER", "PROJECT_GUEST", "PROJECT_VIEWER"])
								.optional(),
							uid: z.string().optional(),
							createdAt: z.number().optional(),
							username: z.string().optional(),
							previousRole: z
								.enum(["ADMIN", "PROJECT_DEVELOPER", "PROJECT_GUEST", "PROJECT_VIEWER"])
								.optional(),
						}),
					})
					.strict(),
				z
					.object({
						previousProjectId: z.string().optional(),
						newProjectId: z.string().optional(),
						previousProjectName: z.string(),
						newProjectName: z.string(),
						originAccountName: z.string(),
						transferId: z.string().optional(),
					})
					.strict(),
				z
					.object({
						previousProjectId: z.string().optional(),
						projectName: z.string(),
						destinationAccountName: z.string().nullable(),
						transferId: z.string().optional(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						originAccountName: z.string(),
						destinationAccountName: z.string(),
						destinationAccountId: z.string(),
						transferId: z.string().optional(),
					})
					.strict(),
				z
					.object({
						previousProjectId: z.string().optional(),
						newProjectId: z.string().optional(),
						previousProjectName: z.string(),
						newProjectName: z.string(),
						destinationAccountName: z.string(),
						transferId: z.string().optional(),
					})
					.strict(),
				z
					.object({
						source: z.string(),
						projectId: z.string(),
						projectName: z.string(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						optionsAllowlist: z
							.object({
								paths: z.array(
									z.object({
										value: z.string(),
									}),
								),
							})
							.nullish(),
						oldOptionsAllowlist: z
							.object({
								paths: z.array(
									z.object({
										value: z.string(),
									}),
								),
							})
							.nullish(),
					})
					.strict(),
				z
					.object({
						projectId: z.string().optional(),
						projectName: z.string().optional(),
						passwordProtection: z
							.union([
								z
									.object({
										deploymentType: z.enum([
											"all",
											"all_except_custom_domains",
											"preview",
											"prod_deployment_urls_and_all_previews",
										]),
									})
									.strict(),
								z.enum([
									"all",
									"all_except_custom_domains",
									"preview",
									"prod_deployment_urls_and_all_previews",
								]),
							])
							.nullable(),
						oldPasswordProtection: z
							.union([
								z
									.object({
										deploymentType: z.enum([
											"all",
											"all_except_custom_domains",
											"preview",
											"prod_deployment_urls_and_all_previews",
										]),
									})
									.strict(),
								z.enum([
									"all",
									"all_except_custom_domains",
									"preview",
									"prod_deployment_urls_and_all_previews",
								]),
							])
							.nullable(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						expiresAt: z.number(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						reasonCode: z.enum(["BACKOFFICE", "BUDGET_REACHED", "PUBLIC_API"]).optional(),
					})
					.strict(),
				z
					.object({
						projectId: z.string().optional(),
						projectName: z.string(),
						consent: z.enum(["granted", "refused"]),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						projectAccountId: z.string(),
						deploymentId: z.string(),
						rollbackDescription: z
							.object({
								userId: z.string().describe("The user who rolled back the project."),
								username: z
									.string()
									.describe("The username of the user who rolled back the project."),
								description: z
									.string()
									.describe(
										"User-supplied explanation of why they rolled back the project. Limited to 250 characters.",
									),
								createdAt: z.number().describe("Timestamp of when the rollback was requested."),
							})
							.optional()
							.describe(
								"Description of why a project was rolled back, and by whom. Note that lastAliasRequest contains the from/to details of the rollback.",
							),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						targetDeploymentId: z.string().optional(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						targetDeploymentId: z.string().optional(),
						newTargetPercentage: z.number().optional(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						targetDeploymentId: z.string().optional(),
						action: z.string().optional(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						previous: z.object({}).nullable(),
						next: z.object({}).nullable(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						previous: z.object({
							issuerMode: z.enum(["global", "team"]).optional(),
						}),
						next: z.object({
							issuerMode: z.enum(["global", "team"]),
						}),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						customerSupportCodeVisibility: z.union([z.literal(false), z.literal(true)]),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						gitForkProtection: z.union([z.literal(false), z.literal(true)]),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						protectedSourcemaps: z.union([z.literal(false), z.literal(true)]),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						inheritDeploymentProtection: z.union([z.literal(false), z.literal(true)]),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						publicSource: z.union([z.literal(false), z.literal(true)]),
					})
					.strict(),
				z
					.object({
						projectId: z.string().optional(),
						projectName: z.string().optional(),
						previous: z.object({
							expiration: z.string().optional(),
							expirationProduction: z.string().optional(),
							expirationCanceled: z.string().optional(),
							expirationErrored: z.string().optional(),
						}),
						next: z.object({
							expiration: z.string().optional(),
							expirationProduction: z.string().optional(),
							expirationCanceled: z.string().optional(),
							expirationErrored: z.string().optional(),
						}),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						next: z.object({
							skewProtectionBoundaryAt: z.number(),
						}),
						previous: z.object({
							skewProtectionBoundaryAt: z.number().optional(),
						}),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						next: z.object({
							skewProtectionMaxAge: z.number(),
						}),
						previous: z.object({
							skewProtectionMaxAge: z.number().optional(),
						}),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						next: z.object({
							skewProtectionAllowedDomains: z.array(z.string()),
						}),
						previous: z.object({
							skewProtectionAllowedDomains: z.array(z.string()).optional(),
						}),
					})
					.strict(),
				z
					.object({
						projectId: z.string().optional(),
						projectName: z.string().optional(),
						ssoProtection: z
							.union([
								z
									.object({
										deploymentType: z.enum([
											"all",
											"all_except_custom_domains",
											"preview",
											"prod_deployment_urls_and_all_previews",
										]),
										cve55182MigrationAppliedFrom: z
											.enum([
												"all",
												"all_except_custom_domains",
												"preview",
												"prod_deployment_urls_and_all_previews",
											])
											.nullish(),
										april2026SecurityIncidentMigrationAppliedFrom: z
											.enum([
												"all",
												"all_except_custom_domains",
												"preview",
												"prod_deployment_urls_and_all_previews",
											])
											.nullish(),
									})
									.strict(),
								z.enum([
									"all",
									"all_except_custom_domains",
									"preview",
									"prod_deployment_urls_and_all_previews",
								]),
							])
							.nullable(),
						oldSsoProtection: z
							.union([
								z
									.object({
										deploymentType: z.enum([
											"all",
											"all_except_custom_domains",
											"preview",
											"prod_deployment_urls_and_all_previews",
										]),
										cve55182MigrationAppliedFrom: z
											.enum([
												"all",
												"all_except_custom_domains",
												"preview",
												"prod_deployment_urls_and_all_previews",
											])
											.nullish(),
										april2026SecurityIncidentMigrationAppliedFrom: z
											.enum([
												"all",
												"all_except_custom_domains",
												"preview",
												"prod_deployment_urls_and_all_previews",
											])
											.nullish(),
									})
									.strict(),
								z.enum([
									"all",
									"all_except_custom_domains",
									"preview",
									"prod_deployment_urls_and_all_previews",
								]),
							])
							.nullable(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						next: z.object({
							project: z.object({
								id: z.string().optional(),
								staticIps: z.object({
									builds: z.union([z.literal(false), z.literal(true)]).optional(),
									enabled: z.union([z.literal(false), z.literal(true)]),
									regions: z.array(z.string()).optional(),
								}),
							}),
						}),
						previous: z.object({
							project: z.object({
								id: z.string().optional(),
								staticIps: z.object({
									builds: z.union([z.literal(false), z.literal(true)]).optional(),
									enabled: z.union([z.literal(false), z.literal(true)]),
									regions: z.array(z.string()).optional(),
								}),
							}),
						}),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						trustedIps: z
							.enum([
								"all",
								"all_except_custom_domains",
								"preview",
								"prod_deployment_urls_and_all_previews",
								"production",
							])
							.nullish(),
						oldTrustedIps: z
							.enum([
								"all",
								"all_except_custom_domains",
								"preview",
								"prod_deployment_urls_and_all_previews",
								"production",
							])
							.nullish(),
						addedAddresses: z.array(z.string()).nullish(),
						removedAddresses: z.array(z.string()).nullish(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						addedProjects: z.array(
							z.object({
								id: z.string(),
								name: z.string(),
							}),
						),
						removedProjects: z.array(
							z.object({
								id: z.string(),
								name: z.string(),
							}),
						),
						addedProviders: z.array(z.string()),
						removedProviders: z.array(z.string()),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						reasonCode: z.enum(["BACKOFFICE", "PUBLIC_API"]).optional(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						projectWebAnalytics: z
							.object({
								id: z.string(),
								disabledAt: z.number().optional(),
								canceledAt: z.number().optional(),
								enabledAt: z.number().optional(),
								hasData: z.literal(true).optional(),
							})
							.optional(),
						prevProjectWebAnalytics: z
							.object({
								id: z.string(),
								disabledAt: z.number().optional(),
								canceledAt: z.number().optional(),
								enabledAt: z.number().optional(),
								hasData: z.literal(true).optional(),
							})
							.nullish(),
					})
					.strict(),
				z
					.object({
						gitProvider: z.string(),
						gitProviderGroupDescriptor: z.string(),
						gitScope: z.string(),
					})
					.strict(),
				z
					.object({
						alias: z.string(),
						sandboxName: z.string(),
						sandboxId: z.string().optional(),
						projectId: z.string().optional(),
					})
					.strict(),
				z
					.object({
						instances: z.number(),
						url: z.string(),
					})
					.strict(),
				z
					.object({
						email: z.string(),
						verified: z.union([z.literal(false), z.literal(true)]),
					})
					.strict(),
				z
					.object({
						email: z.string(),
					})
					.strict(),
				z
					.object({
						uid: z.string(),
						name: z.union([
							z.string(),
							z
								.object({
									name: z.string(),
								})
								.strict(),
						]),
					})
					.strict(),
				z
					.object({
						oldName: z.string(),
						newName: z.string(),
						uid: z.string().optional(),
					})
					.strict(),
				z
					.object({
						enabled: z.union([z.literal(false), z.literal(true)]),
						updatedAt: z.number(),
						firstEnabledAt: z.number().optional(),
						projectId: z.string().optional(),
						projectName: z.string().optional(),
					})
					.strict(),
				z
					.object({
						bio: z.string(),
					})
					.strict(),
				z
					.object({
						scalingRules: z.object({}).catchall(
							z.object({
								min: z.number(),
								max: z.number(),
							}),
						),
						min: z.number(),
						max: z.number(),
						url: z.string(),
					})
					.strict(),
				z
					.object({
						userAgent: z.string().optional(),
						geolocation: z
							.object({
								city: z
									.object({
										names: z.object({
											en: z.string(),
										}),
									})
									.optional(),
								country: z.object({
									names: z.object({
										en: z.string(),
									}),
								}),
								mostSpecificSubdivision: z
									.object({
										names: z.object({
											en: z.string(),
										}),
									})
									.optional(),
								regionName: z.string().optional(),
							})
							.nullish(),
						env: z.string().optional(),
						os: z.string().optional(),
						username: z.string().optional(),
						ssoType: z.string().optional(),
						factors: z
							.array(
								z
									.object({
										origin: z.enum([
											"apple",
											"bitbucket",
											"chatgpt",
											"email",
											"github",
											"gitlab",
											"google",
											"otp",
											"saml",
										]),
										username: z.string().optional(),
										teamId: z.string().optional(),
										legacy: z.union([z.literal(false), z.literal(true)]).optional(),
										ssoType: z.string().optional(),
									})
									.strict(),
							)
							.min(1)
							.max(1)
							.optional(),
						viaOTP: z.union([z.literal(false), z.literal(true)]).optional(),
						viaGithub: z.union([z.literal(false), z.literal(true)]).optional(),
						viaGitlab: z.union([z.literal(false), z.literal(true)]).optional(),
						viaBitbucket: z.union([z.literal(false), z.literal(true)]).optional(),
						viaGoogle: z.union([z.literal(false), z.literal(true)]).optional(),
						viaApple: z.union([z.literal(false), z.literal(true)]).optional(),
						viaSamlSso: z.union([z.literal(false), z.literal(true)]).optional(),
						viaPasskey: z.union([z.literal(false), z.literal(true)]).optional(),
					})
					.strict(),
				z
					.object({
						email: z.string(),
						bitbucketLogin: z.string(),
						bitbucketEmail: z.string(),
						bitbucketName: z.string(),
						zeitAccount: z.string(),
						zeitAccountType: z.string(),
					})
					.strict(),
				z
					.object({
						email: z.string(),
						githubLogin: z.string(),
						zeitAccount: z.string(),
						zeitAccountType: z.string(),
					})
					.strict(),
				z
					.object({
						email: z.string(),
						gitlabLogin: z.string(),
						gitlabEmail: z.string(),
						gitlabName: z.string(),
						zeitAccount: z.string(),
						zeitAccountType: z.string(),
					})
					.strict(),
				z
					.object({
						projectId: z.string().optional(),
						projectName: z.string().optional(),
						analyticsId: z.string().optional(),
						sampleRatePercent: z.number().nullable(),
						spendLimitInDollars: z.number().nullable(),
						previous: z.object({
							sampleRatePercent: z.number().nullable(),
							spendLimitInDollars: z.number().nullable(),
						}),
					})
					.strict(),
				z
					.object({
						budget: z.object({
							budgetItem: z
								.object({
									type: z.enum(["fixed"]).describe("The budget type"),
									fixedBudget: z.number().describe("Budget amount (USD / dollars)"),
									previousSpend: z
										.array(z.number())
										.describe("Array of the last 3 months of spend data"),
									notifiedAt: z
										.array(z.number())
										.describe("Array of 50, 75, 100 to keep track of notifications sent out"),
									webhookId: z
										.string()
										.optional()
										.describe(
											"Webhook id that corresponds to a webhook in Cosmos webhook collection",
										),
									webhookNotified: z
										.union([z.literal(false), z.literal(true)])
										.optional()
										.describe("Keep track if the webhook has been called for the month"),
									createdAt: z.number().describe("Date time when budget is created"),
									updatedAt: z
										.number()
										.optional()
										.describe("Date time when budget is updated last"),
									isActive: z
										.union([z.literal(false), z.literal(true)])
										.describe("Is the budget currently active for a customer"),
									pauseProjects: z
										.union([z.literal(false), z.literal(true)])
										.optional()
										.describe("Should all projects be paused if budget is exceeded"),
									pricingPlan: z
										.enum(["legacy", "platform", "plus", "unbundled"])
										.optional()
										.describe("The acive pricing plan the team is billed with"),
									teamId: z.string().describe("Partition key"),
									id: z.string().describe("Sort key that needs to be unique per teamId"),
								})
								.describe(
									"Represents a budget for tracking and notifying teams on their spending.",
								),
						}),
					})
					.strict(),
				z
					.object({
						budget: z
							.object({
								type: z.enum(["fixed"]).describe("The budget type"),
								fixedBudget: z.number().describe("Budget amount (USD / dollars)"),
								previousSpend: z
									.array(z.number())
									.describe("Array of the last 3 months of spend data"),
								notifiedAt: z
									.array(z.number())
									.describe("Array of 50, 75, 100 to keep track of notifications sent out"),
								webhookId: z
									.string()
									.optional()
									.describe(
										"Webhook id that corresponds to a webhook in Cosmos webhook collection",
									),
								webhookNotified: z
									.union([z.literal(false), z.literal(true)])
									.optional()
									.describe("Keep track if the webhook has been called for the month"),
								createdAt: z.number().describe("Date time when budget is created"),
								updatedAt: z.number().optional().describe("Date time when budget is updated last"),
								isActive: z
									.union([z.literal(false), z.literal(true)])
									.describe("Is the budget currently active for a customer"),
								pauseProjects: z
									.union([z.literal(false), z.literal(true)])
									.optional()
									.describe("Should all projects be paused if budget is exceeded"),
								pricingPlan: z
									.enum(["legacy", "platform", "plus", "unbundled"])
									.optional()
									.describe("The acive pricing plan the team is billed with"),
								teamId: z.string().describe("Partition key"),
								id: z.string().describe("Sort key that needs to be unique per teamId"),
							})
							.describe("Represents a budget for tracking and notifying teams on their spending."),
					})
					.strict(),
				z
					.object({
						budget: z
							.object({
								type: z.enum(["fixed"]).describe("The budget type"),
								fixedBudget: z.number().describe("Budget amount (USD / dollars)"),
								previousSpend: z
									.array(z.number())
									.describe("Array of the last 3 months of spend data"),
								notifiedAt: z
									.array(z.number())
									.describe("Array of 50, 75, 100 to keep track of notifications sent out"),
								webhookId: z
									.string()
									.optional()
									.describe(
										"Webhook id that corresponds to a webhook in Cosmos webhook collection",
									),
								webhookNotified: z
									.union([z.literal(false), z.literal(true)])
									.optional()
									.describe("Keep track if the webhook has been called for the month"),
								createdAt: z.number().describe("Date time when budget is created"),
								updatedAt: z.number().optional().describe("Date time when budget is updated last"),
								isActive: z
									.union([z.literal(false), z.literal(true)])
									.describe("Is the budget currently active for a customer"),
								pauseProjects: z
									.union([z.literal(false), z.literal(true)])
									.optional()
									.describe("Should all projects be paused if budget is exceeded"),
								pricingPlan: z
									.enum(["legacy", "platform", "plus", "unbundled"])
									.optional()
									.describe("The acive pricing plan the team is billed with"),
								teamId: z.string().describe("Partition key"),
								id: z.string().describe("Sort key that needs to be unique per teamId"),
							})
							.describe("Represents a budget for tracking and notifying teams on their spending."),
						webhookUrl: z.string().optional(),
					})
					.strict(),
				z
					.object({
						webhookUrl: z.string().optional(),
					})
					.strict(),
				z
					.object({
						storeType: z.enum(["postgres", "redis"]),
					})
					.strict(),
				z
					.object({
						transferRequestCode: z.string(),
						store: z.object({
							id: z.string(),
							name: z.string().optional(),
							type: z.enum(["blob", "edge-config", "integration", "postgres", "redis"]),
						}),
					})
					.strict(),
				z
					.object({
						transferRequestCode: z.string(),
						store: z.object({
							id: z.string(),
							name: z.string().optional(),
							type: z.enum(["blob", "edge-config", "integration", "postgres", "redis"]),
						}),
						destinationTeamId: z.string(),
						destinationTeamName: z.string(),
					})
					.strict(),
				z
					.object({
						transferRequestCode: z.string(),
						store: z.object({
							id: z.string(),
							name: z.string().optional(),
							type: z.enum(["blob", "edge-config", "integration", "postgres", "redis"]),
						}),
						originTeamId: z.string(),
						originTeamName: z.string(),
					})
					.strict(),
				z
					.object({
						id: z.string(),
						name: z.string().optional(),
						computeUnitsMax: z.number().optional(),
						computeUnitsMin: z.number().optional(),
						suspendTimeoutSeconds: z.number().optional(),
						type: z.enum(["blob", "edge-config", "integration", "postgres", "redis"]),
						access: z.enum(["private", "public"]).optional(),
					})
					.strict(),
				z
					.object({
						store: z.object({
							name: z.string(),
							id: z.string(),
						}),
						ownerId: z.string().optional(),
					})
					.strict(),
				z
					.object({
						id: z.string(),
						name: z.string().optional(),
						computeUnitsMax: z.number().optional(),
						computeUnitsMin: z.number().optional(),
						suspendTimeoutSeconds: z.number().optional(),
						type: z.enum(["blob", "edge-config", "integration", "postgres", "redis"]),
						access: z.enum(["private", "public"]).optional(),
						locked: z.union([z.literal(false), z.literal(true)]),
					})
					.strict(),
				z
					.object({
						slug: z.string(),
					})
					.strict(),
				z
					.object({
						previous: z
							.object({
								enabled: z
									.union([z.literal(false), z.literal(true)])
									.describe("Whether automatic code reviews are enabled"),
								scope: z
									.enum(["all", "private", "public", "selected_repos"])
									.describe("Which repository visibilities get automatic reviews"),
								includeDrafts: z
									.union([z.literal(false), z.literal(true)])
									.describe("Whether to include draft pull requests in automatic reviews"),
								selectedRepos: z
									.array(z.string())
									.nullish()
									.describe(
										"GitHub repos to scope automatic reviews to. Format: \"owner/repo\" (lowercase). Only used when scope='selected_repos'.",
									),
							})
							.optional()
							.describe("Automatic code review settings"),
						next: z
							.object({
								enabled: z
									.union([z.literal(false), z.literal(true)])
									.describe("Whether automatic code reviews are enabled"),
								scope: z
									.enum(["all", "private", "public", "selected_repos"])
									.describe("Which repository visibilities get automatic reviews"),
								includeDrafts: z
									.union([z.literal(false), z.literal(true)])
									.describe("Whether to include draft pull requests in automatic reviews"),
								selectedRepos: z
									.array(z.string())
									.nullish()
									.describe(
										"GitHub repos to scope automatic reviews to. Format: \"owner/repo\" (lowercase). Only used when scope='selected_repos'.",
									),
							})
							.describe("Automatic code review settings"),
					})
					.strict(),
				z
					.object({
						trialCreditsIssuedAt: z.number(),
						expiresAt: z.string(),
						amount: z.string(),
						currency: z.string(),
					})
					.strict(),
				z
					.object({
						eventId: z.string(),
						sessionId: z.string(),
						sessionKind: z
							.string()
							.describe("Currently emitted session kinds: chat, investigation."),
						surface: z
							.string()
							.describe(
								"Currently emitted surfaces: dashboard, internal, slack, automation, github.",
							),
						occurredAt: z.number(),
					})
					.strict(),
				z
					.object({
						eventId: z.string(),
						sessionId: z.string(),
						sessionKind: z
							.string()
							.describe("Currently emitted session kinds: chat, investigation."),
						surface: z
							.string()
							.describe(
								"Currently emitted surfaces: dashboard, internal, slack, automation, github.",
							),
						occurredAt: z.number(),
						planId: z.string(),
						requestedScopes: z
							.array(z.string())
							.describe("Scopes requested by the model-authored plan."),
						elevatedScopes: z
							.array(z.string())
							.describe("Requested Vercel scopes that are not included in the baseline token."),
						mergedScopes: z
							.array(z.string())
							.describe("Baseline plus elevated Vercel scopes used when minting scoped tokens."),
						githubScopes: z
							.array(z.string())
							.describe(
								"External GitHub scopes requested by the plan; these are not Vercel token scopes.",
							),
						requestedScopeCount: z.number(),
						elevatedScopeCount: z.number(),
						mergedScopeCount: z.number(),
						githubScopeCount: z.number(),
					})
					.strict(),
				z
					.object({
						previous: z.enum(["elastic", "enhanced", "standard", "turbo"]).optional(),
						next: z.enum(["elastic", "enhanced", "standard", "turbo"]).optional(),
					})
					.strict(),
				z
					.object({
						slug: z.string(),
						teamId: z.string(),
						by: z.string(),
						byUid: z.string().optional(),
						reasons: z
							.array(
								z.object({
									slug: z.string(),
									description: z.string(),
								}),
							)
							.optional(),
						removedUsers: z
							.object({})
							.catchall(
								z.object({
									role: z.enum([
										"BILLING",
										"CONTRIBUTOR",
										"DEVELOPER",
										"MEMBER",
										"OWNER",
										"SECURITY",
										"VIEWER",
										"VIEWER_FOR_PLUS",
									]),
									confirmed: z.union([z.literal(false), z.literal(true)]),
									confirmedAt: z.number().optional(),
								}),
							)
							.optional(),
						removedMemberCount: z.number().optional(),
						timestamp: z.number().optional(),
					})
					.strict(),
				z
					.object({
						previous: z.object({}).nullable(),
						next: z.object({}).nullable(),
					})
					.strict(),
				z
					.object({
						personalAccountId: z.string(),
						managedAccountId: z.string(),
					})
					.strict(),
				z
					.object({
						enabled: z.union([z.literal(false), z.literal(true)]),
						domain: z.string().optional(),
					})
					.strict(),
				z
					.object({
						projectId: z.string(),
						projectName: z.string(),
						enabled: z.union([z.literal(false), z.literal(true)]).nullable(),
						environment: z.enum(["preview", "production"]),
					})
					.strict(),
				z
					.object({
						environment: z.enum(["preview", "production"]),
						enabled: z.enum(["default", "default-force", "off", "off-force", "on", "on-force"]),
					})
					.strict(),
				z
					.object({
						emailDomain: z.string().nullish(),
					})
					.strict(),
				z
					.object({
						deletedCount: z.number(),
						inviteIds: z.array(z.string()),
					})
					.strict(),
				z
					.object({
						directoryType: z.string().optional(),
						ssoType: z.string().optional(),
						invitedUser: z
							.object({
								username: z.string(),
								email: z.string(),
							})
							.optional(),
						invitedEmail: z.string().optional(),
						invitationRole: z.string().optional(),
						entitlements: z.array(z.string()).optional(),
						invitedUid: z.string().optional(),
						origin: z.string().optional(),
						teamSlug: z.string().optional(),
					})
					.strict(),
				z
					.object({
						teamName: z.string(),
						username: z.string().optional(),
						gitUsername: z.string().optional(),
						githubUsername: z.string().nullish(),
						gitlabUsername: z.string().nullish(),
						bitbucketUsername: z.string().nullish(),
						updatedUid: z.string().optional(),
						teamId: z.string().optional(),
					})
					.strict(),
				z
					.object({
						teamName: z.string(),
						username: z.string().optional(),
						gitUsername: z.string().nullish(),
						githubUsername: z.string().nullish(),
						gitlabUsername: z.string().nullish(),
						bitbucketUsername: z.string().nullish(),
					})
					.strict(),
				z
					.object({
						deletedUser: z
							.object({
								username: z.string(),
								email: z.string(),
							})
							.optional(),
						deletedUid: z.string().optional(),
						githubUsername: z.string().nullish(),
						gitlabUsername: z.string().nullish(),
						bitbucketUsername: z.string().nullish(),
						directoryType: z.string().optional(),
						role: z
							.enum([
								"BILLING",
								"CONTRIBUTOR",
								"DEVELOPER",
								"MEMBER",
								"OWNER",
								"SECURITY",
								"VIEWER",
								"VIEWER_FOR_PLUS",
							])
							.optional(),
						reason: z
							.string()
							.optional()
							.describe(
								"Why the member was removed. When removed due to a plan downgrade, this is a {@link DowngradeReason} from `@api/pubsub-types` (e.g. `trial_expired`, `user_downgrade`).",
							),
						previousPlan: z.enum(["enterprise", "hobby", "pro"]).optional(),
						newPlan: z.enum(["enterprise", "hobby", "pro"]).optional(),
						automated: z
							.union([z.literal(false), z.literal(true)])
							.optional()
							.describe("Whether the removal was system-initiated rather than human-initiated."),
					})
					.strict(),
				z
					.object({
						entitlement: z.string(),
						user: z.object({
							id: z.string(),
							username: z.string(),
						}),
					})
					.strict(),
				z
					.object({
						entitlement: z.string(),
						user: z.object({
							id: z.string(),
							username: z.string(),
						}),
						previousCanceledAt: z.string().optional(),
					})
					.strict(),
				z
					.object({
						role: z.string().optional(),
						uid: z.string().optional(),
						updatedUid: z.string().optional(),
						updatedUser: z
							.object({
								username: z.string(),
								email: z.string(),
							})
							.optional(),
						origin: z.string().optional(),
						teamSlug: z.string().optional(),
						teamRoles: z.array(z.string()).optional(),
						teamPermissions: z.array(z.string()).optional(),
						entitlements: z.array(z.string()).optional(),
						invitedBy: z
							.object({
								email: z.string(),
								userId: z.string().optional(),
								name: z.string().optional(),
							})
							.optional(),
					})
					.strict(),
				z
					.object({
						requestedTeamName: z.string(),
						requestedTeamSlug: z.string().optional(),
						requestedUserName: z.string().optional(),
						gitUsername: z.string().optional(),
						githubUsername: z.string().optional(),
						gitlabUsername: z.string().optional(),
						bitbucketUsername: z.string().optional(),
						source: z
							.enum([
								"account-update",
								"bitbucket",
								"dsync",
								"feedback",
								"github",
								"gitlab",
								"import",
								"link",
								"mail",
								"nsnb-auto-approve",
								"nsnb-hobby-upgrade",
								"nsnb-invite",
								"nsnb-redeploy",
								"nsnb-redeploy-attribution-card",
								"nsnb-request-access",
								"nsnb-viewer-upgrade",
								"organization-teams",
								"saml",
								"teams",
							])
							.optional(),
					})
					.strict(),
				z
					.object({
						directoryType: z.string().optional(),
						ssoType: z.string().optional(),
						updatedUser: z
							.object({
								username: z.string(),
								email: z.string(),
							})
							.optional(),
						role: z.string().optional(),
						previousRole: z.string(),
						updatedUid: z.string().optional(),
						origin: z.string().optional(),
						teamSlug: z.string().optional(),
					})
					.strict(),
				z
					.object({
						email: z.string().optional(),
						authorized: z.union([z.literal(false), z.literal(true)]),
						reason: z.string().optional(),
					})
					.strict(),
				z
					.object({
						enforced: z.union([z.literal(false), z.literal(true)]),
					})
					.strict(),
				z
					.object({
						publicId: z.string(),
						role: z.string(),
						maxUses: z.number(),
						expiresAt: z.string(),
						name: z.string().optional(),
					})
					.strict(),
				z
					.object({
						publicId: z.string(),
						name: z.string().optional(),
					})
					.strict(),
				z
					.object({
						previousConcurrentBuilds: z.number(),
						nextConcurrentBuilds: z.number(),
					})
					.strict(),
				z
					.object({
						plan: z.enum(["enterprise", "hobby", "pro"]),
						trial: z
							.object({
								start: z.number(),
								end: z.number(),
							})
							.nullish(),
					})
					.strict(),
				z
					.object({
						invoiceId: z.string(),
						convertedFromTrial: z.union([z.literal(false), z.literal(true)]),
						plan: z.enum(["enterprise", "hobby", "pro"]),
					})
					.strict(),
				z
					.object({
						inviteCode: z.string().optional(),
					})
					.strict(),
				z
					.object({
						name: z.string().optional(),
					})
					.strict(),
				z
					.object({
						consent: z.enum(["granted", "refused"]),
					})
					.strict(),
				z
					.object({
						remoteCaching: z
							.object({
								enabled: z.union([z.literal(false), z.literal(true)]).optional(),
							})
							.optional()
							.describe("Represents configuration for remote caching"),
					})
					.strict(),
				z
					.object({
						enabled: z.enum(["default", "off", "on"]),
					})
					.strict(),
				z
					.object({
						enabled: z.union([z.literal(false), z.literal(true)]),
						scope: z.enum(["dashboard", "log-drains"]),
					})
					.strict(),
				z
					.object({
						previous: z
							.object({})
							.catchall(
								z.union([
									z
										.object({
											accessGroupId: z.string(),
										})
										.strict(),
									z.enum([
										"BILLING",
										"CONTRIBUTOR",
										"DEVELOPER",
										"MEMBER",
										"OWNER",
										"SECURITY",
										"VIEWER",
										"VIEWER_FOR_PLUS",
									]),
								]),
							)
							.optional(),
						next: z
							.object({})
							.catchall(
								z.union([
									z
										.object({
											accessGroupId: z.string(),
										})
										.strict(),
									z.enum([
										"BILLING",
										"CONTRIBUTOR",
										"DEVELOPER",
										"MEMBER",
										"OWNER",
										"SECURITY",
										"VIEWER",
										"VIEWER_FOR_PLUS",
									]),
								]),
							)
							.optional(),
					})
					.strict(),
				z
					.object({
						domain: z.string(),
						ips: z.array(z.string()),
					})
					.strict(),
				z
					.object({
						tokenTypes: z.array(z.string()),
					})
					.strict(),
				z
					.object({
						exportId: z.string(),
						from: z.number(),
						to: z.number(),
						format: z.string(),
					})
					.strict(),
				z
					.object({
						fileId: z.string(),
					})
					.strict(),
				z
					.object({
						slug: z.string().optional(),
					})
					.strict(),
				z
					.object({
						provider: z.enum([
							"apple",
							"bitbucket",
							"chatgpt",
							"github",
							"github-custom-host",
							"github-limited",
							"gitlab",
							"google",
						]),
						login: z.string(),
					})
					.strict(),
				z
					.object({
						totp: z.union([z.literal(false), z.literal(true)]),
						recoveryCodes: z.number(),
						actorId: z.string().optional(),
						actorType: z.enum(["admin", "user"]).optional(),
						reason: z.string().optional(),
					})
					.strict(),
				z
					.object({
						deletedAt: z.number().nullish(),
						username: z.string(),
					})
					.strict(),
				z
					.object({
						username: z.string(),
					})
					.strict(),
				z
					.object({
						previous: z.object({
							enabled: z.union([z.literal(false), z.literal(true)]),
							totpVerified: z.union([z.literal(false), z.literal(true)]),
						}),
						next: z.object({
							enabled: z.union([z.literal(false), z.literal(true)]),
							totpVerified: z.union([z.literal(false), z.literal(true)]),
						}),
					})
					.strict(),
				z
					.object({
						mfaEnabled: z.union([z.literal(false), z.literal(true)]),
					})
					.strict(),
				z
					.object({
						mfa: z.object({
							enabled: z.union([z.literal(false), z.literal(true)]),
							totpVerified: z.union([z.literal(false), z.literal(true)]),
						}),
					})
					.strict(),
				z
					.object({
						enabled: z.union([z.literal(false), z.literal(true)]),
						totpVerified: z.union([z.literal(false), z.literal(true)]),
					})
					.strict(),
				z
					.object({
						email: z.string(),
						prevEmail: z.string(),
					})
					.strict(),
				z
					.object({
						ruleName: z.string(),
					})
					.strict(),
				z
					.object({
						customAlertTitle: z.string(),
					})
					.strict(),
				z
					.object({
						vulnerabilities: z.array(z.string()),
						protectionEnabled: z.union([z.literal(false), z.literal(true)]),
						protectedProjectCount: z.number(),
					})
					.strict(),
				z
					.object({
						team: z.object({
							id: z.string(),
							name: z.string(),
						}),
						configuration: z.object({
							id: z.string(),
							name: z.string().optional(),
						}),
						peering: z.object({
							id: z.string(),
							accountId: z.string(),
							region: z.string(),
							vpcId: z.string(),
						}),
					})
					.strict(),
				z
					.object({
						team: z.object({
							id: z.string(),
							name: z.string(),
						}),
						configuration: z.object({
							id: z.string(),
							name: z.string().optional(),
						}),
						peering: z.object({
							id: z.string(),
							name: z.string().optional(),
						}),
					})
					.strict(),
				z
					.object({
						team: z.object({
							id: z.string(),
							name: z.string(),
						}),
						configuration: z.object({
							id: z.string(),
							name: z.string().optional(),
						}),
						peering: z.object({
							id: z.string(),
							name: z.string().optional(),
						}),
						newName: z.string().optional(),
					})
					.strict(),
				z
					.object({
						tier: z.enum(["plus", "pro"]),
					})
					.strict(),
				z
					.object({
						id: z.string(),
						url: z.string(),
					})
					.strict(),
				z
					.object({
						chatId: z.string(),
						chatTitle: z.string().optional(),
					})
					.strict(),
				z
					.object({
						model: z.string(),
						useCase: z.string(),
					})
					.strict(),
				z
					.object({
						chatId: z.string(),
						chatTitle: z.string().optional(),
						messageId: z.string(),
					})
					.strict(),
				z
					.object({
						deploymentId: z.string(),
						projectId: z.string(),
						runId: z.string(),
					})
					.strict(),
				z
					.object({
						grantType: z.enum([
							"authorization_code",
							"urn:ietf:params:oauth:grant-type:device_code",
						]),
						appName: z
							.string()
							.describe(
								"the app's name at the time the event was published (it could have changed since then)",
							),
						atTTL: z.number().describe("access_token TTL"),
						rtTTL: z.number().optional().describe("refresh_token TTL"),
						scope: z.string(),
						authMethod: z.enum([
							"app",
							"apple",
							"bitbucket",
							"chatgpt",
							"email",
							"emu",
							"github",
							"github-webhook",
							"gitlab",
							"google",
							"invite",
							"manual",
							"otp",
							"passkey",
							"saml",
							"sms",
							"token-exchange-oidc",
						]),
						app: z
							.object({
								clientId: z.string(),
								name: z
									.string()
									.describe(
										"the app's name at the time the event was published (it could have changed since then)",
									),
								clientAuthenticationUsed: z.object({
									method: z.enum([
										"client_secret_basic",
										"client_secret_jwt",
										"client_secret_post",
										"none",
										"oidc_token",
										"private_key_jwt",
									]),
									secretId: z.string().optional(),
								}),
							})
							.optional()
							.describe(
								"optional since entries prior to 2025-10-13 do not contain app information",
							),
						includesRefreshToken: z
							.union([z.literal(false), z.literal(true)])
							.optional()
							.describe("optional since entries prior to 2025-10-13 do not contain this field"),
						publicId: z
							.string()
							.optional()
							.describe("optional since entries prior to 2025-10-13 do not contain this field"),
						tokenPrefix: z
							.enum(["vca_"])
							.optional()
							.describe("optional since entries prior to 2026-04-23 do not contain this field"),
						tokenSuffix: z
							.string()
							.optional()
							.describe("optional since entries prior to 2026-04-23 do not contain this field"),
						refreshTokenPublicId: z
							.string()
							.optional()
							.describe("optional; only present when a refresh token was issued (offline_access)."),
						refreshTokenPrefix: z
							.enum(["vcr_"])
							.optional()
							.describe("optional; only present when a refresh token was issued (offline_access)."),
						refreshTokenSuffix: z
							.string()
							.optional()
							.describe("optional; only present when a refresh token was issued (offline_access)."),
						sessionId: z
							.string()
							.optional()
							.describe("optional since entries prior to 2025-10-13 do not contain this field"),
						ip: z
							.string()
							.nullish()
							.describe("optional since entries prior to 2026-04-23 do not contain this field"),
						geolocation: z
							.object({
								city: z
									.object({
										names: z.object({
											en: z.string(),
										}),
									})
									.optional(),
								country: z.object({
									names: z.object({
										en: z.string(),
									}),
								}),
								mostSpecificSubdivision: z
									.object({
										names: z.object({
											en: z.string(),
										}),
									})
									.optional(),
								regionName: z.string().optional(),
							})
							.nullish()
							.describe("optional since entries prior to 2026-04-23 do not contain this field"),
						userAgent: z
							.string()
							.optional()
							.describe("optional since entries prior to 2026-04-23 do not contain this field"),
					})
					.strict(),
				z
					.object({
						tokenId: z.string().describe("The token's public ID."),
						tokenPrefix: z
							.enum(["vcp_"])
							.optional()
							.describe("The token prefix used when showing a safe checksum-style fingerprint."),
						tokenSuffix: z.string().optional().describe("The token checksum suffix."),
						tokenName: z.string().describe("User-supplied name of the token."),
						origin: z
							.enum([
								"app",
								"apple",
								"bitbucket",
								"chatgpt",
								"email",
								"emu",
								"github",
								"github-webhook",
								"gitlab",
								"google",
								"invite",
								"manual",
								"otp",
								"passkey",
								"saml",
								"sms",
								"token-exchange-oidc",
							])
							.describe("How the token was issued. Always `'manual'` for explicit PAT creation."),
						scope: z
							.enum(["project", "team", "user"])
							.describe(
								"Scope of the token: - `'user'`: full-account token (not tied to any team). - `'team'`: scoped to a single team. - `'project'`: scoped to a single project within a team.",
							),
						teamId: z
							.string()
							.optional()
							.describe("Present when `scope` is `'team'` or `'project'`."),
						teamSlug: z
							.string()
							.optional()
							.describe("Present when `scope` is `'team'` or `'project'`."),
						projectId: z.string().optional().describe("Present when `scope` is `'project'`."),
						expiresAt: z
							.number()
							.optional()
							.describe("Unix epoch milliseconds. Absent when the token never expires."),
						hasAuthorizationDetails: z
							.union([z.literal(false), z.literal(true)])
							.optional()
							.describe("Whether the token was issued with RFC 9396 authorization details."),
						ip: z.string().nullish(),
						geolocation: z
							.object({
								city: z
									.object({
										names: z.object({
											en: z.string(),
										}),
									})
									.optional(),
								country: z.object({
									names: z.object({
										en: z.string(),
									}),
								}),
								mostSpecificSubdivision: z
									.object({
										names: z.object({
											en: z.string(),
										}),
									})
									.optional(),
								regionName: z.string().optional(),
							})
							.nullish(),
						userAgent: z.string().optional(),
						reqId: z.string().optional(),
						reqUrl: z.string().optional(),
					})
					.strict(),
				z
					.object({
						tokenId: z.string(),
						tokenType: z.string(),
						tokenName: z.string(),
						actorTokenId: z.string().describe("The token's public ID."),
						origin: z
							.enum([
								"app",
								"apple",
								"bitbucket",
								"chatgpt",
								"email",
								"emu",
								"github",
								"github-webhook",
								"gitlab",
								"google",
								"invite",
								"manual",
								"otp",
								"passkey",
								"saml",
								"sms",
								"token-exchange-oidc",
							])
							.optional(),
						teamId: z.string().optional(),
						expired: z.union([z.literal(false), z.literal(true)]).optional(),
						leaked: z.union([z.literal(false), z.literal(true)]).optional(),
						revoked: z.union([z.literal(false), z.literal(true)]).optional(),
						ip: z.string().nullish(),
						geolocation: z
							.object({
								city: z
									.object({
										names: z.object({
											en: z.string(),
										}),
									})
									.optional(),
								country: z.object({
									names: z.object({
										en: z.string(),
									}),
								}),
								mostSpecificSubdivision: z
									.object({
										names: z.object({
											en: z.string(),
										}),
									})
									.optional(),
								regionName: z.string().optional(),
							})
							.nullish(),
						userAgent: z.string().optional(),
						reqId: z.string().optional(),
						reqUrl: z.string().optional(),
					})
					.strict(),
				z
					.object({
						deletedCount: z.number(),
						actorTokenId: z.string().describe("The token's public ID."),
						ip: z.string().nullish(),
						geolocation: z
							.object({
								city: z
									.object({
										names: z.object({
											en: z.string(),
										}),
									})
									.optional(),
								country: z.object({
									names: z.object({
										en: z.string(),
									}),
								}),
								mostSpecificSubdivision: z
									.object({
										names: z.object({
											en: z.string(),
										}),
									})
									.optional(),
								regionName: z.string().optional(),
							})
							.nullish(),
						userAgent: z.string().optional(),
						reqId: z.string().optional(),
						reqUrl: z.string().optional(),
					})
					.strict(),
			])
			.optional(),
	})
	.describe("Array of events generated by the User.");

export const listEventTypeSchema = z
	.object({
		name: z
			.enum([
				"access-group-created",
				"access-group-deleted",
				"access-group-project-updated",
				"access-group-updated",
				"access-group-user-added",
				"access-group-user-removed",
				"agentic-provisioning-account-blocked",
				"agentic-provisioning-account-linked",
				"agentic-provisioning-account-relinked",
				"agentic-provisioning-account-unlinked",
				"agentic-provisioning-credentials-rotated",
				"agentic-provisioning-plan-changed",
				"agentic-provisioning-team-created",
				"ai-alert-investigation",
				"ai-code-review",
				"ai-gateway-api-key-created",
				"ai-gateway-api-key-deleted",
				"ai-gateway-api-key-quota-updated",
				"ai-gateway-byok-credential-created",
				"ai-gateway-byok-credential-deleted",
				"ai-gateway-byok-credential-updated",
				"ai-gateway-provider-allowlist-providers-updated",
				"ai-gateway-provider-allowlist-toggled",
				"ai-gateway-rule-created",
				"ai-gateway-rule-deleted",
				"ai-gateway-rule-updated",
				"ai-gateway-virtual-model-config-archived",
				"ai-gateway-virtual-model-config-created",
				"ai-gateway-virtual-model-config-restored",
				"ai-gateway-virtual-model-config-updated",
				"ai-omniagent",
				"alert-rule-created",
				"alert-rule-deleted",
				"alert-rule-updated",
				"alias",
				"alias-chown",
				"alias-delete",
				"alias-invite-created",
				"alias-invite-joined",
				"alias-invite-revoked",
				"alias-protection-bypass-created",
				"alias-protection-bypass-exception",
				"alias-protection-bypass-regenerated",
				"alias-protection-bypass-revoked",
				"alias-system",
				"alias-user-scoped-access-denied",
				"alias-user-scoped-access-granted",
				"alias-user-scoped-access-requested",
				"alias-user-scoped-access-revoked",
				"aliases-assigned",
				"attack-mode-disabled",
				"attack-mode-enabled",
				"audit-log-export-downloaded",
				"audit-log-export-requested",
				"authorize-git-deployment",
				"auto-expose-system-envs",
				"avatar",
				"bulk-redirects-settings-updated",
				"bulk-redirects-version-promoted",
				"bulk-redirects-version-restored",
				"cert",
				"cert-autorenew",
				"cert-chown",
				"cert-clone",
				"cert-delete",
				"cert-renew",
				"cert-replace",
				"cert-system-create",
				"concurrent-builds-update",
				"connect-attach-project",
				"connect-bitbucket",
				"connect-bitbucket-app",
				"connect-configuration-created",
				"connect-configuration-deleted",
				"connect-configuration-link-updated",
				"connect-configuration-linked",
				"connect-configuration-unlinked",
				"connect-configuration-updated",
				"connect-create-connector",
				"connect-delete-connector",
				"connect-delete-installation",
				"connect-detach-project",
				"connect-github",
				"connect-github-custom-host",
				"connect-github-limited",
				"connect-gitlab",
				"connect-gitlab-app",
				"connect-import-tokens",
				"connect-revoke-all-tokens",
				"connect-update-connector",
				"connect-update-trigger-destinations",
				"connect-upsert-installation",
				"custom-alert-created",
				"custom-alert-deleted",
				"custom-alert-updated",
				"custom-suffix-clear",
				"custom-suffix-disable",
				"custom-suffix-enable",
				"custom-suffix-pending",
				"custom-suffix-ready",
				"deploy-hook-created",
				"deploy-hook-deduped",
				"deploy-hook-deleted",
				"deploy-hook-processed",
				"deployment",
				"deployment-check-created",
				"deployment-check-deleted",
				"deployment-check-updated",
				"deployment-chown",
				"deployment-creation-blocked",
				"deployment-delete",
				"deployment-policy-blocked",
				"deployment-undeleted",
				"disabled-integration-installation-removed",
				"disconnect-bitbucket-app",
				"disconnect-github",
				"disconnect-github-custom-host",
				"disconnect-github-limited",
				"disconnect-gitlab-app",
				"dns-add",
				"dns-delete",
				"dns-record-internal",
				"dns-update",
				"dns-zonefile-import",
				"domain",
				"domain-buy",
				"domain-cdn",
				"domain-chown",
				"domain-custom-ns-change",
				"domain-delegated",
				"domain-delete",
				"domain-move-in",
				"domain-move-out",
				"domain-move-out-request-sent",
				"domain-renew-change",
				"domain-service-type-updated",
				"domain-transfer-in",
				"domain-transfer-in-canceled",
				"domain-transfer-in-completed",
				"domain-zone-change",
				"drain-created",
				"drain-deleted",
				"drain-disabled",
				"drain-enabled",
				"drain-updated",
				"edge-cache-dangerously-delete-by-src-images",
				"edge-cache-dangerously-delete-by-tags",
				"edge-cache-invalidate-by-src-images",
				"edge-cache-invalidate-by-tags",
				"edge-cache-purge-all",
				"edge-cache-rollback-purge",
				"edge-config-backup-restored",
				"edge-config-created",
				"edge-config-deleted",
				"edge-config-items-updated",
				"edge-config-schema-deleted",
				"edge-config-schema-updated",
				"edge-config-token-created",
				"edge-config-token-deleted",
				"edge-config-transfer-in",
				"edge-config-transfer-out",
				"edge-config-updated",
				"email",
				"email-notification-rule-removed",
				"email-notification-rule-updated",
				"enforce-sensitive-environment-variables",
				"env-variable-add",
				"env-variable-delete",
				"env-variable-edit",
				"env-variable-masked",
				"env-variable-read",
				"env-variable-read:cli:dev",
				"env-variable-read:cli:env:add",
				"env-variable-read:cli:env:ls",
				"env-variable-read:cli:env:pull",
				"env-variable-read:cli:env:rm",
				"env-variable-read:cli:pull",
				"env-variable-read:unknown-source",
				"env-variable-read:v0:env:pull",
				"env-variable-rotated",
				"firewall-bypass-created",
				"firewall-bypass-deleted",
				"firewall-config-modified",
				"firewall-config-promoted",
				"firewall-config-removed",
				"firewall-managed-rulegroup-updated",
				"firewall-managed-ruleset-updated",
				"flag",
				"flag-archived",
				"flag-created",
				"flag-deleted",
				"flag-unarchived",
				"flag-updated",
				"flags-explorer-subscription",
				"flags-sdk-key",
				"flags-sdk-key-added",
				"flags-sdk-key-deleted",
				"flags-sdk-key-read",
				"flags-segment",
				"flags-settings",
				"flags-transferred",
				"git_account_integration_link_added",
				"instant-rollback-created",
				"integration-configuration-owner-changed",
				"integration-configuration-scope-change-confirmed",
				"integration-configuration-transfer-in-success",
				"integration-configuration-transfer-out-success",
				"integration-configurations-disabled",
				"integration-installation-billing-plan-updated",
				"integration-installation-completed",
				"integration-installation-permission-updated",
				"integration-installation-removed",
				"integration-resource-sql-query-executed",
				"integration-scope-changed",
				"invoice-modified",
				"invoice-refunded",
				"log-drain-created",
				"log-drain-deleted",
				"log-drain-disabled",
				"log-drain-enabled",
				"login",
				"manual-deployment-promotion-created",
				"marketplace-integration-allowlist-updated",
				"microfrontend-group-added",
				"microfrontend-group-deleted",
				"microfrontend-group-updated",
				"microfrontend-project-added-to-group",
				"microfrontend-project-removed-from-group",
				"microfrontend-project-updated",
				"monitoring-alert-updated",
				"monitoring-disabled",
				"monitoring-enabled",
				"oauth-app-connection-created",
				"oauth-app-connection-removed",
				"oauth-app-connection-updated",
				"oauth-app-created",
				"oauth-app-deleted",
				"oauth-app-secret-deleted",
				"oauth-app-secret-generated",
				"oauth-app-token-created",
				"oauth-app-updated",
				"observability-disabled",
				"observability-enabled",
				"observability-plus-project-disabled",
				"observability-plus-project-enabled",
				"organization-team-add",
				"owner-blocked",
				"owner-soft-blocked",
				"owner-soft-unblocked",
				"owner-unblocked",
				"page-integrity-config-updated",
				"page-integrity-header-approved",
				"page-integrity-header-rejected",
				"page-integrity-inventory-cleared",
				"page-integrity-resource-approved",
				"page-integrity-resource-deleted",
				"page-integrity-resource-rejected",
				"passkey-created",
				"passkey-deleted",
				"passkey-updated",
				"password-protection-disabled",
				"password-protection-enabled",
				"payment-method-added",
				"payment-method-default-updated",
				"payment-method-removed",
				"plan",
				"preview-deployment-suffix-disabled",
				"preview-deployment-suffix-enabled",
				"preview-deployment-suffix-update",
				"privatelink-endpoint-created",
				"privatelink-endpoint-deleted",
				"privatelink-endpoint-updated",
				"production-branch-updated",
				"project-add-alias",
				"project-add-redirect",
				"project-affected-projects-deployments-updated",
				"project-alias-configured-change",
				"project-analytics-disabled",
				"project-analytics-enabled",
				"project-auto-assign-custom-production-domains-updated",
				"project-automation-bypass",
				"project-avatar-update",
				"project-build-command-updated",
				"project-build-logs-and-source-protection-updated",
				"project-build-machine-updated",
				"project-client-cert-delete",
				"project-client-cert-upload",
				"project-connect-configurations",
				"project-consolidated-git-commit-status-updated",
				"project-created",
				"project-cron-jobs-toggled",
				"project-custom-environment-created",
				"project-custom-environment-deleted",
				"project-custom-environment-updated",
				"project-customer-success-code-visibility-updated",
				"project-delete",
				"project-deployment-policy-updated",
				"project-deployment-retention-updated",
				"project-directory-listing",
				"project-domain-deleted",
				"project-domain-moved",
				"project-domain-unverified",
				"project-domain-updated",
				"project-domain-verified",
				"project-elastic-concurrency-updated",
				"project-expiration-locked",
				"project-expiration-reached",
				"project-expiration-scheduled",
				"project-expiration-unlocked",
				"project-external-rewrite-caching-updated",
				"project-framework-updated",
				"project-function-cpu-memory",
				"project-function-failover",
				"project-function-max-duration",
				"project-function-regions",
				"project-functions-beta-updated",
				"project-functions-fluid-disabled",
				"project-functions-fluid-enabled",
				"project-git-commit-comments-toggled",
				"project-git-commit-status-toggled",
				"project-git-create-deployments-toggled",
				"project-git-fork-protection-updated",
				"project-git-lfs-toggled",
				"project-git-pr-comments-toggled",
				"project-git-repository-connected",
				"project-git-repository-disconnected",
				"project-git-repository-dispatch-events-toggled",
				"project-git-require-verified-commits-toggled",
				"project-ignored-build-step-updated",
				"project-install-command-updated",
				"project-member-added",
				"project-member-invited",
				"project-member-removed",
				"project-member-removed-batch",
				"project-member-updated",
				"project-move-in-success",
				"project-move-out-failed",
				"project-move-out-started",
				"project-move-out-success",
				"project-name",
				"project-node-version-updated",
				"project-oidc-issuer-mode-updated",
				"project-oidc-token-created",
				"project-options-allowlist",
				"project-output-directory-updated",
				"project-passport-updated",
				"project-password-protection",
				"project-paused",
				"project-preview-deployment-suffix",
				"project-preview-environment-branch-tracking-updated",
				"project-prioritize-production-builds-updated",
				"project-program-enrollment-changed",
				"project-protected-sourcemaps-updated",
				"project-rollback-description-updated",
				"project-rolling-release-aborted",
				"project-rolling-release-approved",
				"project-rolling-release-completed",
				"project-rolling-release-configured",
				"project-rolling-release-continued",
				"project-rolling-release-disabled",
				"project-rolling-release-enabled",
				"project-rolling-release-paused",
				"project-rolling-release-started",
				"project-rolling-release-suggested-actions-generated",
				"project-rolling-release-timer",
				"project-root-directory-updated",
				"project-routes-version-promoted",
				"project-routes-version-restored",
				"project-sandbox-url-protection-updated",
				"project-skew-protection-allowed-domains-updated",
				"project-skew-protection-max-age-updated",
				"project-skew-protection-threshold-updated",
				"project-source-files-outside-root-directory-updated",
				"project-speed-insights-disabled",
				"project-speed-insights-enabled",
				"project-sso-protection",
				"project-static-ips-updated",
				"project-trusted-ips",
				"project-trusted-sources",
				"project-unpaused",
				"project-web-analytics-disabled",
				"project-web-analytics-enabled",
				"protected-git-scope-added",
				"protected-git-scope-removed",
				"runtime-cache-purge-all",
				"sandbox-alias-assigned",
				"sandbox-alias-delete",
				"scale",
				"scale-auto",
				"secondary-email-added",
				"secondary-email-removed",
				"secondary-email-verified",
				"secret-add",
				"secret-delete",
				"secret-rename",
				"security-plus-updated",
				"set-bio",
				"set-name",
				"set-profiles",
				"set-scale",
				"shared-env-variable-create",
				"shared-env-variable-delete",
				"shared-env-variable-read",
				"shared-env-variable-update",
				"show-ip-addresses",
				"signup",
				"signup-via-bitbucket",
				"signup-via-github",
				"signup-via-gitlab",
				"speed-insights-settings-updated",
				"spend-created",
				"spend-deleted",
				"spend-updated",
				"storage-accept-tos",
				"storage-access-token-set",
				"storage-accessed-data-browser",
				"storage-connect-project",
				"storage-create",
				"storage-delete",
				"storage-disconnect-project",
				"storage-disconnect-projects",
				"storage-inactive-store-deleted",
				"storage-reset-credentials",
				"storage-resource-repl-command",
				"storage-set-locked",
				"storage-transfer-in-success",
				"storage-transfer-out-success",
				"storage-transfer-request-created",
				"storage-update",
				"storage-update-project-connection",
				"storage-upgrade-project-connection-to-oidc",
				"storage-view-secret",
				"strict-deployment-protection-settings",
				"strict-shareable-links",
				"subscription-created",
				"subscription-product-added",
				"subscription-product-removed",
				"subscription-updated",
				"team",
				"team-avatar-update",
				"team-default-build-machine-updated",
				"team-default-passport-updated",
				"team-delete",
				"team-deployment-policy-updated",
				"team-domain-verification-created",
				"team-domain-verification-deleted",
				"team-domain-verification-verified",
				"team-email-domain-update",
				"team-emu-account-split",
				"team-emu-updated",
				"team-ended-trial",
				"team-git-repository-dispatch-events-toggled",
				"team-git-require-verified-commits-toggled",
				"team-invite-bulk-delete",
				"team-invite-code-reset",
				"team-invite-link-created",
				"team-invite-link-deleted",
				"team-ip-blocking-rules-created",
				"team-ip-blocking-rules-removed",
				"team-member-add",
				"team-member-confirm-request",
				"team-member-decline-request",
				"team-member-delete",
				"team-member-entitlement-added",
				"team-member-entitlement-canceled",
				"team-member-entitlement-reactivated",
				"team-member-entitlement-removed",
				"team-member-join",
				"team-member-leave",
				"team-member-request-access",
				"team-member-role-update",
				"team-member-sso-authorization-attempt",
				"team-mfa-enforcement-updated",
				"team-name-update",
				"team-paid-invoice",
				"team-program-enrollment-changed",
				"team-remote-caching-update",
				"team-saml-enforced",
				"team-saml-roles",
				"team-slug-update",
				"team-tokens-invalidated",
				"unlink-login-connection",
				"user-delete",
				"user-emu-account-archived",
				"user-emu-account-recovered",
				"user-mfa-challenge-verified",
				"user-mfa-configuration-updated",
				"user-mfa-recovery-codes-regenerated",
				"user-mfa-removed",
				"user-mfa-setup-skipped",
				"user-mfa-totp-verification-started",
				"user-mfa-totp-verified",
				"user-primary-email-updated",
				"user-token-created",
				"user-token-deleted",
				"user-tokens-deleted",
				"username",
				"v0-chat-ai-usage",
				"v0-chat-created",
				"v0-chat-message-sent",
				"vercel-agent-elevated-permissions-approved",
				"vercel-agent-elevated-permissions-requested",
				"vercel-agent-session-created",
				"vercel-agent-team-trial-credits-applied",
				"vercel-app-installation-request-dismissed",
				"vercel-app-installation-requested",
				"vercel-app-installation-updated",
				"vercel-app-installed",
				"vercel-app-tokens-revoked",
				"vercel-app-uninstalled",
				"vercel-toolbar",
				"vpc-peering-connection-accepted",
				"vpc-peering-connection-deleted",
				"vpc-peering-connection-rejected",
				"vpc-peering-connection-updated",
				"vulnerability-banner-dismissed",
				"web-analytics-tier-updated",
				"webhook-created",
				"webhook-deleted",
				"webhook-updated",
				"workflow-deployment-key-accessed",
			])
			.describe("The name of the event type."),
		description: z
			.string()
			.describe("Description of the event, visible to users in the Activity dashboard and docs."),
		categories: z
			.array(
				z.enum([
					"account",
					"ai",
					"ai-gateway",
					"billing",
					"deployment",
					"domain",
					"edge",
					"env-variable",
					"feature-flags",
					"firewall",
					"integration",
					"microfrontends",
					"network",
					"observability",
					"other",
					"project",
					"security",
					"storage",
					"team",
					"v0",
					"vercel-app",
					"workflow",
				]),
			)
			.describe("Categories that group this event type with related event types."),
		deprecated: z
			.union([z.literal(false), z.literal(true)])
			.optional()
			.describe("Present only when this event type is deprecated."),
		replacedBy: z
			.array(
				z.enum([
					"access-group-created",
					"access-group-deleted",
					"access-group-project-updated",
					"access-group-updated",
					"access-group-user-added",
					"access-group-user-removed",
					"agentic-provisioning-account-blocked",
					"agentic-provisioning-account-linked",
					"agentic-provisioning-account-relinked",
					"agentic-provisioning-account-unlinked",
					"agentic-provisioning-credentials-rotated",
					"agentic-provisioning-plan-changed",
					"agentic-provisioning-team-created",
					"ai-alert-investigation",
					"ai-code-review",
					"ai-gateway-api-key-created",
					"ai-gateway-api-key-deleted",
					"ai-gateway-api-key-quota-updated",
					"ai-gateway-byok-credential-created",
					"ai-gateway-byok-credential-deleted",
					"ai-gateway-byok-credential-updated",
					"ai-gateway-provider-allowlist-providers-updated",
					"ai-gateway-provider-allowlist-toggled",
					"ai-gateway-rule-created",
					"ai-gateway-rule-deleted",
					"ai-gateway-rule-updated",
					"ai-gateway-virtual-model-config-archived",
					"ai-gateway-virtual-model-config-created",
					"ai-gateway-virtual-model-config-restored",
					"ai-gateway-virtual-model-config-updated",
					"ai-omniagent",
					"alert-rule-created",
					"alert-rule-deleted",
					"alert-rule-updated",
					"alias",
					"alias-chown",
					"alias-delete",
					"alias-invite-created",
					"alias-invite-joined",
					"alias-invite-revoked",
					"alias-protection-bypass-created",
					"alias-protection-bypass-exception",
					"alias-protection-bypass-regenerated",
					"alias-protection-bypass-revoked",
					"alias-system",
					"alias-user-scoped-access-denied",
					"alias-user-scoped-access-granted",
					"alias-user-scoped-access-requested",
					"alias-user-scoped-access-revoked",
					"aliases-assigned",
					"attack-mode-disabled",
					"attack-mode-enabled",
					"audit-log-export-downloaded",
					"audit-log-export-requested",
					"authorize-git-deployment",
					"auto-expose-system-envs",
					"avatar",
					"bulk-redirects-settings-updated",
					"bulk-redirects-version-promoted",
					"bulk-redirects-version-restored",
					"cert",
					"cert-autorenew",
					"cert-chown",
					"cert-clone",
					"cert-delete",
					"cert-renew",
					"cert-replace",
					"cert-system-create",
					"concurrent-builds-update",
					"connect-attach-project",
					"connect-bitbucket",
					"connect-bitbucket-app",
					"connect-configuration-created",
					"connect-configuration-deleted",
					"connect-configuration-link-updated",
					"connect-configuration-linked",
					"connect-configuration-unlinked",
					"connect-configuration-updated",
					"connect-create-connector",
					"connect-delete-connector",
					"connect-delete-installation",
					"connect-detach-project",
					"connect-github",
					"connect-github-custom-host",
					"connect-github-limited",
					"connect-gitlab",
					"connect-gitlab-app",
					"connect-import-tokens",
					"connect-revoke-all-tokens",
					"connect-update-connector",
					"connect-update-trigger-destinations",
					"connect-upsert-installation",
					"custom-alert-created",
					"custom-alert-deleted",
					"custom-alert-updated",
					"custom-suffix-clear",
					"custom-suffix-disable",
					"custom-suffix-enable",
					"custom-suffix-pending",
					"custom-suffix-ready",
					"deploy-hook-created",
					"deploy-hook-deduped",
					"deploy-hook-deleted",
					"deploy-hook-processed",
					"deployment",
					"deployment-check-created",
					"deployment-check-deleted",
					"deployment-check-updated",
					"deployment-chown",
					"deployment-creation-blocked",
					"deployment-delete",
					"deployment-policy-blocked",
					"deployment-undeleted",
					"disabled-integration-installation-removed",
					"disconnect-bitbucket-app",
					"disconnect-github",
					"disconnect-github-custom-host",
					"disconnect-github-limited",
					"disconnect-gitlab-app",
					"dns-add",
					"dns-delete",
					"dns-record-internal",
					"dns-update",
					"dns-zonefile-import",
					"domain",
					"domain-buy",
					"domain-cdn",
					"domain-chown",
					"domain-custom-ns-change",
					"domain-delegated",
					"domain-delete",
					"domain-move-in",
					"domain-move-out",
					"domain-move-out-request-sent",
					"domain-renew-change",
					"domain-service-type-updated",
					"domain-transfer-in",
					"domain-transfer-in-canceled",
					"domain-transfer-in-completed",
					"domain-zone-change",
					"drain-created",
					"drain-deleted",
					"drain-disabled",
					"drain-enabled",
					"drain-updated",
					"edge-cache-dangerously-delete-by-src-images",
					"edge-cache-dangerously-delete-by-tags",
					"edge-cache-invalidate-by-src-images",
					"edge-cache-invalidate-by-tags",
					"edge-cache-purge-all",
					"edge-cache-rollback-purge",
					"edge-config-backup-restored",
					"edge-config-created",
					"edge-config-deleted",
					"edge-config-items-updated",
					"edge-config-schema-deleted",
					"edge-config-schema-updated",
					"edge-config-token-created",
					"edge-config-token-deleted",
					"edge-config-transfer-in",
					"edge-config-transfer-out",
					"edge-config-updated",
					"email",
					"email-notification-rule-removed",
					"email-notification-rule-updated",
					"enforce-sensitive-environment-variables",
					"env-variable-add",
					"env-variable-delete",
					"env-variable-edit",
					"env-variable-masked",
					"env-variable-read",
					"env-variable-read:cli:dev",
					"env-variable-read:cli:env:add",
					"env-variable-read:cli:env:ls",
					"env-variable-read:cli:env:pull",
					"env-variable-read:cli:env:rm",
					"env-variable-read:cli:pull",
					"env-variable-read:unknown-source",
					"env-variable-read:v0:env:pull",
					"env-variable-rotated",
					"firewall-bypass-created",
					"firewall-bypass-deleted",
					"firewall-config-modified",
					"firewall-config-promoted",
					"firewall-config-removed",
					"firewall-managed-rulegroup-updated",
					"firewall-managed-ruleset-updated",
					"flag",
					"flag-archived",
					"flag-created",
					"flag-deleted",
					"flag-unarchived",
					"flag-updated",
					"flags-explorer-subscription",
					"flags-sdk-key",
					"flags-sdk-key-added",
					"flags-sdk-key-deleted",
					"flags-sdk-key-read",
					"flags-segment",
					"flags-settings",
					"flags-transferred",
					"git_account_integration_link_added",
					"instant-rollback-created",
					"integration-configuration-owner-changed",
					"integration-configuration-scope-change-confirmed",
					"integration-configuration-transfer-in-success",
					"integration-configuration-transfer-out-success",
					"integration-configurations-disabled",
					"integration-installation-billing-plan-updated",
					"integration-installation-completed",
					"integration-installation-permission-updated",
					"integration-installation-removed",
					"integration-resource-sql-query-executed",
					"integration-scope-changed",
					"invoice-modified",
					"invoice-refunded",
					"log-drain-created",
					"log-drain-deleted",
					"log-drain-disabled",
					"log-drain-enabled",
					"login",
					"manual-deployment-promotion-created",
					"marketplace-integration-allowlist-updated",
					"microfrontend-group-added",
					"microfrontend-group-deleted",
					"microfrontend-group-updated",
					"microfrontend-project-added-to-group",
					"microfrontend-project-removed-from-group",
					"microfrontend-project-updated",
					"monitoring-alert-updated",
					"monitoring-disabled",
					"monitoring-enabled",
					"oauth-app-connection-created",
					"oauth-app-connection-removed",
					"oauth-app-connection-updated",
					"oauth-app-created",
					"oauth-app-deleted",
					"oauth-app-secret-deleted",
					"oauth-app-secret-generated",
					"oauth-app-token-created",
					"oauth-app-updated",
					"observability-disabled",
					"observability-enabled",
					"observability-plus-project-disabled",
					"observability-plus-project-enabled",
					"organization-team-add",
					"owner-blocked",
					"owner-soft-blocked",
					"owner-soft-unblocked",
					"owner-unblocked",
					"page-integrity-config-updated",
					"page-integrity-header-approved",
					"page-integrity-header-rejected",
					"page-integrity-inventory-cleared",
					"page-integrity-resource-approved",
					"page-integrity-resource-deleted",
					"page-integrity-resource-rejected",
					"passkey-created",
					"passkey-deleted",
					"passkey-updated",
					"password-protection-disabled",
					"password-protection-enabled",
					"payment-method-added",
					"payment-method-default-updated",
					"payment-method-removed",
					"plan",
					"preview-deployment-suffix-disabled",
					"preview-deployment-suffix-enabled",
					"preview-deployment-suffix-update",
					"privatelink-endpoint-created",
					"privatelink-endpoint-deleted",
					"privatelink-endpoint-updated",
					"production-branch-updated",
					"project-add-alias",
					"project-add-redirect",
					"project-affected-projects-deployments-updated",
					"project-alias-configured-change",
					"project-analytics-disabled",
					"project-analytics-enabled",
					"project-auto-assign-custom-production-domains-updated",
					"project-automation-bypass",
					"project-avatar-update",
					"project-build-command-updated",
					"project-build-logs-and-source-protection-updated",
					"project-build-machine-updated",
					"project-client-cert-delete",
					"project-client-cert-upload",
					"project-connect-configurations",
					"project-consolidated-git-commit-status-updated",
					"project-created",
					"project-cron-jobs-toggled",
					"project-custom-environment-created",
					"project-custom-environment-deleted",
					"project-custom-environment-updated",
					"project-customer-success-code-visibility-updated",
					"project-delete",
					"project-deployment-policy-updated",
					"project-deployment-retention-updated",
					"project-directory-listing",
					"project-domain-deleted",
					"project-domain-moved",
					"project-domain-unverified",
					"project-domain-updated",
					"project-domain-verified",
					"project-elastic-concurrency-updated",
					"project-expiration-locked",
					"project-expiration-reached",
					"project-expiration-scheduled",
					"project-expiration-unlocked",
					"project-external-rewrite-caching-updated",
					"project-framework-updated",
					"project-function-cpu-memory",
					"project-function-failover",
					"project-function-max-duration",
					"project-function-regions",
					"project-functions-beta-updated",
					"project-functions-fluid-disabled",
					"project-functions-fluid-enabled",
					"project-git-commit-comments-toggled",
					"project-git-commit-status-toggled",
					"project-git-create-deployments-toggled",
					"project-git-fork-protection-updated",
					"project-git-lfs-toggled",
					"project-git-pr-comments-toggled",
					"project-git-repository-connected",
					"project-git-repository-disconnected",
					"project-git-repository-dispatch-events-toggled",
					"project-git-require-verified-commits-toggled",
					"project-ignored-build-step-updated",
					"project-install-command-updated",
					"project-member-added",
					"project-member-invited",
					"project-member-removed",
					"project-member-removed-batch",
					"project-member-updated",
					"project-move-in-success",
					"project-move-out-failed",
					"project-move-out-started",
					"project-move-out-success",
					"project-name",
					"project-node-version-updated",
					"project-oidc-issuer-mode-updated",
					"project-oidc-token-created",
					"project-options-allowlist",
					"project-output-directory-updated",
					"project-passport-updated",
					"project-password-protection",
					"project-paused",
					"project-preview-deployment-suffix",
					"project-preview-environment-branch-tracking-updated",
					"project-prioritize-production-builds-updated",
					"project-program-enrollment-changed",
					"project-protected-sourcemaps-updated",
					"project-rollback-description-updated",
					"project-rolling-release-aborted",
					"project-rolling-release-approved",
					"project-rolling-release-completed",
					"project-rolling-release-configured",
					"project-rolling-release-continued",
					"project-rolling-release-disabled",
					"project-rolling-release-enabled",
					"project-rolling-release-paused",
					"project-rolling-release-started",
					"project-rolling-release-suggested-actions-generated",
					"project-rolling-release-timer",
					"project-root-directory-updated",
					"project-routes-version-promoted",
					"project-routes-version-restored",
					"project-sandbox-url-protection-updated",
					"project-skew-protection-allowed-domains-updated",
					"project-skew-protection-max-age-updated",
					"project-skew-protection-threshold-updated",
					"project-source-files-outside-root-directory-updated",
					"project-speed-insights-disabled",
					"project-speed-insights-enabled",
					"project-sso-protection",
					"project-static-ips-updated",
					"project-trusted-ips",
					"project-trusted-sources",
					"project-unpaused",
					"project-web-analytics-disabled",
					"project-web-analytics-enabled",
					"protected-git-scope-added",
					"protected-git-scope-removed",
					"runtime-cache-purge-all",
					"sandbox-alias-assigned",
					"sandbox-alias-delete",
					"scale",
					"scale-auto",
					"secondary-email-added",
					"secondary-email-removed",
					"secondary-email-verified",
					"secret-add",
					"secret-delete",
					"secret-rename",
					"security-plus-updated",
					"set-bio",
					"set-name",
					"set-profiles",
					"set-scale",
					"shared-env-variable-create",
					"shared-env-variable-delete",
					"shared-env-variable-read",
					"shared-env-variable-update",
					"show-ip-addresses",
					"signup",
					"signup-via-bitbucket",
					"signup-via-github",
					"signup-via-gitlab",
					"speed-insights-settings-updated",
					"spend-created",
					"spend-deleted",
					"spend-updated",
					"storage-accept-tos",
					"storage-access-token-set",
					"storage-accessed-data-browser",
					"storage-connect-project",
					"storage-create",
					"storage-delete",
					"storage-disconnect-project",
					"storage-disconnect-projects",
					"storage-inactive-store-deleted",
					"storage-reset-credentials",
					"storage-resource-repl-command",
					"storage-set-locked",
					"storage-transfer-in-success",
					"storage-transfer-out-success",
					"storage-transfer-request-created",
					"storage-update",
					"storage-update-project-connection",
					"storage-upgrade-project-connection-to-oidc",
					"storage-view-secret",
					"strict-deployment-protection-settings",
					"strict-shareable-links",
					"subscription-created",
					"subscription-product-added",
					"subscription-product-removed",
					"subscription-updated",
					"team",
					"team-avatar-update",
					"team-default-build-machine-updated",
					"team-default-passport-updated",
					"team-delete",
					"team-deployment-policy-updated",
					"team-domain-verification-created",
					"team-domain-verification-deleted",
					"team-domain-verification-verified",
					"team-email-domain-update",
					"team-emu-account-split",
					"team-emu-updated",
					"team-ended-trial",
					"team-git-repository-dispatch-events-toggled",
					"team-git-require-verified-commits-toggled",
					"team-invite-bulk-delete",
					"team-invite-code-reset",
					"team-invite-link-created",
					"team-invite-link-deleted",
					"team-ip-blocking-rules-created",
					"team-ip-blocking-rules-removed",
					"team-member-add",
					"team-member-confirm-request",
					"team-member-decline-request",
					"team-member-delete",
					"team-member-entitlement-added",
					"team-member-entitlement-canceled",
					"team-member-entitlement-reactivated",
					"team-member-entitlement-removed",
					"team-member-join",
					"team-member-leave",
					"team-member-request-access",
					"team-member-role-update",
					"team-member-sso-authorization-attempt",
					"team-mfa-enforcement-updated",
					"team-name-update",
					"team-paid-invoice",
					"team-program-enrollment-changed",
					"team-remote-caching-update",
					"team-saml-enforced",
					"team-saml-roles",
					"team-slug-update",
					"team-tokens-invalidated",
					"unlink-login-connection",
					"user-delete",
					"user-emu-account-archived",
					"user-emu-account-recovered",
					"user-mfa-challenge-verified",
					"user-mfa-configuration-updated",
					"user-mfa-recovery-codes-regenerated",
					"user-mfa-removed",
					"user-mfa-setup-skipped",
					"user-mfa-totp-verification-started",
					"user-mfa-totp-verified",
					"user-primary-email-updated",
					"user-token-created",
					"user-token-deleted",
					"user-tokens-deleted",
					"username",
					"v0-chat-ai-usage",
					"v0-chat-created",
					"v0-chat-message-sent",
					"vercel-agent-elevated-permissions-approved",
					"vercel-agent-elevated-permissions-requested",
					"vercel-agent-session-created",
					"vercel-agent-team-trial-credits-applied",
					"vercel-app-installation-request-dismissed",
					"vercel-app-installation-requested",
					"vercel-app-installation-updated",
					"vercel-app-installed",
					"vercel-app-tokens-revoked",
					"vercel-app-uninstalled",
					"vercel-toolbar",
					"vpc-peering-connection-accepted",
					"vpc-peering-connection-deleted",
					"vpc-peering-connection-rejected",
					"vpc-peering-connection-updated",
					"vulnerability-banner-dismissed",
					"web-analytics-tier-updated",
					"webhook-created",
					"webhook-deleted",
					"webhook-updated",
					"workflow-deployment-key-accessed",
				]),
			)
			.optional()
			.describe("Event type names that supersede this deprecated event type."),
	})
	.describe("A user-facing event type.");

export const listEventTypesResponseSchema = z
	.object({
		types: z.array(z.unknown()),
		categories: z.array(
			z.object({
				name: z.enum([
					"account",
					"ai",
					"ai-gateway",
					"billing",
					"deployment",
					"domain",
					"edge",
					"env-variable",
					"feature-flags",
					"firewall",
					"integration",
					"microfrontends",
					"network",
					"observability",
					"other",
					"project",
					"security",
					"storage",
					"team",
					"v0",
					"vercel-app",
					"workflow",
				]),
				label: z.string(),
			}),
		),
	})
	.describe("Response returned by the List Event Types endpoint.");

export const flagSchema = z.object({
	description: z.string().optional(),
	maintainerIds: z.array(z.string()).optional(),
	permanent: z.union([z.literal(false), z.literal(true)]).optional(),
	tags: z.array(z.string()).optional(),
	experiment: z
		.object({
			id: z.string().optional(),
			name: z.string().optional(),
			numVariants: z.number().optional(),
			surfaceArea: z.string().optional(),
			stickyRequirement: z.union([z.literal(false), z.literal(true)]).optional(),
			layer: z.string().optional(),
			guardrailMetrics: z
				.array(
					z.object({
						description: z.string().optional(),
						metricFormula: z.string().optional(),
						name: z.string(),
						metricType: z.enum(["count", "currency", "percentage"]),
						metricUnit: z.enum(["session", "user", "visitor"]),
						directionality: z.enum(["decreaseIsGood", "increaseIsGood"]),
					}),
				)
				.optional(),
			hypothesis: z.string().optional(),
			device: z.enum(["android", "desktop", "ios", "mweb"]).optional(),
			controlVariantId: z.string().optional(),
			startedAt: z.number().optional(),
			endedAt: z.number().optional(),
			decision: z.string().optional(),
			decisionReason: z.string().optional(),
			duration: z.number().optional(),
			durationUnit: z.enum(["days", "exposures"]).optional(),
			allocationPercent: z.number().optional(),
			allocationUnit: z.enum(["cookieId", "userId", "visitorId"]),
			primaryMetrics: z.array(
				z.object({
					description: z.string().optional(),
					metricFormula: z.string().optional(),
					name: z.string(),
					metricType: z.enum(["count", "currency", "percentage"]),
					metricUnit: z.enum(["session", "user", "visitor"]),
					directionality: z.enum(["decreaseIsGood", "increaseIsGood"]),
				}),
			),
			status: z.enum(["closed", "draft", "paused", "running"]),
		})
		.optional(),
	variants: z.array(z.object({})),
	id: z.string(),
	environments: z.object({}).catchall(
		z.object({
			reuse: z
				.object({
					active: z.union([z.literal(false), z.literal(true)]),
					environment: z.string(),
				})
				.optional(),
			targets: z
				.object({})
				.catchall(
					z.object({}).catchall(
						z.object({}).catchall(
							z.array(
								z.object({
									note: z.string().optional(),
									value: z.string(),
								}),
							),
						),
					),
				)
				.optional(),
			revision: z.number().optional(),
			pausedOutcome: z.object({
				type: z.enum(["variant"]),
				variantId: z.string(),
			}),
			fallthrough: z.union([
				z
					.object({
						type: z.enum(["variant"]),
						variantId: z.string(),
					})
					.strict(),
				z
					.object({
						type: z.enum(["split"]),
						base: z.object({
							type: z.enum(["entity"]),
							kind: z.string(),
							attribute: z.string(),
						}),
						weights: z.object({}).catchall(z.number()),
						defaultVariantId: z.string(),
					})
					.strict(),
				z
					.object({
						type: z.enum(["rollout"]),
						base: z.object({
							type: z.enum(["entity"]),
							kind: z.string(),
							attribute: z.string(),
						}),
						defaultVariantId: z.string(),
						startTimestamp: z.number(),
						rollFromVariantId: z.string(),
						rollToVariantId: z.string(),
						slots: z.array(
							z.object({
								promille: z.number(),
								durationMs: z.number(),
							}),
						),
					})
					.strict(),
			]),
			active: z.union([z.literal(false), z.literal(true)]),
			rules: z.array(
				z.object({
					id: z.string(),
					outcome: z.union([
						z
							.object({
								type: z.enum(["variant"]),
								variantId: z.string(),
							})
							.strict(),
						z
							.object({
								type: z.enum(["split"]),
								base: z.object({
									type: z.enum(["entity"]),
									kind: z.string(),
									attribute: z.string(),
								}),
								weights: z.object({}).catchall(z.number()),
								defaultVariantId: z.string(),
							})
							.strict(),
						z
							.object({
								type: z.enum(["rollout"]),
								base: z.object({
									type: z.enum(["entity"]),
									kind: z.string(),
									attribute: z.string(),
								}),
								defaultVariantId: z.string(),
								startTimestamp: z.number(),
								rollFromVariantId: z.string(),
								rollToVariantId: z.string(),
								slots: z.array(
									z.object({
										promille: z.number(),
										durationMs: z.number(),
									}),
								),
							})
							.strict(),
					]),
					conditions: z.array(
						z.object({
							rhs: z
								.union([
									z.string(),
									z.number(),
									z
										.object({
											type: z.enum(["list", "list/inline"]),
											items: z.array(
												z.union([
													z
														.object({
															label: z.string().optional(),
															note: z.string().optional(),
															value: z.number(),
														})
														.strict(),
													z
														.object({
															label: z.string().optional(),
															note: z.string().optional(),
															value: z.string(),
														})
														.strict(),
												]),
											),
										})
										.strict(),
									z
										.object({
											type: z.enum(["regex"]),
											pattern: z.string(),
											flags: z.string(),
										})
										.strict(),
									z.union([z.literal(false), z.literal(true)]),
								])
								.optional(),
							cmpOptions: z
								.object({
									ignoreCase: z.union([z.literal(false), z.literal(true)]).optional(),
								})
								.optional(),
							lhs: z.union([
								z
									.object({
										type: z.enum(["segment"]),
									})
									.strict(),
								z
									.object({
										type: z.enum(["entity"]),
										kind: z.string(),
										attribute: z.string(),
									})
									.strict(),
							]),
							cmp: z.enum([
								"after",
								"before",
								"contains",
								"containsAllOf",
								"containsAnyOf",
								"containsNoneOf",
								"endsWith",
								"eq",
								"ex",
								"gt",
								"gte",
								"lt",
								"lte",
								"oneOf",
								"regex",
								"startsWith",
							]),
						}),
					),
				}),
			),
		}),
	),
	kind: z.enum(["boolean", "json", "number", "string"]),
	revision: z.number(),
	seed: z.number(),
	state: z.enum(["active", "archived"]),
	slug: z.string(),
	createdAt: z.number(),
	updatedAt: z.number(),
	createdBy: z.string(),
	ownerId: z.string(),
	projectId: z.string(),
	typeName: z.enum(["flag"]),
	metadata: z
		.object({
			creator: z
				.object({
					id: z.string(),
					name: z.string(),
				})
				.optional(),
		})
		.optional(),
});

export const marketplaceFlagSchema = z.object({
	typeName: z.enum(["marketplaceFlag"]),
	id: z.string(),
	externalId: z.string(),
	slug: z.string(),
	origin: z.string(),
	ownerId: z.string(),
	projectId: z.string(),
	resourceId: z.string(),
	integrationConfigurationId: z.string(),
	state: z.enum(["active", "archived"]),
	name: z.string().optional(),
	description: z.string().optional(),
	category: z.enum(["experiment", "flag"]).optional(),
	createdAt: z.number().optional(),
	updatedAt: z.number().optional(),
});

export const segmentSchema = z.object({
	description: z.string().optional(),
	createdBy: z.string().optional(),
	usedByFlags: z.array(z.string()).optional(),
	usedBySegments: z.array(z.string()).optional(),
	data: z.object({
		rules: z
			.array(
				z.object({
					id: z.string(),
					outcome: z.union([
						z
							.object({
								type: z.enum(["all"]),
							})
							.strict(),
						z
							.object({
								type: z.enum(["split"]),
								base: z.object({
									type: z.enum(["entity"]),
									kind: z.string(),
									attribute: z.string(),
								}),
								passPromille: z.number(),
							})
							.strict(),
					]),
					conditions: z.array(
						z.object({
							rhs: z
								.union([
									z.string(),
									z.number(),
									z
										.object({
											type: z.enum(["list", "list/inline"]),
											items: z.array(
												z.union([
													z
														.object({
															label: z.string().optional(),
															note: z.string().optional(),
															value: z.number(),
														})
														.strict(),
													z
														.object({
															label: z.string().optional(),
															note: z.string().optional(),
															value: z.string(),
														})
														.strict(),
												]),
											),
										})
										.strict(),
									z
										.object({
											type: z.enum(["regex"]),
											pattern: z.string(),
											flags: z.string(),
										})
										.strict(),
									z.union([z.literal(false), z.literal(true)]),
								])
								.optional(),
							cmpOptions: z
								.object({
									ignoreCase: z.union([z.literal(false), z.literal(true)]).optional(),
								})
								.optional(),
							lhs: z.union([
								z
									.object({
										type: z.enum(["segment"]),
									})
									.strict(),
								z
									.object({
										type: z.enum(["entity"]),
										kind: z.string(),
										attribute: z.string(),
									})
									.strict(),
							]),
							cmp: z.enum([
								"after",
								"before",
								"contains",
								"containsAllOf",
								"containsAnyOf",
								"containsNoneOf",
								"endsWith",
								"eq",
								"ex",
								"gt",
								"gte",
								"lt",
								"lte",
								"oneOf",
								"regex",
								"startsWith",
							]),
						}),
					),
				}),
			)
			.optional(),
		include: z
			.object({})
			.catchall(
				z.object({}).catchall(
					z.array(
						z.object({
							note: z.string().optional(),
							value: z.string(),
						}),
					),
				),
			)
			.optional(),
		exclude: z
			.object({})
			.catchall(
				z.object({}).catchall(
					z.array(
						z.object({
							note: z.string().optional(),
							value: z.string(),
						}),
					),
				),
			)
			.optional(),
	}),
	id: z.string(),
	label: z.string(),
	slug: z.string(),
	createdAt: z.number(),
	updatedAt: z.number(),
	projectId: z.string(),
	typeName: z.enum(["segment"]),
	hint: z.string(),
	metadata: z
		.object({
			creator: z
				.object({
					id: z.string(),
					name: z.string(),
				})
				.optional(),
		})
		.optional(),
});

export const flagsSdkKeyWithSecretsSchema = z
	.object({
		hashKey: z.string(),
		projectId: z.string(),
		type: z.enum(["client", "mobile", "server"]),
		environment: z.string(),
		createdBy: z.string(),
		createdAt: z.number(),
		updatedAt: z.number(),
		label: z.string().optional(),
		deletedAt: z.number().optional(),
		partialKeyValue: z
			.string()
			.describe(
				"Partially-masked representation of the SDK key value, safe to display in UIs. The value is the `vf_<type>_` prefix followed by the first 3 characters of the secret portion and a fixed 8-character `*` mask (e.g. `vf_server_abc********`).",
			),
		keyValue: z.string().describe("Cleartext value of the SDK key."),
		tokenValue: z
			.string()
			.optional()
			.describe(
				"Cleartext value of the Edge Config token, when the project has an Edge Config connection.",
			),
	})
	.describe(
		"Representation of a Flags SDK key returned by CREATE. Includes cleartext secrets (`keyValue`, `tokenValue`, `connectionString`) which are only ever disclosed once, on creation.",
	);

export const aCLActionSchema = z
	.enum(["create", "delete", "list", "read", "update"])
	.describe(
		"Enum containing the actions that can be performed against a resource. Group operations are included.",
	);

export const namedSandboxSchema = z
	.object({
		name: z.string().describe("The unique identifier of the sandbox."),
		currentSnapshotId: z
			.string()
			.optional()
			.describe("Current snapshot ID that the named sandbox is pointing to."),
		currentSessionId: z.string().describe("Current session ID the sandbox is pointing to."),
		status: z
			.enum(["running", "stopped", "stopping"])
			.describe("The status of the current sandbox."),
		statusUpdatedAt: z
			.number()
			.describe(
				"The time when the sandbox status was last updated, in milliseconds since the epoch.",
			),
		persistent: z
			.union([z.literal(false), z.literal(true)])
			.describe("Whether the sandbox persists its state across restarts via automatic snapshots."),
		region: z.string().optional().describe("The region the sandbox runs in."),
		vcpus: z.number().optional().describe("Number of virtual CPUs allocated."),
		memory: z.number().optional().describe("Memory allocated in MB."),
		runtime: z.string().optional().describe("Runtime identifier."),
		timeout: z.number().optional().describe("Timeout in milliseconds."),
		snapshotExpiration: z
			.number()
			.optional()
			.describe("Default snapshot expiration time in milliseconds. 0 means no expiration."),
		keepLastSnapshots: z
			.object({
				count: z.number().describe("Number of most recent snapshots to keep."),
				expiration: z
					.number()
					.optional()
					.describe("Expiration time in milliseconds for kept snapshots."),
				deleteEvicted: z
					.union([z.literal(false), z.literal(true)])
					.describe("Whether to immediately delete evicted snapshots."),
			})
			.optional()
			.describe("Keep-last snapshot configuration."),
		networkPolicy: z
			.object({
				mode: z.enum(["allow-all", "custom", "default-allow", "default-deny", "deny-all"]),
				allowedDomains: z.array(z.string()).optional(),
				allowedCIDRs: z.array(z.string()).optional(),
				deniedCIDRs: z.array(z.string()).optional(),
			})
			.optional()
			.describe("Network policy configuration."),
		totalEgressBytes: z
			.number()
			.optional()
			.describe("Cumulative egress bytes across all sandbox runs."),
		totalIngressBytes: z
			.number()
			.optional()
			.describe("Cumulative ingress bytes across all sandbox runs."),
		totalActiveCpuDurationMs: z
			.number()
			.optional()
			.describe("Cumulative active CPU duration in milliseconds across all sandbox runs."),
		totalDurationMs: z
			.number()
			.optional()
			.describe("Cumulative wall-clock duration in milliseconds across all sandbox runs."),
		cwd: z.string().optional().describe("The working directory of the sandbox."),
		tags: z
			.object({})
			.catchall(z.string())
			.optional()
			.describe("Key-value tags attached to the named sandbox."),
		mounts: z
			.object({})
			.catchall(
				z.object({
					drive: z.string(),
					mode: z.enum(["read-only", "read-write"]).optional(),
				}),
			)
			.optional()
			.describe("Key-value pairs of mount path and drive."),
		createdAt: z
			.number()
			.describe("The time when the named sandbox was created, in milliseconds since the epoch."),
		updatedAt: z
			.number()
			.describe(
				"The time when the named sandbox was last updated, in milliseconds since the epoch.",
			),
	})
	.describe("This object contains information related to a Vercel NamedSandbox.");

export const sandboxInjectionRuleSchema = z
	.object({
		domain: z
			.string()
			.describe(
				"The domain (or pattern) that this injection rule applies to. Supports wildcards like *.vercel.com.",
			),
		headerNames: z
			.array(z.string())
			.optional()
			.describe(
				"The names of HTTP headers that have value that will be injected for requests to this domain.",
			),
	})
	.describe("HTTP header injection rules for outgoing requests matching specific domains.");

export const sandboxNetworkPolicySchema = z
	.object({
		mode: z
			.enum(["allow-all", "custom", "deny-all"])
			.describe(
				"The network policy mode. - 'allow-all': All traffic is allowed. - 'deny-all': All traffic is blocked. - 'custom': Traffic is controlled by explicit allow/deny rules.",
			),
		allowedDomains: z
			.array(z.string())
			.optional()
			.describe(
				'List of domain names the sandbox is allowed to connect to. Supports wildcard patterns (e.g., "*.vercel.com" matches all subdomains).',
			),
		allowedCIDRs: z
			.array(z.string())
			.optional()
			.describe(
				"List of IP address ranges (in CIDR notation) the sandbox is allowed to connect to.",
			),
		deniedCIDRs: z
			.array(z.string())
			.optional()
			.describe(
				"List of IP address ranges (in CIDR notation) the sandbox is blocked from connecting to. These rules take precedence over all allowed rules.",
			),
		injectionRules: z
			.array(z.unknown())
			.optional()
			.describe("HTTP header injection rules for outgoing requests matching specific domains."),
	})
	.describe("The network policy applied to this sandbox, if any.");

export const sessionSchema = z
	.object({
		sourceSandboxName: z.string().describe("The name of the source sandbox."),
		projectId: z
			.string()
			.describe("The unique identifier of the project associated with this session."),
		id: z.string().describe("The unique identifier of the sandbox."),
		memory: z.number().describe("Memory allocated to this sandbox in MB."),
		vcpus: z.number().describe("Number of vCPUs allocated to this sandbox."),
		region: z.string().describe("The region where the sandbox is hosted."),
		runtime: z.string().describe("The runtime of the sandbox."),
		timeout: z
			.number()
			.describe("The maximum amount of time the sandbox will run for in milliseconds."),
		status: z
			.enum(["aborted", "failed", "pending", "running", "snapshotting", "stopped", "stopping"])
			.describe("The status of the sandbox."),
		requestedAt: z
			.number()
			.describe("The time when the sandbox was requested, in milliseconds since the epoch."),
		startedAt: z
			.number()
			.optional()
			.describe("The time when the sandbox was started, in milliseconds since the epoch."),
		cwd: z.string().describe("The working directory of the sandbox."),
		requestedStopAt: z
			.number()
			.optional()
			.describe(
				"The time when the sandbox was requested to stop, in milliseconds since the epoch.",
			),
		stoppedAt: z
			.number()
			.optional()
			.describe("The time when the sandbox was stopped, in milliseconds since the epoch."),
		abortedAt: z
			.number()
			.optional()
			.describe("The time when the sandbox was aborted, in milliseconds since the epoch."),
		duration: z.number().optional().describe("The duration of the sandbox in milliseconds."),
		sourceSnapshotId: z
			.string()
			.optional()
			.describe("The unique identifier of the snapshot associated with this sandbox, if any."),
		snapshottedAt: z
			.number()
			.optional()
			.describe("The time when a snapshot was requested, in milliseconds since the epoch."),
		createdAt: z
			.number()
			.describe("The time when the sandbox was created, in milliseconds since the epoch."),
		updatedAt: z
			.number()
			.describe("The last time the sandbox was updated, in milliseconds since the epoch."),
		networkPolicy: z.unknown().optional(),
		activeCpuDurationMs: z
			.number()
			.optional()
			.describe(
				"The amount of CPU time the sandbox consumed, if available, in milliseconds. This value is only available once the sandbox is stopped, and only if it stopped successfully.",
			),
		networkTransfer: z
			.object({
				ingress: z.number(),
				egress: z.number(),
			})
			.optional()
			.describe(
				"The quantity of data transfered to and from the sandbox, in bytes. This value is only available once the sandbox is stopped, and only if it stopped successfully.",
			),
	})
	.describe(
		'This object contains information related to a Vercel Sandbox Session. v2 endpoints return "session" instead of "sandbox" as the response wrapper key.',
	);

export const sandboxPublicRouteSchema = z
	.object({
		url: z.string().describe("A public URL to access the corresponding port in the Sandbox."),
		port: z.number().describe("The user port number that the route is mapped to."),
		subdomain: z.string().describe("The subdomain assigned to this route."),
		system: z
			.literal(true)
			.optional()
			.describe("Whether the route is reserved by the system (e.g. for internal use)."),
	})
	.describe("This object represents a public route in a Vercel Sandbox.");

export const driveSchema = z
	.object({
		name: z.string().describe("The unique drive name within the project."),
		projectId: z.string().describe("The project that owns the drive."),
		maxSizeBytes: z.number().describe("The maximum drive size in bytes."),
		currentSessionId: z
			.string()
			.optional()
			.describe("Current session ID the drive is attached to, if any."),
		currentSandboxName: z
			.string()
			.optional()
			.describe("Current sandbox name the drive is attached to, if any."),
		createdAt: z
			.number()
			.describe("The time when the drive was created, in milliseconds since the epoch."),
		updatedAt: z
			.number()
			.describe("The last time the drive was updated, in milliseconds since the epoch."),
	})
	.describe("This object contains information related to a Vercel Sandbox Drive.");

export const snapshotSchema = z
	.object({
		id: z.string().describe("The unique identifier of the snapshot."),
		sourceSessionId: z
			.string()
			.describe("The unique identifier of the session from which the snapshot was created."),
		region: z.string().describe("The region where the snapshot is stored."),
		status: z.enum(["created", "deleted", "failed"]).describe("The status of the snapshot."),
		sizeBytes: z.number().describe("The size of the snapshot in bytes."),
		expiresAt: z
			.number()
			.optional()
			.describe(
				"The time when the snapshot will expire, in milliseconds since the epoch. If not set, the snapshot does not have any expiration.",
			),
		createdAt: z
			.number()
			.describe("The time when the snapshot was created, in milliseconds since the epoch."),
		updatedAt: z
			.number()
			.describe("The last time the snapshot was updated, in milliseconds since the epoch."),
		lastUsedAt: z
			.number()
			.describe(
				"The last time the snapshot was used (e.g. to resume or create a sandbox), in milliseconds since the epoch. Falls back to `createdAt` for older snapshots that predate this field.",
			),
		creationMethod: z
			.enum(["automatic", "manual"])
			.optional()
			.describe("The method used to create the snapshot."),
		parentId: z
			.string()
			.optional()
			.describe(
				"The unique identifier of the parent snapshot, if this snapshot was created from another snapshot.",
			),
	})
	.describe(
		"This object contains information related to a Snapshot of a Vercel Sandbox session (v2 API).",
	);

export const sessionCommandSchema = z
	.object({
		id: z.string().describe("The ID of the command."),
		name: z.string().describe("The name of the command."),
		args: z.array(z.string()).describe("The arguments of the command."),
		cwd: z.string().describe("The current working directory of the command."),
		sessionId: z.string().describe("The ID of the session associated with the command."),
		exitCode: z.number().nullable().describe("If the command did finish, the exit code."),
		startedAt: z
			.number()
			.describe("When the command was started, in milliseconds since the epoch."),
	})
	.describe("This object represents a command run in a Vercel Sandbox session (v2 API).");

export const invitedTeamMemberSchema = z
	.object({
		uid: z.string().describe("The ID of the invited user"),
		username: z.string().describe("The username of the invited user"),
		email: z.string().describe("The email of the invited user."),
		role: z
			.enum([
				"BILLING",
				"CONTRIBUTOR",
				"DEVELOPER",
				"MEMBER",
				"OWNER",
				"SECURITY",
				"VIEWER",
				"VIEWER_FOR_PLUS",
			])
			.describe("The role used for the invitation"),
		teamRoles: z
			.array(
				z.enum([
					"BILLING",
					"CONTRIBUTOR",
					"DEVELOPER",
					"MEMBER",
					"OWNER",
					"SECURITY",
					"VIEWER",
					"VIEWER_FOR_PLUS",
				]),
			)
			.optional()
			.describe("The team roles of the user"),
		teamPermissions: z
			.array(
				z.enum([
					"CreateProject",
					"EnvVariableManager",
					"EnvironmentManager",
					"FullProductionDeployment",
					"IntegrationManager",
					"OrgAdmin",
					"OrgViewer",
					"UsageViewer",
					"V0Builder",
					"V0Chatter",
					"V0Viewer",
				]),
			)
			.optional()
			.describe("The team permissions of the user"),
	})
	.describe("The member was successfully added to the team.");

export const teamSchema = z
	.object({
		connect: z
			.object({
				enabled: z.union([z.literal(false), z.literal(true)]).optional(),
			})
			.optional(),
		creatorId: z.string().describe("The ID of the user who created the Team."),
		updatedAt: z
			.number()
			.describe("Timestamp (in milliseconds) of when the Team was last updated."),
		emailDomain: z
			.string()
			.nullish()
			.describe(
				"Hostname that'll be matched with emails on sign-up to automatically join the Team.",
			),
		saml: z
			.object({
				connection: z
					.object({
						status: z.string().describe("Current status of the connection."),
						type: z.string().describe('The Identity Provider "type", for example Okta.'),
						state: z.string().describe("Current state of the connection."),
						connectedAt: z
							.number()
							.describe("Timestamp (in milliseconds) of when the configuration was connected."),
						lastReceivedWebhookEvent: z
							.number()
							.optional()
							.describe(
								"Timestamp (in milliseconds) of when the last webhook event was received from WorkOS.",
							),
						lastSyncedAt: z
							.number()
							.optional()
							.describe(
								"Timestamp (in milliseconds) of when the last directory sync was performed.",
							),
						syncState: z
							.enum(["ACTIVE", "SETUP"])
							.optional()
							.describe(
								"Controls whether directory sync events are processed. - 'SETUP': Directory connected but role mappings not yet configured. Events are acknowledged but not processed. - 'ACTIVE': Fully configured. Events are processed normally. - undefined: Legacy directory (pre-feature), treat as 'ACTIVE' for backwards compatibility.",
							),
					})
					.optional()
					.describe("Information for the SAML Single Sign-On configuration."),
				directory: z
					.object({
						type: z.string().describe('The Identity Provider "type", for example Okta.'),
						state: z.string().describe("Current state of the connection."),
						connectedAt: z
							.number()
							.describe("Timestamp (in milliseconds) of when the configuration was connected."),
						lastReceivedWebhookEvent: z
							.number()
							.optional()
							.describe(
								"Timestamp (in milliseconds) of when the last webhook event was received from WorkOS.",
							),
						lastSyncedAt: z
							.number()
							.optional()
							.describe(
								"Timestamp (in milliseconds) of when the last directory sync was performed.",
							),
						syncState: z
							.enum(["ACTIVE", "SETUP"])
							.optional()
							.describe(
								"Controls whether directory sync events are processed. - 'SETUP': Directory connected but role mappings not yet configured. Events are acknowledged but not processed. - 'ACTIVE': Fully configured. Events are processed normally. - undefined: Legacy directory (pre-feature), treat as 'ACTIVE' for backwards compatibility.",
							),
					})
					.optional()
					.describe("Information for the Directory Sync configuration."),
				enforced: z
					.union([z.literal(false), z.literal(true)])
					.describe(
						"When `true`, interactions with the Team **must** be done with an authentication token that has been authenticated with the Team's SAML Single Sign-On provider.",
					),
				defaultRedirectUri: z
					.enum(["v0.app", "v0.dev", "vercel.com"])
					.optional()
					.describe("The default redirect URI to use after successful SAML authentication."),
				roles: z
					.object({})
					.catchall(
						z.union([
							z
								.object({
									accessGroupId: z.string(),
								})
								.strict(),
							z.enum([
								"BILLING",
								"CONTRIBUTOR",
								"DEVELOPER",
								"MEMBER",
								"OWNER",
								"SECURITY",
								"VIEWER",
								"VIEWER_FOR_PLUS",
							]),
						]),
					)
					.optional()
					.describe(
						'When "Directory Sync" is configured, this object contains a mapping of which Directory Group (by ID) should be assigned to which Vercel Team "role".',
					),
			})
			.optional()
			.describe(
				'When "Single Sign-On (SAML)" is configured, this object contains information regarding the configuration of the Identity Provider (IdP).',
			),
		inviteCode: z
			.string()
			.optional()
			.describe("Code that can be used to join this Team. Only visible to Team owners."),
		description: z.string().nullable().describe("A short description of the Team."),
		defaultRoles: z
			.object({
				teamRoles: z
					.array(
						z.enum([
							"BILLING",
							"CONTRIBUTOR",
							"DEVELOPER",
							"MEMBER",
							"OWNER",
							"SECURITY",
							"VIEWER",
							"VIEWER_FOR_PLUS",
						]),
					)
					.optional(),
				teamPermissions: z
					.array(
						z.enum([
							"CreateProject",
							"EnvVariableManager",
							"EnvironmentManager",
							"FullProductionDeployment",
							"IntegrationManager",
							"OrgAdmin",
							"OrgViewer",
							"UsageViewer",
							"V0Builder",
							"V0Chatter",
							"V0Viewer",
						]),
					)
					.optional(),
			})
			.optional()
			.describe("Default roles for the team."),
		stagingPrefix: z.string().describe("The prefix that is prepended to automatic aliases."),
		resourceConfig: z
			.object({
				concurrentBuilds: z
					.number()
					.optional()
					.describe("The total amount of concurrent builds that can be used."),
				elasticConcurrencyEnabled: z
					.union([z.literal(false), z.literal(true)])
					.optional()
					.describe(
						"Whether every build for this team / user has elastic concurrency enabled automatically.",
					),
				edgeConfigSize: z
					.number()
					.optional()
					.describe(
						"The maximum size in kilobytes of an Edge Config. Only specified if a custom limit is set.",
					),
				edgeConfigs: z
					.number()
					.optional()
					.describe("The maximum number of edge configs an account can create."),
				kvDatabases: z
					.number()
					.optional()
					.describe("The maximum number of kv databases an account can create."),
				blobStores: z
					.number()
					.optional()
					.describe("The maximum number of blob stores an account can create."),
				postgresDatabases: z
					.number()
					.optional()
					.describe("The maximum number of postgres databases an account can create."),
				customEnvironmentsPerProject: z
					.number()
					.optional()
					.describe("The maximum number of custom environments allowed per project."),
				serverlessFunctionMaxMemorySize: z
					.number()
					.optional()
					.describe(
						"The maximum memory size (in MB) for a serverless function. Only specified if a custom limit is set.",
					),
				buildEntitlements: z
					.object({
						enhancedBuilds: z.union([z.literal(false), z.literal(true)]).optional(),
					})
					.optional(),
				buildMachine: z
					.object({
						default: z
							.enum(["elastic", "enhanced", "standard", "turbo"])
							.optional()
							.describe("Default build machine type for new builds"),
					})
					.optional()
					.describe("Build machine configuration"),
			})
			.optional(),
		previewDeploymentSuffix: z
			.string()
			.nullish()
			.describe("The hostname that is current set as preview deployment suffix."),
		platform: z
			.union([z.literal(false), z.literal(true)])
			.optional()
			.describe("Whether the team is a platform team."),
		disableHardAutoBlocks: z
			.union([z.number(), z.union([z.literal(false), z.literal(true)])])
			.optional(),
		remoteCaching: z
			.object({
				enabled: z.union([z.literal(false), z.literal(true)]).optional(),
			})
			.optional()
			.describe("Is remote caching enabled for this team"),
		defaultDeploymentProtection: z
			.object({
				passwordProtection: z
					.object({
						deploymentType: z.string(),
					})
					.nullish(),
				ssoProtection: z
					.object({
						deploymentType: z.string(),
					})
					.nullish(),
			})
			.optional()
			.describe(
				"Default deployment protection for this team null indicates protection is disabled",
			),
		defaultPassport: z
			.object({
				connectorId: z
					.string()
					.describe("Default Passport configuration for new projects in this team."),
				deploymentType: z
					.enum([
						"all",
						"all_except_custom_domains",
						"preview",
						"prod_deployment_urls_and_all_previews",
					])
					.describe("Default Passport configuration for new projects in this team."),
			})
			.nullish()
			.describe("Default Passport configuration for new projects in this team."),
		defaultExpirationSettings: z
			.object({
				expirationDays: z
					.number()
					.optional()
					.describe(
						"Number of days to keep non-production deployments (mostly preview deployments) before soft deletion.",
					),
				expirationDaysProduction: z
					.number()
					.optional()
					.describe("Number of days to keep production deployments before soft deletion."),
				expirationDaysCanceled: z
					.number()
					.optional()
					.describe("Number of days to keep canceled deployments before soft deletion."),
				expirationDaysErrored: z
					.number()
					.optional()
					.describe("Number of days to keep errored deployments before soft deletion."),
				deploymentsToKeep: z
					.number()
					.optional()
					.describe(
						"Minimum number of production deployments to keep for this project, even if they are over the production expiration limit.",
					),
			})
			.optional()
			.describe("Default deployment expiration settings for this team"),
		defaultProjectJobs: z
			.object({
				lint: z
					.object({
						targets: z
							.array(z.string())
							.describe("Default job configuration applied to new projects created in this team."),
					})
					.optional()
					.describe("Default job configuration applied to new projects created in this team."),
				typecheck: z
					.object({
						targets: z
							.array(z.string())
							.describe("Default job configuration applied to new projects created in this team."),
					})
					.optional()
					.describe("Default job configuration applied to new projects created in this team."),
				mfeConfigPresent: z
					.object({
						targets: z
							.array(z.string())
							.describe("Default job configuration applied to new projects created in this team."),
					})
					.optional()
					.describe("Default job configuration applied to new projects created in this team."),
			})
			.optional()
			.describe("Default job configuration applied to new projects created in this team."),
		enablePreviewFeedback: z
			.enum(["default", "default-force", "off", "off-force", "on", "on-force"])
			.nullish()
			.describe("Whether toolbar is enabled on preview deployments"),
		enableProductionFeedback: z
			.enum(["default", "default-force", "off", "off-force", "on", "on-force"])
			.nullish()
			.describe("Whether toolbar is enabled on production deployments"),
		sensitiveEnvironmentVariablePolicy: z
			.enum(["default", "off", "on"])
			.nullish()
			.describe("Sensitive environment variable policy for this team"),
		hideIpAddresses: z
			.union([z.literal(false), z.literal(true)])
			.nullish()
			.describe("Indicates if IP addresses should be accessible in observability (o11y) tooling"),
		hideIpAddressesInLogDrains: z
			.union([z.literal(false), z.literal(true)])
			.nullish()
			.describe("Indicates if IP addresses should be accessible in log drains"),
		dpAccessRequestsMode: z
			.enum(["all", "email-domain", "none"])
			.optional()
			.describe("Controls who can request access to protected deployments."),
		ipBuckets: z
			.array(
				z.object({
					bucket: z.string(),
					supportUntil: z.number().optional(),
					default: z.union([z.literal(false), z.literal(true)]).optional(),
				}),
			)
			.optional(),
		requireVerifiedCommits: z
			.union([z.literal(false), z.literal(true)])
			.optional()
			.describe(
				"When enabled, all projects in the team require commits to be signed and verified by the git provider before deployments will be created. Projects may override this via `project.gitProviderOptions.requireVerifiedCommits` (gated by `Project:Update`).",
			),
		disableRepositoryDispatchEvents: z
			.union([z.literal(false), z.literal(true)])
			.optional()
			.describe(
				"Default for projects in the team. When `true`, projects in this team will not emit GitHub repository-dispatch events on deployment events unless the project explicitly overrides this setting via `project.gitProviderOptions.disableRepositoryDispatchEvents`.",
			),
		strictDeploymentProtectionSettings: z
			.object({
				enabled: z.union([z.literal(false), z.literal(true)]),
				updatedAt: z.number(),
			})
			.optional()
			.describe(
				"When enabled, deployment protection settings require stricter permissions (owner-only).",
			),
		strictShareableLinks: z
			.object({
				enabled: z.union([z.literal(false), z.literal(true)]),
				updatedAt: z.number(),
			})
			.optional()
			.describe("When enabled, creating shareable links requires Owner role."),
		nsnbConfig: z
			.object({
				preference: z.enum(["auto-approval", "block", "manual-approval"]),
			})
			.optional()
			.describe("NSNB configuration for the team."),
		deploymentPolicy: z
			.object({
				gitSources: z
					.array(
						z.object({
							sources: z.array(
								z.union([
									z
										.object({
											provider: z.enum(["bitbucket", "github"]),
											org: z.string(),
											repo: z.string().optional(),
										})
										.strict(),
									z
										.object({
											provider: z.enum(["gitlab"]),
											namespace: z.string(),
											project: z.string().optional(),
										})
										.strict(),
								]),
							),
							enabled: z.union([z.literal(false), z.literal(true)]),
							environments: z.array(
								z.union([
									z
										.object({
											type: z.enum(["system"]),
											target: z.enum(["preview", "production"]),
										})
										.strict(),
									z
										.object({
											type: z.enum(["custom"]),
											environmentId: z.string(),
										})
										.strict(),
								]),
							),
						}),
					)
					.optional(),
				deploymentSources: z
					.array(
						z.object({
							sources: z.array(
								z.enum(["cli", "deploy-hook", "git", "integration", "rest-api", "v0"]),
							),
							enabled: z.union([z.literal(false), z.literal(true)]),
							environments: z.array(
								z.union([
									z
										.object({
											type: z.enum(["system"]),
											target: z.enum(["preview", "production"]),
										})
										.strict(),
									z
										.object({
											type: z.enum(["custom"]),
											environmentId: z.string(),
										})
										.strict(),
								]),
							),
						}),
					)
					.optional(),
			})
			.optional()
			.describe(
				"Composable deployment-time policy for the team. Used as the default for every project on the team, with optional per-project overrides on `project.deploymentPolicy`.",
			),
		personalAccessTokensInvalidatedAt: z
			.number()
			.optional()
			.describe(
				"Timestamp (ms) after which personal access tokens created at or before this time are considered invalid for this team.",
			),
		appTokensInvalidatedAt: z
			.number()
			.optional()
			.describe(
				"Timestamp (ms) after which Vercel App tokens created at or before this time are considered invalid for this team.",
			),
		apiKeysInvalidatedAt: z
			.number()
			.optional()
			.describe(
				"Timestamp (ms) after which API keys created at or before this time are considered invalid for this team.",
			),
		integrationTokensInvalidatedAt: z
			.number()
			.optional()
			.describe(
				"Timestamp (ms) after which integration tokens created at or before this time are considered invalid for this team.",
			),
		id: z.string().describe("The Team's unique identifier."),
		slug: z.string().describe("The Team's slug, which is unique across the Vercel platform."),
		name: z
			.string()
			.nullable()
			.describe("Name associated with the Team account, or `null` if none has been provided."),
		avatar: z.string().nullable().describe("The ID of the file used as avatar for this Team."),
		membership: z
			.object({
				uid: z.string().optional(),
				entitlements: z
					.array(
						z.object({
							entitlement: z.string(),
						}),
					)
					.optional(),
				teamId: z.string().optional(),
				confirmed: z.literal(true),
				accessRequestedAt: z.number().optional(),
				role: z.enum([
					"BILLING",
					"CONTRIBUTOR",
					"DEVELOPER",
					"MEMBER",
					"OWNER",
					"SECURITY",
					"VIEWER",
					"VIEWER_FOR_PLUS",
				]),
				teamRoles: z
					.array(
						z.enum([
							"BILLING",
							"CONTRIBUTOR",
							"DEVELOPER",
							"MEMBER",
							"OWNER",
							"SECURITY",
							"VIEWER",
							"VIEWER_FOR_PLUS",
						]),
					)
					.optional(),
				teamPermissions: z
					.array(
						z.enum([
							"CreateProject",
							"EnvVariableManager",
							"EnvironmentManager",
							"FullProductionDeployment",
							"IntegrationManager",
							"OrgAdmin",
							"OrgViewer",
							"UsageViewer",
							"V0Builder",
							"V0Chatter",
							"V0Viewer",
						]),
					)
					.optional(),
				createdAt: z.number(),
				created: z.number(),
				joinedFrom: z
					.object({
						origin: z.enum([
							"account-update",
							"bitbucket",
							"dsync",
							"feedback",
							"github",
							"gitlab",
							"import",
							"link",
							"mail",
							"nsnb-auto-approve",
							"nsnb-hobby-upgrade",
							"nsnb-invite",
							"nsnb-redeploy",
							"nsnb-redeploy-attribution-card",
							"nsnb-request-access",
							"nsnb-viewer-upgrade",
							"organization-teams",
							"saml",
							"teams",
						]),
						commitId: z.string().optional(),
						repoId: z.string().optional(),
						repoPath: z.string().optional(),
						gitUserId: z.union([z.string(), z.number()]).optional(),
						gitUserLogin: z.string().optional(),
						ssoUserId: z.string().optional(),
						ssoConnectedAt: z.number().optional(),
						idpUserId: z.string().optional(),
						dsyncUserId: z.string().optional(),
						dsyncConnectedAt: z.number().optional(),
					})
					.optional(),
			})
			.optional()
			.describe("The membership of the authenticated User in relation to the Team."),
		createdAt: z.number().describe("UNIX timestamp (in milliseconds) when the Team was created."),
		parentId: z
			.string()
			.optional()
			.describe("The organizationId for child teams created under an organization."),
	})
	.catchall(z.unknown())
	.describe("Data representing a Team.");

export const teamLimitedSchema = z
	.object({
		limited: z
			.literal(true)
			.describe(
				"Property indicating that this Team data contains only limited information, due to the authentication token missing privileges to read the full Team data or due to team having MFA enforced and the user not having MFA enabled. Re-login with the Team's configured SAML Single Sign-On provider in order to upgrade the authentication token with the necessary privileges.",
			),
		limitedBy: z.array(z.enum(["invalidated", "mfa", "scope"])),
		saml: z
			.object({
				connection: z
					.object({
						status: z.string().describe("Current status of the connection."),
						type: z.string().describe('The Identity Provider "type", for example Okta.'),
						state: z.string().describe("Current state of the connection."),
						connectedAt: z
							.number()
							.describe("Timestamp (in milliseconds) of when the configuration was connected."),
						lastReceivedWebhookEvent: z
							.number()
							.optional()
							.describe(
								"Timestamp (in milliseconds) of when the last webhook event was received from WorkOS.",
							),
						lastSyncedAt: z
							.number()
							.optional()
							.describe(
								"Timestamp (in milliseconds) of when the last directory sync was performed.",
							),
						syncState: z
							.enum(["ACTIVE", "SETUP"])
							.optional()
							.describe(
								"Controls whether directory sync events are processed. - 'SETUP': Directory connected but role mappings not yet configured. Events are acknowledged but not processed. - 'ACTIVE': Fully configured. Events are processed normally. - undefined: Legacy directory (pre-feature), treat as 'ACTIVE' for backwards compatibility.",
							),
					})
					.optional()
					.describe("Information for the SAML Single Sign-On configuration."),
				directory: z
					.object({
						type: z.string().describe('The Identity Provider "type", for example Okta.'),
						state: z.string().describe("Current state of the connection."),
						connectedAt: z
							.number()
							.describe("Timestamp (in milliseconds) of when the configuration was connected."),
						lastReceivedWebhookEvent: z
							.number()
							.optional()
							.describe(
								"Timestamp (in milliseconds) of when the last webhook event was received from WorkOS.",
							),
						lastSyncedAt: z
							.number()
							.optional()
							.describe(
								"Timestamp (in milliseconds) of when the last directory sync was performed.",
							),
						syncState: z
							.enum(["ACTIVE", "SETUP"])
							.optional()
							.describe(
								"Controls whether directory sync events are processed. - 'SETUP': Directory connected but role mappings not yet configured. Events are acknowledged but not processed. - 'ACTIVE': Fully configured. Events are processed normally. - undefined: Legacy directory (pre-feature), treat as 'ACTIVE' for backwards compatibility.",
							),
					})
					.optional()
					.describe("Information for the Directory Sync configuration."),
				enforced: z
					.union([z.literal(false), z.literal(true)])
					.describe(
						"When `true`, interactions with the Team **must** be done with an authentication token that has been authenticated with the Team's SAML Single Sign-On provider.",
					),
			})
			.optional()
			.describe(
				'When "Single Sign-On (SAML)" is configured, this object contains information that allows the client-side to identify whether or not this Team has SAML enforced.',
			),
		id: z.string().describe("The Team's unique identifier."),
		slug: z.string().describe("The Team's slug, which is unique across the Vercel platform."),
		name: z
			.string()
			.nullable()
			.describe("Name associated with the Team account, or `null` if none has been provided."),
		avatar: z.string().nullable().describe("The ID of the file used as avatar for this Team."),
		membership: z
			.object({
				uid: z.string().optional(),
				entitlements: z
					.array(
						z.object({
							entitlement: z.string(),
						}),
					)
					.optional(),
				teamId: z.string().optional(),
				confirmed: z.literal(true),
				accessRequestedAt: z.number().optional(),
				role: z.enum([
					"BILLING",
					"CONTRIBUTOR",
					"DEVELOPER",
					"MEMBER",
					"OWNER",
					"SECURITY",
					"VIEWER",
					"VIEWER_FOR_PLUS",
				]),
				teamRoles: z
					.array(
						z.enum([
							"BILLING",
							"CONTRIBUTOR",
							"DEVELOPER",
							"MEMBER",
							"OWNER",
							"SECURITY",
							"VIEWER",
							"VIEWER_FOR_PLUS",
						]),
					)
					.optional(),
				teamPermissions: z
					.array(
						z.enum([
							"CreateProject",
							"EnvVariableManager",
							"EnvironmentManager",
							"FullProductionDeployment",
							"IntegrationManager",
							"OrgAdmin",
							"OrgViewer",
							"UsageViewer",
							"V0Builder",
							"V0Chatter",
							"V0Viewer",
						]),
					)
					.optional(),
				createdAt: z.number(),
				created: z.number(),
				joinedFrom: z
					.object({
						origin: z.enum([
							"account-update",
							"bitbucket",
							"dsync",
							"feedback",
							"github",
							"gitlab",
							"import",
							"link",
							"mail",
							"nsnb-auto-approve",
							"nsnb-hobby-upgrade",
							"nsnb-invite",
							"nsnb-redeploy",
							"nsnb-redeploy-attribution-card",
							"nsnb-request-access",
							"nsnb-viewer-upgrade",
							"organization-teams",
							"saml",
							"teams",
						]),
						commitId: z.string().optional(),
						repoId: z.string().optional(),
						repoPath: z.string().optional(),
						gitUserId: z.union([z.string(), z.number()]).optional(),
						gitUserLogin: z.string().optional(),
						ssoUserId: z.string().optional(),
						ssoConnectedAt: z.number().optional(),
						idpUserId: z.string().optional(),
						dsyncUserId: z.string().optional(),
						dsyncConnectedAt: z.number().optional(),
					})
					.optional(),
			})
			.optional()
			.describe("The membership of the authenticated User in relation to the Team."),
		createdAt: z.number().describe("UNIX timestamp (in milliseconds) when the Team was created."),
		parentId: z
			.string()
			.optional()
			.describe("The organizationId for child teams created under an organization."),
	})
	.describe(
		"A limited form of data representing a Team, due to the authentication token missing privileges to read the full Team data.",
	);

export const authTokenSchema = z
	.object({
		id: z.string().describe("The unique identifier of the token."),
		name: z.string().describe("The human-readable name of the token."),
		type: z.string().describe("The type of the token."),
		prefix: z.string().optional().describe("The token's prefix, for identification purposes."),
		suffix: z
			.string()
			.optional()
			.describe("The last few characters of the token, for identification purposes."),
		origin: z.string().optional().describe("The origin of how the token was created."),
		scopes: z
			.array(
				z.union([
					z
						.object({
							type: z.enum(["user"]),
							sudo: z
								.object({
									origin: z
										.enum(["email-otp", "otp", "recovery-code", "totp", "webauthn"])
										.describe("Possible step-up auth origins"),
									verifiedAt: z.number().optional(),
									expiresAt: z.number(),
								})
								.optional(),
							origin: z
								.enum([
									"app",
									"apple",
									"bitbucket",
									"chatgpt",
									"email",
									"emu",
									"github",
									"github-webhook",
									"gitlab",
									"google",
									"invite",
									"manual",
									"otp",
									"passkey",
									"saml",
									"sms",
									"token-exchange-oidc",
								])
								.optional(),
							createdAt: z.number(),
							expiresAt: z.number().optional(),
						})
						.strict(),
					z
						.object({
							type: z.enum(["team"]),
							teamId: z.string(),
							origin: z
								.enum([
									"app",
									"apple",
									"bitbucket",
									"chatgpt",
									"email",
									"emu",
									"github",
									"github-webhook",
									"gitlab",
									"google",
									"invite",
									"manual",
									"otp",
									"passkey",
									"saml",
									"sms",
									"token-exchange-oidc",
								])
								.optional(),
							createdAt: z.number(),
							expiresAt: z.number().optional(),
						})
						.strict(),
				]),
			)
			.optional()
			.describe("The access scopes granted to the token."),
		createdAt: z.number().describe("Timestamp (in milliseconds) of when the token was created."),
		activeAt: z
			.number()
			.describe("Timestamp (in milliseconds) of when the token was most recently used."),
		expiresAt: z
			.number()
			.optional()
			.describe("Timestamp (in milliseconds) of when the token expires."),
		revokedAt: z
			.number()
			.optional()
			.describe("Timestamp (in milliseconds) of when the token was revoked."),
		leakedAt: z
			.number()
			.optional()
			.describe("Timestamp (in milliseconds) of when the token was marked as leaked."),
		leakedUrl: z.string().optional().describe("URL where the token was discovered as leaked."),
	})
	.describe("Authentication token metadata.");

export const authUserSchema = z
	.object({
		createdAt: z
			.number()
			.describe("UNIX timestamp (in milliseconds) when the User account was created."),
		softBlock: z
			.object({
				blockedAt: z.number(),
				reason: z.enum([
					"BLOCKED_FOR_PLATFORM_ABUSE",
					"ENTERPRISE_TRIAL_ENDED",
					"ENTERPRISE_UNPAID_INVOICE",
					"EXPOSURE_CAP_EXCEEDED",
					"FAIR_USE_LIMITS_EXCEEDED",
					"SUBSCRIPTION_CANCELED",
					"SUBSCRIPTION_EXPIRED",
					"UNPAID_INVOICE",
				]),
				blockedDueToOverageType: z
					.enum([
						"analyticsUsage",
						"artifacts",
						"bandwidth",
						"blobDataTransfer",
						"blobTotalAdvancedRequests",
						"blobTotalAvgSizeInBytes",
						"blobTotalGetResponseObjectSizeInBytes",
						"blobTotalSimpleRequests",
						"connectDataTransfer",
						"dataCacheRead",
						"dataCacheWrite",
						"edgeConfigRead",
						"edgeConfigWrite",
						"edgeFunctionExecutionUnits",
						"edgeMiddlewareInvocations",
						"edgeRequest",
						"edgeRequestAdditionalCpuDuration",
						"elasticConcurrencyBuildSlots",
						"fastDataTransfer",
						"fastOriginTransfer",
						"fluidCpuDuration",
						"fluidDuration",
						"functionDuration",
						"functionInvocation",
						"imageOptimizationCacheRead",
						"imageOptimizationCacheWrite",
						"imageOptimizationTransformation",
						"logDrainsVolume",
						"monitoringMetric",
						"observabilityEvent",
						"onDemandConcurrencyMinutes",
						"runtimeCacheRead",
						"runtimeCacheWrite",
						"serverlessFunctionExecution",
						"sourceImages",
						"wafOwaspExcessBytes",
						"wafOwaspRequests",
						"wafRateLimitRequest",
						"webAnalyticsEvent",
					])
					.optional(),
			})
			.nullable()
			.describe(
				'When the User account has been "soft blocked", this property will contain the date when the restriction was enacted, and the identifier for why.',
			),
		billing: z
			.object({})
			.nullable()
			.describe("An object containing billing infomation associated with the User account."),
		resourceConfig: z
			.object({
				nodeType: z
					.string()
					.optional()
					.describe(
						"An object containing infomation related to the amount of platform resources may be allocated to the User account.",
					),
				concurrentBuilds: z
					.number()
					.optional()
					.describe(
						"An object containing infomation related to the amount of platform resources may be allocated to the User account.",
					),
				elasticConcurrencyEnabled: z
					.union([z.literal(false), z.literal(true)])
					.optional()
					.describe(
						"An object containing infomation related to the amount of platform resources may be allocated to the User account.",
					),
				buildEntitlements: z
					.object({
						enhancedBuilds: z
							.union([z.literal(false), z.literal(true)])
							.optional()
							.describe(
								"An object containing infomation related to the amount of platform resources may be allocated to the User account.",
							),
					})
					.optional()
					.describe(
						"An object containing infomation related to the amount of platform resources may be allocated to the User account.",
					),
				buildQueue: z
					.object({
						configuration: z
							.enum(["SKIP_NAMESPACE_QUEUE", "WAIT_FOR_NAMESPACE_QUEUE"])
							.optional()
							.describe(
								"An object containing infomation related to the amount of platform resources may be allocated to the User account.",
							),
					})
					.optional()
					.describe(
						"An object containing infomation related to the amount of platform resources may be allocated to the User account.",
					),
				awsAccountType: z
					.string()
					.optional()
					.describe(
						"An object containing infomation related to the amount of platform resources may be allocated to the User account.",
					),
				awsAccountIds: z
					.array(z.string())
					.optional()
					.describe(
						"An object containing infomation related to the amount of platform resources may be allocated to the User account.",
					),
				cfZoneName: z
					.string()
					.optional()
					.describe(
						"An object containing infomation related to the amount of platform resources may be allocated to the User account.",
					),
				imageOptimizationType: z
					.string()
					.optional()
					.describe(
						"An object containing infomation related to the amount of platform resources may be allocated to the User account.",
					),
				edgeConfigs: z
					.number()
					.optional()
					.describe(
						"An object containing infomation related to the amount of platform resources may be allocated to the User account.",
					),
				edgeConfigSize: z
					.number()
					.optional()
					.describe(
						"An object containing infomation related to the amount of platform resources may be allocated to the User account.",
					),
				edgeFunctionMaxSizeBytes: z
					.number()
					.optional()
					.describe(
						"An object containing infomation related to the amount of platform resources may be allocated to the User account.",
					),
				edgeFunctionExecutionTimeoutMs: z
					.number()
					.optional()
					.describe(
						"An object containing infomation related to the amount of platform resources may be allocated to the User account.",
					),
				serverlessFunctionMaxMemorySize: z
					.number()
					.optional()
					.describe(
						"An object containing infomation related to the amount of platform resources may be allocated to the User account.",
					),
				kvDatabases: z
					.number()
					.optional()
					.describe(
						"An object containing infomation related to the amount of platform resources may be allocated to the User account.",
					),
				postgresDatabases: z
					.number()
					.optional()
					.describe(
						"An object containing infomation related to the amount of platform resources may be allocated to the User account.",
					),
				blobStores: z
					.number()
					.optional()
					.describe(
						"An object containing infomation related to the amount of platform resources may be allocated to the User account.",
					),
				integrationStores: z
					.number()
					.optional()
					.describe(
						"An object containing infomation related to the amount of platform resources may be allocated to the User account.",
					),
				cronJobsPerProject: z
					.number()
					.optional()
					.describe(
						"An object containing infomation related to the amount of platform resources may be allocated to the User account.",
					),
				microfrontendGroupsPerTeam: z
					.number()
					.optional()
					.describe(
						"An object containing infomation related to the amount of platform resources may be allocated to the User account.",
					),
				microfrontendProjectsPerGroup: z
					.number()
					.optional()
					.describe(
						"An object containing infomation related to the amount of platform resources may be allocated to the User account.",
					),
				flagsExplorerOverridesThreshold: z
					.number()
					.optional()
					.describe(
						"An object containing infomation related to the amount of platform resources may be allocated to the User account.",
					),
				flagsExplorerUnlimitedOverrides: z
					.union([z.literal(false), z.literal(true)])
					.optional()
					.describe(
						"An object containing infomation related to the amount of platform resources may be allocated to the User account.",
					),
				customEnvironmentsPerProject: z
					.number()
					.optional()
					.describe(
						"An object containing infomation related to the amount of platform resources may be allocated to the User account.",
					),
				security: z
					.object({
						customRules: z
							.number()
							.optional()
							.describe(
								"An object containing infomation related to the amount of platform resources may be allocated to the User account.",
							),
						ipBlocks: z
							.number()
							.optional()
							.describe(
								"An object containing infomation related to the amount of platform resources may be allocated to the User account.",
							),
						ipBypass: z
							.number()
							.optional()
							.describe(
								"An object containing infomation related to the amount of platform resources may be allocated to the User account.",
							),
						rateLimit: z
							.number()
							.optional()
							.describe(
								"An object containing infomation related to the amount of platform resources may be allocated to the User account.",
							),
					})
					.optional()
					.describe(
						"An object containing infomation related to the amount of platform resources may be allocated to the User account.",
					),
				bulkRedirectsFreeLimitOverride: z
					.number()
					.optional()
					.describe(
						"An object containing infomation related to the amount of platform resources may be allocated to the User account.",
					),
			})
			.describe(
				"An object containing infomation related to the amount of platform resources may be allocated to the User account.",
			),
		stagingPrefix: z
			.string()
			.describe(
				'Prefix that will be used in the URL of "Preview" deployments created by the User account.',
			),
		activeDashboardViews: z
			.array(
				z.object({
					scopeId: z.string(),
					viewPreference: z.enum(["cards", "list"]).nullish(),
					favoritesViewPreference: z.enum(["closed", "open"]).nullish(),
					recentsViewPreference: z.enum(["closed", "open"]).nullish(),
				}),
			)
			.optional()
			.describe("set of dashboard view preferences (cards or list) per scopeId"),
		importFlowGitNamespace: z.union([z.string(), z.number()]).nullish(),
		importFlowGitNamespaceId: z.union([z.string(), z.number()]).nullish(),
		importFlowGitProvider: z
			.enum(["bitbucket", "github", "github-custom-host", "github-limited", "gitlab", "vercel"])
			.nullish(),
		preferredScopesAndGitNamespaces: z
			.array(
				z.object({
					scopeId: z.string(),
					gitNamespaceId: z.union([z.string(), z.number()]).nullable(),
				}),
			)
			.optional(),
		dismissedToasts: z
			.array(
				z.object({
					name: z.string(),
					dismissals: z.array(
						z.object({
							scopeId: z.string(),
							createdAt: z.number(),
						}),
					),
				}),
			)
			.optional()
			.describe("A record of when, under a certain scopeId, a toast was dismissed"),
		favoriteProjectsAndSpaces: z
			.array(
				z.object({
					teamId: z.string(),
					projectId: z.string(),
				}),
			)
			.optional()
			.describe("A list of projects and spaces across teams that a user has marked as a favorite."),
		hasTrialAvailable: z
			.union([z.literal(false), z.literal(true)])
			.describe("Whether the user has a trial available for a paid plan subscription."),
		remoteCaching: z
			.object({
				enabled: z.union([z.literal(false), z.literal(true)]).optional(),
			})
			.optional()
			.describe("remote caching settings"),
		dataCache: z
			.object({
				excessBillingEnabled: z.union([z.literal(false), z.literal(true)]).optional(),
			})
			.optional()
			.describe("data cache settings"),
		featureBlocks: z
			.object({
				webAnalytics: z
					.object({
						blockedFrom: z.number().optional(),
						blockedUntil: z.number().optional(),
						isCurrentlyBlocked: z.union([z.literal(false), z.literal(true)]),
					})
					.optional(),
			})
			.optional()
			.describe("Feature blocks for the user"),
		isAccountUpdateRequired: z
			.union([z.literal(false), z.literal(true)])
			.optional()
			.describe(
				"When `true`, the user must complete the EMU Update Account flow before they can use the dashboard.",
			),
		accountUpdateContext: z
			.object({
				managedTeams: z.array(
					z.object({
						name: z.string(),
						avatar: z.string().nullable(),
					}),
				),
			})
			.optional()
			.describe(
				"Context for the Update Account screen. Present only when `isAccountUpdateRequired` is true. `managedTeams` is empty for orphan mode (user matches an EMU domain but is not on the team).",
			),
		id: z.string().describe("The User's unique identifier."),
		email: z.string().describe("Email address associated with the User account."),
		name: z
			.string()
			.nullable()
			.describe("Name associated with the User account, or `null` if none has been provided."),
		username: z.string().describe("Unique username associated with the User account."),
		avatar: z
			.string()
			.nullable()
			.describe(
				"SHA1 hash of the avatar for the User account. Can be used in conjuction with the ... endpoint to retrieve the avatar image.",
			),
		defaultTeamId: z.string().nullable().describe("The user's default team."),
		isEnterpriseManaged: z
			.union([z.literal(false), z.literal(true)])
			.optional()
			.describe("Indicates whether the user is managed by an enterprise."),
	})
	.describe("Data for the currently authenticated User.");

export const authUserLimitedSchema = z
	.object({
		limited: z
			.literal(true)
			.describe(
				"Property indicating that this User data contains only limited information, due to the authentication token missing privileges to read the full User data. Re-login with email, GitHub, GitLab or Bitbucket in order to upgrade the authentication token with the necessary privileges.",
			),
		id: z.string().describe("The User's unique identifier."),
		email: z.string().describe("Email address associated with the User account."),
		name: z
			.string()
			.nullable()
			.describe("Name associated with the User account, or `null` if none has been provided."),
		username: z.string().describe("Unique username associated with the User account."),
		avatar: z
			.string()
			.nullable()
			.describe(
				"SHA1 hash of the avatar for the User account. Can be used in conjuction with the ... endpoint to retrieve the avatar image.",
			),
		defaultTeamId: z.string().nullable().describe("The user's default team."),
		isEnterpriseManaged: z
			.union([z.literal(false), z.literal(true)])
			.optional()
			.describe("Indicates whether the user is managed by an enterprise."),
	})
	.describe(
		"A limited form of data for the currently authenticated User, due to the authentication token missing privileges to read the full User data.",
	);

export const fileTreeSchema = z
	.object({
		name: z.string().describe("The name of the file tree entry"),
		type: z
			.enum(["directory", "file", "invalid", "lambda", "middleware", "symlink"])
			.describe("String indicating the type of file tree entry."),
		uid: z
			.string()
			.optional()
			.describe("The unique identifier of the file (only valid for the `file` type)"),
		children: z
			.array(z.unknown())
			.optional()
			.describe(
				"The list of children files of the directory (only valid for the `directory` type)",
			),
		contentType: z
			.string()
			.optional()
			.describe("The content-type of the file (only valid for the `file` type)"),
		mode: z.number().describe('The file "mode" indicating file type and permissions.'),
	})
	.describe("A deployment file tree entry");

export const vercelBaseErrorSchema = z.object({
	code: z.string(),
	message: z.string(),
});

export const vercelForbiddenErrorSchema = z.object({
	error: z.unknown().and(
		z.object({
			code: z.string(),
		}),
	),
});

export const vercelNotFoundErrorSchema = z.object({
	error: z.unknown().and(
		z.object({
			code: z.string(),
			message: z.string().optional(),
		}),
	),
});

export const vercelBadRequestErrorSchema = z.object({
	error: z.unknown().and(
		z.object({
			code: z.string(),
			message: z.string().optional(),
		}),
	),
});

export const vercelRateLimitErrorSchema = z.object({
	error: z.unknown().and(
		z.object({
			code: z.string(),
			limit: z.unknown().optional(),
		}),
	),
});

export const rateLimitNoticeSchema = z.object({
	remaining: z.int().min(0),
	reset: z.int().min(0),
	resetMs: z.int().min(0),
	total: z.int().min(0),
});

export const readAccessGroupPathIdOrNameSchema = z.string();

export const readAccessGroupQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const readAccessGroupQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const readAccessGroupStatus200Schema = z.unknown();

export const readAccessGroupStatus400Schema = z.unknown();

export const readAccessGroupStatus401Schema = z.unknown();

export const readAccessGroupStatus403Schema = z.unknown();

export const readAccessGroupResponseSchema = z.union([
	readAccessGroupStatus200Schema,
	readAccessGroupStatus400Schema,
	readAccessGroupStatus401Schema,
	readAccessGroupStatus403Schema,
]);

export const updateAccessGroupPathIdOrNameSchema = z.string();

export const updateAccessGroupQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const updateAccessGroupQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const updateAccessGroupStatus200Schema = z.unknown();

export const updateAccessGroupStatus400Schema = z.unknown();

export const updateAccessGroupStatus401Schema = z.unknown();

export const updateAccessGroupStatus403Schema = z.unknown();

export const updateAccessGroupResponseSchema = z.union([
	updateAccessGroupStatus200Schema,
	updateAccessGroupStatus400Schema,
	updateAccessGroupStatus401Schema,
	updateAccessGroupStatus403Schema,
]);

export const deleteAccessGroupPathIdOrNameSchema = z.string();

export const deleteAccessGroupQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const deleteAccessGroupQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const deleteAccessGroupStatus200Schema = z.unknown();

export const deleteAccessGroupStatus400Schema = z.unknown();

export const deleteAccessGroupStatus401Schema = z.unknown();

export const deleteAccessGroupStatus403Schema = z.unknown();

export const deleteAccessGroupResponseSchema = z.union([
	deleteAccessGroupStatus200Schema,
	deleteAccessGroupStatus400Schema,
	deleteAccessGroupStatus401Schema,
	deleteAccessGroupStatus403Schema,
]);

export const listAccessGroupMembersPathIdOrNameSchema = z
	.string()
	.describe("The ID or name of the Access Group.");

export const listAccessGroupMembersQueryLimitSchema = z
	.int()
	.min(1)
	.max(100)
	.optional()
	.describe("Limit how many access group members should be returned.");

export const listAccessGroupMembersQueryNextSchema = z
	.string()
	.optional()
	.describe("Continuation cursor to retrieve the next page of results.");

export const listAccessGroupMembersQuerySearchSchema = z
	.string()
	.optional()
	.describe("Search project members by their name, username, and email.");

export const listAccessGroupMembersQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const listAccessGroupMembersQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const listAccessGroupMembersStatus200Schema = z.unknown();

export const listAccessGroupMembersStatus400Schema = z.unknown();

export const listAccessGroupMembersStatus401Schema = z.unknown();

export const listAccessGroupMembersStatus403Schema = z.unknown();

export const listAccessGroupMembersResponseSchema = z.union([
	listAccessGroupMembersStatus200Schema,
	listAccessGroupMembersStatus400Schema,
	listAccessGroupMembersStatus401Schema,
	listAccessGroupMembersStatus403Schema,
]);

export const listAccessGroupsQueryProjectIdSchema = z
	.string()
	.optional()
	.describe("Filter access groups by project.");

export const listAccessGroupsQuerySearchSchema = z
	.string()
	.optional()
	.describe("Search for access groups by name.");

export const listAccessGroupsQueryMembersLimitSchema = z
	.int()
	.min(1)
	.max(100)
	.optional()
	.describe("Number of members to include in the response.");

export const listAccessGroupsQueryProjectsLimitSchema = z
	.int()
	.min(1)
	.max(100)
	.optional()
	.describe("Number of projects to include in the response.");

export const listAccessGroupsQueryLimitSchema = z
	.int()
	.min(1)
	.max(100)
	.optional()
	.describe("Limit how many access group should be returned.");

export const listAccessGroupsQueryNextSchema = z
	.string()
	.optional()
	.describe("Continuation cursor to retrieve the next page of results.");

export const listAccessGroupsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const listAccessGroupsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const listAccessGroupsStatus200Schema = z.unknown();

export const listAccessGroupsStatus400Schema = z.unknown();

export const listAccessGroupsStatus401Schema = z.unknown();

export const listAccessGroupsStatus403Schema = z.unknown();

export const listAccessGroupsResponseSchema = z.union([
	listAccessGroupsStatus200Schema,
	listAccessGroupsStatus400Schema,
	listAccessGroupsStatus401Schema,
	listAccessGroupsStatus403Schema,
]);

export const createAccessGroupQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const createAccessGroupQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const createAccessGroupStatus200Schema = z.unknown();

export const createAccessGroupStatus400Schema = z.unknown();

export const createAccessGroupStatus401Schema = z.unknown();

export const createAccessGroupStatus403Schema = z.unknown();

export const createAccessGroupResponseSchema = z.union([
	createAccessGroupStatus200Schema,
	createAccessGroupStatus400Schema,
	createAccessGroupStatus401Schema,
	createAccessGroupStatus403Schema,
]);

export const listAccessGroupProjectsPathIdOrNameSchema = z
	.string()
	.describe("The ID or name of the Access Group.");

export const listAccessGroupProjectsQueryLimitSchema = z
	.int()
	.min(1)
	.max(100)
	.optional()
	.describe("Limit how many access group projects should be returned.");

export const listAccessGroupProjectsQueryNextSchema = z
	.string()
	.optional()
	.describe("Continuation cursor to retrieve the next page of results.");

export const listAccessGroupProjectsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const listAccessGroupProjectsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const listAccessGroupProjectsStatus200Schema = z.unknown();

export const listAccessGroupProjectsStatus400Schema = z.unknown();

export const listAccessGroupProjectsStatus401Schema = z.unknown();

export const listAccessGroupProjectsStatus403Schema = z.unknown();

export const listAccessGroupProjectsResponseSchema = z.union([
	listAccessGroupProjectsStatus200Schema,
	listAccessGroupProjectsStatus400Schema,
	listAccessGroupProjectsStatus401Schema,
	listAccessGroupProjectsStatus403Schema,
]);

export const createAccessGroupProjectPathAccessGroupIdOrNameSchema = z.string();

export const createAccessGroupProjectQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const createAccessGroupProjectQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const createAccessGroupProjectStatus200Schema = z.unknown();

export const createAccessGroupProjectStatus400Schema = z.unknown();

export const createAccessGroupProjectStatus401Schema = z.unknown();

export const createAccessGroupProjectStatus403Schema = z.unknown();

export const createAccessGroupProjectResponseSchema = z.union([
	createAccessGroupProjectStatus200Schema,
	createAccessGroupProjectStatus400Schema,
	createAccessGroupProjectStatus401Schema,
	createAccessGroupProjectStatus403Schema,
]);

export const readAccessGroupProjectPathAccessGroupIdOrNameSchema = z.string();

export const readAccessGroupProjectPathProjectIdSchema = z.string();

export const readAccessGroupProjectQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const readAccessGroupProjectQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const readAccessGroupProjectStatus200Schema = z.unknown();

export const readAccessGroupProjectStatus400Schema = z.unknown();

export const readAccessGroupProjectStatus401Schema = z.unknown();

export const readAccessGroupProjectStatus403Schema = z.unknown();

export const readAccessGroupProjectResponseSchema = z.union([
	readAccessGroupProjectStatus200Schema,
	readAccessGroupProjectStatus400Schema,
	readAccessGroupProjectStatus401Schema,
	readAccessGroupProjectStatus403Schema,
]);

export const updateAccessGroupProjectPathAccessGroupIdOrNameSchema = z.string();

export const updateAccessGroupProjectPathProjectIdSchema = z.string();

export const updateAccessGroupProjectQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const updateAccessGroupProjectQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const updateAccessGroupProjectStatus200Schema = z.unknown();

export const updateAccessGroupProjectStatus400Schema = z.unknown();

export const updateAccessGroupProjectStatus401Schema = z.unknown();

export const updateAccessGroupProjectStatus403Schema = z.unknown();

export const updateAccessGroupProjectResponseSchema = z.union([
	updateAccessGroupProjectStatus200Schema,
	updateAccessGroupProjectStatus400Schema,
	updateAccessGroupProjectStatus401Schema,
	updateAccessGroupProjectStatus403Schema,
]);

export const deleteAccessGroupProjectPathAccessGroupIdOrNameSchema = z.string();

export const deleteAccessGroupProjectPathProjectIdSchema = z.string();

export const deleteAccessGroupProjectQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const deleteAccessGroupProjectQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const deleteAccessGroupProjectStatus200Schema = z.unknown();

export const deleteAccessGroupProjectStatus400Schema = z.unknown();

export const deleteAccessGroupProjectStatus401Schema = z.unknown();

export const deleteAccessGroupProjectStatus403Schema = z.unknown();

export const deleteAccessGroupProjectResponseSchema = z.union([
	deleteAccessGroupProjectStatus200Schema,
	deleteAccessGroupProjectStatus400Schema,
	deleteAccessGroupProjectStatus401Schema,
	deleteAccessGroupProjectStatus403Schema,
]);

export const recordEventsHeaderxArtifactClientCiSchema = z
	.string()
	.max(50)
	.optional()
	.describe(
		"The continuous integration or delivery environment where this artifact is downloaded.",
	);

export const recordEventsHeaderxArtifactClientInteractiveSchema = z
	.int()
	.min(0)
	.max(1)
	.optional()
	.describe("1 if the client is an interactive shell. Otherwise 0");

export const recordEventsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const recordEventsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const recordEventsStatus200Schema = z.unknown();

export const recordEventsStatus400Schema = z.unknown();

export const recordEventsStatus401Schema = z.unknown();

export const recordEventsStatus402Schema = z.unknown();

export const recordEventsStatus403Schema = z.unknown();

export const recordEventsResponseSchema = z.union([
	recordEventsStatus200Schema,
	recordEventsStatus400Schema,
	recordEventsStatus401Schema,
	recordEventsStatus402Schema,
	recordEventsStatus403Schema,
]);

export const statusQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const statusQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const statusStatus200Schema = z.unknown();

export const statusStatus400Schema = z.unknown();

export const statusStatus401Schema = z.unknown();

export const statusStatus402Schema = z.unknown();

export const statusStatus403Schema = z.unknown();

export const statusResponseSchema = z.union([
	statusStatus200Schema,
	statusStatus400Schema,
	statusStatus401Schema,
	statusStatus402Schema,
	statusStatus403Schema,
]);

export const uploadArtifactHeadercontentLengthSchema = z
	.number()
	.optional()
	.describe("The artifact size in bytes");

export const uploadArtifactHeaderxArtifactDurationSchema = z
	.number()
	.optional()
	.describe("The time taken to generate the uploaded artifact in milliseconds.");

export const uploadArtifactHeaderxArtifactClientCiSchema = z
	.string()
	.max(50)
	.optional()
	.describe(
		"The continuous integration or delivery environment where this artifact was generated.",
	);

export const uploadArtifactHeaderxArtifactClientInteractiveSchema = z
	.int()
	.min(0)
	.max(1)
	.optional()
	.describe("1 if the client is an interactive shell. Otherwise 0");

export const uploadArtifactHeaderxArtifactTagSchema = z
	.string()
	.max(600)
	.optional()
	.describe(
		"The base64 encoded tag for this artifact. The value is sent back to clients when the artifact is downloaded as the header `x-artifact-tag`",
	);

export const uploadArtifactHeaderxArtifactShaSchema = z
	.string()
	.max(200)
	.optional()
	.describe("The SHA of the source control revision that generated this artifact.");

export const uploadArtifactHeaderxArtifactDirtyHashSchema = z
	.string()
	.max(200)
	.optional()
	.describe(
		"A hash representing uncommitted changes in the working directory when this artifact was generated.",
	);

export const uploadArtifactPathHashSchema = z.string().describe("The artifact hash");

export const uploadArtifactQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const uploadArtifactQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const uploadArtifactStatus202Schema = z.unknown();

export const uploadArtifactStatus400Schema = z.unknown();

export const uploadArtifactStatus401Schema = z.unknown();

export const uploadArtifactStatus402Schema = z.unknown();

export const uploadArtifactStatus403Schema = z.unknown();

export const uploadArtifactResponseSchema = z.union([
	uploadArtifactStatus202Schema,
	uploadArtifactStatus400Schema,
	uploadArtifactStatus401Schema,
	uploadArtifactStatus402Schema,
	uploadArtifactStatus403Schema,
]);

export const downloadArtifactHeaderxArtifactClientCiSchema = z
	.string()
	.max(50)
	.optional()
	.describe(
		"The continuous integration or delivery environment where this artifact is downloaded.",
	);

export const downloadArtifactHeaderxArtifactClientInteractiveSchema = z
	.int()
	.min(0)
	.max(1)
	.optional()
	.describe("1 if the client is an interactive shell. Otherwise 0");

export const downloadArtifactPathHashSchema = z.string().describe("The artifact hash");

export const downloadArtifactQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const downloadArtifactQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const downloadArtifactStatus200Schema = z.unknown();

export const downloadArtifactStatus400Schema = z.unknown();

export const downloadArtifactStatus401Schema = z.unknown();

export const downloadArtifactStatus402Schema = z.unknown();

export const downloadArtifactStatus403Schema = z.unknown();

export const downloadArtifactStatus404Schema = z.unknown();

export const downloadArtifactResponseSchema = z.union([
	downloadArtifactStatus200Schema,
	downloadArtifactStatus400Schema,
	downloadArtifactStatus401Schema,
	downloadArtifactStatus402Schema,
	downloadArtifactStatus403Schema,
	downloadArtifactStatus404Schema,
]);

export const artifactQueryQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const artifactQueryQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const artifactQueryStatus200Schema = z.unknown();

export const artifactQueryStatus400Schema = z.unknown();

export const artifactQueryStatus401Schema = z.unknown();

export const artifactQueryStatus402Schema = z.unknown();

export const artifactQueryStatus403Schema = z.unknown();

export const artifactQueryResponseSchema = z.union([
	artifactQueryStatus200Schema,
	artifactQueryStatus400Schema,
	artifactQueryStatus401Schema,
	artifactQueryStatus402Schema,
	artifactQueryStatus403Schema,
]);

export const listBillingChargesQueryFromSchema = z
	.string()
	.describe("Inclusive start of the date range as an ISO 8601 date-time string in UTC.");

export const listBillingChargesQueryToSchema = z
	.string()
	.describe("Exclusive end of the date range as an ISO 8601 date-time string in UTC.");

export const listBillingChargesQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const listBillingChargesQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const listBillingChargesStatus200Schema = z.unknown();

export const listBillingChargesStatus400Schema = z.unknown();

export const listBillingChargesStatus401Schema = z.unknown();

export const listBillingChargesStatus403Schema = z.unknown();

export const listBillingChargesStatus404Schema = z.unknown();

export const listBillingChargesStatus500Schema = z.unknown();

export const listBillingChargesStatus503Schema = z.unknown();

export const listBillingChargesResponseSchema = z.union([
	listBillingChargesStatus200Schema,
	listBillingChargesStatus400Schema,
	listBillingChargesStatus401Schema,
	listBillingChargesStatus403Schema,
	listBillingChargesStatus404Schema,
	listBillingChargesStatus500Schema,
	listBillingChargesStatus503Schema,
]);

export const listContractCommitmentsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const listContractCommitmentsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const listContractCommitmentsStatus200Schema = z.unknown();

export const listContractCommitmentsStatus400Schema = z.unknown();

export const listContractCommitmentsStatus401Schema = z.unknown();

export const listContractCommitmentsStatus403Schema = z.unknown();

export const listContractCommitmentsStatus404Schema = z.unknown();

export const listContractCommitmentsResponseSchema = z.union([
	listContractCommitmentsStatus200Schema,
	listContractCommitmentsStatus400Schema,
	listContractCommitmentsStatus401Schema,
	listContractCommitmentsStatus403Schema,
	listContractCommitmentsStatus404Schema,
]);

export const buyCreditsQuerySourceSchema = z
	.string()
	.optional()
	.describe("The source of the purchase request. Defaults to `api` if not specified.");

export const buyCreditsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const buyCreditsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const buyCreditsStatus200Schema = z.unknown();

export const buyCreditsStatus400Schema = z.unknown();

export const buyCreditsStatus401Schema = z.unknown();

export const buyCreditsStatus402Schema = z.unknown();

export const buyCreditsStatus403Schema = z.unknown();

export const buyCreditsStatus404Schema = z.unknown();

export const buyCreditsStatus500Schema = z.unknown();

export const buyCreditsResponseSchema = z.union([
	buyCreditsStatus200Schema,
	buyCreditsStatus400Schema,
	buyCreditsStatus401Schema,
	buyCreditsStatus402Schema,
	buyCreditsStatus403Schema,
	buyCreditsStatus404Schema,
	buyCreditsStatus500Schema,
]);

export const stageRedirectsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const stageRedirectsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const stageRedirectsStatus200Schema = z.unknown();

export const stageRedirectsStatus400Schema = z.unknown();

export const stageRedirectsStatus401Schema = z.unknown();

export const stageRedirectsStatus403Schema = z.unknown();

export const stageRedirectsStatus500Schema = z.unknown();

export const stageRedirectsResponseSchema = z.union([
	stageRedirectsStatus200Schema,
	stageRedirectsStatus400Schema,
	stageRedirectsStatus401Schema,
	stageRedirectsStatus403Schema,
	stageRedirectsStatus500Schema,
]);

export const getRedirectsQueryProjectIdSchema = z.string();

export const getRedirectsQueryVersionIdSchema = z.string().optional();

export const getRedirectsQueryQSchema = z.string().optional();

export const getRedirectsQueryDiffSchema = z.union([z.boolean(), z.enum(["only"])]).optional();

export const getRedirectsQueryPageSchema = z.int().min(1).optional();

export const getRedirectsQueryPerPageSchema = z.int().min(10).max(250).optional();

export const getRedirectsQuerySortBySchema = z
	.enum(["source", "destination", "statusCode"])
	.optional();

export const getRedirectsQuerySortOrderSchema = z.enum(["asc", "desc"]).optional();

export const getRedirectsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getRedirectsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getRedirectsStatus200Schema = z.unknown();

export const getRedirectsStatus400Schema = z.unknown();

export const getRedirectsStatus401Schema = z.unknown();

export const getRedirectsStatus403Schema = z.unknown();

export const getRedirectsStatus404Schema = z.unknown();

export const getRedirectsResponseSchema = z.union([
	getRedirectsStatus200Schema,
	getRedirectsStatus400Schema,
	getRedirectsStatus401Schema,
	getRedirectsStatus403Schema,
	getRedirectsStatus404Schema,
]);

export const deleteRedirectsQueryProjectIdSchema = z.string();

export const deleteRedirectsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const deleteRedirectsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const deleteRedirectsStatus200Schema = z.unknown();

export const deleteRedirectsStatus400Schema = z.unknown();

export const deleteRedirectsStatus401Schema = z.unknown();

export const deleteRedirectsStatus403Schema = z.unknown();

export const deleteRedirectsStatus404Schema = z.unknown();

export const deleteRedirectsStatus500Schema = z.unknown();

export const deleteRedirectsResponseSchema = z.union([
	deleteRedirectsStatus200Schema,
	deleteRedirectsStatus400Schema,
	deleteRedirectsStatus401Schema,
	deleteRedirectsStatus403Schema,
	deleteRedirectsStatus404Schema,
	deleteRedirectsStatus500Schema,
]);

export const editRedirectQueryProjectIdSchema = z.string();

export const editRedirectQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const editRedirectQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const editRedirectStatus200Schema = z.unknown();

export const editRedirectStatus400Schema = z.unknown();

export const editRedirectStatus401Schema = z.unknown();

export const editRedirectStatus403Schema = z.unknown();

export const editRedirectStatus404Schema = z.unknown();

export const editRedirectStatus500Schema = z.unknown();

export const editRedirectResponseSchema = z.union([
	editRedirectStatus200Schema,
	editRedirectStatus400Schema,
	editRedirectStatus401Schema,
	editRedirectStatus403Schema,
	editRedirectStatus404Schema,
	editRedirectStatus500Schema,
]);

export const restoreRedirectsQueryProjectIdSchema = z.string();

export const restoreRedirectsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const restoreRedirectsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const restoreRedirectsStatus200Schema = z.unknown();

export const restoreRedirectsStatus400Schema = z.unknown();

export const restoreRedirectsStatus401Schema = z.unknown();

export const restoreRedirectsStatus403Schema = z.unknown();

export const restoreRedirectsStatus404Schema = z.unknown();

export const restoreRedirectsStatus500Schema = z.unknown();

export const restoreRedirectsResponseSchema = z.union([
	restoreRedirectsStatus200Schema,
	restoreRedirectsStatus400Schema,
	restoreRedirectsStatus401Schema,
	restoreRedirectsStatus403Schema,
	restoreRedirectsStatus404Schema,
	restoreRedirectsStatus500Schema,
]);

export const getVersionsQueryProjectIdSchema = z.string();

export const getVersionsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getVersionsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getVersionsStatus200Schema = z.unknown();

export const getVersionsStatus400Schema = z.unknown();

export const getVersionsStatus401Schema = z.unknown();

export const getVersionsStatus403Schema = z.unknown();

export const getVersionsStatus500Schema = z.unknown();

export const getVersionsResponseSchema = z.union([
	getVersionsStatus200Schema,
	getVersionsStatus400Schema,
	getVersionsStatus401Schema,
	getVersionsStatus403Schema,
	getVersionsStatus500Schema,
]);

export const updateVersionQueryProjectIdSchema = z.string();

export const updateVersionQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const updateVersionQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const updateVersionStatus200Schema = z.unknown();

export const updateVersionStatus400Schema = z.unknown();

export const updateVersionStatus401Schema = z.unknown();

export const updateVersionStatus403Schema = z.unknown();

export const updateVersionStatus404Schema = z.unknown();

export const updateVersionStatus500Schema = z.unknown();

export const updateVersionResponseSchema = z.union([
	updateVersionStatus200Schema,
	updateVersionStatus400Schema,
	updateVersionStatus401Schema,
	updateVersionStatus403Schema,
	updateVersionStatus404Schema,
	updateVersionStatus500Schema,
]);

export const listProjectChecksPathProjectIdOrNameSchema = z.string();

export const listProjectChecksQueryBlocksSchema = z
	.enum(["build-start", "deployment-start", "deployment-alias", "deployment-promotion", "none"])
	.optional();

export const listProjectChecksQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const listProjectChecksQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const listProjectChecksStatus200Schema = z.unknown();

export const listProjectChecksStatus400Schema = z.unknown();

export const listProjectChecksStatus401Schema = z.unknown();

export const listProjectChecksStatus403Schema = z.unknown();

export const listProjectChecksStatus500Schema = z.unknown();

export const listProjectChecksResponseSchema = z.union([
	listProjectChecksStatus200Schema,
	listProjectChecksStatus400Schema,
	listProjectChecksStatus401Schema,
	listProjectChecksStatus403Schema,
	listProjectChecksStatus500Schema,
]);

export const createProjectCheckPathProjectIdOrNameSchema = z.string();

export const createProjectCheckQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const createProjectCheckQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const createProjectCheckStatus200Schema = z.unknown();

export const createProjectCheckStatus400Schema = z.unknown();

export const createProjectCheckStatus401Schema = z.unknown();

export const createProjectCheckStatus403Schema = z.unknown();

export const createProjectCheckStatus500Schema = z.unknown();

export const createProjectCheckResponseSchema = z.union([
	createProjectCheckStatus200Schema,
	createProjectCheckStatus400Schema,
	createProjectCheckStatus401Schema,
	createProjectCheckStatus403Schema,
	createProjectCheckStatus500Schema,
]);

export const getProjectCheckPathProjectIdOrNameSchema = z.string();

export const getProjectCheckPathCheckIdSchema = z
	.string()
	.describe("The ID of the resource that will be updated.");

export const getProjectCheckQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getProjectCheckQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getProjectCheckStatus200Schema = z.unknown();

export const getProjectCheckStatus400Schema = z.unknown();

export const getProjectCheckStatus401Schema = z.unknown();

export const getProjectCheckStatus403Schema = z.unknown();

export const getProjectCheckStatus500Schema = z.unknown();

export const getProjectCheckResponseSchema = z.union([
	getProjectCheckStatus200Schema,
	getProjectCheckStatus400Schema,
	getProjectCheckStatus401Schema,
	getProjectCheckStatus403Schema,
	getProjectCheckStatus500Schema,
]);

export const updateProjectCheckPathProjectIdOrNameSchema = z.string();

export const updateProjectCheckPathCheckIdSchema = z.string();

export const updateProjectCheckQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const updateProjectCheckQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const updateProjectCheckStatus200Schema = z.unknown();

export const updateProjectCheckStatus400Schema = z.unknown();

export const updateProjectCheckStatus401Schema = z.unknown();

export const updateProjectCheckStatus403Schema = z.unknown();

export const updateProjectCheckStatus404Schema = z.unknown();

export const updateProjectCheckStatus500Schema = z.unknown();

export const updateProjectCheckResponseSchema = z.union([
	updateProjectCheckStatus200Schema,
	updateProjectCheckStatus400Schema,
	updateProjectCheckStatus401Schema,
	updateProjectCheckStatus403Schema,
	updateProjectCheckStatus404Schema,
	updateProjectCheckStatus500Schema,
]);

export const deleteProjectCheckPathProjectIdOrNameSchema = z.string();

export const deleteProjectCheckPathCheckIdSchema = z.string();

export const deleteProjectCheckQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const deleteProjectCheckQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const deleteProjectCheckStatus200Schema = z.unknown();

export const deleteProjectCheckStatus400Schema = z.unknown();

export const deleteProjectCheckStatus401Schema = z.unknown();

export const deleteProjectCheckStatus403Schema = z.unknown();

export const deleteProjectCheckStatus404Schema = z.unknown();

export const deleteProjectCheckStatus500Schema = z.unknown();

export const deleteProjectCheckResponseSchema = z.union([
	deleteProjectCheckStatus200Schema,
	deleteProjectCheckStatus400Schema,
	deleteProjectCheckStatus401Schema,
	deleteProjectCheckStatus403Schema,
	deleteProjectCheckStatus404Schema,
	deleteProjectCheckStatus500Schema,
]);

export const listCheckRunsPathProjectIdOrNameSchema = z.string();

export const listCheckRunsPathCheckIdSchema = z
	.string()
	.describe("The ID of the resource that will be updated.");

export const listCheckRunsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const listCheckRunsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const listCheckRunsStatus200Schema = z.unknown();

export const listCheckRunsStatus400Schema = z.unknown();

export const listCheckRunsStatus401Schema = z.unknown();

export const listCheckRunsStatus403Schema = z.unknown();

export const listCheckRunsStatus500Schema = z.unknown();

export const listCheckRunsResponseSchema = z.union([
	listCheckRunsStatus200Schema,
	listCheckRunsStatus400Schema,
	listCheckRunsStatus401Schema,
	listCheckRunsStatus403Schema,
	listCheckRunsStatus500Schema,
]);

export const listDeploymentCheckRunsPathDeploymentIdSchema = z.string();

export const listDeploymentCheckRunsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const listDeploymentCheckRunsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const listDeploymentCheckRunsStatus200Schema = z.unknown();

export const listDeploymentCheckRunsStatus400Schema = z.unknown();

export const listDeploymentCheckRunsStatus401Schema = z.unknown();

export const listDeploymentCheckRunsStatus403Schema = z.unknown();

export const listDeploymentCheckRunsStatus500Schema = z.unknown();

export const listDeploymentCheckRunsResponseSchema = z.union([
	listDeploymentCheckRunsStatus200Schema,
	listDeploymentCheckRunsStatus400Schema,
	listDeploymentCheckRunsStatus401Schema,
	listDeploymentCheckRunsStatus403Schema,
	listDeploymentCheckRunsStatus500Schema,
]);

export const createDeploymentCheckRunPathDeploymentIdSchema = z.string();

export const createDeploymentCheckRunQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const createDeploymentCheckRunQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const createDeploymentCheckRunStatus200Schema = z.unknown();

export const createDeploymentCheckRunStatus400Schema = z.unknown();

export const createDeploymentCheckRunStatus401Schema = z.unknown();

export const createDeploymentCheckRunStatus403Schema = z.unknown();

export const createDeploymentCheckRunStatus404Schema = z.unknown();

export const createDeploymentCheckRunStatus500Schema = z.unknown();

export const createDeploymentCheckRunResponseSchema = z.union([
	createDeploymentCheckRunStatus200Schema,
	createDeploymentCheckRunStatus400Schema,
	createDeploymentCheckRunStatus401Schema,
	createDeploymentCheckRunStatus403Schema,
	createDeploymentCheckRunStatus404Schema,
	createDeploymentCheckRunStatus500Schema,
]);

export const getDeploymentCheckRunPathDeploymentIdSchema = z.string();

export const getDeploymentCheckRunPathCheckRunIdSchema = z
	.string()
	.describe("The ID of the resource that will be updated.");

export const getDeploymentCheckRunQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getDeploymentCheckRunQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getDeploymentCheckRunStatus200Schema = z.unknown();

export const getDeploymentCheckRunStatus400Schema = z.unknown();

export const getDeploymentCheckRunStatus401Schema = z.unknown();

export const getDeploymentCheckRunStatus403Schema = z.unknown();

export const getDeploymentCheckRunStatus404Schema = z.unknown();

export const getDeploymentCheckRunStatus500Schema = z.unknown();

export const getDeploymentCheckRunResponseSchema = z.union([
	getDeploymentCheckRunStatus200Schema,
	getDeploymentCheckRunStatus400Schema,
	getDeploymentCheckRunStatus401Schema,
	getDeploymentCheckRunStatus403Schema,
	getDeploymentCheckRunStatus404Schema,
	getDeploymentCheckRunStatus500Schema,
]);

export const updateDeploymentCheckRunPathDeploymentIdSchema = z.string();

export const updateDeploymentCheckRunPathCheckRunIdSchema = z.string();

export const updateDeploymentCheckRunQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const updateDeploymentCheckRunQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const updateDeploymentCheckRunStatus200Schema = z.unknown();

export const updateDeploymentCheckRunStatus400Schema = z.unknown();

export const updateDeploymentCheckRunStatus401Schema = z.unknown();

export const updateDeploymentCheckRunStatus403Schema = z.unknown();

export const updateDeploymentCheckRunStatus413Schema = z.unknown();

export const updateDeploymentCheckRunStatus500Schema = z.unknown();

export const updateDeploymentCheckRunResponseSchema = z.union([
	updateDeploymentCheckRunStatus200Schema,
	updateDeploymentCheckRunStatus400Schema,
	updateDeploymentCheckRunStatus401Schema,
	updateDeploymentCheckRunStatus403Schema,
	updateDeploymentCheckRunStatus413Schema,
	updateDeploymentCheckRunStatus500Schema,
]);

export const createCheckPathDeploymentIdSchema = z
	.string()
	.describe("The deployment to create the check for.");

export const createCheckQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const createCheckQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const createCheckStatus200Schema = z.unknown();

export const createCheckStatus400Schema = z.unknown();

export const createCheckStatus401Schema = z.unknown();

export const createCheckStatus403Schema = z.unknown();

export const createCheckStatus404Schema = z.unknown();

export const createCheckResponseSchema = z.union([
	createCheckStatus200Schema,
	createCheckStatus400Schema,
	createCheckStatus401Schema,
	createCheckStatus403Schema,
	createCheckStatus404Schema,
]);

export const getAllChecksPathDeploymentIdSchema = z
	.string()
	.describe("The deployment to get all checks for");

export const getAllChecksQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getAllChecksQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getAllChecksStatus200Schema = z.unknown();

export const getAllChecksStatus400Schema = z.unknown();

export const getAllChecksStatus401Schema = z.unknown();

export const getAllChecksStatus403Schema = z.unknown();

export const getAllChecksStatus404Schema = z.unknown();

export const getAllChecksResponseSchema = z.union([
	getAllChecksStatus200Schema,
	getAllChecksStatus400Schema,
	getAllChecksStatus401Schema,
	getAllChecksStatus403Schema,
	getAllChecksStatus404Schema,
]);

export const getCheckPathDeploymentIdSchema = z
	.string()
	.describe("The deployment to get the check for.");

export const getCheckPathCheckIdSchema = z.string().describe("The check to fetch");

export const getCheckQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getCheckQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getCheckStatus200Schema = z.unknown();

export const getCheckStatus400Schema = z.unknown();

export const getCheckStatus401Schema = z.unknown();

export const getCheckStatus403Schema = z.unknown();

export const getCheckStatus404Schema = z.unknown();

export const getCheckResponseSchema = z.union([
	getCheckStatus200Schema,
	getCheckStatus400Schema,
	getCheckStatus401Schema,
	getCheckStatus403Schema,
	getCheckStatus404Schema,
]);

export const updateCheckPathDeploymentIdSchema = z
	.string()
	.describe("The deployment to update the check for.");

export const updateCheckPathCheckIdSchema = z.string().describe("The check being updated");

export const updateCheckQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const updateCheckQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const updateCheckStatus200Schema = z.unknown();

export const updateCheckStatus400Schema = z.unknown();

export const updateCheckStatus401Schema = z.unknown();

export const updateCheckStatus403Schema = z.unknown();

export const updateCheckStatus404Schema = z.unknown();

export const updateCheckStatus413Schema = z.unknown();

export const updateCheckResponseSchema = z.union([
	updateCheckStatus200Schema,
	updateCheckStatus400Schema,
	updateCheckStatus401Schema,
	updateCheckStatus403Schema,
	updateCheckStatus404Schema,
	updateCheckStatus413Schema,
]);

export const rerequestCheckPathDeploymentIdSchema = z
	.string()
	.describe("The deployment to rerun the check for.");

export const rerequestCheckPathCheckIdSchema = z.string().describe("The check to rerun");

export const rerequestCheckQueryAutoUpdateSchema = z
	.boolean()
	.optional()
	.describe("Mark the check as running");

export const rerequestCheckQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const rerequestCheckQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const rerequestCheckStatus200Schema = z.unknown();

export const rerequestCheckStatus400Schema = z.unknown();

export const rerequestCheckStatus401Schema = z.unknown();

export const rerequestCheckStatus403Schema = z.unknown();

export const rerequestCheckStatus404Schema = z.unknown();

export const rerequestCheckResponseSchema = z.union([
	rerequestCheckStatus200Schema,
	rerequestCheckStatus400Schema,
	rerequestCheckStatus401Schema,
	rerequestCheckStatus403Schema,
	rerequestCheckStatus404Schema,
]);

export const listNetworksQueryIncludeHostedZonesSchema = z
	.boolean()
	.optional()
	.default(true)
	.describe("Whether to include Hosted Zones in the response");

export const listNetworksQueryIncludePeeringConnectionsSchema = z
	.boolean()
	.optional()
	.default(true)
	.describe("Whether to include VPC Peering connections in the response");

export const listNetworksQueryIncludeProjectsSchema = z
	.boolean()
	.optional()
	.default(true)
	.describe("Whether to include projects in the response");

export const listNetworksQuerySearchSchema = z
	.string()
	.max(255)
	.optional()
	.describe("The query to use as a filter for returned networks");

export const listNetworksQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const listNetworksQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const listNetworksStatus200Schema = z.unknown();

export const listNetworksStatus400Schema = z.unknown();

export const listNetworksStatus401Schema = z.unknown();

export const listNetworksStatus403Schema = z.unknown();

export const listNetworksResponseSchema = z.union([
	listNetworksStatus200Schema,
	listNetworksStatus400Schema,
	listNetworksStatus401Schema,
	listNetworksStatus403Schema,
]);

export const createNetworkQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const createNetworkQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const createNetworkStatus201Schema = z.unknown();

export const createNetworkStatus400Schema = z.unknown();

export const createNetworkStatus401Schema = z.unknown();

export const createNetworkStatus402Schema = z.unknown();

export const createNetworkStatus403Schema = z.unknown();

export const createNetworkStatus409Schema = z.unknown();

export const createNetworkResponseSchema = z.union([
	createNetworkStatus201Schema,
	createNetworkStatus400Schema,
	createNetworkStatus401Schema,
	createNetworkStatus402Schema,
	createNetworkStatus403Schema,
	createNetworkStatus409Schema,
]);

export const deleteNetworkPathNetworkIdSchema = z
	.string()
	.describe("The ID of the network to delete");

export const deleteNetworkQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const deleteNetworkQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const deleteNetworkStatus204Schema = z.unknown();

export const deleteNetworkStatus400Schema = z.unknown();

export const deleteNetworkStatus401Schema = z.unknown();

export const deleteNetworkStatus402Schema = z.unknown();

export const deleteNetworkStatus403Schema = z.unknown();

export const deleteNetworkStatus409Schema = z.unknown();

export const deleteNetworkResponseSchema = z.union([
	deleteNetworkStatus204Schema,
	deleteNetworkStatus400Schema,
	deleteNetworkStatus401Schema,
	deleteNetworkStatus402Schema,
	deleteNetworkStatus403Schema,
	deleteNetworkStatus409Schema,
]);

export const updateNetworkPathNetworkIdSchema = z
	.string()
	.describe("The unique identifier of the Secure Compute network");

export const updateNetworkQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const updateNetworkQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const updateNetworkStatus200Schema = z.unknown();

export const updateNetworkStatus400Schema = z.unknown();

export const updateNetworkStatus401Schema = z.unknown();

export const updateNetworkStatus403Schema = z.unknown();

export const updateNetworkResponseSchema = z.union([
	updateNetworkStatus200Schema,
	updateNetworkStatus400Schema,
	updateNetworkStatus401Schema,
	updateNetworkStatus403Schema,
]);

export const readNetworkPathNetworkIdSchema = z
	.string()
	.describe("The unique identifier of the Secure Compute network");

export const readNetworkQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const readNetworkQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const readNetworkStatus200Schema = z.unknown();

export const readNetworkStatus400Schema = z.unknown();

export const readNetworkStatus401Schema = z.unknown();

export const readNetworkStatus403Schema = z.unknown();

export const readNetworkResponseSchema = z.union([
	readNetworkStatus200Schema,
	readNetworkStatus400Schema,
	readNetworkStatus401Schema,
	readNetworkStatus403Schema,
]);

export const createConnectorStatus201Schema = z.unknown();

export const createConnectorStatus400Schema = z.unknown();

export const createConnectorStatus401Schema = z.unknown();

export const createConnectorStatus403Schema = z.unknown();

export const createConnectorStatus404Schema = z.unknown();

export const createConnectorStatus409Schema = z.unknown();

export const createConnectorResponseSchema = z.union([
	createConnectorStatus201Schema,
	createConnectorStatus400Schema,
	createConnectorStatus401Schema,
	createConnectorStatus403Schema,
	createConnectorStatus404Schema,
	createConnectorStatus409Schema,
]);

export const getConnectorTokenPathConnectorSchema = z.string();

export const getConnectorTokenStatus200Schema = z.unknown();

export const getConnectorTokenStatus400Schema = z.unknown();

export const getConnectorTokenStatus401Schema = z.unknown();

export const getConnectorTokenStatus403Schema = z.unknown();

export const getConnectorTokenStatus404Schema = z.unknown();

export const getConnectorTokenStatus422Schema = z.unknown();

export const getConnectorTokenStatus429Schema = z.unknown();

export const getConnectorTokenStatus504Schema = z.unknown();

export const getConnectorTokenResponseSchema = z.union([
	getConnectorTokenStatus200Schema,
	getConnectorTokenStatus400Schema,
	getConnectorTokenStatus401Schema,
	getConnectorTokenStatus403Schema,
	getConnectorTokenStatus404Schema,
	getConnectorTokenStatus422Schema,
	getConnectorTokenStatus429Schema,
	getConnectorTokenStatus504Schema,
]);

export const importConnectorTokensPathConnectorSchema = z.string();

export const importConnectorTokensStatus200Schema = z.unknown();

export const importConnectorTokensStatus400Schema = z.unknown();

export const importConnectorTokensStatus401Schema = z.unknown();

export const importConnectorTokensStatus403Schema = z.unknown();

export const importConnectorTokensStatus404Schema = z.unknown();

export const importConnectorTokensStatus422Schema = z.unknown();

export const importConnectorTokensStatus504Schema = z.unknown();

export const importConnectorTokensResponseSchema = z.union([
	importConnectorTokensStatus200Schema,
	importConnectorTokensStatus400Schema,
	importConnectorTokensStatus401Schema,
	importConnectorTokensStatus403Schema,
	importConnectorTokensStatus404Schema,
	importConnectorTokensStatus422Schema,
	importConnectorTokensStatus504Schema,
]);

export const createConnectorAuthorizationRequestPathConnectorSchema = z.string();

export const createConnectorAuthorizationRequestStatus200Schema = z.unknown();

export const createConnectorAuthorizationRequestStatus400Schema = z.unknown();

export const createConnectorAuthorizationRequestStatus401Schema = z.unknown();

export const createConnectorAuthorizationRequestStatus403Schema = z.unknown();

export const createConnectorAuthorizationRequestStatus404Schema = z.unknown();

export const createConnectorAuthorizationRequestResponseSchema = z.union([
	createConnectorAuthorizationRequestStatus200Schema,
	createConnectorAuthorizationRequestStatus400Schema,
	createConnectorAuthorizationRequestStatus401Schema,
	createConnectorAuthorizationRequestStatus403Schema,
	createConnectorAuthorizationRequestStatus404Schema,
]);

export const getDeploymentEventsPathIdOrUrlSchema = z
	.string()
	.describe("The unique identifier or hostname of the deployment.");

export const getDeploymentEventsQueryDirectionSchema = z
	.enum(["backward", "forward"])
	.optional()
	.default("forward")
	.describe("Order of the returned events based on the timestamp.");

export const getDeploymentEventsQueryFollowSchema = z
	.union([z.literal(0), z.literal(1)])
	.optional()
	.describe("When enabled, this endpoint will return live events as they happen.");

export const getDeploymentEventsQueryLimitSchema = z
	.number()
	.optional()
	.describe("Maximum number of events to return. Provide `-1` to return all available logs.");

export const getDeploymentEventsQueryNameSchema = z
	.string()
	.optional()
	.describe("Deployment build ID.");

export const getDeploymentEventsQuerySinceSchema = z
	.number()
	.optional()
	.describe("Timestamp for when build logs should be pulled from.");

export const getDeploymentEventsQueryUntilSchema = z
	.number()
	.optional()
	.describe("Timestamp for when the build logs should be pulled up until.");

export const getDeploymentEventsQueryStatusCodeSchema = z
	.union([z.number(), z.string()])
	.optional()
	.describe("HTTP status code range to filter events by.");

export const getDeploymentEventsQueryDelimiterSchema = z
	.union([z.literal(0), z.literal(1)])
	.optional();

export const getDeploymentEventsQueryBuildsSchema = z
	.union([z.literal(0), z.literal(1)])
	.optional();

export const getDeploymentEventsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getDeploymentEventsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getDeploymentEventsStatus200Schema = z.unknown();

export const getDeploymentEventsStatus400Schema = z.unknown();

export const getDeploymentEventsStatus401Schema = z.unknown();

export const getDeploymentEventsStatus403Schema = z.unknown();

export const getDeploymentEventsStatus500Schema = z.unknown();

export const getDeploymentEventsResponseSchema = z.union([
	getDeploymentEventsStatus200Schema,
	getDeploymentEventsStatus400Schema,
	getDeploymentEventsStatus401Schema,
	getDeploymentEventsStatus403Schema,
	getDeploymentEventsStatus500Schema,
]);

export const updateIntegrationDeploymentActionPathDeploymentIdSchema = z.string();

export const updateIntegrationDeploymentActionPathIntegrationConfigurationIdSchema = z.string();

export const updateIntegrationDeploymentActionPathResourceIdSchema = z.string();

export const updateIntegrationDeploymentActionPathActionSchema = z.string();

export const updateIntegrationDeploymentActionStatus202Schema = z.unknown();

export const updateIntegrationDeploymentActionStatus400Schema = z.unknown();

export const updateIntegrationDeploymentActionStatus401Schema = z.unknown();

export const updateIntegrationDeploymentActionStatus403Schema = z.unknown();

export const updateIntegrationDeploymentActionResponseSchema = z.union([
	updateIntegrationDeploymentActionStatus202Schema,
	updateIntegrationDeploymentActionStatus400Schema,
	updateIntegrationDeploymentActionStatus401Schema,
	updateIntegrationDeploymentActionStatus403Schema,
]);

export const getDeploymentPathIdOrUrlSchema = z
	.string()
	.describe("The unique identifier or hostname of the deployment.");

export const getDeploymentQueryWithGitRepoInfoSchema = z
	.string()
	.optional()
	.describe("Whether to add in gitRepo information.");

export const getDeploymentQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getDeploymentQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getDeploymentStatus200Schema = z.unknown();

export const getDeploymentStatus400Schema = z.unknown();

export const getDeploymentStatus403Schema = z.unknown();

export const getDeploymentStatus404Schema = z.unknown();

export const getDeploymentStatus429Schema = z.unknown();

export const getDeploymentResponseSchema = z.union([
	getDeploymentStatus200Schema,
	getDeploymentStatus400Schema,
	getDeploymentStatus403Schema,
	getDeploymentStatus404Schema,
	getDeploymentStatus429Schema,
]);

export const createDeploymentQueryForceNewSchema = z
	.unknown()
	.optional()
	.describe("Forces a new deployment even if there is a previous similar deployment");

export const createDeploymentQuerySkipAutoDetectionConfirmationSchema = z
	.unknown()
	.optional()
	.describe("Allows to skip framework detection so the API would not fail to ask for confirmation");

export const createDeploymentQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const createDeploymentQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const createDeploymentStatus200Schema = z.unknown();

export const createDeploymentStatus400Schema = z.unknown();

export const createDeploymentStatus401Schema = z.unknown();

export const createDeploymentStatus402Schema = z.unknown();

export const createDeploymentStatus403Schema = z.unknown();

export const createDeploymentStatus404Schema = z.unknown();

export const createDeploymentStatus409Schema = z.unknown();

export const createDeploymentStatus426Schema = z.unknown();

export const createDeploymentStatus429Schema = z.unknown();

export const createDeploymentStatus500Schema = z.unknown();

export const createDeploymentStatus503Schema = z.unknown();

export const createDeploymentResponseSchema = z.union([
	createDeploymentStatus200Schema,
	createDeploymentStatus400Schema,
	createDeploymentStatus401Schema,
	createDeploymentStatus402Schema,
	createDeploymentStatus403Schema,
	createDeploymentStatus404Schema,
	createDeploymentStatus409Schema,
	createDeploymentStatus426Schema,
	createDeploymentStatus429Schema,
	createDeploymentStatus500Schema,
	createDeploymentStatus503Schema,
]);

export const cancelDeploymentPathIdSchema = z
	.string()
	.describe("The unique identifier of the deployment.");

export const cancelDeploymentQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const cancelDeploymentQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const cancelDeploymentStatus200Schema = z.unknown();

export const cancelDeploymentStatus400Schema = z.unknown();

export const cancelDeploymentStatus401Schema = z.unknown();

export const cancelDeploymentStatus403Schema = z.unknown();

export const cancelDeploymentStatus404Schema = z.unknown();

export const cancelDeploymentResponseSchema = z.union([
	cancelDeploymentStatus200Schema,
	cancelDeploymentStatus400Schema,
	cancelDeploymentStatus401Schema,
	cancelDeploymentStatus403Schema,
	cancelDeploymentStatus404Schema,
]);

export const getRecordsPathDomainSchema = z.string();

export const getRecordsQueryLimitSchema = z
	.string()
	.optional()
	.describe("Maximum number of records to list from a request.");

export const getRecordsQuerySinceSchema = z
	.string()
	.optional()
	.describe("Get records created after this JavaScript timestamp.");

export const getRecordsQueryUntilSchema = z
	.string()
	.optional()
	.describe("Get records created before this JavaScript timestamp.");

export const getRecordsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getRecordsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getRecordsStatus200Schema = z.unknown();

export const getRecordsStatus400Schema = z.unknown();

export const getRecordsStatus401Schema = z.unknown();

export const getRecordsStatus403Schema = z.unknown();

export const getRecordsStatus404Schema = z.unknown();

export const getRecordsResponseSchema = z.union([
	getRecordsStatus200Schema,
	getRecordsStatus400Schema,
	getRecordsStatus401Schema,
	getRecordsStatus403Schema,
	getRecordsStatus404Schema,
]);

export const createRecordPathDomainSchema = z
	.string()
	.describe("The domain used to create the DNS record.");

export const createRecordQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const createRecordQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const createRecordStatus200Schema = z.unknown();

export const createRecordStatus400Schema = z.unknown();

export const createRecordStatus401Schema = z.unknown();

export const createRecordStatus402Schema = z.unknown();

export const createRecordStatus403Schema = z.unknown();

export const createRecordStatus404Schema = z.unknown();

export const createRecordStatus409Schema = z.unknown();

export const createRecordResponseSchema = z.union([
	createRecordStatus200Schema,
	createRecordStatus400Schema,
	createRecordStatus401Schema,
	createRecordStatus402Schema,
	createRecordStatus403Schema,
	createRecordStatus404Schema,
	createRecordStatus409Schema,
]);

export const updateRecordPathRecordIdSchema = z.string().describe("The id of the DNS record");

export const updateRecordQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const updateRecordQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const updateRecordStatus200Schema = z.unknown();

export const updateRecordStatus400Schema = z.unknown();

export const updateRecordStatus401Schema = z.unknown();

export const updateRecordStatus402Schema = z.unknown();

export const updateRecordStatus403Schema = z.unknown();

export const updateRecordStatus404Schema = z.unknown();

export const updateRecordStatus409Schema = z.unknown();

export const updateRecordResponseSchema = z.union([
	updateRecordStatus200Schema,
	updateRecordStatus400Schema,
	updateRecordStatus401Schema,
	updateRecordStatus402Schema,
	updateRecordStatus403Schema,
	updateRecordStatus404Schema,
	updateRecordStatus409Schema,
]);

export const removeRecordPathDomainSchema = z.string();

export const removeRecordPathRecordIdSchema = z.string();

export const removeRecordQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const removeRecordQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const removeRecordStatus200Schema = z.unknown();

export const removeRecordStatus400Schema = z.unknown();

export const removeRecordStatus401Schema = z.unknown();

export const removeRecordStatus403Schema = z.unknown();

export const removeRecordStatus404Schema = z.unknown();

export const removeRecordResponseSchema = z.union([
	removeRecordStatus200Schema,
	removeRecordStatus400Schema,
	removeRecordStatus401Schema,
	removeRecordStatus403Schema,
	removeRecordStatus404Schema,
]);

export const getSupportedTldsQueryTeamIdSchema = z.string().optional();

export const getSupportedTldsStatus200Schema = z.unknown();

export const getSupportedTldsStatus400Schema = z.unknown();

export const getSupportedTldsStatus401Schema = z.unknown();

export const getSupportedTldsStatus403Schema = z.unknown();

export const getSupportedTldsStatus429Schema = z.unknown();

export const getSupportedTldsStatus500Schema = z.unknown();

export const getSupportedTldsResponseSchema = z.union([
	getSupportedTldsStatus200Schema,
	getSupportedTldsStatus400Schema,
	getSupportedTldsStatus401Schema,
	getSupportedTldsStatus403Schema,
	getSupportedTldsStatus429Schema,
	getSupportedTldsStatus500Schema,
]);

export const getTldPathTldSchema = z.unknown();

export const getTldQueryTeamIdSchema = z.string().optional();

export const getTldStatus200Schema = z.unknown();

export const getTldStatus400Schema = z.unknown();

export const getTldStatus401Schema = z.unknown();

export const getTldStatus403Schema = z.unknown();

export const getTldStatus429Schema = z.unknown();

export const getTldStatus500Schema = z.unknown();

export const getTldResponseSchema = z.union([
	getTldStatus200Schema,
	getTldStatus400Schema,
	getTldStatus401Schema,
	getTldStatus403Schema,
	getTldStatus429Schema,
	getTldStatus500Schema,
]);

export const getTldPricePathTldSchema = z.unknown();

export const getTldPriceQueryYearsSchema = z
	.string()
	.optional()
	.describe(
		"The number of years to get the price for. If not provided, the minimum number of years for the TLD will be used.",
	);

export const getTldPriceQueryTeamIdSchema = z.string().optional();

export const getTldPriceStatus200Schema = z.unknown();

export const getTldPriceStatus400Schema = z.unknown();

export const getTldPriceStatus401Schema = z.unknown();

export const getTldPriceStatus403Schema = z.unknown();

export const getTldPriceStatus429Schema = z.unknown();

export const getTldPriceStatus500Schema = z.unknown();

export const getTldPriceResponseSchema = z.union([
	getTldPriceStatus200Schema,
	getTldPriceStatus400Schema,
	getTldPriceStatus401Schema,
	getTldPriceStatus403Schema,
	getTldPriceStatus429Schema,
	getTldPriceStatus500Schema,
]);

export const getDomainAvailabilityPathDomainSchema = z.unknown();

export const getDomainAvailabilityQueryTeamIdSchema = z.string().optional();

export const getDomainAvailabilityStatus200Schema = z.unknown();

export const getDomainAvailabilityStatus400Schema = z.unknown();

export const getDomainAvailabilityStatus401Schema = z.unknown();

export const getDomainAvailabilityStatus403Schema = z.unknown();

export const getDomainAvailabilityStatus404Schema = z.unknown();

export const getDomainAvailabilityStatus429Schema = z.unknown();

export const getDomainAvailabilityStatus500Schema = z.unknown();

export const getDomainAvailabilityResponseSchema = z.union([
	getDomainAvailabilityStatus200Schema,
	getDomainAvailabilityStatus400Schema,
	getDomainAvailabilityStatus401Schema,
	getDomainAvailabilityStatus403Schema,
	getDomainAvailabilityStatus404Schema,
	getDomainAvailabilityStatus429Schema,
	getDomainAvailabilityStatus500Schema,
]);

export const getDomainPricePathDomainSchema = z.unknown();

export const getDomainPriceQueryYearsSchema = z
	.string()
	.optional()
	.describe(
		"The number of years to get the price for. If not provided, the minimum number of years for the TLD will be used.",
	);

export const getDomainPriceQueryTeamIdSchema = z.string().optional();

export const getDomainPriceStatus200Schema = z.unknown();

export const getDomainPriceStatus400Schema = z.unknown();

export const getDomainPriceStatus401Schema = z.unknown();

export const getDomainPriceStatus403Schema = z.unknown();

export const getDomainPriceStatus429Schema = z.unknown();

export const getDomainPriceStatus500Schema = z.unknown();

export const getDomainPriceResponseSchema = z.union([
	getDomainPriceStatus200Schema,
	getDomainPriceStatus400Schema,
	getDomainPriceStatus401Schema,
	getDomainPriceStatus403Schema,
	getDomainPriceStatus429Schema,
	getDomainPriceStatus500Schema,
]);

export const getBulkAvailabilityQueryTeamIdSchema = z.string().optional();

export const getBulkAvailabilityStatus200Schema = z.unknown();

export const getBulkAvailabilityStatus400Schema = z.unknown();

export const getBulkAvailabilityStatus401Schema = z.unknown();

export const getBulkAvailabilityStatus403Schema = z.unknown();

export const getBulkAvailabilityStatus429Schema = z.unknown();

export const getBulkAvailabilityStatus500Schema = z.unknown();

export const getBulkAvailabilityResponseSchema = z.union([
	getBulkAvailabilityStatus200Schema,
	getBulkAvailabilityStatus400Schema,
	getBulkAvailabilityStatus401Schema,
	getBulkAvailabilityStatus403Schema,
	getBulkAvailabilityStatus429Schema,
	getBulkAvailabilityStatus500Schema,
]);

export const getDomainAuthCodePathDomainSchema = z.unknown();

export const getDomainAuthCodeQueryTeamIdSchema = z.string().optional();

export const getDomainAuthCodeStatus200Schema = z.unknown();

export const getDomainAuthCodeStatus400Schema = z.unknown();

export const getDomainAuthCodeStatus401Schema = z.unknown();

export const getDomainAuthCodeStatus403Schema = z.unknown();

export const getDomainAuthCodeStatus404Schema = z.unknown();

export const getDomainAuthCodeStatus409Schema = z.unknown();

export const getDomainAuthCodeStatus429Schema = z.unknown();

export const getDomainAuthCodeStatus500Schema = z.unknown();

export const getDomainAuthCodeResponseSchema = z.union([
	getDomainAuthCodeStatus200Schema,
	getDomainAuthCodeStatus400Schema,
	getDomainAuthCodeStatus401Schema,
	getDomainAuthCodeStatus403Schema,
	getDomainAuthCodeStatus404Schema,
	getDomainAuthCodeStatus409Schema,
	getDomainAuthCodeStatus429Schema,
	getDomainAuthCodeStatus500Schema,
]);

export const buySingleDomainPathDomainSchema = z.unknown();

export const buySingleDomainQueryTeamIdSchema = z.string().optional();

export const buySingleDomainStatus200Schema = z.unknown();

export const buySingleDomainStatus400Schema = z.unknown();

export const buySingleDomainStatus401Schema = z.unknown();

export const buySingleDomainStatus403Schema = z.unknown();

export const buySingleDomainStatus429Schema = z.unknown();

export const buySingleDomainStatus500Schema = z.unknown();

export const buySingleDomainResponseSchema = z.union([
	buySingleDomainStatus200Schema,
	buySingleDomainStatus400Schema,
	buySingleDomainStatus401Schema,
	buySingleDomainStatus403Schema,
	buySingleDomainStatus429Schema,
	buySingleDomainStatus500Schema,
]);

export const buyDomainsQueryTeamIdSchema = z.string().optional();

export const buyDomainsStatus200Schema = z.unknown();

export const buyDomainsStatus400Schema = z.unknown();

export const buyDomainsStatus401Schema = z.unknown();

export const buyDomainsStatus403Schema = z.unknown();

export const buyDomainsStatus429Schema = z.unknown();

export const buyDomainsStatus500Schema = z.unknown();

export const buyDomainsResponseSchema = z.union([
	buyDomainsStatus200Schema,
	buyDomainsStatus400Schema,
	buyDomainsStatus401Schema,
	buyDomainsStatus403Schema,
	buyDomainsStatus429Schema,
	buyDomainsStatus500Schema,
]);

export const transferInDomainPathDomainSchema = z.unknown();

export const transferInDomainQueryTeamIdSchema = z.string().optional();

export const transferInDomainStatus200Schema = z.unknown();

export const transferInDomainStatus400Schema = z.unknown();

export const transferInDomainStatus401Schema = z.unknown();

export const transferInDomainStatus403Schema = z.unknown();

export const transferInDomainStatus429Schema = z.unknown();

export const transferInDomainStatus500Schema = z.unknown();

export const transferInDomainResponseSchema = z.union([
	transferInDomainStatus200Schema,
	transferInDomainStatus400Schema,
	transferInDomainStatus401Schema,
	transferInDomainStatus403Schema,
	transferInDomainStatus429Schema,
	transferInDomainStatus500Schema,
]);

export const getDomainTransferInPathDomainSchema = z.unknown();

export const getDomainTransferInQueryTeamIdSchema = z.string().optional();

export const getDomainTransferInStatus200Schema = z.unknown();

export const getDomainTransferInStatus400Schema = z.unknown();

export const getDomainTransferInStatus401Schema = z.unknown();

export const getDomainTransferInStatus403Schema = z.unknown();

export const getDomainTransferInStatus404Schema = z.unknown();

export const getDomainTransferInStatus429Schema = z.unknown();

export const getDomainTransferInStatus500Schema = z.unknown();

export const getDomainTransferInResponseSchema = z.union([
	getDomainTransferInStatus200Schema,
	getDomainTransferInStatus400Schema,
	getDomainTransferInStatus401Schema,
	getDomainTransferInStatus403Schema,
	getDomainTransferInStatus404Schema,
	getDomainTransferInStatus429Schema,
	getDomainTransferInStatus500Schema,
]);

export const renewDomainPathDomainSchema = z.unknown();

export const renewDomainQueryTeamIdSchema = z.string().optional();

export const renewDomainStatus200Schema = z.unknown();

export const renewDomainStatus400Schema = z.unknown();

export const renewDomainStatus401Schema = z.unknown();

export const renewDomainStatus403Schema = z.unknown();

export const renewDomainStatus404Schema = z.unknown();

export const renewDomainStatus429Schema = z.unknown();

export const renewDomainStatus500Schema = z.unknown();

export const renewDomainResponseSchema = z.union([
	renewDomainStatus200Schema,
	renewDomainStatus400Schema,
	renewDomainStatus401Schema,
	renewDomainStatus403Schema,
	renewDomainStatus404Schema,
	renewDomainStatus429Schema,
	renewDomainStatus500Schema,
]);

export const updateDomainAutoRenewPathDomainSchema = z.unknown();

export const updateDomainAutoRenewQueryTeamIdSchema = z.string().optional();

export const updateDomainAutoRenewStatus204Schema = z.unknown();

export const updateDomainAutoRenewStatus400Schema = z.unknown();

export const updateDomainAutoRenewStatus401Schema = z.unknown();

export const updateDomainAutoRenewStatus403Schema = z.unknown();

export const updateDomainAutoRenewStatus404Schema = z.unknown();

export const updateDomainAutoRenewStatus429Schema = z.unknown();

export const updateDomainAutoRenewStatus500Schema = z.unknown();

export const updateDomainAutoRenewResponseSchema = z.union([
	updateDomainAutoRenewStatus204Schema,
	updateDomainAutoRenewStatus400Schema,
	updateDomainAutoRenewStatus401Schema,
	updateDomainAutoRenewStatus403Schema,
	updateDomainAutoRenewStatus404Schema,
	updateDomainAutoRenewStatus429Schema,
	updateDomainAutoRenewStatus500Schema,
]);

export const updateDomainNameserversPathDomainSchema = z.unknown();

export const updateDomainNameserversQueryTeamIdSchema = z.string().optional();

export const updateDomainNameserversStatus204Schema = z.unknown();

export const updateDomainNameserversStatus400Schema = z.unknown();

export const updateDomainNameserversStatus401Schema = z.unknown();

export const updateDomainNameserversStatus403Schema = z.unknown();

export const updateDomainNameserversStatus404Schema = z.unknown();

export const updateDomainNameserversStatus429Schema = z.unknown();

export const updateDomainNameserversStatus500Schema = z.unknown();

export const updateDomainNameserversResponseSchema = z.union([
	updateDomainNameserversStatus204Schema,
	updateDomainNameserversStatus400Schema,
	updateDomainNameserversStatus401Schema,
	updateDomainNameserversStatus403Schema,
	updateDomainNameserversStatus404Schema,
	updateDomainNameserversStatus429Schema,
	updateDomainNameserversStatus500Schema,
]);

export const getDomainContactVerificationPathDomainSchema = z.unknown();

export const getDomainContactVerificationQueryTeamIdSchema = z.string().optional();

export const getDomainContactVerificationStatus200Schema = z.unknown();

export const getDomainContactVerificationStatus400Schema = z.unknown();

export const getDomainContactVerificationStatus401Schema = z.unknown();

export const getDomainContactVerificationStatus403Schema = z.unknown();

export const getDomainContactVerificationStatus404Schema = z.unknown();

export const getDomainContactVerificationStatus429Schema = z.unknown();

export const getDomainContactVerificationStatus500Schema = z.unknown();

export const getDomainContactVerificationResponseSchema = z.union([
	getDomainContactVerificationStatus200Schema,
	getDomainContactVerificationStatus400Schema,
	getDomainContactVerificationStatus401Schema,
	getDomainContactVerificationStatus403Schema,
	getDomainContactVerificationStatus404Schema,
	getDomainContactVerificationStatus429Schema,
	getDomainContactVerificationStatus500Schema,
]);

export const getContactInfoSchemaPathDomainSchema = z.unknown();

export const getContactInfoSchemaQueryTeamIdSchema = z.string().optional();

export const getContactInfoSchemaStatus200Schema = z.unknown();

export const getContactInfoSchemaStatus400Schema = z.unknown();

export const getContactInfoSchemaStatus401Schema = z.unknown();

export const getContactInfoSchemaStatus403Schema = z.unknown();

export const getContactInfoSchemaStatus429Schema = z.unknown();

export const getContactInfoSchemaStatus500Schema = z.unknown();

export const getContactInfoSchemaResponseSchema = z.union([
	getContactInfoSchemaStatus200Schema,
	getContactInfoSchemaStatus400Schema,
	getContactInfoSchemaStatus401Schema,
	getContactInfoSchemaStatus403Schema,
	getContactInfoSchemaStatus429Schema,
	getContactInfoSchemaStatus500Schema,
]);

export const getOrderPathOrderIdSchema = z.unknown();

export const getOrderQueryTeamIdSchema = z.string().optional();

export const getOrderStatus200Schema = z.unknown();

export const getOrderStatus400Schema = z.unknown();

export const getOrderStatus401Schema = z.unknown();

export const getOrderStatus403Schema = z.unknown();

export const getOrderStatus404Schema = z.unknown();

export const getOrderStatus429Schema = z.unknown();

export const getOrderStatus500Schema = z.unknown();

export const getOrderResponseSchema = z.union([
	getOrderStatus200Schema,
	getOrderStatus400Schema,
	getOrderStatus401Schema,
	getOrderStatus403Schema,
	getOrderStatus404Schema,
	getOrderStatus429Schema,
	getOrderStatus500Schema,
]);

export const getDomainConfigPathDomainSchema = z.string().describe("The name of the domain.");

export const getDomainConfigQueryProjectIdOrNameSchema = z
	.string()
	.optional()
	.describe(
		"The project id or name that will be associated with the domain. Use this when the domain is not yet associated with a project.",
	);

export const getDomainConfigQueryStrictSchema = z
	.enum(["true", "false"])
	.optional()
	.describe(
		"When true, the response will only include the nameservers assigned directly to the specified domain. When false and there are no nameservers assigned directly to the specified domain, the response will include the nameservers of the domain's parent zone.",
	);

export const getDomainConfigQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getDomainConfigQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getDomainConfigStatus200Schema = z.unknown();

export const getDomainConfigStatus400Schema = z.unknown();

export const getDomainConfigStatus401Schema = z.unknown();

export const getDomainConfigStatus403Schema = z.unknown();

export const getDomainConfigResponseSchema = z.union([
	getDomainConfigStatus200Schema,
	getDomainConfigStatus400Schema,
	getDomainConfigStatus401Schema,
	getDomainConfigStatus403Schema,
]);

export const getDomainVerificationRecordPathDomainSchema = z
	.string()
	.describe("The domain name to get the verification record for");

export const getDomainVerificationRecordQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getDomainVerificationRecordQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getDomainVerificationRecordStatus200Schema = z.unknown();

export const getDomainVerificationRecordStatus400Schema = z.unknown();

export const getDomainVerificationRecordStatus401Schema = z.unknown();

export const getDomainVerificationRecordStatus403Schema = z.unknown();

export const getDomainVerificationRecordStatus404Schema = z.unknown();

export const getDomainVerificationRecordResponseSchema = z.union([
	getDomainVerificationRecordStatus200Schema,
	getDomainVerificationRecordStatus400Schema,
	getDomainVerificationRecordStatus401Schema,
	getDomainVerificationRecordStatus403Schema,
	getDomainVerificationRecordStatus404Schema,
]);

export const claimDomainOwnershipPathDomainSchema = z
	.string()
	.describe("The domain name to claim ownership of");

export const claimDomainOwnershipQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const claimDomainOwnershipQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const claimDomainOwnershipStatus200Schema = z.unknown();

export const claimDomainOwnershipStatus400Schema = z.unknown();

export const claimDomainOwnershipStatus401Schema = z.unknown();

export const claimDomainOwnershipStatus403Schema = z.unknown();

export const claimDomainOwnershipStatus404Schema = z.unknown();

export const claimDomainOwnershipResponseSchema = z.union([
	claimDomainOwnershipStatus200Schema,
	claimDomainOwnershipStatus400Schema,
	claimDomainOwnershipStatus401Schema,
	claimDomainOwnershipStatus403Schema,
	claimDomainOwnershipStatus404Schema,
]);

export const getDomainProjectDomainsPathDomainSchema = z.string().describe("The apex domain name.");

export const getDomainProjectDomainsQueryLimitSchema = z
	.number()
	.optional()
	.describe("Maximum number of project domains to list from a request.");

export const getDomainProjectDomainsQuerySinceSchema = z
	.number()
	.optional()
	.describe("Get project domains created after this JavaScript timestamp.");

export const getDomainProjectDomainsQueryUntilSchema = z
	.number()
	.optional()
	.describe("Get project domains created before this JavaScript timestamp.");

export const getDomainProjectDomainsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getDomainProjectDomainsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getDomainProjectDomainsStatus200Schema = z.unknown();

export const getDomainProjectDomainsStatus400Schema = z.unknown();

export const getDomainProjectDomainsStatus401Schema = z.unknown();

export const getDomainProjectDomainsStatus403Schema = z.unknown();

export const getDomainProjectDomainsStatus404Schema = z.unknown();

export const getDomainProjectDomainsResponseSchema = z.union([
	getDomainProjectDomainsStatus200Schema,
	getDomainProjectDomainsStatus400Schema,
	getDomainProjectDomainsStatus401Schema,
	getDomainProjectDomainsStatus403Schema,
	getDomainProjectDomainsStatus404Schema,
]);

export const getDomainPathDomainSchema = z.string().describe("The name of the domain.");

export const getDomainQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getDomainQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getDomainStatus200Schema = z.unknown();

export const getDomainStatus400Schema = z.unknown();

export const getDomainStatus401Schema = z.unknown();

export const getDomainStatus403Schema = z.unknown();

export const getDomainStatus404Schema = z.unknown();

export const getDomainResponseSchema = z.union([
	getDomainStatus200Schema,
	getDomainStatus400Schema,
	getDomainStatus401Schema,
	getDomainStatus403Schema,
	getDomainStatus404Schema,
]);

export const getDomainsQueryLimitSchema = z
	.number()
	.optional()
	.describe("Maximum number of domains to list from a request.");

export const getDomainsQuerySinceSchema = z
	.number()
	.optional()
	.describe("Get domains created after this JavaScript timestamp.");

export const getDomainsQueryUntilSchema = z
	.number()
	.optional()
	.describe("Get domains created before this JavaScript timestamp.");

export const getDomainsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getDomainsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getDomainsStatus200Schema = z.unknown();

export const getDomainsStatus400Schema = z.unknown();

export const getDomainsStatus401Schema = z.unknown();

export const getDomainsStatus403Schema = z.unknown();

export const getDomainsStatus409Schema = z.unknown();

export const getDomainsResponseSchema = z.union([
	getDomainsStatus200Schema,
	getDomainsStatus400Schema,
	getDomainsStatus401Schema,
	getDomainsStatus403Schema,
	getDomainsStatus409Schema,
]);

export const createOrTransferDomainQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const createOrTransferDomainQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const createOrTransferDomainStatus200Schema = z.unknown();

export const createOrTransferDomainStatus400Schema = z.unknown();

export const createOrTransferDomainStatus401Schema = z.unknown();

export const createOrTransferDomainStatus402Schema = z.unknown();

export const createOrTransferDomainStatus403Schema = z.unknown();

export const createOrTransferDomainStatus404Schema = z.unknown();

export const createOrTransferDomainStatus409Schema = z.unknown();

export const createOrTransferDomainResponseSchema = z.union([
	createOrTransferDomainStatus200Schema,
	createOrTransferDomainStatus400Schema,
	createOrTransferDomainStatus401Schema,
	createOrTransferDomainStatus402Schema,
	createOrTransferDomainStatus403Schema,
	createOrTransferDomainStatus404Schema,
	createOrTransferDomainStatus409Schema,
]);

export const patchDomainPathDomainSchema = z.string();

export const patchDomainQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const patchDomainQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const patchDomainStatus200Schema = z.unknown();

export const patchDomainStatus400Schema = z.unknown();

export const patchDomainStatus401Schema = z.unknown();

export const patchDomainStatus403Schema = z.unknown();

export const patchDomainStatus404Schema = z.unknown();

export const patchDomainStatus409Schema = z.unknown();

export const patchDomainStatus500Schema = z.unknown();

export const patchDomainResponseSchema = z.union([
	patchDomainStatus200Schema,
	patchDomainStatus400Schema,
	patchDomainStatus401Schema,
	patchDomainStatus403Schema,
	patchDomainStatus404Schema,
	patchDomainStatus409Schema,
	patchDomainStatus500Schema,
]);

export const deleteDomainPathDomainSchema = z.string().describe("The name of the domain.");

export const deleteDomainQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const deleteDomainQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const deleteDomainStatus200Schema = z.unknown();

export const deleteDomainStatus400Schema = z.unknown();

export const deleteDomainStatus401Schema = z.unknown();

export const deleteDomainStatus403Schema = z.unknown();

export const deleteDomainStatus404Schema = z.unknown();

export const deleteDomainStatus409Schema = z.unknown();

export const deleteDomainResponseSchema = z.union([
	deleteDomainStatus200Schema,
	deleteDomainStatus400Schema,
	deleteDomainStatus401Schema,
	deleteDomainStatus403Schema,
	deleteDomainStatus404Schema,
	deleteDomainStatus409Schema,
]);

export const getConfigurableLogDrainPathIdSchema = z.string();

export const getConfigurableLogDrainQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getConfigurableLogDrainQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getConfigurableLogDrainStatus200Schema = z.unknown();

export const getConfigurableLogDrainStatus400Schema = z.unknown();

export const getConfigurableLogDrainStatus401Schema = z.unknown();

export const getConfigurableLogDrainStatus403Schema = z.unknown();

export const getConfigurableLogDrainStatus404Schema = z.unknown();

export const getConfigurableLogDrainResponseSchema = z.union([
	getConfigurableLogDrainStatus200Schema,
	getConfigurableLogDrainStatus400Schema,
	getConfigurableLogDrainStatus401Schema,
	getConfigurableLogDrainStatus403Schema,
	getConfigurableLogDrainStatus404Schema,
]);

export const deleteConfigurableLogDrainPathIdSchema = z.string();

export const deleteConfigurableLogDrainQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const deleteConfigurableLogDrainQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const deleteConfigurableLogDrainStatus204Schema = z.unknown();

export const deleteConfigurableLogDrainStatus400Schema = z.unknown();

export const deleteConfigurableLogDrainStatus401Schema = z.unknown();

export const deleteConfigurableLogDrainStatus403Schema = z.unknown();

export const deleteConfigurableLogDrainStatus404Schema = z.unknown();

export const deleteConfigurableLogDrainResponseSchema = z.union([
	deleteConfigurableLogDrainStatus204Schema,
	deleteConfigurableLogDrainStatus400Schema,
	deleteConfigurableLogDrainStatus401Schema,
	deleteConfigurableLogDrainStatus403Schema,
	deleteConfigurableLogDrainStatus404Schema,
]);

export const getAllLogDrainsQueryProjectIdSchema = z
	.string()
	.regex(/^[a-zA-z0-9_]+$/)
	.optional();

export const getAllLogDrainsQueryProjectIdOrNameSchema = z.string().optional();

export const getAllLogDrainsQueryIncludeMetadataSchema = z.boolean().optional().default(false);

export const getAllLogDrainsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getAllLogDrainsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getAllLogDrainsStatus200Schema = z.unknown();

export const getAllLogDrainsStatus400Schema = z.unknown();

export const getAllLogDrainsStatus401Schema = z.unknown();

export const getAllLogDrainsStatus403Schema = z.unknown();

export const getAllLogDrainsStatus404Schema = z.unknown();

export const getAllLogDrainsResponseSchema = z.union([
	getAllLogDrainsStatus200Schema,
	getAllLogDrainsStatus400Schema,
	getAllLogDrainsStatus401Schema,
	getAllLogDrainsStatus403Schema,
	getAllLogDrainsStatus404Schema,
]);

export const createConfigurableLogDrainQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const createConfigurableLogDrainQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const createConfigurableLogDrainStatus200Schema = z.unknown();

export const createConfigurableLogDrainStatus400Schema = z.unknown();

export const createConfigurableLogDrainStatus401Schema = z.unknown();

export const createConfigurableLogDrainStatus403Schema = z.unknown();

export const createConfigurableLogDrainResponseSchema = z.union([
	createConfigurableLogDrainStatus200Schema,
	createConfigurableLogDrainStatus400Schema,
	createConfigurableLogDrainStatus401Schema,
	createConfigurableLogDrainStatus403Schema,
]);

export const createDrainQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const createDrainQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const createDrainStatus200Schema = z.unknown();

export const createDrainStatus400Schema = z.unknown();

export const createDrainStatus401Schema = z.unknown();

export const createDrainStatus403Schema = z.unknown();

export const createDrainResponseSchema = z.union([
	createDrainStatus200Schema,
	createDrainStatus400Schema,
	createDrainStatus401Schema,
	createDrainStatus403Schema,
]);

export const getDrainsQueryProjectIdSchema = z.string().optional();

export const getDrainsQueryIncludeMetadataSchema = z.boolean().optional().default(false);

export const getDrainsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getDrainsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getDrainsStatus200Schema = z.unknown();

export const getDrainsStatus400Schema = z.unknown();

export const getDrainsStatus401Schema = z.unknown();

export const getDrainsStatus403Schema = z.unknown();

export const getDrainsStatus404Schema = z.unknown();

export const getDrainsResponseSchema = z.union([
	getDrainsStatus200Schema,
	getDrainsStatus400Schema,
	getDrainsStatus401Schema,
	getDrainsStatus403Schema,
	getDrainsStatus404Schema,
]);

export const deleteDrainPathIdSchema = z.string();

export const deleteDrainQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const deleteDrainQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const deleteDrainStatus204Schema = z.unknown();

export const deleteDrainStatus400Schema = z.unknown();

export const deleteDrainStatus401Schema = z.unknown();

export const deleteDrainStatus403Schema = z.unknown();

export const deleteDrainStatus404Schema = z.unknown();

export const deleteDrainResponseSchema = z.union([
	deleteDrainStatus204Schema,
	deleteDrainStatus400Schema,
	deleteDrainStatus401Schema,
	deleteDrainStatus403Schema,
	deleteDrainStatus404Schema,
]);

export const getDrainPathIdSchema = z.string();

export const getDrainQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getDrainQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getDrainStatus200Schema = z.unknown();

export const getDrainStatus400Schema = z.unknown();

export const getDrainStatus401Schema = z.unknown();

export const getDrainStatus403Schema = z.unknown();

export const getDrainStatus404Schema = z.unknown();

export const getDrainResponseSchema = z.union([
	getDrainStatus200Schema,
	getDrainStatus400Schema,
	getDrainStatus401Schema,
	getDrainStatus403Schema,
	getDrainStatus404Schema,
]);

export const updateDrainPathIdSchema = z.string();

export const updateDrainQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const updateDrainQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const updateDrainStatus200Schema = z.unknown();

export const updateDrainStatus400Schema = z.unknown();

export const updateDrainStatus401Schema = z.unknown();

export const updateDrainStatus403Schema = z.unknown();

export const updateDrainStatus404Schema = z.unknown();

export const updateDrainResponseSchema = z.union([
	updateDrainStatus200Schema,
	updateDrainStatus400Schema,
	updateDrainStatus401Schema,
	updateDrainStatus403Schema,
	updateDrainStatus404Schema,
]);

export const testDrainQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const testDrainQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const testDrainStatus200Schema = z.unknown();

export const testDrainStatus400Schema = z.unknown();

export const testDrainStatus401Schema = z.unknown();

export const testDrainStatus403Schema = z.unknown();

export const testDrainResponseSchema = z.union([
	testDrainStatus200Schema,
	testDrainStatus400Schema,
	testDrainStatus401Schema,
	testDrainStatus403Schema,
]);

export const invalidateByTagsQueryProjectIdOrNameSchema = z.string();

export const invalidateByTagsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const invalidateByTagsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const invalidateByTagsStatus200Schema = z.unknown();

export const invalidateByTagsStatus400Schema = z.unknown();

export const invalidateByTagsStatus401Schema = z.unknown();

export const invalidateByTagsStatus403Schema = z.unknown();

export const invalidateByTagsStatus404Schema = z.unknown();

export const invalidateByTagsResponseSchema = z.union([
	invalidateByTagsStatus200Schema,
	invalidateByTagsStatus400Schema,
	invalidateByTagsStatus401Schema,
	invalidateByTagsStatus403Schema,
	invalidateByTagsStatus404Schema,
]);

export const dangerouslyDeleteByTagsQueryProjectIdOrNameSchema = z.string();

export const dangerouslyDeleteByTagsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const dangerouslyDeleteByTagsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const dangerouslyDeleteByTagsStatus200Schema = z.unknown();

export const dangerouslyDeleteByTagsStatus400Schema = z.unknown();

export const dangerouslyDeleteByTagsStatus401Schema = z.unknown();

export const dangerouslyDeleteByTagsStatus403Schema = z.unknown();

export const dangerouslyDeleteByTagsStatus404Schema = z.unknown();

export const dangerouslyDeleteByTagsResponseSchema = z.union([
	dangerouslyDeleteByTagsStatus200Schema,
	dangerouslyDeleteByTagsStatus400Schema,
	dangerouslyDeleteByTagsStatus401Schema,
	dangerouslyDeleteByTagsStatus403Schema,
	dangerouslyDeleteByTagsStatus404Schema,
]);

export const invalidateBySrcImagesQueryProjectIdOrNameSchema = z.string();

export const invalidateBySrcImagesQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const invalidateBySrcImagesQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const invalidateBySrcImagesStatus200Schema = z.unknown();

export const invalidateBySrcImagesStatus400Schema = z.unknown();

export const invalidateBySrcImagesStatus401Schema = z.unknown();

export const invalidateBySrcImagesStatus402Schema = z.unknown();

export const invalidateBySrcImagesStatus403Schema = z.unknown();

export const invalidateBySrcImagesStatus404Schema = z.unknown();

export const invalidateBySrcImagesResponseSchema = z.union([
	invalidateBySrcImagesStatus200Schema,
	invalidateBySrcImagesStatus400Schema,
	invalidateBySrcImagesStatus401Schema,
	invalidateBySrcImagesStatus402Schema,
	invalidateBySrcImagesStatus403Schema,
	invalidateBySrcImagesStatus404Schema,
]);

export const dangerouslyDeleteBySrcImagesQueryProjectIdOrNameSchema = z.string();

export const dangerouslyDeleteBySrcImagesQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const dangerouslyDeleteBySrcImagesQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const dangerouslyDeleteBySrcImagesStatus200Schema = z.unknown();

export const dangerouslyDeleteBySrcImagesStatus400Schema = z.unknown();

export const dangerouslyDeleteBySrcImagesStatus401Schema = z.unknown();

export const dangerouslyDeleteBySrcImagesStatus402Schema = z.unknown();

export const dangerouslyDeleteBySrcImagesStatus403Schema = z.unknown();

export const dangerouslyDeleteBySrcImagesStatus404Schema = z.unknown();

export const dangerouslyDeleteBySrcImagesResponseSchema = z.union([
	dangerouslyDeleteBySrcImagesStatus200Schema,
	dangerouslyDeleteBySrcImagesStatus400Schema,
	dangerouslyDeleteBySrcImagesStatus401Schema,
	dangerouslyDeleteBySrcImagesStatus402Schema,
	dangerouslyDeleteBySrcImagesStatus403Schema,
	dangerouslyDeleteBySrcImagesStatus404Schema,
]);

export const getEdgeConfigsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getEdgeConfigsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getEdgeConfigsStatus200Schema = z.unknown();

export const getEdgeConfigsStatus400Schema = z.unknown();

export const getEdgeConfigsStatus401Schema = z.unknown();

export const getEdgeConfigsStatus403Schema = z.unknown();

export const getEdgeConfigsResponseSchema = z.union([
	getEdgeConfigsStatus200Schema,
	getEdgeConfigsStatus400Schema,
	getEdgeConfigsStatus401Schema,
	getEdgeConfigsStatus403Schema,
]);

export const createEdgeConfigQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const createEdgeConfigQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const createEdgeConfigStatus201Schema = z.unknown();

export const createEdgeConfigStatus400Schema = z.unknown();

export const createEdgeConfigStatus401Schema = z.unknown();

export const createEdgeConfigStatus402Schema = z.unknown();

export const createEdgeConfigStatus403Schema = z.unknown();

export const createEdgeConfigResponseSchema = z.union([
	createEdgeConfigStatus201Schema,
	createEdgeConfigStatus400Schema,
	createEdgeConfigStatus401Schema,
	createEdgeConfigStatus402Schema,
	createEdgeConfigStatus403Schema,
]);

export const getEdgeConfigPathEdgeConfigIdSchema = z.string();

export const getEdgeConfigQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getEdgeConfigQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getEdgeConfigStatus200Schema = z.unknown();

export const getEdgeConfigStatus400Schema = z.unknown();

export const getEdgeConfigStatus401Schema = z.unknown();

export const getEdgeConfigStatus403Schema = z.unknown();

export const getEdgeConfigStatus404Schema = z.unknown();

export const getEdgeConfigResponseSchema = z.union([
	getEdgeConfigStatus200Schema,
	getEdgeConfigStatus400Schema,
	getEdgeConfigStatus401Schema,
	getEdgeConfigStatus403Schema,
	getEdgeConfigStatus404Schema,
]);

export const updateEdgeConfigPathEdgeConfigIdSchema = z.string();

export const updateEdgeConfigQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const updateEdgeConfigQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const updateEdgeConfigStatus200Schema = z.unknown();

export const updateEdgeConfigStatus400Schema = z.unknown();

export const updateEdgeConfigStatus401Schema = z.unknown();

export const updateEdgeConfigStatus402Schema = z.unknown();

export const updateEdgeConfigStatus403Schema = z.unknown();

export const updateEdgeConfigStatus404Schema = z.unknown();

export const updateEdgeConfigStatus409Schema = z.unknown();

export const updateEdgeConfigResponseSchema = z.union([
	updateEdgeConfigStatus200Schema,
	updateEdgeConfigStatus400Schema,
	updateEdgeConfigStatus401Schema,
	updateEdgeConfigStatus402Schema,
	updateEdgeConfigStatus403Schema,
	updateEdgeConfigStatus404Schema,
	updateEdgeConfigStatus409Schema,
]);

export const deleteEdgeConfigPathEdgeConfigIdSchema = z.string();

export const deleteEdgeConfigQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const deleteEdgeConfigQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const deleteEdgeConfigStatus204Schema = z.unknown();

export const deleteEdgeConfigStatus400Schema = z.unknown();

export const deleteEdgeConfigStatus401Schema = z.unknown();

export const deleteEdgeConfigStatus403Schema = z.unknown();

export const deleteEdgeConfigStatus404Schema = z.unknown();

export const deleteEdgeConfigStatus409Schema = z.unknown();

export const deleteEdgeConfigResponseSchema = z.union([
	deleteEdgeConfigStatus204Schema,
	deleteEdgeConfigStatus400Schema,
	deleteEdgeConfigStatus401Schema,
	deleteEdgeConfigStatus403Schema,
	deleteEdgeConfigStatus404Schema,
	deleteEdgeConfigStatus409Schema,
]);

export const getEdgeConfigItemsPathEdgeConfigIdSchema = z.string().regex(/^ecfg_/);

export const getEdgeConfigItemsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getEdgeConfigItemsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getEdgeConfigItemsStatus200Schema = z.unknown();

export const getEdgeConfigItemsStatus400Schema = z.unknown();

export const getEdgeConfigItemsStatus401Schema = z.unknown();

export const getEdgeConfigItemsStatus403Schema = z.unknown();

export const getEdgeConfigItemsStatus404Schema = z.unknown();

export const getEdgeConfigItemsResponseSchema = z.union([
	getEdgeConfigItemsStatus200Schema,
	getEdgeConfigItemsStatus400Schema,
	getEdgeConfigItemsStatus401Schema,
	getEdgeConfigItemsStatus403Schema,
	getEdgeConfigItemsStatus404Schema,
]);

export const patchEdgeConfigItemsPathEdgeConfigIdSchema = z.string().regex(/^ecfg_/);

export const patchEdgeConfigItemsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const patchEdgeConfigItemsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const patchEdgeConfigItemsStatus200Schema = z.unknown();

export const patchEdgeConfigItemsStatus400Schema = z.unknown();

export const patchEdgeConfigItemsStatus401Schema = z.unknown();

export const patchEdgeConfigItemsStatus402Schema = z.unknown();

export const patchEdgeConfigItemsStatus403Schema = z.unknown();

export const patchEdgeConfigItemsStatus404Schema = z.unknown();

export const patchEdgeConfigItemsStatus409Schema = z.unknown();

export const patchEdgeConfigItemsStatus412Schema = z.unknown();

export const patchEdgeConfigItemsResponseSchema = z.union([
	patchEdgeConfigItemsStatus200Schema,
	patchEdgeConfigItemsStatus400Schema,
	patchEdgeConfigItemsStatus401Schema,
	patchEdgeConfigItemsStatus402Schema,
	patchEdgeConfigItemsStatus403Schema,
	patchEdgeConfigItemsStatus404Schema,
	patchEdgeConfigItemsStatus409Schema,
	patchEdgeConfigItemsStatus412Schema,
]);

export const getEdgeConfigSchemaPathEdgeConfigIdSchema = z.string();

export const getEdgeConfigSchemaQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getEdgeConfigSchemaQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getEdgeConfigSchemaStatus200Schema = z.unknown();

export const getEdgeConfigSchemaStatus400Schema = z.unknown();

export const getEdgeConfigSchemaStatus401Schema = z.unknown();

export const getEdgeConfigSchemaStatus403Schema = z.unknown();

export const getEdgeConfigSchemaStatus404Schema = z.unknown();

export const getEdgeConfigSchemaResponseSchema = z.union([
	getEdgeConfigSchemaStatus200Schema,
	getEdgeConfigSchemaStatus400Schema,
	getEdgeConfigSchemaStatus401Schema,
	getEdgeConfigSchemaStatus403Schema,
	getEdgeConfigSchemaStatus404Schema,
]);

export const patchEdgeConfigSchemaPathEdgeConfigIdSchema = z.string();

export const patchEdgeConfigSchemaQueryDryRunSchema = z.string().optional();

export const patchEdgeConfigSchemaQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const patchEdgeConfigSchemaQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const patchEdgeConfigSchemaStatus200Schema = z.unknown();

export const patchEdgeConfigSchemaStatus400Schema = z.unknown();

export const patchEdgeConfigSchemaStatus401Schema = z.unknown();

export const patchEdgeConfigSchemaStatus402Schema = z.unknown();

export const patchEdgeConfigSchemaStatus403Schema = z.unknown();

export const patchEdgeConfigSchemaStatus404Schema = z.unknown();

export const patchEdgeConfigSchemaStatus409Schema = z.unknown();

export const patchEdgeConfigSchemaResponseSchema = z.union([
	patchEdgeConfigSchemaStatus200Schema,
	patchEdgeConfigSchemaStatus400Schema,
	patchEdgeConfigSchemaStatus401Schema,
	patchEdgeConfigSchemaStatus402Schema,
	patchEdgeConfigSchemaStatus403Schema,
	patchEdgeConfigSchemaStatus404Schema,
	patchEdgeConfigSchemaStatus409Schema,
]);

export const deleteEdgeConfigSchemaPathEdgeConfigIdSchema = z.string();

export const deleteEdgeConfigSchemaQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const deleteEdgeConfigSchemaQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const deleteEdgeConfigSchemaStatus204Schema = z.unknown();

export const deleteEdgeConfigSchemaStatus400Schema = z.unknown();

export const deleteEdgeConfigSchemaStatus401Schema = z.unknown();

export const deleteEdgeConfigSchemaStatus402Schema = z.unknown();

export const deleteEdgeConfigSchemaStatus403Schema = z.unknown();

export const deleteEdgeConfigSchemaStatus404Schema = z.unknown();

export const deleteEdgeConfigSchemaStatus409Schema = z.unknown();

export const deleteEdgeConfigSchemaResponseSchema = z.union([
	deleteEdgeConfigSchemaStatus204Schema,
	deleteEdgeConfigSchemaStatus400Schema,
	deleteEdgeConfigSchemaStatus401Schema,
	deleteEdgeConfigSchemaStatus402Schema,
	deleteEdgeConfigSchemaStatus403Schema,
	deleteEdgeConfigSchemaStatus404Schema,
	deleteEdgeConfigSchemaStatus409Schema,
]);

export const getEdgeConfigItemPathEdgeConfigIdSchema = z.string().regex(/^ecfg_/);

export const getEdgeConfigItemPathEdgeConfigItemKeySchema = z.string();

export const getEdgeConfigItemQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getEdgeConfigItemQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getEdgeConfigItemStatus200Schema = z.unknown();

export const getEdgeConfigItemStatus400Schema = z.unknown();

export const getEdgeConfigItemStatus401Schema = z.unknown();

export const getEdgeConfigItemStatus403Schema = z.unknown();

export const getEdgeConfigItemStatus404Schema = z.unknown();

export const getEdgeConfigItemResponseSchema = z.union([
	getEdgeConfigItemStatus200Schema,
	getEdgeConfigItemStatus400Schema,
	getEdgeConfigItemStatus401Schema,
	getEdgeConfigItemStatus403Schema,
	getEdgeConfigItemStatus404Schema,
]);

export const getEdgeConfigTokensPathEdgeConfigIdSchema = z.string();

export const getEdgeConfigTokensQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getEdgeConfigTokensQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getEdgeConfigTokensStatus200Schema = z.unknown();

export const getEdgeConfigTokensStatus400Schema = z.unknown();

export const getEdgeConfigTokensStatus401Schema = z.unknown();

export const getEdgeConfigTokensStatus403Schema = z.unknown();

export const getEdgeConfigTokensStatus404Schema = z.unknown();

export const getEdgeConfigTokensResponseSchema = z.union([
	getEdgeConfigTokensStatus200Schema,
	getEdgeConfigTokensStatus400Schema,
	getEdgeConfigTokensStatus401Schema,
	getEdgeConfigTokensStatus403Schema,
	getEdgeConfigTokensStatus404Schema,
]);

export const deleteEdgeConfigTokensPathEdgeConfigIdSchema = z.string().regex(/^ecfg_/);

export const deleteEdgeConfigTokensQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const deleteEdgeConfigTokensQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const deleteEdgeConfigTokensStatus204Schema = z.unknown();

export const deleteEdgeConfigTokensStatus400Schema = z.unknown();

export const deleteEdgeConfigTokensStatus401Schema = z.unknown();

export const deleteEdgeConfigTokensStatus402Schema = z.unknown();

export const deleteEdgeConfigTokensStatus403Schema = z.unknown();

export const deleteEdgeConfigTokensStatus404Schema = z.unknown();

export const deleteEdgeConfigTokensStatus409Schema = z.unknown();

export const deleteEdgeConfigTokensResponseSchema = z.union([
	deleteEdgeConfigTokensStatus204Schema,
	deleteEdgeConfigTokensStatus400Schema,
	deleteEdgeConfigTokensStatus401Schema,
	deleteEdgeConfigTokensStatus402Schema,
	deleteEdgeConfigTokensStatus403Schema,
	deleteEdgeConfigTokensStatus404Schema,
	deleteEdgeConfigTokensStatus409Schema,
]);

export const getEdgeConfigTokenPathEdgeConfigIdSchema = z.string();

export const getEdgeConfigTokenPathTokenSchema = z.string();

export const getEdgeConfigTokenQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getEdgeConfigTokenQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getEdgeConfigTokenStatus200Schema = z.unknown();

export const getEdgeConfigTokenStatus400Schema = z.unknown();

export const getEdgeConfigTokenStatus401Schema = z.unknown();

export const getEdgeConfigTokenStatus403Schema = z.unknown();

export const getEdgeConfigTokenStatus404Schema = z.unknown();

export const getEdgeConfigTokenResponseSchema = z.union([
	getEdgeConfigTokenStatus200Schema,
	getEdgeConfigTokenStatus400Schema,
	getEdgeConfigTokenStatus401Schema,
	getEdgeConfigTokenStatus403Schema,
	getEdgeConfigTokenStatus404Schema,
]);

export const createEdgeConfigTokenPathEdgeConfigIdSchema = z.string().regex(/^ecfg_/);

export const createEdgeConfigTokenQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const createEdgeConfigTokenQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const createEdgeConfigTokenStatus201Schema = z.unknown();

export const createEdgeConfigTokenStatus400Schema = z.unknown();

export const createEdgeConfigTokenStatus401Schema = z.unknown();

export const createEdgeConfigTokenStatus402Schema = z.unknown();

export const createEdgeConfigTokenStatus403Schema = z.unknown();

export const createEdgeConfigTokenStatus404Schema = z.unknown();

export const createEdgeConfigTokenStatus409Schema = z.unknown();

export const createEdgeConfigTokenResponseSchema = z.union([
	createEdgeConfigTokenStatus201Schema,
	createEdgeConfigTokenStatus400Schema,
	createEdgeConfigTokenStatus401Schema,
	createEdgeConfigTokenStatus402Schema,
	createEdgeConfigTokenStatus403Schema,
	createEdgeConfigTokenStatus404Schema,
	createEdgeConfigTokenStatus409Schema,
]);

export const getEdgeConfigBackupPathEdgeConfigIdSchema = z.string();

export const getEdgeConfigBackupPathEdgeConfigBackupVersionIdSchema = z.string();

export const getEdgeConfigBackupQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getEdgeConfigBackupQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getEdgeConfigBackupStatus200Schema = z.unknown();

export const getEdgeConfigBackupStatus400Schema = z.unknown();

export const getEdgeConfigBackupStatus401Schema = z.unknown();

export const getEdgeConfigBackupStatus403Schema = z.unknown();

export const getEdgeConfigBackupStatus404Schema = z.unknown();

export const getEdgeConfigBackupResponseSchema = z.union([
	getEdgeConfigBackupStatus200Schema,
	getEdgeConfigBackupStatus400Schema,
	getEdgeConfigBackupStatus401Schema,
	getEdgeConfigBackupStatus403Schema,
	getEdgeConfigBackupStatus404Schema,
]);

export const restoreEdgeConfigBackupPathEdgeConfigIdSchema = z.string().regex(/^ecfg_/);

export const restoreEdgeConfigBackupPathEdgeConfigBackupVersionIdSchema = z.string();

export const restoreEdgeConfigBackupQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const restoreEdgeConfigBackupQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const restoreEdgeConfigBackupStatus200Schema = z.unknown();

export const restoreEdgeConfigBackupStatus400Schema = z.unknown();

export const restoreEdgeConfigBackupStatus401Schema = z.unknown();

export const restoreEdgeConfigBackupStatus402Schema = z.unknown();

export const restoreEdgeConfigBackupStatus403Schema = z.unknown();

export const restoreEdgeConfigBackupStatus404Schema = z.unknown();

export const restoreEdgeConfigBackupStatus409Schema = z.unknown();

export const restoreEdgeConfigBackupStatus412Schema = z.unknown();

export const restoreEdgeConfigBackupResponseSchema = z.union([
	restoreEdgeConfigBackupStatus200Schema,
	restoreEdgeConfigBackupStatus400Schema,
	restoreEdgeConfigBackupStatus401Schema,
	restoreEdgeConfigBackupStatus402Schema,
	restoreEdgeConfigBackupStatus403Schema,
	restoreEdgeConfigBackupStatus404Schema,
	restoreEdgeConfigBackupStatus409Schema,
	restoreEdgeConfigBackupStatus412Schema,
]);

export const getEdgeConfigBackupsPathEdgeConfigIdSchema = z.string();

export const getEdgeConfigBackupsQueryNextSchema = z.string().optional();

export const getEdgeConfigBackupsQueryLimitSchema = z.number().min(0).max(50).optional();

export const getEdgeConfigBackupsQueryMetadataSchema = z.string().optional();

export const getEdgeConfigBackupsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getEdgeConfigBackupsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getEdgeConfigBackupsStatus200Schema = z.unknown();

export const getEdgeConfigBackupsStatus400Schema = z.unknown();

export const getEdgeConfigBackupsStatus401Schema = z.unknown();

export const getEdgeConfigBackupsStatus403Schema = z.unknown();

export const getEdgeConfigBackupsStatus404Schema = z.unknown();

export const getEdgeConfigBackupsResponseSchema = z.union([
	getEdgeConfigBackupsStatus200Schema,
	getEdgeConfigBackupsStatus400Schema,
	getEdgeConfigBackupsStatus401Schema,
	getEdgeConfigBackupsStatus403Schema,
	getEdgeConfigBackupsStatus404Schema,
]);

export const createSharedEnvVariableQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const createSharedEnvVariableQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const createSharedEnvVariableStatus201Schema = z.unknown();

export const createSharedEnvVariableStatus400Schema = z.unknown();

export const createSharedEnvVariableStatus401Schema = z.unknown();

export const createSharedEnvVariableStatus402Schema = z.unknown();

export const createSharedEnvVariableStatus403Schema = z.unknown();

export const createSharedEnvVariableResponseSchema = z.union([
	createSharedEnvVariableStatus201Schema,
	createSharedEnvVariableStatus400Schema,
	createSharedEnvVariableStatus401Schema,
	createSharedEnvVariableStatus402Schema,
	createSharedEnvVariableStatus403Schema,
]);

export const listSharedEnvVariableQuerySearchSchema = z.string().optional();

export const listSharedEnvVariableQueryProjectIdSchema = z
	.string()
	.optional()
	.describe("Filter SharedEnvVariables that belong to a project");

export const listSharedEnvVariableQueryIdsSchema = z
	.string()
	.optional()
	.describe("Filter SharedEnvVariables based on comma separated ids");

export const listSharedEnvVariableQueryExcludeIdsSchema = z
	.string()
	.optional()
	.describe("Filter SharedEnvVariables based on comma separated ids");

export const listSharedEnvVariableQueryexcludeIdsSchema = z
	.string()
	.optional()
	.describe("Filter SharedEnvVariables based on comma separated ids");

export const listSharedEnvVariableQueryExcludeProjectIdSchema = z
	.string()
	.optional()
	.describe("Filter SharedEnvVariables that belong to a project");

export const listSharedEnvVariableQueryexcludeProjectIdSchema = z
	.string()
	.optional()
	.describe("Filter SharedEnvVariables that belong to a project");

export const listSharedEnvVariableQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const listSharedEnvVariableQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const listSharedEnvVariableStatus200Schema = z.unknown();

export const listSharedEnvVariableStatus400Schema = z.unknown();

export const listSharedEnvVariableStatus401Schema = z.unknown();

export const listSharedEnvVariableStatus403Schema = z.unknown();

export const listSharedEnvVariableStatus404Schema = z.unknown();

export const listSharedEnvVariableResponseSchema = z.union([
	listSharedEnvVariableStatus200Schema,
	listSharedEnvVariableStatus400Schema,
	listSharedEnvVariableStatus401Schema,
	listSharedEnvVariableStatus403Schema,
	listSharedEnvVariableStatus404Schema,
]);

export const updateSharedEnvVariableQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const updateSharedEnvVariableQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const updateSharedEnvVariableStatus200Schema = z.unknown();

export const updateSharedEnvVariableStatus400Schema = z.unknown();

export const updateSharedEnvVariableStatus401Schema = z.unknown();

export const updateSharedEnvVariableStatus402Schema = z.unknown();

export const updateSharedEnvVariableStatus403Schema = z.unknown();

export const updateSharedEnvVariableResponseSchema = z.union([
	updateSharedEnvVariableStatus200Schema,
	updateSharedEnvVariableStatus400Schema,
	updateSharedEnvVariableStatus401Schema,
	updateSharedEnvVariableStatus402Schema,
	updateSharedEnvVariableStatus403Schema,
]);

export const deleteSharedEnvVariableQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const deleteSharedEnvVariableQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const deleteSharedEnvVariableStatus200Schema = z.unknown();

export const deleteSharedEnvVariableStatus400Schema = z.unknown();

export const deleteSharedEnvVariableStatus401Schema = z.unknown();

export const deleteSharedEnvVariableStatus402Schema = z.unknown();

export const deleteSharedEnvVariableStatus403Schema = z.unknown();

export const deleteSharedEnvVariableResponseSchema = z.union([
	deleteSharedEnvVariableStatus200Schema,
	deleteSharedEnvVariableStatus400Schema,
	deleteSharedEnvVariableStatus401Schema,
	deleteSharedEnvVariableStatus402Schema,
	deleteSharedEnvVariableStatus403Schema,
]);

export const getSharedEnvVarPathIdSchema = z
	.string()
	.describe("The unique ID for the Shared Environment Variable to get the decrypted value.");

export const getSharedEnvVarQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getSharedEnvVarQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getSharedEnvVarStatus200Schema = z.unknown();

export const getSharedEnvVarStatus400Schema = z.unknown();

export const getSharedEnvVarStatus401Schema = z.unknown();

export const getSharedEnvVarStatus403Schema = z.unknown();

export const getSharedEnvVarResponseSchema = z.union([
	getSharedEnvVarStatus200Schema,
	getSharedEnvVarStatus400Schema,
	getSharedEnvVarStatus401Schema,
	getSharedEnvVarStatus403Schema,
]);

export const unlinkSharedEnvVariablePathIdSchema = z
	.string()
	.describe("The unique ID for the Shared Environment Variable to unlink from the project.");

export const unlinkSharedEnvVariablePathProjectIdSchema = z.string();

export const unlinkSharedEnvVariableQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const unlinkSharedEnvVariableQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const unlinkSharedEnvVariableStatus200Schema = z.unknown();

export const unlinkSharedEnvVariableStatus400Schema = z.unknown();

export const unlinkSharedEnvVariableStatus401Schema = z.unknown();

export const unlinkSharedEnvVariableStatus403Schema = z.unknown();

export const unlinkSharedEnvVariableResponseSchema = z.union([
	unlinkSharedEnvVariableStatus200Schema,
	unlinkSharedEnvVariableStatus400Schema,
	unlinkSharedEnvVariableStatus401Schema,
	unlinkSharedEnvVariableStatus403Schema,
]);

export const listUserEventsQueryLimitSchema = z
	.number()
	.optional()
	.describe("Maximum number of items which may be returned.");

export const listUserEventsQuerySinceSchema = z
	.string()
	.optional()
	.describe("Timestamp to only include items created since then.");

export const listUserEventsQueryUntilSchema = z
	.string()
	.optional()
	.describe("Timestamp to only include items created until then.");

export const listUserEventsQueryTypesSchema = z
	.string()
	.optional()
	.describe('Comma-delimited list of event "types" to filter the results by.');

export const listUserEventsQueryUserIdSchema = z
	.string()
	.optional()
	.describe(
		"Deprecated. Use `principalId` instead. If `principalId` and `userId` both exist, `principalId` will be used.",
	);

export const listUserEventsQueryPrincipalIdSchema = z
	.string()
	.optional()
	.describe(
		"When retrieving events for a Team, the `principalId` parameter may be specified to filter events generated by a specific principal.",
	);

export const listUserEventsQueryProjectIdsSchema = z
	.string()
	.optional()
	.describe("Comma-delimited list of project IDs to filter the results by.");

export const listUserEventsQueryWithPayloadSchema = z
	.string()
	.optional()
	.describe("When set to `true`, the response will include the `payload` field for each event.");

export const listUserEventsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const listUserEventsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const listUserEventsStatus200Schema = z.unknown();

export const listUserEventsStatus400Schema = z.unknown();

export const listUserEventsStatus401Schema = z.unknown();

export const listUserEventsStatus403Schema = z.unknown();

export const listUserEventsResponseSchema = z.union([
	listUserEventsStatus200Schema,
	listUserEventsStatus400Schema,
	listUserEventsStatus401Schema,
	listUserEventsStatus403Schema,
]);

export const listEventTypesQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const listEventTypesQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const listEventTypesStatus200Schema = z.unknown();

export const listEventTypesStatus400Schema = z.unknown();

export const listEventTypesStatus401Schema = z.unknown();

export const listEventTypesStatus403Schema = z.unknown();

export const listFlagsV2PathProjectIdOrNameSchema = z.string().describe("The project id or name");

export const listFlagsV2QueryStateSchema = z
	.enum(["active", "archived"])
	.optional()
	.describe("The state of the flags to retrieve. Defaults to `active`.");

export const listFlagsV2QueryLimitSchema = z
	.int()
	.min(1)
	.max(100)
	.optional()
	.default(25)
	.describe("Maximum number of flags to return.");

export const listFlagsV2QueryCursorSchema = z
	.string()
	.optional()
	.describe("Pagination cursor to continue from.");

export const listFlagsV2QuerySearchSchema = z
	.string()
	.max(256)
	.optional()
	.describe("Search flags by their slug or description. Case-insensitive.");

export const listFlagsV2QueryTagsSchema = z
	.array(z.string())
	.optional()
	.describe("Filter flags by tag. Repeat the parameter for multiple tags (all must match).");

export const listFlagsV2QueryCreatedBySchema = z
	.string()
	.max(256)
	.optional()
	.describe("Filter flags by the id of the entity that created them (a user or team id).");

export const listFlagsV2QueryMaintainerIdsSchema = z
	.array(z.string().max(24))
	.max(25)
	.optional()
	.describe(
		"Filter flags by maintainer user id. Repeat the parameter for multiple maintainers (any may match).",
	);

export const listFlagsV2QueryIncludeMarketplaceFlagsSchema = z
	.boolean()
	.optional()
	.describe(
		"Whether to include Marketplace experimentation items in the paginated response. Defaults to false.",
	);

export const listFlagsV2QueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const listFlagsV2QuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const listFlagsV2Status200Schema = z.unknown();

export const listFlagsV2Status400Schema = z.unknown();

export const listFlagsV2Status401Schema = z.unknown();

export const listFlagsV2Status402Schema = z.unknown();

export const listFlagsV2Status403Schema = z.unknown();

export const listFlagsV2Status404Schema = z.unknown();

export const listFlagsV2ResponseSchema = z.union([
	listFlagsV2Status200Schema,
	listFlagsV2Status400Schema,
	listFlagsV2Status401Schema,
	listFlagsV2Status402Schema,
	listFlagsV2Status403Schema,
	listFlagsV2Status404Schema,
]);

export const listFlagsPathProjectIdOrNameSchema = z.string().describe("The project id or name");

export const listFlagsQueryStateSchema = z
	.enum(["active", "archived"])
	.optional()
	.describe("The state of the flags to retrieve. Defaults to `active`.");

export const listFlagsQueryWithMetadataSchema = z
	.boolean()
	.optional()
	.describe(
		"Deprecated. Whether to include creator metadata in each flag in the response. Resolve creator identity client-side (e.g. via the team members endpoint) instead; this parameter will be removed in a future release. Use `GET /v1/projects/:id/feature-flags/flags/:flagIdOrSlug?withMetadata=true` for single-flag lookups that need creator metadata.",
	);

export const listFlagsQueryLimitSchema = z
	.int()
	.min(1)
	.max(100)
	.optional()
	.describe("Maximum number of flags to return. When not set, all flags are returned.");

export const listFlagsQueryCursorSchema = z
	.string()
	.optional()
	.describe("Pagination cursor to continue from.");

export const listFlagsQuerySearchSchema = z
	.string()
	.max(256)
	.optional()
	.describe("Search flags by their slug or description. Case-insensitive.");

export const listFlagsQueryTagsSchema = z
	.array(z.string())
	.optional()
	.describe("Filter flags by tag. Repeat the parameter for multiple tags (all must match).");

export const listFlagsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const listFlagsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const listFlagsStatus200Schema = z.unknown();

export const listFlagsStatus400Schema = z.unknown();

export const listFlagsStatus401Schema = z.unknown();

export const listFlagsStatus402Schema = z.unknown();

export const listFlagsStatus403Schema = z.unknown();

export const listFlagsStatus404Schema = z.unknown();

export const listFlagsResponseSchema = z.union([
	listFlagsStatus200Schema,
	listFlagsStatus400Schema,
	listFlagsStatus401Schema,
	listFlagsStatus402Schema,
	listFlagsStatus403Schema,
	listFlagsStatus404Schema,
]);

export const createFlagPathProjectIdOrNameSchema = z.string().describe("The project id or name");

export const createFlagQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const createFlagQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const createFlagStatus201Schema = z.unknown();

export const createFlagStatus400Schema = z.unknown();

export const createFlagStatus401Schema = z.unknown();

export const createFlagStatus402Schema = z.unknown();

export const createFlagStatus403Schema = z.unknown();

export const createFlagStatus404Schema = z.unknown();

export const createFlagStatus409Schema = z.unknown();

export const createFlagStatus412Schema = z.unknown();

export const createFlagResponseSchema = z.union([
	createFlagStatus201Schema,
	createFlagStatus400Schema,
	createFlagStatus401Schema,
	createFlagStatus402Schema,
	createFlagStatus403Schema,
	createFlagStatus404Schema,
	createFlagStatus409Schema,
	createFlagStatus412Schema,
]);

export const getFlagPathProjectIdOrNameSchema = z.string().describe("The project id or name");

export const getFlagPathFlagIdOrSlugSchema = z.string().describe("The flag id or name");

export const getFlagQueryIfMatchSchema = z
	.string()
	.optional()
	.describe("Etag to match, can be used interchangeably with the `if-match` header");

export const getFlagQueryWithMetadataSchema = z
	.boolean()
	.optional()
	.describe("Whether to include metadata in the response");

export const getFlagQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getFlagQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getFlagStatus200Schema = z.unknown();

export const getFlagStatus304Schema = z.unknown();

export const getFlagStatus400Schema = z.unknown();

export const getFlagStatus401Schema = z.unknown();

export const getFlagStatus402Schema = z.unknown();

export const getFlagStatus403Schema = z.unknown();

export const getFlagStatus404Schema = z.unknown();

export const getFlagResponseSchema = z.union([
	getFlagStatus200Schema,
	getFlagStatus304Schema,
	getFlagStatus400Schema,
	getFlagStatus401Schema,
	getFlagStatus402Schema,
	getFlagStatus403Schema,
	getFlagStatus404Schema,
]);

export const updateFlagPathProjectIdOrNameSchema = z.string().describe("The project id or name");

export const updateFlagPathFlagIdOrSlugSchema = z.string().describe("The flag id or name");

export const updateFlagQueryIfMatchSchema = z
	.string()
	.optional()
	.describe("Etag to match, can be used interchangeably with the `if-match` header");

export const updateFlagQueryWithMetadataSchema = z
	.boolean()
	.optional()
	.describe("Whether to include metadata in the response");

export const updateFlagQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const updateFlagQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const updateFlagStatus200Schema = z.unknown();

export const updateFlagStatus304Schema = z.unknown();

export const updateFlagStatus400Schema = z.unknown();

export const updateFlagStatus401Schema = z.unknown();

export const updateFlagStatus402Schema = z.unknown();

export const updateFlagStatus403Schema = z.unknown();

export const updateFlagStatus404Schema = z.unknown();

export const updateFlagStatus409Schema = z.unknown();

export const updateFlagStatus412Schema = z.unknown();

export const updateFlagResponseSchema = z.union([
	updateFlagStatus200Schema,
	updateFlagStatus304Schema,
	updateFlagStatus400Schema,
	updateFlagStatus401Schema,
	updateFlagStatus402Schema,
	updateFlagStatus403Schema,
	updateFlagStatus404Schema,
	updateFlagStatus409Schema,
	updateFlagStatus412Schema,
]);

export const deleteFlagPathProjectIdOrNameSchema = z.string().describe("The project id or name");

export const deleteFlagPathFlagIdOrSlugSchema = z.string().describe("The flag id or name");

export const deleteFlagQueryIfMatchSchema = z
	.string()
	.optional()
	.describe("Etag to match, can be used interchangeably with the `if-match` header");

export const deleteFlagQueryWithMetadataSchema = z
	.boolean()
	.optional()
	.describe("Whether to include metadata in the response");

export const deleteFlagQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const deleteFlagQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const deleteFlagStatus204Schema = z.unknown();

export const deleteFlagStatus304Schema = z.unknown();

export const deleteFlagStatus400Schema = z.unknown();

export const deleteFlagStatus401Schema = z.unknown();

export const deleteFlagStatus402Schema = z.unknown();

export const deleteFlagStatus403Schema = z.unknown();

export const deleteFlagStatus404Schema = z.unknown();

export const deleteFlagStatus409Schema = z.unknown();

export const deleteFlagStatus412Schema = z.unknown();

export const deleteFlagResponseSchema = z.union([
	deleteFlagStatus204Schema,
	deleteFlagStatus304Schema,
	deleteFlagStatus400Schema,
	deleteFlagStatus401Schema,
	deleteFlagStatus402Schema,
	deleteFlagStatus403Schema,
	deleteFlagStatus404Schema,
	deleteFlagStatus409Schema,
	deleteFlagStatus412Schema,
]);

export const listFlagVersionsPathProjectIdOrNameSchema = z.string();

export const listFlagVersionsPathFlagIdOrSlugSchema = z.string();

export const listFlagVersionsQueryLimitSchema = z.number().min(1).max(100).optional().default(20);

export const listFlagVersionsQueryCursorSchema = z
	.string()
	.optional()
	.describe("Pagination cursor");

export const listFlagVersionsQueryEnvironmentSchema = z
	.string()
	.optional()
	.describe("Environment to filter by");

export const listFlagVersionsQueryWithMetadataSchema = z
	.boolean()
	.optional()
	.default(false)
	.describe("Whether to include metadata");

export const listFlagVersionsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const listFlagVersionsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const listFlagVersionsStatus200Schema = z.unknown();

export const listFlagVersionsStatus304Schema = z.unknown();

export const listFlagVersionsStatus400Schema = z.unknown();

export const listFlagVersionsStatus401Schema = z.unknown();

export const listFlagVersionsStatus402Schema = z.unknown();

export const listFlagVersionsStatus403Schema = z.unknown();

export const listFlagVersionsStatus404Schema = z.unknown();

export const listFlagVersionsResponseSchema = z.union([
	listFlagVersionsStatus200Schema,
	listFlagVersionsStatus304Schema,
	listFlagVersionsStatus400Schema,
	listFlagVersionsStatus401Schema,
	listFlagVersionsStatus402Schema,
	listFlagVersionsStatus403Schema,
	listFlagVersionsStatus404Schema,
]);

export const getFlagSettingsPathProjectIdOrNameSchema = z
	.string()
	.describe("The project id or name");

export const getFlagSettingsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getFlagSettingsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getFlagSettingsStatus200Schema = z.unknown();

export const getFlagSettingsStatus400Schema = z.unknown();

export const getFlagSettingsStatus401Schema = z.unknown();

export const getFlagSettingsStatus402Schema = z.unknown();

export const getFlagSettingsStatus403Schema = z.unknown();

export const getFlagSettingsStatus404Schema = z.unknown();

export const getFlagSettingsResponseSchema = z.union([
	getFlagSettingsStatus200Schema,
	getFlagSettingsStatus400Schema,
	getFlagSettingsStatus401Schema,
	getFlagSettingsStatus402Schema,
	getFlagSettingsStatus403Schema,
	getFlagSettingsStatus404Schema,
]);

export const updateFlagSettingsPathProjectIdOrNameSchema = z
	.string()
	.describe("The project id or name");

export const updateFlagSettingsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const updateFlagSettingsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const updateFlagSettingsStatus200Schema = z.unknown();

export const updateFlagSettingsStatus201Schema = z.unknown();

export const updateFlagSettingsStatus400Schema = z.unknown();

export const updateFlagSettingsStatus401Schema = z.unknown();

export const updateFlagSettingsStatus402Schema = z.unknown();

export const updateFlagSettingsStatus403Schema = z.unknown();

export const updateFlagSettingsStatus404Schema = z.unknown();

export const updateFlagSettingsStatus409Schema = z.unknown();

export const updateFlagSettingsStatus412Schema = z.unknown();

export const updateFlagSettingsResponseSchema = z.union([
	updateFlagSettingsStatus200Schema,
	updateFlagSettingsStatus201Schema,
	updateFlagSettingsStatus400Schema,
	updateFlagSettingsStatus401Schema,
	updateFlagSettingsStatus402Schema,
	updateFlagSettingsStatus403Schema,
	updateFlagSettingsStatus404Schema,
	updateFlagSettingsStatus409Schema,
	updateFlagSettingsStatus412Schema,
]);

export const listTeamFlagSettingsQueryLimitSchema = z
	.int()
	.min(1)
	.max(100)
	.optional()
	.default(20)
	.describe("Maximum number of settings to return.");

export const listTeamFlagSettingsQueryCursorSchema = z
	.string()
	.optional()
	.describe("Pagination cursor to continue from.");

export const listTeamFlagSettingsPathTeamIdSchema = z
	.string()
	.describe("The Team identifier to perform the request on behalf of.");

export const listTeamFlagSettingsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const listTeamFlagSettingsStatus200Schema = z.unknown();

export const listTeamFlagSettingsStatus400Schema = z.unknown();

export const listTeamFlagSettingsStatus401Schema = z.unknown();

export const listTeamFlagSettingsStatus403Schema = z.unknown();

export const listTeamFlagSettingsResponseSchema = z.union([
	listTeamFlagSettingsStatus200Schema,
	listTeamFlagSettingsStatus400Schema,
	listTeamFlagSettingsStatus401Schema,
	listTeamFlagSettingsStatus403Schema,
]);

export const listTeamFlagsV2QueryStateSchema = z
	.enum(["active", "archived"])
	.optional()
	.describe("The state of the flags to retrieve. Defaults to `active`.");

export const listTeamFlagsV2QueryLimitSchema = z
	.int()
	.min(1)
	.max(100)
	.optional()
	.default(25)
	.describe("Maximum number of flags to return.");

export const listTeamFlagsV2QueryCursorSchema = z
	.string()
	.optional()
	.describe("Pagination cursor to continue from.");

export const listTeamFlagsV2QuerySearchSchema = z
	.string()
	.max(256)
	.optional()
	.describe("Search flags by their slug or description. Case-insensitive.");

export const listTeamFlagsV2QueryKindSchema = z
	.enum(["boolean", "string", "number", "json"])
	.optional()
	.describe("The kind of flags to retrieve.");

export const listTeamFlagsV2QueryTagsSchema = z
	.array(z.string())
	.optional()
	.describe("Filter flags by tag. Repeat the parameter for multiple tags (all must match).");

export const listTeamFlagsV2QueryCreatedBySchema = z
	.string()
	.max(256)
	.optional()
	.describe("Filter flags by the id of the entity that created them (a user or team id).");

export const listTeamFlagsV2QueryMaintainerIdsSchema = z
	.array(z.string().max(24))
	.max(25)
	.optional()
	.describe(
		"Filter flags by maintainer user id. Repeat the parameter for multiple maintainers (any may match).",
	);

export const listTeamFlagsV2QueryIncludeMarketplaceFlagsSchema = z
	.boolean()
	.optional()
	.describe(
		"Whether to include Marketplace experimentation items in the paginated response. Defaults to false.",
	);

export const listTeamFlagsV2PathTeamIdSchema = z
	.string()
	.describe("The Team identifier to perform the request on behalf of.");

export const listTeamFlagsV2QuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const listTeamFlagsV2Status200Schema = z.unknown();

export const listTeamFlagsV2Status400Schema = z.unknown();

export const listTeamFlagsV2Status401Schema = z.unknown();

export const listTeamFlagsV2Status403Schema = z.unknown();

export const listTeamFlagsV2ResponseSchema = z.union([
	listTeamFlagsV2Status200Schema,
	listTeamFlagsV2Status400Schema,
	listTeamFlagsV2Status401Schema,
	listTeamFlagsV2Status403Schema,
]);

export const listTeamFlagsQueryStateSchema = z
	.enum(["active", "archived"])
	.optional()
	.describe("The state of the flags to retrieve. Defaults to `active`.");

export const listTeamFlagsQueryWithMetadataSchema = z
	.boolean()
	.optional()
	.describe(
		"Deprecated. Whether to include creator metadata in each flag in the response. Resolve creator identity client-side (e.g. via the team members endpoint) instead; this parameter will be removed in a future release.",
	);

export const listTeamFlagsQueryLimitSchema = z
	.int()
	.min(1)
	.max(100)
	.optional()
	.default(20)
	.describe("Maximum number of flags to return.");

export const listTeamFlagsQueryCursorSchema = z
	.string()
	.optional()
	.describe("Pagination cursor to continue from.");

export const listTeamFlagsQuerySearchSchema = z
	.string()
	.max(256)
	.optional()
	.describe("Search flags by their slug or description. Case-insensitive.");

export const listTeamFlagsQueryKindSchema = z
	.enum(["boolean", "string", "number", "json"])
	.optional()
	.describe("The kind of flags to retrieve.");

export const listTeamFlagsQueryTagsSchema = z
	.array(z.string())
	.optional()
	.describe("Filter flags by tag. Repeat the parameter for multiple tags (all must match).");

export const listTeamFlagsPathTeamIdSchema = z
	.string()
	.describe("The Team identifier to perform the request on behalf of.");

export const listTeamFlagsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const listTeamFlagsStatus200Schema = z.unknown();

export const listTeamFlagsStatus400Schema = z.unknown();

export const listTeamFlagsStatus401Schema = z.unknown();

export const listTeamFlagsStatus403Schema = z.unknown();

export const listTeamFlagsResponseSchema = z.union([
	listTeamFlagsStatus200Schema,
	listTeamFlagsStatus400Schema,
	listTeamFlagsStatus401Schema,
	listTeamFlagsStatus403Schema,
]);

export const createFlagSegmentPathProjectIdOrNameSchema = z
	.string()
	.describe("The project id or name");

export const createFlagSegmentQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const createFlagSegmentQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const createFlagSegmentStatus201Schema = z.unknown();

export const createFlagSegmentStatus400Schema = z.unknown();

export const createFlagSegmentStatus401Schema = z.unknown();

export const createFlagSegmentStatus402Schema = z.unknown();

export const createFlagSegmentStatus403Schema = z.unknown();

export const createFlagSegmentStatus404Schema = z.unknown();

export const createFlagSegmentStatus409Schema = z.unknown();

export const createFlagSegmentStatus412Schema = z.unknown();

export const createFlagSegmentResponseSchema = z.union([
	createFlagSegmentStatus201Schema,
	createFlagSegmentStatus400Schema,
	createFlagSegmentStatus401Schema,
	createFlagSegmentStatus402Schema,
	createFlagSegmentStatus403Schema,
	createFlagSegmentStatus404Schema,
	createFlagSegmentStatus409Schema,
	createFlagSegmentStatus412Schema,
]);

export const listFlagSegmentsPathProjectIdOrNameSchema = z
	.string()
	.describe("The project id or name");

export const listFlagSegmentsQueryWithMetadataSchema = z
	.boolean()
	.optional()
	.default(false)
	.describe("Whether to include metadata");

export const listFlagSegmentsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const listFlagSegmentsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const listFlagSegmentsStatus200Schema = z.unknown();

export const listFlagSegmentsStatus400Schema = z.unknown();

export const listFlagSegmentsStatus401Schema = z.unknown();

export const listFlagSegmentsStatus402Schema = z.unknown();

export const listFlagSegmentsStatus403Schema = z.unknown();

export const listFlagSegmentsStatus404Schema = z.unknown();

export const listFlagSegmentsResponseSchema = z.union([
	listFlagSegmentsStatus200Schema,
	listFlagSegmentsStatus400Schema,
	listFlagSegmentsStatus401Schema,
	listFlagSegmentsStatus402Schema,
	listFlagSegmentsStatus403Schema,
	listFlagSegmentsStatus404Schema,
]);

export const getFlagSegmentPathProjectIdOrNameSchema = z
	.string()
	.describe("The project id or name");

export const getFlagSegmentPathSegmentIdOrSlugSchema = z.string().describe("The segment slug");

export const getFlagSegmentQueryWithMetadataSchema = z
	.boolean()
	.optional()
	.default(false)
	.describe("Whether to include metadata");

export const getFlagSegmentQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getFlagSegmentQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getFlagSegmentStatus200Schema = z.unknown();

export const getFlagSegmentStatus400Schema = z.unknown();

export const getFlagSegmentStatus401Schema = z.unknown();

export const getFlagSegmentStatus402Schema = z.unknown();

export const getFlagSegmentStatus403Schema = z.unknown();

export const getFlagSegmentStatus404Schema = z.unknown();

export const getFlagSegmentResponseSchema = z.union([
	getFlagSegmentStatus200Schema,
	getFlagSegmentStatus400Schema,
	getFlagSegmentStatus401Schema,
	getFlagSegmentStatus402Schema,
	getFlagSegmentStatus403Schema,
	getFlagSegmentStatus404Schema,
]);

export const deleteFlagSegmentPathProjectIdOrNameSchema = z
	.string()
	.describe("The project id or name");

export const deleteFlagSegmentPathSegmentIdOrSlugSchema = z.string().describe("The segment slug");

export const deleteFlagSegmentQueryWithMetadataSchema = z
	.boolean()
	.optional()
	.default(false)
	.describe("Whether to include metadata");

export const deleteFlagSegmentQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const deleteFlagSegmentQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const deleteFlagSegmentStatus204Schema = z.unknown();

export const deleteFlagSegmentStatus304Schema = z.unknown();

export const deleteFlagSegmentStatus400Schema = z.unknown();

export const deleteFlagSegmentStatus401Schema = z.unknown();

export const deleteFlagSegmentStatus402Schema = z.unknown();

export const deleteFlagSegmentStatus403Schema = z.unknown();

export const deleteFlagSegmentStatus404Schema = z.unknown();

export const deleteFlagSegmentStatus409Schema = z.unknown();

export const deleteFlagSegmentStatus412Schema = z.unknown();

export const deleteFlagSegmentResponseSchema = z.union([
	deleteFlagSegmentStatus204Schema,
	deleteFlagSegmentStatus304Schema,
	deleteFlagSegmentStatus400Schema,
	deleteFlagSegmentStatus401Schema,
	deleteFlagSegmentStatus402Schema,
	deleteFlagSegmentStatus403Schema,
	deleteFlagSegmentStatus404Schema,
	deleteFlagSegmentStatus409Schema,
	deleteFlagSegmentStatus412Schema,
]);

export const updateFlagSegmentPathProjectIdOrNameSchema = z
	.string()
	.describe("The project id or name");

export const updateFlagSegmentPathSegmentIdOrSlugSchema = z.string().describe("The segment slug");

export const updateFlagSegmentQueryWithMetadataSchema = z
	.boolean()
	.optional()
	.default(false)
	.describe("Whether to include metadata");

export const updateFlagSegmentQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const updateFlagSegmentQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const updateFlagSegmentStatus200Schema = z.unknown();

export const updateFlagSegmentStatus400Schema = z.unknown();

export const updateFlagSegmentStatus401Schema = z.unknown();

export const updateFlagSegmentStatus402Schema = z.unknown();

export const updateFlagSegmentStatus403Schema = z.unknown();

export const updateFlagSegmentStatus404Schema = z.unknown();

export const updateFlagSegmentStatus409Schema = z.unknown();

export const updateFlagSegmentStatus412Schema = z.unknown();

export const updateFlagSegmentResponseSchema = z.union([
	updateFlagSegmentStatus200Schema,
	updateFlagSegmentStatus400Schema,
	updateFlagSegmentStatus401Schema,
	updateFlagSegmentStatus402Schema,
	updateFlagSegmentStatus403Schema,
	updateFlagSegmentStatus404Schema,
	updateFlagSegmentStatus409Schema,
	updateFlagSegmentStatus412Schema,
]);

export const getDeploymentFeatureFlagsPathDeploymentIdSchema = z.string();

export const getDeploymentFeatureFlagsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getDeploymentFeatureFlagsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getDeploymentFeatureFlagsStatus200Schema = z.unknown();

export const getDeploymentFeatureFlagsStatus400Schema = z.unknown();

export const getDeploymentFeatureFlagsStatus401Schema = z.unknown();

export const getDeploymentFeatureFlagsStatus403Schema = z.unknown();

export const getDeploymentFeatureFlagsStatus404Schema = z.unknown();

export const getDeploymentFeatureFlagsResponseSchema = z.union([
	getDeploymentFeatureFlagsStatus200Schema,
	getDeploymentFeatureFlagsStatus400Schema,
	getDeploymentFeatureFlagsStatus401Schema,
	getDeploymentFeatureFlagsStatus403Schema,
	getDeploymentFeatureFlagsStatus404Schema,
]);

export const getSdkKeysPathProjectIdOrNameSchema = z.string().describe("The project id or name");

export const getSdkKeysQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getSdkKeysQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getSdkKeysStatus200Schema = z.unknown();

export const getSdkKeysStatus400Schema = z.unknown();

export const getSdkKeysStatus401Schema = z.unknown();

export const getSdkKeysStatus402Schema = z.unknown();

export const getSdkKeysStatus403Schema = z.unknown();

export const getSdkKeysStatus404Schema = z.unknown();

export const getSdkKeysResponseSchema = z.union([
	getSdkKeysStatus200Schema,
	getSdkKeysStatus400Schema,
	getSdkKeysStatus401Schema,
	getSdkKeysStatus402Schema,
	getSdkKeysStatus403Schema,
	getSdkKeysStatus404Schema,
]);

export const createSdkKeyPathProjectIdOrNameSchema = z.string().describe("The project id or name");

export const createSdkKeyQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const createSdkKeyQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const createSdkKeyStatus200Schema = z.unknown();

export const createSdkKeyStatus400Schema = z.unknown();

export const createSdkKeyStatus401Schema = z.unknown();

export const createSdkKeyStatus402Schema = z.unknown();

export const createSdkKeyStatus403Schema = z.unknown();

export const createSdkKeyStatus404Schema = z.unknown();

export const createSdkKeyStatus409Schema = z.unknown();

export const createSdkKeyResponseSchema = z.union([
	createSdkKeyStatus200Schema,
	createSdkKeyStatus400Schema,
	createSdkKeyStatus401Schema,
	createSdkKeyStatus402Schema,
	createSdkKeyStatus403Schema,
	createSdkKeyStatus404Schema,
	createSdkKeyStatus409Schema,
]);

export const deleteSdkKeyPathProjectIdOrNameSchema = z.string().describe("The project id or name");

export const deleteSdkKeyPathHashKeySchema = z.string().describe("The SDK key hash key to delete");

export const deleteSdkKeyQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const deleteSdkKeyQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const deleteSdkKeyStatus204Schema = z.unknown();

export const deleteSdkKeyStatus400Schema = z.unknown();

export const deleteSdkKeyStatus401Schema = z.unknown();

export const deleteSdkKeyStatus402Schema = z.unknown();

export const deleteSdkKeyStatus403Schema = z.unknown();

export const deleteSdkKeyStatus404Schema = z.unknown();

export const deleteSdkKeyStatus409Schema = z.unknown();

export const deleteSdkKeyResponseSchema = z.union([
	deleteSdkKeyStatus204Schema,
	deleteSdkKeyStatus400Schema,
	deleteSdkKeyStatus401Schema,
	deleteSdkKeyStatus402Schema,
	deleteSdkKeyStatus403Schema,
	deleteSdkKeyStatus404Schema,
	deleteSdkKeyStatus409Schema,
]);

export const gitNamespacesQueryHostSchema = z
	.string()
	.optional()
	.describe("The custom Git host if using a custom Git provider, like GitHub Enterprise Server");

export const gitNamespacesQueryProviderSchema = z
	.enum(["github", "github-limited", "github-custom-host", "gitlab", "bitbucket"])
	.optional();

export const gitNamespacesQueryViewerMetadataSchema = z
	.boolean()
	.optional()
	.describe("When true, includes the viewer object for each namespace.");

export const gitNamespacesStatus200Schema = z.unknown();

export const gitNamespacesStatus400Schema = z.unknown();

export const gitNamespacesStatus401Schema = z.unknown();

export const gitNamespacesStatus403Schema = z.unknown();

export const gitNamespacesStatus404Schema = z.unknown();

export const gitNamespacesStatus429Schema = z.unknown();

export const gitNamespacesStatus500Schema = z.unknown();

export const gitNamespacesResponseSchema = z.union([
	gitNamespacesStatus200Schema,
	gitNamespacesStatus400Schema,
	gitNamespacesStatus401Schema,
	gitNamespacesStatus403Schema,
	gitNamespacesStatus404Schema,
	gitNamespacesStatus429Schema,
	gitNamespacesStatus500Schema,
]);

export const searchRepoQueryQuerySchema = z.string().optional();

export const searchRepoQueryNamespaceIdSchema = z.union([z.string(), z.number()]).nullish();

export const searchRepoQueryProviderSchema = z
	.enum(["github", "github-limited", "github-custom-host", "gitlab", "bitbucket"])
	.optional();

export const searchRepoQueryInstallationIdSchema = z.string().optional();

export const searchRepoQueryHostSchema = z
	.string()
	.optional()
	.describe("The custom Git host if using a custom Git provider, like GitHub Enterprise Server");

export const searchRepoQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const searchRepoQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const searchRepoStatus200Schema = z.unknown();

export const searchRepoStatus400Schema = z.unknown();

export const searchRepoStatus401Schema = z.unknown();

export const searchRepoStatus403Schema = z.unknown();

export const searchRepoStatus404Schema = z.unknown();

export const searchRepoStatus429Schema = z.unknown();

export const searchRepoStatus500Schema = z.unknown();

export const searchRepoResponseSchema = z.union([
	searchRepoStatus200Schema,
	searchRepoStatus400Schema,
	searchRepoStatus401Schema,
	searchRepoStatus403Schema,
	searchRepoStatus404Schema,
	searchRepoStatus429Schema,
	searchRepoStatus500Schema,
]);

export const getBillingPlansPathIntegrationIdOrSlugSchema = z.string();

export const getBillingPlansQueryIntegrationConfigurationIdSchema = z.string().optional();

export const getBillingPlansPathProductIdOrSlugSchema = z.string();

export const getBillingPlansQueryMetadataSchema = z.string().optional();

export const getBillingPlansQuerySourceSchema = z
	.enum([
		"marketplace",
		"deploy-button",
		"external",
		"v0",
		"resource-claims",
		"cli",
		"oauth",
		"backoffice",
	])
	.optional();

export const getBillingPlansQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getBillingPlansQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getBillingPlansStatus200Schema = z.unknown();

export const getBillingPlansStatus400Schema = z.unknown();

export const getBillingPlansStatus401Schema = z.unknown();

export const getBillingPlansStatus403Schema = z.unknown();

export const getBillingPlansStatus404Schema = z.unknown();

export const getBillingPlansResponseSchema = z.union([
	getBillingPlansStatus200Schema,
	getBillingPlansStatus400Schema,
	getBillingPlansStatus401Schema,
	getBillingPlansStatus403Schema,
	getBillingPlansStatus404Schema,
]);

export const connectIntegrationResourceToProjectPathIntegrationConfigurationIdSchema = z.string();

export const connectIntegrationResourceToProjectPathResourceIdSchema = z.string();

export const connectIntegrationResourceToProjectQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const connectIntegrationResourceToProjectQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const connectIntegrationResourceToProjectStatus201Schema = z.unknown();

export const connectIntegrationResourceToProjectStatus400Schema = z.unknown();

export const connectIntegrationResourceToProjectStatus401Schema = z.unknown();

export const connectIntegrationResourceToProjectStatus403Schema = z.unknown();

export const connectIntegrationResourceToProjectStatus404Schema = z.unknown();

export const connectIntegrationResourceToProjectResponseSchema = z.union([
	connectIntegrationResourceToProjectStatus201Schema,
	connectIntegrationResourceToProjectStatus400Schema,
	connectIntegrationResourceToProjectStatus401Schema,
	connectIntegrationResourceToProjectStatus403Schema,
	connectIntegrationResourceToProjectStatus404Schema,
]);

export const updateInstallationPathIntegrationConfigurationIdSchema = z.string();

export const updateInstallationStatus204Schema = z.unknown();

export const updateInstallationStatus400Schema = z.unknown();

export const updateInstallationStatus401Schema = z.unknown();

export const updateInstallationStatus403Schema = z.unknown();

export const updateInstallationStatus404Schema = z.unknown();

export const updateInstallationResponseSchema = z.union([
	updateInstallationStatus204Schema,
	updateInstallationStatus400Schema,
	updateInstallationStatus401Schema,
	updateInstallationStatus403Schema,
	updateInstallationStatus404Schema,
]);

export const getAccountInfoPathIntegrationConfigurationIdSchema = z.string();

export const getAccountInfoStatus200Schema = z.unknown();

export const getAccountInfoStatus400Schema = z.unknown();

export const getAccountInfoStatus401Schema = z.unknown();

export const getAccountInfoStatus403Schema = z.unknown();

export const getAccountInfoStatus404Schema = z.unknown();

export const getAccountInfoResponseSchema = z.union([
	getAccountInfoStatus200Schema,
	getAccountInfoStatus400Schema,
	getAccountInfoStatus401Schema,
	getAccountInfoStatus403Schema,
	getAccountInfoStatus404Schema,
]);

export const getMemberPathIntegrationConfigurationIdSchema = z.string();

export const getMemberPathMemberIdSchema = z.string();

export const getMemberStatus200Schema = z.unknown();

export const getMemberStatus400Schema = z.unknown();

export const getMemberStatus401Schema = z.unknown();

export const getMemberStatus403Schema = z.unknown();

export const getMemberStatus404Schema = z.unknown();

export const getMemberResponseSchema = z.union([
	getMemberStatus200Schema,
	getMemberStatus400Schema,
	getMemberStatus401Schema,
	getMemberStatus403Schema,
	getMemberStatus404Schema,
]);

export const createEventPathIntegrationConfigurationIdSchema = z.string();

export const createEventStatus201Schema = z.unknown();

export const createEventStatus400Schema = z.unknown();

export const createEventStatus401Schema = z.unknown();

export const createEventStatus403Schema = z.unknown();

export const createEventStatus404Schema = z.unknown();

export const createEventResponseSchema = z.union([
	createEventStatus201Schema,
	createEventStatus400Schema,
	createEventStatus401Schema,
	createEventStatus403Schema,
	createEventStatus404Schema,
]);

export const getIntegrationResourcesPathIntegrationConfigurationIdSchema = z.string();

export const getIntegrationResourcesStatus200Schema = z.unknown();

export const getIntegrationResourcesStatus400Schema = z.unknown();

export const getIntegrationResourcesStatus401Schema = z.unknown();

export const getIntegrationResourcesStatus403Schema = z.unknown();

export const getIntegrationResourcesStatus404Schema = z.unknown();

export const getIntegrationResourcesResponseSchema = z.union([
	getIntegrationResourcesStatus200Schema,
	getIntegrationResourcesStatus400Schema,
	getIntegrationResourcesStatus401Schema,
	getIntegrationResourcesStatus403Schema,
	getIntegrationResourcesStatus404Schema,
]);

export const getIntegrationResourcePathIntegrationConfigurationIdSchema = z
	.string()
	.describe("The ID of the integration configuration (installation) the resource belongs to");

export const getIntegrationResourcePathResourceIdSchema = z
	.string()
	.describe("The ID provided by the 3rd party provider for the given resource");

export const getIntegrationResourceStatus200Schema = z.unknown();

export const getIntegrationResourceStatus400Schema = z.unknown();

export const getIntegrationResourceStatus401Schema = z.unknown();

export const getIntegrationResourceStatus403Schema = z.unknown();

export const getIntegrationResourceStatus404Schema = z.unknown();

export const getIntegrationResourceResponseSchema = z.union([
	getIntegrationResourceStatus200Schema,
	getIntegrationResourceStatus400Schema,
	getIntegrationResourceStatus401Schema,
	getIntegrationResourceStatus403Schema,
	getIntegrationResourceStatus404Schema,
]);

export const deleteIntegrationResourcePathIntegrationConfigurationIdSchema = z.string();

export const deleteIntegrationResourcePathResourceIdSchema = z.string();

export const deleteIntegrationResourceStatus204Schema = z.unknown();

export const deleteIntegrationResourceStatus400Schema = z.unknown();

export const deleteIntegrationResourceStatus401Schema = z.unknown();

export const deleteIntegrationResourceStatus403Schema = z.unknown();

export const deleteIntegrationResourceStatus404Schema = z.unknown();

export const deleteIntegrationResourceResponseSchema = z.union([
	deleteIntegrationResourceStatus204Schema,
	deleteIntegrationResourceStatus400Schema,
	deleteIntegrationResourceStatus401Schema,
	deleteIntegrationResourceStatus403Schema,
	deleteIntegrationResourceStatus404Schema,
]);

export const importResourcePathIntegrationConfigurationIdSchema = z.string();

export const importResourcePathResourceIdSchema = z.string();

export const importResourceStatus200Schema = z.unknown();

export const importResourceStatus400Schema = z.unknown();

export const importResourceStatus401Schema = z.unknown();

export const importResourceStatus403Schema = z.unknown();

export const importResourceStatus404Schema = z.unknown();

export const importResourceStatus409Schema = z.unknown();

export const importResourceStatus422Schema = z.unknown();

export const importResourceStatus429Schema = z.unknown();

export const importResourceResponseSchema = z.union([
	importResourceStatus200Schema,
	importResourceStatus400Schema,
	importResourceStatus401Schema,
	importResourceStatus403Schema,
	importResourceStatus404Schema,
	importResourceStatus409Schema,
	importResourceStatus422Schema,
	importResourceStatus429Schema,
]);

export const updateResourcePathIntegrationConfigurationIdSchema = z.string();

export const updateResourcePathResourceIdSchema = z.string();

export const updateResourceStatus200Schema = z.unknown();

export const updateResourceStatus400Schema = z.unknown();

export const updateResourceStatus401Schema = z.unknown();

export const updateResourceStatus403Schema = z.unknown();

export const updateResourceStatus404Schema = z.unknown();

export const updateResourceStatus409Schema = z.unknown();

export const updateResourceStatus422Schema = z.unknown();

export const updateResourceResponseSchema = z.union([
	updateResourceStatus200Schema,
	updateResourceStatus400Schema,
	updateResourceStatus401Schema,
	updateResourceStatus403Schema,
	updateResourceStatus404Schema,
	updateResourceStatus409Schema,
	updateResourceStatus422Schema,
]);

export const submitBillingDataPathIntegrationConfigurationIdSchema = z.string();

export const submitBillingDataStatus201Schema = z.unknown();

export const submitBillingDataStatus400Schema = z.unknown();

export const submitBillingDataStatus401Schema = z.unknown();

export const submitBillingDataStatus403Schema = z.unknown();

export const submitBillingDataStatus404Schema = z.unknown();

export const submitBillingDataResponseSchema = z.union([
	submitBillingDataStatus201Schema,
	submitBillingDataStatus400Schema,
	submitBillingDataStatus401Schema,
	submitBillingDataStatus403Schema,
	submitBillingDataStatus404Schema,
]);

export const submitInvoicePathIntegrationConfigurationIdSchema = z.string();

export const submitInvoiceStatus200Schema = z.unknown();

export const submitInvoiceStatus400Schema = z.unknown();

export const submitInvoiceStatus401Schema = z.unknown();

export const submitInvoiceStatus403Schema = z.unknown();

export const submitInvoiceStatus404Schema = z.unknown();

export const submitInvoiceStatus409Schema = z.unknown();

export const submitInvoiceResponseSchema = z.union([
	submitInvoiceStatus200Schema,
	submitInvoiceStatus400Schema,
	submitInvoiceStatus401Schema,
	submitInvoiceStatus403Schema,
	submitInvoiceStatus404Schema,
	submitInvoiceStatus409Schema,
]);

export const finalizeInstallationPathIntegrationConfigurationIdSchema = z.string();

export const finalizeInstallationStatus204Schema = z.unknown();

export const finalizeInstallationStatus400Schema = z.unknown();

export const finalizeInstallationStatus401Schema = z.unknown();

export const finalizeInstallationStatus403Schema = z.unknown();

export const finalizeInstallationStatus404Schema = z.unknown();

export const finalizeInstallationResponseSchema = z.union([
	finalizeInstallationStatus204Schema,
	finalizeInstallationStatus400Schema,
	finalizeInstallationStatus401Schema,
	finalizeInstallationStatus403Schema,
	finalizeInstallationStatus404Schema,
]);

export const getInvoicePathIntegrationConfigurationIdSchema = z.string();

export const getInvoicePathInvoiceIdSchema = z.string();

export const getInvoiceStatus200Schema = z.unknown();

export const getInvoiceStatus400Schema = z.unknown();

export const getInvoiceStatus401Schema = z.unknown();

export const getInvoiceStatus403Schema = z.unknown();

export const getInvoiceStatus404Schema = z.unknown();

export const getInvoiceResponseSchema = z.union([
	getInvoiceStatus200Schema,
	getInvoiceStatus400Schema,
	getInvoiceStatus401Schema,
	getInvoiceStatus403Schema,
	getInvoiceStatus404Schema,
]);

export const updateInvoicePathIntegrationConfigurationIdSchema = z.string();

export const updateInvoicePathInvoiceIdSchema = z.string();

export const updateInvoiceStatus204Schema = z.unknown();

export const updateInvoiceStatus400Schema = z.unknown();

export const updateInvoiceStatus401Schema = z.unknown();

export const updateInvoiceStatus403Schema = z.unknown();

export const updateInvoiceStatus404Schema = z.unknown();

export const updateInvoiceStatus409Schema = z.unknown();

export const updateInvoiceResponseSchema = z.union([
	updateInvoiceStatus204Schema,
	updateInvoiceStatus400Schema,
	updateInvoiceStatus401Schema,
	updateInvoiceStatus403Schema,
	updateInvoiceStatus404Schema,
	updateInvoiceStatus409Schema,
]);

export const submitPrepaymentBalancesPathIntegrationConfigurationIdSchema = z.string();

export const submitPrepaymentBalancesStatus201Schema = z.unknown();

export const submitPrepaymentBalancesStatus400Schema = z.unknown();

export const submitPrepaymentBalancesStatus401Schema = z.unknown();

export const submitPrepaymentBalancesStatus403Schema = z.unknown();

export const submitPrepaymentBalancesStatus404Schema = z.unknown();

export const submitPrepaymentBalancesResponseSchema = z.union([
	submitPrepaymentBalancesStatus201Schema,
	submitPrepaymentBalancesStatus400Schema,
	submitPrepaymentBalancesStatus401Schema,
	submitPrepaymentBalancesStatus403Schema,
	submitPrepaymentBalancesStatus404Schema,
]);

export const updateResourceSecretsPathIntegrationConfigurationIdSchema = z.string();

export const updateResourceSecretsPathIntegrationProductIdOrSlugSchema = z.string();

export const updateResourceSecretsPathResourceIdSchema = z.string();

export const updateResourceSecretsStatus201Schema = z.unknown();

export const updateResourceSecretsStatus400Schema = z.unknown();

export const updateResourceSecretsStatus401Schema = z.unknown();

export const updateResourceSecretsStatus403Schema = z.unknown();

export const updateResourceSecretsStatus404Schema = z.unknown();

export const updateResourceSecretsStatus409Schema = z.unknown();

export const updateResourceSecretsStatus422Schema = z.unknown();

export const updateResourceSecretsResponseSchema = z.union([
	updateResourceSecretsStatus201Schema,
	updateResourceSecretsStatus400Schema,
	updateResourceSecretsStatus401Schema,
	updateResourceSecretsStatus403Schema,
	updateResourceSecretsStatus404Schema,
	updateResourceSecretsStatus409Schema,
	updateResourceSecretsStatus422Schema,
]);

export const updateResourceSecretsByIdPathIntegrationConfigurationIdSchema = z.string();

export const updateResourceSecretsByIdPathResourceIdSchema = z.string();

export const updateResourceSecretsByIdStatus201Schema = z.unknown();

export const updateResourceSecretsByIdStatus400Schema = z.unknown();

export const updateResourceSecretsByIdStatus401Schema = z.unknown();

export const updateResourceSecretsByIdStatus403Schema = z.unknown();

export const updateResourceSecretsByIdStatus404Schema = z.unknown();

export const updateResourceSecretsByIdStatus409Schema = z.unknown();

export const updateResourceSecretsByIdStatus422Schema = z.unknown();

export const updateResourceSecretsByIdResponseSchema = z.union([
	updateResourceSecretsByIdStatus201Schema,
	updateResourceSecretsByIdStatus400Schema,
	updateResourceSecretsByIdStatus401Schema,
	updateResourceSecretsByIdStatus403Schema,
	updateResourceSecretsByIdStatus404Schema,
	updateResourceSecretsByIdStatus409Schema,
	updateResourceSecretsByIdStatus422Schema,
]);

export const getConfigurationsQueryViewSchema = z.enum(["account", "project"]);

export const getConfigurationsQueryInstallationTypeSchema = z
	.enum(["marketplace", "external", "provisioning"])
	.optional();

export const getConfigurationsQueryIntegrationIdOrSlugSchema = z
	.string()
	.optional()
	.describe("ID of the integration");

export const getConfigurationsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getConfigurationsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getConfigurationsStatus200Schema = z.unknown();

export const getConfigurationsStatus400Schema = z.unknown();

export const getConfigurationsStatus401Schema = z.unknown();

export const getConfigurationsStatus403Schema = z.unknown();

export const getConfigurationsResponseSchema = z.union([
	getConfigurationsStatus200Schema,
	getConfigurationsStatus400Schema,
	getConfigurationsStatus401Schema,
	getConfigurationsStatus403Schema,
]);

export const getConfigurationPathIdSchema = z.string().describe("ID of the configuration to check");

export const getConfigurationQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getConfigurationQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getConfigurationStatus200Schema = z.unknown();

export const getConfigurationStatus400Schema = z.unknown();

export const getConfigurationStatus401Schema = z.unknown();

export const getConfigurationStatus403Schema = z.unknown();

export const getConfigurationStatus404Schema = z.unknown();

export const getConfigurationResponseSchema = z.union([
	getConfigurationStatus200Schema,
	getConfigurationStatus400Schema,
	getConfigurationStatus401Schema,
	getConfigurationStatus403Schema,
	getConfigurationStatus404Schema,
]);

export const deleteConfigurationPathIdSchema = z.string();

export const deleteConfigurationQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const deleteConfigurationQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const deleteConfigurationStatus204Schema = z.unknown();

export const deleteConfigurationStatus400Schema = z.unknown();

export const deleteConfigurationStatus401Schema = z.unknown();

export const deleteConfigurationStatus403Schema = z.unknown();

export const deleteConfigurationStatus404Schema = z.unknown();

export const deleteConfigurationResponseSchema = z.union([
	deleteConfigurationStatus204Schema,
	deleteConfigurationStatus400Schema,
	deleteConfigurationStatus401Schema,
	deleteConfigurationStatus403Schema,
	deleteConfigurationStatus404Schema,
]);

export const getConfigurationProductsPathIdSchema = z
	.string()
	.describe("ID of the integration configuration");

export const getConfigurationProductsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getConfigurationProductsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getConfigurationProductsStatus200Schema = z.unknown();

export const getConfigurationProductsStatus400Schema = z.unknown();

export const getConfigurationProductsStatus401Schema = z.unknown();

export const getConfigurationProductsStatus403Schema = z.unknown();

export const getConfigurationProductsStatus404Schema = z.unknown();

export const getConfigurationProductsStatus500Schema = z.unknown();

export const getConfigurationProductsResponseSchema = z.union([
	getConfigurationProductsStatus200Schema,
	getConfigurationProductsStatus400Schema,
	getConfigurationProductsStatus401Schema,
	getConfigurationProductsStatus403Schema,
	getConfigurationProductsStatus404Schema,
	getConfigurationProductsStatus500Schema,
]);

export const exchangeSsoTokenStatus200Schema = z.unknown();

export const exchangeSsoTokenStatus400Schema = z.unknown();

export const exchangeSsoTokenStatus403Schema = z.unknown();

export const exchangeSsoTokenStatus500Schema = z.unknown();

export const exchangeSsoTokenResponseSchema = z.union([
	exchangeSsoTokenStatus200Schema,
	exchangeSsoTokenStatus400Schema,
	exchangeSsoTokenStatus403Schema,
	exchangeSsoTokenStatus500Schema,
]);

export const getIntegrationLogDrainsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getIntegrationLogDrainsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getIntegrationLogDrainsStatus200Schema = z.unknown();

export const getIntegrationLogDrainsStatus400Schema = z.unknown();

export const getIntegrationLogDrainsStatus401Schema = z.unknown();

export const getIntegrationLogDrainsStatus403Schema = z.unknown();

export const getIntegrationLogDrainsResponseSchema = z.union([
	getIntegrationLogDrainsStatus200Schema,
	getIntegrationLogDrainsStatus400Schema,
	getIntegrationLogDrainsStatus401Schema,
	getIntegrationLogDrainsStatus403Schema,
]);

export const createLogDrainQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const createLogDrainQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const createLogDrainStatus200Schema = z.unknown();

export const createLogDrainStatus400Schema = z.unknown();

export const createLogDrainStatus401Schema = z.unknown();

export const createLogDrainStatus403Schema = z.unknown();

export const createLogDrainResponseSchema = z.union([
	createLogDrainStatus200Schema,
	createLogDrainStatus400Schema,
	createLogDrainStatus401Schema,
	createLogDrainStatus403Schema,
]);

export const deleteIntegrationLogDrainPathIdSchema = z
	.string()
	.describe("ID of the log drain to be deleted");

export const deleteIntegrationLogDrainQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const deleteIntegrationLogDrainQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const deleteIntegrationLogDrainStatus204Schema = z.unknown();

export const deleteIntegrationLogDrainStatus400Schema = z.unknown();

export const deleteIntegrationLogDrainStatus401Schema = z.unknown();

export const deleteIntegrationLogDrainStatus403Schema = z.unknown();

export const deleteIntegrationLogDrainStatus404Schema = z.unknown();

export const deleteIntegrationLogDrainResponseSchema = z.union([
	deleteIntegrationLogDrainStatus204Schema,
	deleteIntegrationLogDrainStatus400Schema,
	deleteIntegrationLogDrainStatus401Schema,
	deleteIntegrationLogDrainStatus403Schema,
	deleteIntegrationLogDrainStatus404Schema,
]);

export const getRuntimeLogsPathProjectIdSchema = z.string();

export const getRuntimeLogsPathDeploymentIdSchema = z.string();

export const getRuntimeLogsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getRuntimeLogsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getRuntimeLogsStatus200Schema = z.unknown();

export const getRuntimeLogsStatus400Schema = z.unknown();

export const getRuntimeLogsStatus401Schema = z.unknown();

export const getRuntimeLogsStatus403Schema = z.unknown();

export const getRuntimeLogsResponseSchema = z.union([
	getRuntimeLogsStatus200Schema,
	getRuntimeLogsStatus400Schema,
	getRuntimeLogsStatus401Schema,
	getRuntimeLogsStatus403Schema,
]);

export const createInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsPathIntegrationConfigurationIdSchema =
	z.string();

export const createInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsPathResourceIdSchema =
	z.string();

export const createInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsStatus204Schema =
	z.unknown();

export const createInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsStatus400Schema =
	z.unknown();

export const createInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsStatus401Schema =
	z.unknown();

export const createInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsStatus403Schema =
	z.unknown();

export const createInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsStatus404Schema =
	z.unknown();

export const createInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsResponseSchema =
	z.union([
		createInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsStatus204Schema,
		createInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsStatus400Schema,
		createInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsStatus401Schema,
		createInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsStatus403Schema,
		createInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsStatus404Schema,
	]);

export const updateInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsByItemIdPathIntegrationConfigurationIdSchema =
	z.string();

export const updateInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsByItemIdPathResourceIdSchema =
	z.string();

export const updateInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsByItemIdPathItemIdSchema =
	z.string();

export const updateInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsByItemIdStatus204Schema =
	z.unknown();

export const updateInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsByItemIdStatus400Schema =
	z.unknown();

export const updateInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsByItemIdStatus401Schema =
	z.unknown();

export const updateInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsByItemIdStatus403Schema =
	z.unknown();

export const updateInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsByItemIdStatus404Schema =
	z.unknown();

export const updateInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsByItemIdResponseSchema =
	z.union([
		updateInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsByItemIdStatus204Schema,
		updateInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsByItemIdStatus400Schema,
		updateInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsByItemIdStatus401Schema,
		updateInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsByItemIdStatus403Schema,
		updateInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsByItemIdStatus404Schema,
	]);

export const deleteInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsByItemIdPathIntegrationConfigurationIdSchema =
	z.string();

export const deleteInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsByItemIdPathResourceIdSchema =
	z.string();

export const deleteInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsByItemIdPathItemIdSchema =
	z.string();

export const deleteInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsByItemIdStatus204Schema =
	z.unknown();

export const deleteInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsByItemIdStatus400Schema =
	z.unknown();

export const deleteInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsByItemIdStatus401Schema =
	z.unknown();

export const deleteInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsByItemIdStatus403Schema =
	z.unknown();

export const deleteInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsByItemIdStatus404Schema =
	z.unknown();

export const deleteInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsByItemIdResponseSchema =
	z.union([
		deleteInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsByItemIdStatus204Schema,
		deleteInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsByItemIdStatus400Schema,
		deleteInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsByItemIdStatus401Schema,
		deleteInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsByItemIdStatus403Schema,
		deleteInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationItemsByItemIdStatus404Schema,
	]);

export const getInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationEdgeConfigPathIntegrationConfigurationIdSchema =
	z.string();

export const getInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationEdgeConfigPathResourceIdSchema =
	z.string();

export const getInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationEdgeConfigStatus200Schema =
	z.unknown();

export const getInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationEdgeConfigStatus304Schema =
	z.unknown();

export const getInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationEdgeConfigStatus400Schema =
	z.unknown();

export const getInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationEdgeConfigStatus401Schema =
	z.unknown();

export const getInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationEdgeConfigStatus403Schema =
	z.unknown();

export const getInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationEdgeConfigStatus404Schema =
	z.unknown();

export const getInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationEdgeConfigResponseSchema =
	z.union([
		getInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationEdgeConfigStatus200Schema,
		getInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationEdgeConfigStatus304Schema,
		getInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationEdgeConfigStatus400Schema,
		getInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationEdgeConfigStatus401Schema,
		getInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationEdgeConfigStatus403Schema,
		getInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationEdgeConfigStatus404Schema,
	]);

export const replaceInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationEdgeConfigPathIntegrationConfigurationIdSchema =
	z.string();

export const replaceInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationEdgeConfigPathResourceIdSchema =
	z.string();

export const replaceInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationEdgeConfigStatus200Schema =
	z.unknown();

export const replaceInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationEdgeConfigStatus400Schema =
	z.unknown();

export const replaceInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationEdgeConfigStatus401Schema =
	z.unknown();

export const replaceInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationEdgeConfigStatus403Schema =
	z.unknown();

export const replaceInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationEdgeConfigStatus404Schema =
	z.unknown();

export const replaceInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationEdgeConfigStatus409Schema =
	z.unknown();

export const replaceInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationEdgeConfigStatus412Schema =
	z.unknown();

export const replaceInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationEdgeConfigResponseSchema =
	z.union([
		replaceInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationEdgeConfigStatus200Schema,
		replaceInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationEdgeConfigStatus400Schema,
		replaceInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationEdgeConfigStatus401Schema,
		replaceInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationEdgeConfigStatus403Schema,
		replaceInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationEdgeConfigStatus404Schema,
		replaceInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationEdgeConfigStatus409Schema,
		replaceInstallationsByIntegrationConfigurationIdResourcesByResourceIdExperimentationEdgeConfigStatus412Schema,
	]);

export const getMicrofrontendsGroupsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getMicrofrontendsGroupsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getMicrofrontendsGroupsStatus200Schema = z.unknown();

export const getMicrofrontendsGroupsStatus400Schema = z.unknown();

export const getMicrofrontendsGroupsStatus401Schema = z.unknown();

export const getMicrofrontendsGroupsStatus403Schema = z.unknown();

export const getMicrofrontendsGroupsStatus500Schema = z.unknown();

export const getMicrofrontendsGroupsResponseSchema = z.union([
	getMicrofrontendsGroupsStatus200Schema,
	getMicrofrontendsGroupsStatus400Schema,
	getMicrofrontendsGroupsStatus401Schema,
	getMicrofrontendsGroupsStatus403Schema,
	getMicrofrontendsGroupsStatus500Schema,
]);

export const getMicrofrontendsInGroupPathGroupIdSchema = z.string();

export const getMicrofrontendsInGroupQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getMicrofrontendsInGroupQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getMicrofrontendsInGroupStatus200Schema = z.unknown();

export const getMicrofrontendsInGroupStatus400Schema = z.unknown();

export const getMicrofrontendsInGroupStatus401Schema = z.unknown();

export const getMicrofrontendsInGroupStatus403Schema = z.unknown();

export const getMicrofrontendsInGroupResponseSchema = z.union([
	getMicrofrontendsInGroupStatus200Schema,
	getMicrofrontendsInGroupStatus400Schema,
	getMicrofrontendsInGroupStatus401Schema,
	getMicrofrontendsInGroupStatus403Schema,
]);

export const getMicrofrontendsConfigPathDeploymentIdSchema = z
	.string()
	.describe("The unique deployment identifier");

export const getMicrofrontendsConfigQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getMicrofrontendsConfigQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getMicrofrontendsConfigStatus200Schema = z.unknown();

export const getMicrofrontendsConfigStatus400Schema = z.unknown();

export const getMicrofrontendsConfigStatus401Schema = z.unknown();

export const getMicrofrontendsConfigStatus403Schema = z.unknown();

export const getMicrofrontendsConfigStatus404Schema = z.unknown();

export const getMicrofrontendsConfigStatus500Schema = z.unknown();

export const getMicrofrontendsConfigResponseSchema = z.union([
	getMicrofrontendsConfigStatus200Schema,
	getMicrofrontendsConfigStatus400Schema,
	getMicrofrontendsConfigStatus401Schema,
	getMicrofrontendsConfigStatus403Schema,
	getMicrofrontendsConfigStatus404Schema,
	getMicrofrontendsConfigStatus500Schema,
]);

export const getMicrofrontendsConfigForProjectPathProjectIdOrNameSchema = z
	.string()
	.describe("The name or ID of the project");

export const getMicrofrontendsConfigForProjectQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getMicrofrontendsConfigForProjectQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getMicrofrontendsConfigForProjectStatus200Schema = z.unknown();

export const getMicrofrontendsConfigForProjectStatus400Schema = z.unknown();

export const getMicrofrontendsConfigForProjectStatus401Schema = z.unknown();

export const getMicrofrontendsConfigForProjectStatus403Schema = z.unknown();

export const getMicrofrontendsConfigForProjectStatus404Schema = z.unknown();

export const getMicrofrontendsConfigForProjectStatus500Schema = z.unknown();

export const getMicrofrontendsConfigForProjectResponseSchema = z.union([
	getMicrofrontendsConfigForProjectStatus200Schema,
	getMicrofrontendsConfigForProjectStatus400Schema,
	getMicrofrontendsConfigForProjectStatus401Schema,
	getMicrofrontendsConfigForProjectStatus403Schema,
	getMicrofrontendsConfigForProjectStatus404Schema,
	getMicrofrontendsConfigForProjectStatus500Schema,
]);

export const createMicrofrontendsGroupWithApplicationsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const createMicrofrontendsGroupWithApplicationsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const createMicrofrontendsGroupWithApplicationsStatus200Schema = z.unknown();

export const createMicrofrontendsGroupWithApplicationsStatus400Schema = z.unknown();

export const createMicrofrontendsGroupWithApplicationsStatus401Schema = z.unknown();

export const createMicrofrontendsGroupWithApplicationsStatus403Schema = z.unknown();

export const createMicrofrontendsGroupWithApplicationsStatus500Schema = z.unknown();

export const createMicrofrontendsGroupWithApplicationsResponseSchema = z.union([
	createMicrofrontendsGroupWithApplicationsStatus200Schema,
	createMicrofrontendsGroupWithApplicationsStatus400Schema,
	createMicrofrontendsGroupWithApplicationsStatus401Schema,
	createMicrofrontendsGroupWithApplicationsStatus403Schema,
	createMicrofrontendsGroupWithApplicationsStatus500Schema,
]);

export const getObservabilityConfigurationProjectsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getObservabilityConfigurationProjectsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getObservabilityConfigurationProjectsStatus200Schema = z.unknown();

export const getObservabilityConfigurationProjectsStatus400Schema = z.unknown();

export const getObservabilityConfigurationProjectsStatus401Schema = z.unknown();

export const getObservabilityConfigurationProjectsStatus403Schema = z.unknown();

export const getObservabilityConfigurationProjectsStatus404Schema = z.unknown();

export const getObservabilityConfigurationProjectsResponseSchema = z.union([
	getObservabilityConfigurationProjectsStatus200Schema,
	getObservabilityConfigurationProjectsStatus400Schema,
	getObservabilityConfigurationProjectsStatus401Schema,
	getObservabilityConfigurationProjectsStatus403Schema,
	getObservabilityConfigurationProjectsStatus404Schema,
]);

export const updateObservabilityConfigurationProjectPathProjectIdOrNameSchema = z
	.string()
	.describe("The ID or name of the project to update");

export const updateObservabilityConfigurationProjectQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const updateObservabilityConfigurationProjectQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const updateObservabilityConfigurationProjectStatus200Schema = z.unknown();

export const updateObservabilityConfigurationProjectStatus400Schema = z.unknown();

export const updateObservabilityConfigurationProjectStatus401Schema = z.unknown();

export const updateObservabilityConfigurationProjectStatus403Schema = z.unknown();

export const updateObservabilityConfigurationProjectStatus404Schema = z.unknown();

export const updateObservabilityConfigurationProjectStatus429Schema = z.unknown();

export const updateObservabilityConfigurationProjectResponseSchema = z.union([
	updateObservabilityConfigurationProjectStatus200Schema,
	updateObservabilityConfigurationProjectStatus400Schema,
	updateObservabilityConfigurationProjectStatus401Schema,
	updateObservabilityConfigurationProjectStatus403Schema,
	updateObservabilityConfigurationProjectStatus404Schema,
	updateObservabilityConfigurationProjectStatus429Schema,
]);

export const getProjectMembersPathIdOrNameSchema = z
	.string()
	.describe("The ID or name of the Project.");

export const getProjectMembersQueryLimitSchema = z
	.int()
	.min(1)
	.max(100)
	.optional()
	.describe("Limit how many project members should be returned");

export const getProjectMembersQuerySinceSchema = z
	.int()
	.optional()
	.describe("Timestamp in milliseconds to only include members added since then.");

export const getProjectMembersQueryUntilSchema = z
	.int()
	.optional()
	.describe("Timestamp in milliseconds to only include members added until then.");

export const getProjectMembersQuerySearchSchema = z
	.string()
	.optional()
	.describe("Search project members by their name, username, and email.");

export const getProjectMembersQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getProjectMembersQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getProjectMembersStatus200Schema = z.unknown();

export const getProjectMembersStatus400Schema = z.unknown();

export const getProjectMembersStatus401Schema = z.unknown();

export const getProjectMembersStatus403Schema = z.unknown();

export const getProjectMembersResponseSchema = z.union([
	getProjectMembersStatus200Schema,
	getProjectMembersStatus400Schema,
	getProjectMembersStatus401Schema,
	getProjectMembersStatus403Schema,
]);

export const addProjectMemberPathIdOrNameSchema = z
	.string()
	.describe("The ID or name of the Project.");

export const addProjectMemberQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const addProjectMemberQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const addProjectMemberStatus200Schema = z.unknown();

export const addProjectMemberStatus400Schema = z.unknown();

export const addProjectMemberStatus401Schema = z.unknown();

export const addProjectMemberStatus403Schema = z.unknown();

export const addProjectMemberStatus500Schema = z.unknown();

export const addProjectMemberResponseSchema = z.union([
	addProjectMemberStatus200Schema,
	addProjectMemberStatus400Schema,
	addProjectMemberStatus401Schema,
	addProjectMemberStatus403Schema,
	addProjectMemberStatus500Schema,
]);

export const removeProjectMemberPathIdOrNameSchema = z
	.string()
	.describe("The ID or name of the Project.");

export const removeProjectMemberPathUidSchema = z.string().describe("The user ID of the member.");

export const removeProjectMemberQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const removeProjectMemberQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const removeProjectMemberStatus200Schema = z.unknown();

export const removeProjectMemberStatus400Schema = z.unknown();

export const removeProjectMemberStatus401Schema = z.unknown();

export const removeProjectMemberStatus403Schema = z.unknown();

export const removeProjectMemberResponseSchema = z.union([
	removeProjectMemberStatus200Schema,
	removeProjectMemberStatus400Schema,
	removeProjectMemberStatus401Schema,
	removeProjectMemberStatus403Schema,
]);

export const getRoutesPathProjectIdSchema = z.string();

export const getRoutesQueryVersionIdSchema = z.string().optional();

export const getRoutesQueryQSchema = z.string().optional();

export const getRoutesQueryFilterSchema = z
	.enum(["rewrite", "redirect", "set_status", "transform"])
	.optional();

export const getRoutesQueryDiffSchema = z.union([z.boolean(), z.enum(["only"])]).optional();

export const getRoutesQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getRoutesQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getRoutesStatus200Schema = z.unknown();

export const getRoutesStatus400Schema = z.unknown();

export const getRoutesStatus401Schema = z.unknown();

export const getRoutesStatus403Schema = z.unknown();

export const getRoutesStatus404Schema = z.unknown();

export const getRoutesResponseSchema = z.union([
	getRoutesStatus200Schema,
	getRoutesStatus400Schema,
	getRoutesStatus401Schema,
	getRoutesStatus403Schema,
	getRoutesStatus404Schema,
]);

export const stageRoutesPathProjectIdSchema = z.string();

export const stageRoutesQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const stageRoutesQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const stageRoutesStatus200Schema = z.unknown();

export const stageRoutesStatus400Schema = z.unknown();

export const stageRoutesStatus401Schema = z.unknown();

export const stageRoutesStatus403Schema = z.unknown();

export const stageRoutesStatus409Schema = z.unknown();

export const stageRoutesStatus500Schema = z.unknown();

export const stageRoutesResponseSchema = z.union([
	stageRoutesStatus200Schema,
	stageRoutesStatus400Schema,
	stageRoutesStatus401Schema,
	stageRoutesStatus403Schema,
	stageRoutesStatus409Schema,
	stageRoutesStatus500Schema,
]);

export const addRoutePathProjectIdSchema = z.string();

export const addRouteQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const addRouteQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const addRouteStatus200Schema = z.unknown();

export const addRouteStatus400Schema = z.unknown();

export const addRouteStatus401Schema = z.unknown();

export const addRouteStatus403Schema = z.unknown();

export const addRouteStatus409Schema = z.unknown();

export const addRouteStatus500Schema = z.unknown();

export const addRouteResponseSchema = z.union([
	addRouteStatus200Schema,
	addRouteStatus400Schema,
	addRouteStatus401Schema,
	addRouteStatus403Schema,
	addRouteStatus409Schema,
	addRouteStatus500Schema,
]);

export const deleteRoutesPathProjectIdSchema = z.string();

export const deleteRoutesQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const deleteRoutesQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const deleteRoutesStatus200Schema = z.unknown();

export const deleteRoutesStatus400Schema = z.unknown();

export const deleteRoutesStatus401Schema = z.unknown();

export const deleteRoutesStatus403Schema = z.unknown();

export const deleteRoutesStatus404Schema = z.unknown();

export const deleteRoutesStatus409Schema = z.unknown();

export const deleteRoutesStatus500Schema = z.unknown();

export const deleteRoutesResponseSchema = z.union([
	deleteRoutesStatus200Schema,
	deleteRoutesStatus400Schema,
	deleteRoutesStatus401Schema,
	deleteRoutesStatus403Schema,
	deleteRoutesStatus404Schema,
	deleteRoutesStatus409Schema,
	deleteRoutesStatus500Schema,
]);

export const editRoutePathProjectIdSchema = z.string();

export const editRoutePathRouteIdSchema = z.string();

export const editRouteQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const editRouteQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const editRouteStatus200Schema = z.unknown();

export const editRouteStatus400Schema = z.unknown();

export const editRouteStatus401Schema = z.unknown();

export const editRouteStatus403Schema = z.unknown();

export const editRouteStatus404Schema = z.unknown();

export const editRouteStatus409Schema = z.unknown();

export const editRouteStatus500Schema = z.unknown();

export const editRouteResponseSchema = z.union([
	editRouteStatus200Schema,
	editRouteStatus400Schema,
	editRouteStatus401Schema,
	editRouteStatus403Schema,
	editRouteStatus404Schema,
	editRouteStatus409Schema,
	editRouteStatus500Schema,
]);

export const generateRoutePathProjectIdSchema = z.string();

export const generateRouteQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const generateRouteQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const generateRouteStatus200Schema = z.unknown();

export const generateRouteStatus400Schema = z.unknown();

export const generateRouteStatus401Schema = z.unknown();

export const generateRouteStatus403Schema = z.unknown();

export const generateRouteStatus408Schema = z.unknown();

export const generateRouteStatus500Schema = z.unknown();

export const generateRouteResponseSchema = z.union([
	generateRouteStatus200Schema,
	generateRouteStatus400Schema,
	generateRouteStatus401Schema,
	generateRouteStatus403Schema,
	generateRouteStatus408Schema,
	generateRouteStatus500Schema,
]);

export const getRouteVersionsPathProjectIdSchema = z.string();

export const getRouteVersionsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getRouteVersionsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getRouteVersionsStatus200Schema = z.unknown();

export const getRouteVersionsStatus400Schema = z.unknown();

export const getRouteVersionsStatus401Schema = z.unknown();

export const getRouteVersionsStatus403Schema = z.unknown();

export const getRouteVersionsResponseSchema = z.union([
	getRouteVersionsStatus200Schema,
	getRouteVersionsStatus400Schema,
	getRouteVersionsStatus401Schema,
	getRouteVersionsStatus403Schema,
]);

export const updateRouteVersionsPathProjectIdSchema = z.string();

export const updateRouteVersionsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const updateRouteVersionsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const updateRouteVersionsStatus200Schema = z.unknown();

export const updateRouteVersionsStatus400Schema = z.unknown();

export const updateRouteVersionsStatus401Schema = z.unknown();

export const updateRouteVersionsStatus403Schema = z.unknown();

export const updateRouteVersionsStatus404Schema = z.unknown();

export const updateRouteVersionsStatus409Schema = z.unknown();

export const updateRouteVersionsStatus500Schema = z.unknown();

export const updateRouteVersionsResponseSchema = z.union([
	updateRouteVersionsStatus200Schema,
	updateRouteVersionsStatus400Schema,
	updateRouteVersionsStatus401Schema,
	updateRouteVersionsStatus403Schema,
	updateRouteVersionsStatus404Schema,
	updateRouteVersionsStatus409Schema,
	updateRouteVersionsStatus500Schema,
]);

export const getProjectsQueryFromSchema = z
	.string()
	.optional()
	.describe("Query only projects updated after the given timestamp or continuation token.");

export const getProjectsQueryGitForkProtectionSchema = z
	.string()
	.optional()
	.describe(
		"Specifies whether PRs from Git forks should require a team member's authorization before it can be deployed",
	);

export const getProjectsQueryLimitSchema = z
	.string()
	.optional()
	.describe("Limit the number of projects returned");

export const getProjectsQuerySearchSchema = z
	.string()
	.max(100)
	.optional()
	.describe("Search projects by the name field");

export const getProjectsQueryRepoSchema = z
	.string()
	.optional()
	.describe("Filter results by repo. Also used for project count");

export const getProjectsQueryRepoIdSchema = z
	.string()
	.optional()
	.describe("Filter results by Repository ID.");

export const getProjectsQueryRepoUrlSchema = z
	.string()
	.optional()
	.describe("Filter results by Repository URL.");

export const getProjectsQueryExcludeReposSchema = z
	.string()
	.optional()
	.describe("Filter results by excluding those projects that belong to a repo");

export const getProjectsQueryEdgeConfigIdSchema = z
	.string()
	.optional()
	.describe("Filter results by connected Edge Config ID");

export const getProjectsQueryEdgeConfigTokenIdSchema = z
	.string()
	.optional()
	.describe("Filter results by connected Edge Config Token ID");

export const getProjectsQueryDeprecatedSchema = z.boolean().optional();

export const getProjectsQueryElasticConcurrencyEnabledSchema = z
	.string()
	.optional()
	.describe("Filter results by projects with elastic concurrency enabled");

export const getProjectsQueryStaticIpsEnabledSchema = z
	.string()
	.optional()
	.describe("Filter results by projects with Static IPs enabled");

export const getProjectsQueryBuildMachineTypesSchema = z
	.string()
	.optional()
	.describe(
		'Filter results by build machine types. Accepts comma-separated values. Use "default" for projects without a build machine type set.',
	);

export const getProjectsQueryBuildQueueConfigurationSchema = z
	.enum(["SKIP_NAMESPACE_QUEUE", "WAIT_FOR_NAMESPACE_QUEUE"])
	.optional()
	.describe(
		"Filter results by build queue configuration. SKIP_NAMESPACE_QUEUE includes projects without a configuration set.",
	);

export const getProjectsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getProjectsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getProjectsStatus200Schema = z.unknown();

export const getProjectsStatus400Schema = z.unknown();

export const getProjectsStatus401Schema = z.unknown();

export const getProjectsStatus403Schema = z.unknown();

export const getProjectsResponseSchema = z.union([
	getProjectsStatus200Schema,
	getProjectsStatus400Schema,
	getProjectsStatus401Schema,
	getProjectsStatus403Schema,
]);

export const createProjectQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const createProjectQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const createProjectStatus200Schema = z.unknown();

export const createProjectStatus400Schema = z.unknown();

export const createProjectStatus401Schema = z.unknown();

export const createProjectStatus402Schema = z.unknown();

export const createProjectStatus403Schema = z.unknown();

export const createProjectStatus404Schema = z.unknown();

export const createProjectStatus409Schema = z.unknown();

export const createProjectStatus428Schema = z.unknown();

export const createProjectStatus429Schema = z.unknown();

export const createProjectStatus500Schema = z.unknown();

export const createProjectResponseSchema = z.union([
	createProjectStatus200Schema,
	createProjectStatus400Schema,
	createProjectStatus401Schema,
	createProjectStatus402Schema,
	createProjectStatus403Schema,
	createProjectStatus404Schema,
	createProjectStatus409Schema,
	createProjectStatus428Schema,
	createProjectStatus429Schema,
	createProjectStatus500Schema,
]);

export const getProjectPathIdOrNameSchema = z
	.union([z.string(), z.boolean()])
	.describe("The unique project identifier or the project name");

export const getProjectQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getProjectQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getProjectStatus200Schema = z.unknown();

export const getProjectStatus400Schema = z.unknown();

export const getProjectStatus401Schema = z.unknown();

export const getProjectStatus403Schema = z.unknown();

export const getProjectResponseSchema = z.union([
	getProjectStatus200Schema,
	getProjectStatus400Schema,
	getProjectStatus401Schema,
	getProjectStatus403Schema,
]);

export const updateProjectPathIdOrNameSchema = z
	.string()
	.describe("The unique project identifier or the project name");

export const updateProjectQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const updateProjectQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const updateProjectStatus200Schema = z.unknown();

export const updateProjectStatus400Schema = z.unknown();

export const updateProjectStatus401Schema = z.unknown();

export const updateProjectStatus402Schema = z.unknown();

export const updateProjectStatus403Schema = z.unknown();

export const updateProjectStatus404Schema = z.unknown();

export const updateProjectStatus409Schema = z.unknown();

export const updateProjectStatus428Schema = z.unknown();

export const updateProjectStatus500Schema = z.unknown();

export const updateProjectResponseSchema = z.union([
	updateProjectStatus200Schema,
	updateProjectStatus400Schema,
	updateProjectStatus401Schema,
	updateProjectStatus402Schema,
	updateProjectStatus403Schema,
	updateProjectStatus404Schema,
	updateProjectStatus409Schema,
	updateProjectStatus428Schema,
	updateProjectStatus500Schema,
]);

export const deleteProjectPathIdOrNameSchema = z
	.string()
	.describe("The unique project identifier or the project name");

export const deleteProjectQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const deleteProjectQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const deleteProjectStatus204Schema = z.unknown();

export const deleteProjectStatus400Schema = z.unknown();

export const deleteProjectStatus401Schema = z.unknown();

export const deleteProjectStatus403Schema = z.unknown();

export const deleteProjectStatus409Schema = z.unknown();

export const deleteProjectResponseSchema = z.union([
	deleteProjectStatus204Schema,
	deleteProjectStatus400Schema,
	deleteProjectStatus401Schema,
	deleteProjectStatus403Schema,
	deleteProjectStatus409Schema,
]);

export const uploadProjectAvatarPathIdOrNameSchema = z
	.string()
	.describe("The unique project identifier or the project name.");

export const uploadProjectAvatarQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const uploadProjectAvatarQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const uploadProjectAvatarStatus200Schema = z.unknown();

export const uploadProjectAvatarStatus400Schema = z.unknown();

export const uploadProjectAvatarStatus401Schema = z.unknown();

export const uploadProjectAvatarStatus403Schema = z.unknown();

export const uploadProjectAvatarStatus413Schema = z.unknown();

export const uploadProjectAvatarStatus415Schema = z.unknown();

export const uploadProjectAvatarResponseSchema = z.union([
	uploadProjectAvatarStatus200Schema,
	uploadProjectAvatarStatus400Schema,
	uploadProjectAvatarStatus401Schema,
	uploadProjectAvatarStatus403Schema,
	uploadProjectAvatarStatus413Schema,
	uploadProjectAvatarStatus415Schema,
]);

export const updateStaticIpsPathIdOrNameSchema = z
	.string()
	.describe("The unique project identifier or the project name");

export const updateStaticIpsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const updateStaticIpsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const updateStaticIpsStatus200Schema = z.unknown();

export const updateStaticIpsStatus400Schema = z.unknown();

export const updateStaticIpsStatus401Schema = z.unknown();

export const updateStaticIpsStatus402Schema = z.unknown();

export const updateStaticIpsStatus403Schema = z.unknown();

export const updateStaticIpsStatus404Schema = z.unknown();

export const updateStaticIpsStatus409Schema = z.unknown();

export const updateStaticIpsStatus500Schema = z.unknown();

export const updateStaticIpsResponseSchema = z.union([
	updateStaticIpsStatus200Schema,
	updateStaticIpsStatus400Schema,
	updateStaticIpsStatus401Schema,
	updateStaticIpsStatus402Schema,
	updateStaticIpsStatus403Schema,
	updateStaticIpsStatus404Schema,
	updateStaticIpsStatus409Schema,
	updateStaticIpsStatus500Schema,
]);

export const createCustomEnvironmentPathIdOrNameSchema = z
	.string()
	.describe("The unique project identifier or the project name");

export const createCustomEnvironmentQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const createCustomEnvironmentQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const createCustomEnvironmentStatus201Schema = z.unknown();

export const createCustomEnvironmentStatus400Schema = z.unknown();

export const createCustomEnvironmentStatus401Schema = z.unknown();

export const createCustomEnvironmentStatus402Schema = z.unknown();

export const createCustomEnvironmentStatus403Schema = z.unknown();

export const createCustomEnvironmentStatus500Schema = z.unknown();

export const createCustomEnvironmentResponseSchema = z.union([
	createCustomEnvironmentStatus201Schema,
	createCustomEnvironmentStatus400Schema,
	createCustomEnvironmentStatus401Schema,
	createCustomEnvironmentStatus402Schema,
	createCustomEnvironmentStatus403Schema,
	createCustomEnvironmentStatus500Schema,
]);

export const getProjectsByIdOrNameCustomEnvironmentsPathIdOrNameSchema = z
	.string()
	.describe("The unique project identifier or the project name");

export const getProjectsByIdOrNameCustomEnvironmentsQueryGitBranchSchema = z
	.string()
	.optional()
	.describe("Fetch custom environments for a specific git branch");

export const getProjectsByIdOrNameCustomEnvironmentsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getProjectsByIdOrNameCustomEnvironmentsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getProjectsByIdOrNameCustomEnvironmentsStatus200Schema = z.unknown();

export const getProjectsByIdOrNameCustomEnvironmentsStatus400Schema = z.unknown();

export const getProjectsByIdOrNameCustomEnvironmentsStatus401Schema = z.unknown();

export const getProjectsByIdOrNameCustomEnvironmentsStatus403Schema = z.unknown();

export const getProjectsByIdOrNameCustomEnvironmentsResponseSchema = z.union([
	getProjectsByIdOrNameCustomEnvironmentsStatus200Schema,
	getProjectsByIdOrNameCustomEnvironmentsStatus400Schema,
	getProjectsByIdOrNameCustomEnvironmentsStatus401Schema,
	getProjectsByIdOrNameCustomEnvironmentsStatus403Schema,
]);

export const getCustomEnvironmentPathIdOrNameSchema = z
	.string()
	.describe("The unique project identifier or the project name");

export const getCustomEnvironmentPathEnvironmentSlugOrIdSchema = z
	.string()
	.describe("The unique custom environment identifier within the project");

export const getCustomEnvironmentQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getCustomEnvironmentQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getCustomEnvironmentStatus200Schema = z.unknown();

export const getCustomEnvironmentStatus400Schema = z.unknown();

export const getCustomEnvironmentStatus401Schema = z.unknown();

export const getCustomEnvironmentStatus403Schema = z.unknown();

export const getCustomEnvironmentStatus404Schema = z.unknown();

export const getCustomEnvironmentResponseSchema = z.union([
	getCustomEnvironmentStatus200Schema,
	getCustomEnvironmentStatus400Schema,
	getCustomEnvironmentStatus401Schema,
	getCustomEnvironmentStatus403Schema,
	getCustomEnvironmentStatus404Schema,
]);

export const updateCustomEnvironmentPathIdOrNameSchema = z
	.string()
	.describe("The unique project identifier or the project name");

export const updateCustomEnvironmentPathEnvironmentSlugOrIdSchema = z
	.string()
	.describe("The unique custom environment identifier within the project");

export const updateCustomEnvironmentQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const updateCustomEnvironmentQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const updateCustomEnvironmentStatus200Schema = z.unknown();

export const updateCustomEnvironmentStatus400Schema = z.unknown();

export const updateCustomEnvironmentStatus401Schema = z.unknown();

export const updateCustomEnvironmentStatus402Schema = z.unknown();

export const updateCustomEnvironmentStatus403Schema = z.unknown();

export const updateCustomEnvironmentStatus500Schema = z.unknown();

export const updateCustomEnvironmentResponseSchema = z.union([
	updateCustomEnvironmentStatus200Schema,
	updateCustomEnvironmentStatus400Schema,
	updateCustomEnvironmentStatus401Schema,
	updateCustomEnvironmentStatus402Schema,
	updateCustomEnvironmentStatus403Schema,
	updateCustomEnvironmentStatus500Schema,
]);

export const removeCustomEnvironmentPathIdOrNameSchema = z
	.string()
	.describe("The unique project identifier or the project name");

export const removeCustomEnvironmentPathEnvironmentSlugOrIdSchema = z
	.string()
	.describe("The unique custom environment identifier within the project");

export const removeCustomEnvironmentQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const removeCustomEnvironmentQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const removeCustomEnvironmentStatus200Schema = z.unknown();

export const removeCustomEnvironmentStatus400Schema = z.unknown();

export const removeCustomEnvironmentStatus401Schema = z.unknown();

export const removeCustomEnvironmentStatus403Schema = z.unknown();

export const removeCustomEnvironmentResponseSchema = z.union([
	removeCustomEnvironmentStatus200Schema,
	removeCustomEnvironmentStatus400Schema,
	removeCustomEnvironmentStatus401Schema,
	removeCustomEnvironmentStatus403Schema,
]);

export const getProjectDomainsPathIdOrNameSchema = z
	.string()
	.describe("The unique project identifier or the project name");

export const getProjectDomainsQueryProductionSchema = z
	.enum(["true", "false"])
	.optional()
	.default("false")
	.describe("Filters only production domains when set to `true`.");

export const getProjectDomainsQueryTargetSchema = z
	.enum(["production", "preview"])
	.optional()
	.describe('Filters on the target of the domain. Can be either "production", "preview"');

export const getProjectDomainsQueryCustomEnvironmentIdSchema = z
	.string()
	.optional()
	.describe("The unique custom environment identifier within the project");

export const getProjectDomainsQueryGitBranchSchema = z
	.string()
	.optional()
	.describe("Filters domains based on specific branch.");

export const getProjectDomainsQueryRedirectsSchema = z
	.enum(["true", "false"])
	.optional()
	.default("true")
	.describe(
		'Excludes redirect project domains when "false". Includes redirect project domains when "true" (default).',
	);

export const getProjectDomainsQueryRedirectSchema = z
	.string()
	.optional()
	.describe("Filters domains based on their redirect target.");

export const getProjectDomainsQueryVerifiedSchema = z
	.enum(["true", "false"])
	.optional()
	.describe("Filters domains based on their verification status.");

export const getProjectDomainsQueryLimitSchema = z
	.number()
	.optional()
	.describe("Maximum number of domains to list from a request (max 100).");

export const getProjectDomainsQuerySinceSchema = z
	.number()
	.optional()
	.describe("Get domains created after this JavaScript timestamp.");

export const getProjectDomainsQueryUntilSchema = z
	.number()
	.optional()
	.describe("Get domains created before this JavaScript timestamp.");

export const getProjectDomainsQueryOrderSchema = z
	.enum(["ASC", "DESC"])
	.optional()
	.default("DESC")
	.describe("Domains sort order by createdAt");

export const getProjectDomainsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getProjectDomainsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getProjectDomainsStatus200Schema = z.unknown();

export const getProjectDomainsStatus400Schema = z.unknown();

export const getProjectDomainsStatus401Schema = z.unknown();

export const getProjectDomainsStatus403Schema = z.unknown();

export const getProjectDomainsResponseSchema = z.union([
	getProjectDomainsStatus200Schema,
	getProjectDomainsStatus400Schema,
	getProjectDomainsStatus401Schema,
	getProjectDomainsStatus403Schema,
]);

export const getProjectDomainPathIdOrNameSchema = z
	.string()
	.describe("The unique project identifier or the project name");

export const getProjectDomainPathDomainSchema = z.string().describe("The project domain name");

export const getProjectDomainQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getProjectDomainQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getProjectDomainStatus200Schema = z.unknown();

export const getProjectDomainStatus400Schema = z.unknown();

export const getProjectDomainStatus401Schema = z.unknown();

export const getProjectDomainStatus403Schema = z.unknown();

export const getProjectDomainResponseSchema = z.union([
	getProjectDomainStatus200Schema,
	getProjectDomainStatus400Schema,
	getProjectDomainStatus401Schema,
	getProjectDomainStatus403Schema,
]);

export const updateProjectDomainPathIdOrNameSchema = z
	.string()
	.describe("The unique project identifier or the project name");

export const updateProjectDomainPathDomainSchema = z.string().describe("The project domain name");

export const updateProjectDomainQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const updateProjectDomainQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const updateProjectDomainStatus200Schema = z.unknown();

export const updateProjectDomainStatus400Schema = z.unknown();

export const updateProjectDomainStatus401Schema = z.unknown();

export const updateProjectDomainStatus403Schema = z.unknown();

export const updateProjectDomainStatus409Schema = z.unknown();

export const updateProjectDomainResponseSchema = z.union([
	updateProjectDomainStatus200Schema,
	updateProjectDomainStatus400Schema,
	updateProjectDomainStatus401Schema,
	updateProjectDomainStatus403Schema,
	updateProjectDomainStatus409Schema,
]);

export const removeProjectDomainPathIdOrNameSchema = z
	.string()
	.describe("The unique project identifier or the project name");

export const removeProjectDomainPathDomainSchema = z.string().describe("The project domain name");

export const removeProjectDomainQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const removeProjectDomainQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const removeProjectDomainStatus200Schema = z.unknown();

export const removeProjectDomainStatus400Schema = z.unknown();

export const removeProjectDomainStatus401Schema = z.unknown();

export const removeProjectDomainStatus403Schema = z.unknown();

export const removeProjectDomainStatus404Schema = z.unknown();

export const removeProjectDomainStatus409Schema = z.unknown();

export const removeProjectDomainResponseSchema = z.union([
	removeProjectDomainStatus200Schema,
	removeProjectDomainStatus400Schema,
	removeProjectDomainStatus401Schema,
	removeProjectDomainStatus403Schema,
	removeProjectDomainStatus404Schema,
	removeProjectDomainStatus409Schema,
]);

export const addProjectDomainPathIdOrNameSchema = z
	.string()
	.describe("The unique project identifier or the project name");

export const addProjectDomainQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const addProjectDomainQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const addProjectDomainStatus200Schema = z.unknown();

export const addProjectDomainStatus400Schema = z.unknown();

export const addProjectDomainStatus401Schema = z.unknown();

export const addProjectDomainStatus402Schema = z.unknown();

export const addProjectDomainStatus403Schema = z.unknown();

export const addProjectDomainStatus409Schema = z.unknown();

export const addProjectDomainResponseSchema = z.union([
	addProjectDomainStatus200Schema,
	addProjectDomainStatus400Schema,
	addProjectDomainStatus401Schema,
	addProjectDomainStatus402Schema,
	addProjectDomainStatus403Schema,
	addProjectDomainStatus409Schema,
]);

export const moveProjectDomainPathIdOrNameSchema = z
	.string()
	.describe("The unique project identifier or the project name");

export const moveProjectDomainPathDomainSchema = z.string().describe("The project domain name");

export const moveProjectDomainQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const moveProjectDomainQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const moveProjectDomainStatus200Schema = z.unknown();

export const moveProjectDomainStatus400Schema = z.unknown();

export const moveProjectDomainStatus401Schema = z.unknown();

export const moveProjectDomainStatus403Schema = z.unknown();

export const moveProjectDomainStatus409Schema = z.unknown();

export const moveProjectDomainResponseSchema = z.union([
	moveProjectDomainStatus200Schema,
	moveProjectDomainStatus400Schema,
	moveProjectDomainStatus401Schema,
	moveProjectDomainStatus403Schema,
	moveProjectDomainStatus409Schema,
]);

export const verifyProjectDomainPathIdOrNameSchema = z
	.string()
	.describe("The unique project identifier or the project name");

export const verifyProjectDomainPathDomainSchema = z
	.string()
	.describe("The domain name you want to verify");

export const verifyProjectDomainQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const verifyProjectDomainQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const verifyProjectDomainStatus200Schema = z.unknown();

export const verifyProjectDomainStatus400Schema = z.unknown();

export const verifyProjectDomainStatus401Schema = z.unknown();

export const verifyProjectDomainStatus403Schema = z.unknown();

export const verifyProjectDomainResponseSchema = z.union([
	verifyProjectDomainStatus200Schema,
	verifyProjectDomainStatus400Schema,
	verifyProjectDomainStatus401Schema,
	verifyProjectDomainStatus403Schema,
]);

export const filterProjectEnvsPathIdOrNameSchema = z
	.string()
	.describe("The unique project identifier or the project name");

export const filterProjectEnvsQueryGitBranchSchema = z
	.string()
	.max(250)
	.optional()
	.describe(
		"If defined, the git branch of the environment variable to filter the results (must have target=preview)",
	);

export const filterProjectEnvsQueryDecryptSchema = z
	.enum(["true", "false"])
	.optional()
	.describe("If true, the environment variable value will be decrypted");

export const filterProjectEnvsQuerySourceSchema = z
	.string()
	.optional()
	.describe("The source that is calling the endpoint.");

export const filterProjectEnvsQueryCustomEnvironmentIdSchema = z
	.string()
	.optional()
	.describe("The unique custom environment identifier within the project");

export const filterProjectEnvsQueryCustomEnvironmentSlugSchema = z
	.string()
	.optional()
	.describe("The custom environment slug (name) within the project");

export const filterProjectEnvsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const filterProjectEnvsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const filterProjectEnvsStatus200Schema = z.unknown();

export const filterProjectEnvsStatus400Schema = z.unknown();

export const filterProjectEnvsStatus401Schema = z.unknown();

export const filterProjectEnvsStatus403Schema = z.unknown();

export const filterProjectEnvsResponseSchema = z.union([
	filterProjectEnvsStatus200Schema,
	filterProjectEnvsStatus400Schema,
	filterProjectEnvsStatus401Schema,
	filterProjectEnvsStatus403Schema,
]);

export const createProjectEnvPathIdOrNameSchema = z
	.string()
	.describe("The unique project identifier or the project name");

export const createProjectEnvQueryUpsertSchema = z
	.string()
	.optional()
	.describe("Allow override of environment variable if it already exists");

export const createProjectEnvQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const createProjectEnvQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const createProjectEnvStatus201Schema = z.unknown();

export const createProjectEnvStatus400Schema = z.unknown();

export const createProjectEnvStatus401Schema = z.unknown();

export const createProjectEnvStatus402Schema = z.unknown();

export const createProjectEnvStatus403Schema = z.unknown();

export const createProjectEnvStatus404Schema = z.unknown();

export const createProjectEnvStatus409Schema = z.unknown();

export const createProjectEnvStatus429Schema = z.unknown();

export const createProjectEnvStatus500Schema = z.unknown();

export const createProjectEnvResponseSchema = z.union([
	createProjectEnvStatus201Schema,
	createProjectEnvStatus400Schema,
	createProjectEnvStatus401Schema,
	createProjectEnvStatus402Schema,
	createProjectEnvStatus403Schema,
	createProjectEnvStatus404Schema,
	createProjectEnvStatus409Schema,
	createProjectEnvStatus429Schema,
	createProjectEnvStatus500Schema,
]);

export const getProjectEnvPathIdOrNameSchema = z
	.string()
	.describe("The unique project identifier or the project name");

export const getProjectEnvPathIdSchema = z
	.string()
	.describe("The unique ID for the environment variable to get the decrypted value.");

export const getProjectEnvQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getProjectEnvQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getProjectEnvStatus200Schema = z.unknown();

export const getProjectEnvStatus400Schema = z.unknown();

export const getProjectEnvStatus401Schema = z.unknown();

export const getProjectEnvStatus403Schema = z.unknown();

export const getProjectEnvResponseSchema = z.union([
	getProjectEnvStatus200Schema,
	getProjectEnvStatus400Schema,
	getProjectEnvStatus401Schema,
	getProjectEnvStatus403Schema,
]);

export const removeProjectEnvPathIdOrNameSchema = z
	.string()
	.describe("The unique project identifier or the project name");

export const removeProjectEnvPathIdSchema = z
	.string()
	.describe("The unique environment variable identifier");

export const removeProjectEnvQueryCustomEnvironmentIdSchema = z
	.string()
	.optional()
	.describe("The unique custom environment identifier within the project");

export const removeProjectEnvQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const removeProjectEnvQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const removeProjectEnvStatus200Schema = z.unknown();

export const removeProjectEnvStatus400Schema = z.unknown();

export const removeProjectEnvStatus401Schema = z.unknown();

export const removeProjectEnvStatus403Schema = z.unknown();

export const removeProjectEnvStatus404Schema = z.unknown();

export const removeProjectEnvStatus409Schema = z.unknown();

export const removeProjectEnvResponseSchema = z.union([
	removeProjectEnvStatus200Schema,
	removeProjectEnvStatus400Schema,
	removeProjectEnvStatus401Schema,
	removeProjectEnvStatus403Schema,
	removeProjectEnvStatus404Schema,
	removeProjectEnvStatus409Schema,
]);

export const editProjectEnvPathIdOrNameSchema = z
	.string()
	.describe("The unique project identifier or the project name");

export const editProjectEnvPathIdSchema = z
	.string()
	.describe("The unique environment variable identifier");

export const editProjectEnvQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const editProjectEnvQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const editProjectEnvStatus200Schema = z.unknown();

export const editProjectEnvStatus400Schema = z.unknown();

export const editProjectEnvStatus401Schema = z.unknown();

export const editProjectEnvStatus403Schema = z.unknown();

export const editProjectEnvStatus404Schema = z.unknown();

export const editProjectEnvStatus409Schema = z.unknown();

export const editProjectEnvStatus429Schema = z.unknown();

export const editProjectEnvStatus500Schema = z.unknown();

export const editProjectEnvResponseSchema = z.union([
	editProjectEnvStatus200Schema,
	editProjectEnvStatus400Schema,
	editProjectEnvStatus401Schema,
	editProjectEnvStatus403Schema,
	editProjectEnvStatus404Schema,
	editProjectEnvStatus409Schema,
	editProjectEnvStatus429Schema,
	editProjectEnvStatus500Schema,
]);

export const batchRemoveProjectEnvPathIdOrNameSchema = z
	.string()
	.describe("The unique project identifier or the project name");

export const batchRemoveProjectEnvQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const batchRemoveProjectEnvQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const batchRemoveProjectEnvStatus200Schema = z.unknown();

export const batchRemoveProjectEnvStatus400Schema = z.unknown();

export const batchRemoveProjectEnvStatus401Schema = z.unknown();

export const batchRemoveProjectEnvStatus403Schema = z.unknown();

export const batchRemoveProjectEnvStatus404Schema = z.unknown();

export const batchRemoveProjectEnvStatus409Schema = z.unknown();

export const batchRemoveProjectEnvResponseSchema = z.union([
	batchRemoveProjectEnvStatus200Schema,
	batchRemoveProjectEnvStatus400Schema,
	batchRemoveProjectEnvStatus401Schema,
	batchRemoveProjectEnvStatus403Schema,
	batchRemoveProjectEnvStatus404Schema,
	batchRemoveProjectEnvStatus409Schema,
]);

export const getRollingReleaseBillingStatusPathIdOrNameSchema = z
	.string()
	.describe("Project ID or project name (URL-encoded)");

export const getRollingReleaseBillingStatusQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getRollingReleaseBillingStatusQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getRollingReleaseBillingStatusStatus200Schema = z.unknown();

export const getRollingReleaseBillingStatusStatus400Schema = z.unknown();

export const getRollingReleaseBillingStatusStatus401Schema = z.unknown();

export const getRollingReleaseBillingStatusStatus403Schema = z.unknown();

export const getRollingReleaseBillingStatusStatus404Schema = z.unknown();

export const getRollingReleaseBillingStatusResponseSchema = z.union([
	getRollingReleaseBillingStatusStatus200Schema,
	getRollingReleaseBillingStatusStatus400Schema,
	getRollingReleaseBillingStatusStatus401Schema,
	getRollingReleaseBillingStatusStatus403Schema,
	getRollingReleaseBillingStatusStatus404Schema,
]);

export const getRollingReleaseConfigPathIdOrNameSchema = z
	.string()
	.describe("Project ID or project name (URL-encoded)");

export const getRollingReleaseConfigQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getRollingReleaseConfigQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getRollingReleaseConfigStatus200Schema = z.unknown();

export const getRollingReleaseConfigStatus400Schema = z.unknown();

export const getRollingReleaseConfigStatus401Schema = z.unknown();

export const getRollingReleaseConfigStatus403Schema = z.unknown();

export const getRollingReleaseConfigStatus404Schema = z.unknown();

export const getRollingReleaseConfigResponseSchema = z.union([
	getRollingReleaseConfigStatus200Schema,
	getRollingReleaseConfigStatus400Schema,
	getRollingReleaseConfigStatus401Schema,
	getRollingReleaseConfigStatus403Schema,
	getRollingReleaseConfigStatus404Schema,
]);

export const deleteRollingReleaseConfigPathIdOrNameSchema = z
	.string()
	.describe("Project ID or project name (URL-encoded)");

export const deleteRollingReleaseConfigQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const deleteRollingReleaseConfigQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const deleteRollingReleaseConfigStatus200Schema = z.unknown();

export const deleteRollingReleaseConfigStatus400Schema = z.unknown();

export const deleteRollingReleaseConfigStatus401Schema = z.unknown();

export const deleteRollingReleaseConfigStatus403Schema = z.unknown();

export const deleteRollingReleaseConfigStatus404Schema = z.unknown();

export const deleteRollingReleaseConfigResponseSchema = z.union([
	deleteRollingReleaseConfigStatus200Schema,
	deleteRollingReleaseConfigStatus400Schema,
	deleteRollingReleaseConfigStatus401Schema,
	deleteRollingReleaseConfigStatus403Schema,
	deleteRollingReleaseConfigStatus404Schema,
]);

export const updateRollingReleaseConfigPathIdOrNameSchema = z
	.string()
	.describe("Project ID or project name (URL-encoded)");

export const updateRollingReleaseConfigQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const updateRollingReleaseConfigQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const updateRollingReleaseConfigStatus200Schema = z.unknown();

export const updateRollingReleaseConfigStatus400Schema = z.unknown();

export const updateRollingReleaseConfigStatus401Schema = z.unknown();

export const updateRollingReleaseConfigStatus403Schema = z.unknown();

export const updateRollingReleaseConfigStatus404Schema = z.unknown();

export const updateRollingReleaseConfigResponseSchema = z.union([
	updateRollingReleaseConfigStatus200Schema,
	updateRollingReleaseConfigStatus400Schema,
	updateRollingReleaseConfigStatus401Schema,
	updateRollingReleaseConfigStatus403Schema,
	updateRollingReleaseConfigStatus404Schema,
]);

export const getRollingReleasePathIdOrNameSchema = z
	.string()
	.describe("Project ID or project name (URL-encoded)");

export const getRollingReleaseQueryStateSchema = z
	.enum(["ACTIVE", "COMPLETE", "ABORTED"])
	.optional()
	.describe("Filter by rolling release state");

export const getRollingReleaseQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getRollingReleaseQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getRollingReleaseStatus200Schema = z.unknown();

export const getRollingReleaseStatus400Schema = z.unknown();

export const getRollingReleaseStatus401Schema = z.unknown();

export const getRollingReleaseStatus403Schema = z.unknown();

export const getRollingReleaseStatus404Schema = z.unknown();

export const getRollingReleaseResponseSchema = z.union([
	getRollingReleaseStatus200Schema,
	getRollingReleaseStatus400Schema,
	getRollingReleaseStatus401Schema,
	getRollingReleaseStatus403Schema,
	getRollingReleaseStatus404Schema,
]);

export const approveRollingReleaseStagePathIdOrNameSchema = z
	.string()
	.describe("Project ID or project name (URL-encoded)");

export const approveRollingReleaseStageQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const approveRollingReleaseStageQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const approveRollingReleaseStageStatus200Schema = z.unknown();

export const approveRollingReleaseStageStatus400Schema = z.unknown();

export const approveRollingReleaseStageStatus401Schema = z.unknown();

export const approveRollingReleaseStageStatus403Schema = z.unknown();

export const approveRollingReleaseStageStatus404Schema = z.unknown();

export const approveRollingReleaseStageStatus500Schema = z.unknown();

export const approveRollingReleaseStageResponseSchema = z.union([
	approveRollingReleaseStageStatus200Schema,
	approveRollingReleaseStageStatus400Schema,
	approveRollingReleaseStageStatus401Schema,
	approveRollingReleaseStageStatus403Schema,
	approveRollingReleaseStageStatus404Schema,
	approveRollingReleaseStageStatus500Schema,
]);

export const completeRollingReleasePathIdOrNameSchema = z
	.string()
	.describe("Project ID or project name (URL-encoded)");

export const completeRollingReleaseQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const completeRollingReleaseQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const completeRollingReleaseStatus200Schema = z.unknown();

export const completeRollingReleaseStatus400Schema = z.unknown();

export const completeRollingReleaseStatus401Schema = z.unknown();

export const completeRollingReleaseStatus403Schema = z.unknown();

export const completeRollingReleaseStatus404Schema = z.unknown();

export const completeRollingReleaseResponseSchema = z.union([
	completeRollingReleaseStatus200Schema,
	completeRollingReleaseStatus400Schema,
	completeRollingReleaseStatus401Schema,
	completeRollingReleaseStatus403Schema,
	completeRollingReleaseStatus404Schema,
]);

export const createProjectTransferRequestPathIdOrNameSchema = z
	.string()
	.describe("The ID or name of the project to transfer.");

export const createProjectTransferRequestQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const createProjectTransferRequestQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const createProjectTransferRequestStatus200Schema = z.unknown();

export const createProjectTransferRequestStatus400Schema = z.unknown();

export const createProjectTransferRequestStatus401Schema = z.unknown();

export const createProjectTransferRequestStatus403Schema = z.unknown();

export const createProjectTransferRequestResponseSchema = z.union([
	createProjectTransferRequestStatus200Schema,
	createProjectTransferRequestStatus400Schema,
	createProjectTransferRequestStatus401Schema,
	createProjectTransferRequestStatus403Schema,
]);

export const acceptProjectTransferRequestPathCodeSchema = z
	.string()
	.describe("The code of the project transfer request.");

export const acceptProjectTransferRequestQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const acceptProjectTransferRequestQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const acceptProjectTransferRequestStatus202Schema = z.unknown();

export const acceptProjectTransferRequestStatus400Schema = z.unknown();

export const acceptProjectTransferRequestStatus401Schema = z.unknown();

export const acceptProjectTransferRequestStatus403Schema = z.unknown();

export const acceptProjectTransferRequestStatus404Schema = z.unknown();

export const acceptProjectTransferRequestStatus422Schema = z.unknown();

export const acceptProjectTransferRequestResponseSchema = z.union([
	acceptProjectTransferRequestStatus202Schema,
	acceptProjectTransferRequestStatus400Schema,
	acceptProjectTransferRequestStatus401Schema,
	acceptProjectTransferRequestStatus403Schema,
	acceptProjectTransferRequestStatus404Schema,
	acceptProjectTransferRequestStatus422Schema,
]);

export const updateProjectProtectionBypassPathIdOrNameSchema = z
	.string()
	.describe("The unique project identifier or the project name");

export const updateProjectProtectionBypassQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const updateProjectProtectionBypassQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const updateProjectProtectionBypassStatus200Schema = z.unknown();

export const updateProjectProtectionBypassStatus400Schema = z.unknown();

export const updateProjectProtectionBypassStatus401Schema = z.unknown();

export const updateProjectProtectionBypassStatus403Schema = z.unknown();

export const updateProjectProtectionBypassStatus404Schema = z.unknown();

export const updateProjectProtectionBypassStatus409Schema = z.unknown();

export const updateProjectProtectionBypassResponseSchema = z.union([
	updateProjectProtectionBypassStatus200Schema,
	updateProjectProtectionBypassStatus400Schema,
	updateProjectProtectionBypassStatus401Schema,
	updateProjectProtectionBypassStatus403Schema,
	updateProjectProtectionBypassStatus404Schema,
	updateProjectProtectionBypassStatus409Schema,
]);

export const requestRollbackPathProjectIdSchema = z.string();

export const requestRollbackPathDeploymentIdSchema = z
	.string()
	.describe("The ID of the deployment to rollback *to*");

export const requestRollbackQueryDescriptionSchema = z
	.string()
	.optional()
	.describe("The reason for the rollback");

export const requestRollbackQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const requestRollbackQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const requestRollbackStatus201Schema = z.unknown();

export const requestRollbackStatus400Schema = z.unknown();

export const requestRollbackStatus401Schema = z.unknown();

export const requestRollbackStatus402Schema = z.unknown();

export const requestRollbackStatus403Schema = z.unknown();

export const requestRollbackStatus409Schema = z.unknown();

export const requestRollbackStatus422Schema = z.unknown();

export const requestRollbackResponseSchema = z.union([
	requestRollbackStatus201Schema,
	requestRollbackStatus400Schema,
	requestRollbackStatus401Schema,
	requestRollbackStatus402Schema,
	requestRollbackStatus403Schema,
	requestRollbackStatus409Schema,
	requestRollbackStatus422Schema,
]);

export const updateProjectsByProjectIdRollbackByDeploymentIdUpdateDescriptionPathProjectIdSchema =
	z.string();

export const updateProjectsByProjectIdRollbackByDeploymentIdUpdateDescriptionPathDeploymentIdSchema =
	z.string();

export const updateProjectsByProjectIdRollbackByDeploymentIdUpdateDescriptionStatus200Schema =
	z.unknown();

export const updateProjectsByProjectIdRollbackByDeploymentIdUpdateDescriptionStatus400Schema =
	z.unknown();

export const updateProjectsByProjectIdRollbackByDeploymentIdUpdateDescriptionStatus401Schema =
	z.unknown();

export const updateProjectsByProjectIdRollbackByDeploymentIdUpdateDescriptionStatus403Schema =
	z.unknown();

export const updateProjectsByProjectIdRollbackByDeploymentIdUpdateDescriptionStatus409Schema =
	z.unknown();

export const updateProjectsByProjectIdRollbackByDeploymentIdUpdateDescriptionStatus422Schema =
	z.unknown();

export const updateProjectsByProjectIdRollbackByDeploymentIdUpdateDescriptionResponseSchema =
	z.union([
		updateProjectsByProjectIdRollbackByDeploymentIdUpdateDescriptionStatus200Schema,
		updateProjectsByProjectIdRollbackByDeploymentIdUpdateDescriptionStatus400Schema,
		updateProjectsByProjectIdRollbackByDeploymentIdUpdateDescriptionStatus401Schema,
		updateProjectsByProjectIdRollbackByDeploymentIdUpdateDescriptionStatus403Schema,
		updateProjectsByProjectIdRollbackByDeploymentIdUpdateDescriptionStatus409Schema,
		updateProjectsByProjectIdRollbackByDeploymentIdUpdateDescriptionStatus422Schema,
	]);

export const updateMicrofrontendsPathProjectIdSchema = z
	.string()
	.describe("The unique project identifier");

export const updateMicrofrontendsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const updateMicrofrontendsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const updateMicrofrontendsStatus200Schema = z.unknown();

export const updateMicrofrontendsStatus400Schema = z.unknown();

export const updateMicrofrontendsStatus401Schema = z.unknown();

export const updateMicrofrontendsStatus403Schema = z.unknown();

export const updateMicrofrontendsStatus409Schema = z.unknown();

export const updateMicrofrontendsStatus500Schema = z.unknown();

export const updateMicrofrontendsResponseSchema = z.union([
	updateMicrofrontendsStatus200Schema,
	updateMicrofrontendsStatus400Schema,
	updateMicrofrontendsStatus401Schema,
	updateMicrofrontendsStatus403Schema,
	updateMicrofrontendsStatus409Schema,
	updateMicrofrontendsStatus500Schema,
]);

export const requestPromotePathProjectIdSchema = z.string();

export const requestPromotePathDeploymentIdSchema = z.string();

export const requestPromoteQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const requestPromoteQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const requestPromoteStatus201Schema = z.unknown();

export const requestPromoteStatus202Schema = z.unknown();

export const requestPromoteStatus400Schema = z.unknown();

export const requestPromoteStatus401Schema = z.unknown();

export const requestPromoteStatus403Schema = z.unknown();

export const requestPromoteStatus409Schema = z.unknown();

export const requestPromoteResponseSchema = z.union([
	requestPromoteStatus201Schema,
	requestPromoteStatus202Schema,
	requestPromoteStatus400Schema,
	requestPromoteStatus401Schema,
	requestPromoteStatus403Schema,
	requestPromoteStatus409Schema,
]);

export const listPromoteAliasesPathProjectIdSchema = z.string();

export const listPromoteAliasesQueryLimitSchema = z
	.number()
	.max(100)
	.optional()
	.describe("Maximum number of aliases to list from a request (max 100).");

export const listPromoteAliasesQuerySinceSchema = z
	.number()
	.optional()
	.describe("Get aliases created after this epoch timestamp.");

export const listPromoteAliasesQueryUntilSchema = z
	.number()
	.optional()
	.describe("Get aliases created before this epoch timestamp.");

export const listPromoteAliasesQueryFailedOnlySchema = z
	.boolean()
	.optional()
	.describe("Filter results down to aliases that failed to map to the requested deployment");

export const listPromoteAliasesQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const listPromoteAliasesQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const listPromoteAliasesStatus200Schema = z.unknown();

export const listPromoteAliasesStatus400Schema = z.unknown();

export const listPromoteAliasesStatus401Schema = z.unknown();

export const listPromoteAliasesStatus403Schema = z.unknown();

export const listPromoteAliasesStatus404Schema = z.unknown();

export const listPromoteAliasesResponseSchema = z.union([
	listPromoteAliasesStatus200Schema,
	listPromoteAliasesStatus400Schema,
	listPromoteAliasesStatus401Schema,
	listPromoteAliasesStatus403Schema,
	listPromoteAliasesStatus404Schema,
]);

export const pauseProjectPathProjectIdSchema = z.string().describe("The unique project identifier");

export const pauseProjectQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const pauseProjectQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const pauseProjectStatus200Schema = z.unknown();

export const pauseProjectStatus400Schema = z.unknown();

export const pauseProjectStatus401Schema = z.unknown();

export const pauseProjectStatus403Schema = z.unknown();

export const pauseProjectStatus500Schema = z.unknown();

export const pauseProjectResponseSchema = z.union([
	pauseProjectStatus200Schema,
	pauseProjectStatus400Schema,
	pauseProjectStatus401Schema,
	pauseProjectStatus403Schema,
	pauseProjectStatus500Schema,
]);

export const unpauseProjectPathProjectIdSchema = z
	.string()
	.describe("The unique project identifier");

export const unpauseProjectQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const unpauseProjectQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const unpauseProjectStatus200Schema = z.unknown();

export const unpauseProjectStatus400Schema = z.unknown();

export const unpauseProjectStatus401Schema = z.unknown();

export const unpauseProjectStatus403Schema = z.unknown();

export const unpauseProjectStatus500Schema = z.unknown();

export const unpauseProjectResponseSchema = z.union([
	unpauseProjectStatus200Schema,
	unpauseProjectStatus400Schema,
	unpauseProjectStatus401Schema,
	unpauseProjectStatus403Schema,
	unpauseProjectStatus500Schema,
]);

export const listSandboxesQueryProjectSchema = z
	.string()
	.optional()
	.describe("The unique identifier or name of the project to list named sandboxes for.");

export const listSandboxesQueryLimitSchema = z
	.number()
	.min(1)
	.max(50)
	.optional()
	.default(20)
	.describe("Maximum number of named sandboxes to return in the response. Used for pagination.");

export const listSandboxesQuerySortBySchema = z
	.enum(["createdAt", "name", "statusUpdatedAt", "currentSnapshotId"])
	.optional()
	.default("createdAt")
	.describe("Field to sort by.");

export const listSandboxesQueryNamePrefixSchema = z
	.string()
	.optional()
	.describe(
		"Filter named sandboxes whose name starts with this prefix. Only valid when sortBy=name.",
	);

export const listSandboxesQueryCursorSchema = z
	.string()
	.optional()
	.describe("Opaque pagination cursor from a previous response.");

export const listSandboxesQuerySortOrderSchema = z
	.enum(["asc", "desc"])
	.optional()
	.default("desc")
	.describe("Sort direction. Defaults to desc.");

export const listSandboxesQueryTagsSchema = z
	.union([z.string(), z.array(z.string())])
	.optional()
	.describe(
		'Filter sandboxes by tag. Format: \\"key:value\\". Only one tag filter is supported at a time.',
	);

export const listSandboxesQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const listSandboxesQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const listSandboxesStatus200Schema = z.unknown();

export const listSandboxesStatus400Schema = z.unknown();

export const listSandboxesStatus401Schema = z.unknown();

export const listSandboxesStatus403Schema = z.unknown();

export const listSandboxesStatus404Schema = z.unknown();

export const listSandboxesStatus429Schema = z.unknown();

export const listSandboxesResponseSchema = z.union([
	listSandboxesStatus200Schema,
	listSandboxesStatus400Schema,
	listSandboxesStatus401Schema,
	listSandboxesStatus403Schema,
	listSandboxesStatus404Schema,
	listSandboxesStatus429Schema,
]);

export const createSandboxesQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const createSandboxesQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const createSandboxesStatus200Schema = z.unknown();

export const createSandboxesStatus400Schema = z.unknown();

export const createSandboxesStatus401Schema = z.unknown();

export const createSandboxesStatus402Schema = z.unknown();

export const createSandboxesStatus403Schema = z.unknown();

export const createSandboxesStatus404Schema = z.unknown();

export const createSandboxesStatus409Schema = z.unknown();

export const createSandboxesStatus410Schema = z.unknown();

export const createSandboxesStatus422Schema = z.unknown();

export const createSandboxesStatus429Schema = z.unknown();

export const createSandboxesStatus500Schema = z.unknown();

export const createSandboxesResponseSchema = z.union([
	createSandboxesStatus200Schema,
	createSandboxesStatus400Schema,
	createSandboxesStatus401Schema,
	createSandboxesStatus402Schema,
	createSandboxesStatus403Schema,
	createSandboxesStatus404Schema,
	createSandboxesStatus409Schema,
	createSandboxesStatus410Schema,
	createSandboxesStatus422Schema,
	createSandboxesStatus429Schema,
	createSandboxesStatus500Schema,
]);

export const listDrivesQueryProjectIdSchema = z
	.string()
	.optional()
	.describe(
		"The project ID or name associated with the drives. Required unless using a Vercel OIDC token scoped to a project.",
	);

export const listDrivesQueryLimitSchema = z
	.number()
	.min(1)
	.max(50)
	.optional()
	.default(20)
	.describe("Maximum number of drives to return in the response. Used for pagination.");

export const listDrivesQueryCursorSchema = z
	.string()
	.optional()
	.describe("Opaque pagination cursor from a previous response.");

export const listDrivesQuerySortBySchema = z
	.enum(["createdAt", "updatedAt", "name"])
	.optional()
	.default("createdAt")
	.describe("Field to sort drives by.");

export const listDrivesQueryNamePrefixSchema = z
	.string()
	.optional()
	.describe("Filter drives whose name starts with this prefix. Only valid when sortBy=name.");

export const listDrivesQuerySortOrderSchema = z
	.enum(["asc", "desc"])
	.optional()
	.default("desc")
	.describe("Sort direction for results.");

export const listDrivesQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const listDrivesQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const listDrivesStatus200Schema = z.unknown();

export const listDrivesStatus400Schema = z.unknown();

export const listDrivesStatus401Schema = z.unknown();

export const listDrivesStatus402Schema = z.unknown();

export const listDrivesStatus403Schema = z.unknown();

export const listDrivesStatus404Schema = z.unknown();

export const listDrivesStatus429Schema = z.unknown();

export const listDrivesResponseSchema = z.union([
	listDrivesStatus200Schema,
	listDrivesStatus400Schema,
	listDrivesStatus401Schema,
	listDrivesStatus402Schema,
	listDrivesStatus403Schema,
	listDrivesStatus404Schema,
	listDrivesStatus429Schema,
]);

export const getOrCreateDrivePathNameSchema = z
	.string()
	.max(64)
	.regex(/^[a-zA-Z0-9_-]+$/)
	.describe(
		"Name for the drive. Must be unique per project and URL-safe (alphanumeric, hyphens, underscores).",
	);

export const getOrCreateDriveQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getOrCreateDriveQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getOrCreateDriveStatus200Schema = z.unknown();

export const getOrCreateDriveStatus201Schema = z.unknown();

export const getOrCreateDriveStatus400Schema = z.unknown();

export const getOrCreateDriveStatus401Schema = z.unknown();

export const getOrCreateDriveStatus402Schema = z.unknown();

export const getOrCreateDriveStatus403Schema = z.unknown();

export const getOrCreateDriveStatus404Schema = z.unknown();

export const getOrCreateDriveStatus409Schema = z.unknown();

export const getOrCreateDriveStatus429Schema = z.unknown();

export const getOrCreateDriveResponseSchema = z.union([
	getOrCreateDriveStatus200Schema,
	getOrCreateDriveStatus201Schema,
	getOrCreateDriveStatus400Schema,
	getOrCreateDriveStatus401Schema,
	getOrCreateDriveStatus402Schema,
	getOrCreateDriveStatus403Schema,
	getOrCreateDriveStatus404Schema,
	getOrCreateDriveStatus409Schema,
	getOrCreateDriveStatus429Schema,
]);

export const deleteDrivePathNameSchema = z
	.string()
	.max(64)
	.regex(/^[a-zA-Z0-9_-]+$/)
	.describe(
		"Name for the drive. Must be unique per project and URL-safe (alphanumeric, hyphens, underscores).",
	);

export const deleteDriveQueryProjectIdSchema = z
	.string()
	.optional()
	.describe(
		"The project ID or name associated with the drive. Required unless using a Vercel OIDC token scoped to a project.",
	);

export const deleteDriveQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const deleteDriveQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const deleteDriveStatus200Schema = z.unknown();

export const deleteDriveStatus400Schema = z.unknown();

export const deleteDriveStatus401Schema = z.unknown();

export const deleteDriveStatus402Schema = z.unknown();

export const deleteDriveStatus403Schema = z.unknown();

export const deleteDriveStatus404Schema = z.unknown();

export const deleteDriveStatus409Schema = z.unknown();

export const deleteDriveStatus429Schema = z.unknown();

export const deleteDriveResponseSchema = z.union([
	deleteDriveStatus200Schema,
	deleteDriveStatus400Schema,
	deleteDriveStatus401Schema,
	deleteDriveStatus402Schema,
	deleteDriveStatus403Schema,
	deleteDriveStatus404Schema,
	deleteDriveStatus409Schema,
	deleteDriveStatus429Schema,
]);

export const listSessionSnapshotsQueryProjectSchema = z
	.string()
	.optional()
	.describe("The unique identifier or name of the project to list snapshots for.");

export const listSessionSnapshotsQueryNameSchema = z
	.string()
	.max(128)
	.regex(/^[a-zA-Z0-9_-]+$/)
	.optional()
	.describe(
		"Name for the sandbox. Must be unique per project and URL-safe (alphanumeric, hyphens, underscores).",
	);

export const listSessionSnapshotsQueryLimitSchema = z
	.number()
	.min(1)
	.max(50)
	.optional()
	.default(20)
	.describe("Maximum number of snapshots to return in the response. Used for pagination.");

export const listSessionSnapshotsQueryCursorSchema = z
	.string()
	.optional()
	.describe("Opaque pagination cursor from a previous response.");

export const listSessionSnapshotsQuerySortOrderSchema = z
	.enum(["asc", "desc"])
	.optional()
	.default("desc")
	.describe("Sort direction for results by creation time.");

export const listSessionSnapshotsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const listSessionSnapshotsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const listSessionSnapshotsStatus200Schema = z.unknown();

export const listSessionSnapshotsStatus400Schema = z.unknown();

export const listSessionSnapshotsStatus401Schema = z.unknown();

export const listSessionSnapshotsStatus403Schema = z.unknown();

export const listSessionSnapshotsStatus404Schema = z.unknown();

export const listSessionSnapshotsStatus429Schema = z.unknown();

export const listSessionSnapshotsResponseSchema = z.union([
	listSessionSnapshotsStatus200Schema,
	listSessionSnapshotsStatus400Schema,
	listSessionSnapshotsStatus401Schema,
	listSessionSnapshotsStatus403Schema,
	listSessionSnapshotsStatus404Schema,
	listSessionSnapshotsStatus429Schema,
]);

export const getSessionSnapshotPathSnapshotIdSchema = z
	.string()
	.describe("The unique identifier of the snapshot to retrieve.");

export const getSessionSnapshotQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getSessionSnapshotQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getSessionSnapshotStatus200Schema = z.unknown();

export const getSessionSnapshotStatus400Schema = z.unknown();

export const getSessionSnapshotStatus401Schema = z.unknown();

export const getSessionSnapshotStatus403Schema = z.unknown();

export const getSessionSnapshotStatus404Schema = z.unknown();

export const getSessionSnapshotStatus429Schema = z.unknown();

export const getSessionSnapshotResponseSchema = z.union([
	getSessionSnapshotStatus200Schema,
	getSessionSnapshotStatus400Schema,
	getSessionSnapshotStatus401Schema,
	getSessionSnapshotStatus403Schema,
	getSessionSnapshotStatus404Schema,
	getSessionSnapshotStatus429Schema,
]);

export const deleteSessionSnapshotPathSnapshotIdSchema = z
	.string()
	.describe("The unique identifier of the snapshot to delete.");

export const deleteSessionSnapshotQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const deleteSessionSnapshotQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const deleteSessionSnapshotStatus200Schema = z.unknown();

export const deleteSessionSnapshotStatus400Schema = z.unknown();

export const deleteSessionSnapshotStatus401Schema = z.unknown();

export const deleteSessionSnapshotStatus403Schema = z.unknown();

export const deleteSessionSnapshotStatus404Schema = z.unknown();

export const deleteSessionSnapshotStatus429Schema = z.unknown();

export const deleteSessionSnapshotResponseSchema = z.union([
	deleteSessionSnapshotStatus200Schema,
	deleteSessionSnapshotStatus400Schema,
	deleteSessionSnapshotStatus401Schema,
	deleteSessionSnapshotStatus403Schema,
	deleteSessionSnapshotStatus404Schema,
	deleteSessionSnapshotStatus429Schema,
]);

export const listSessionsQueryProjectSchema = z
	.string()
	.optional()
	.describe("The unique identifier or name of the project to list sessions for.");

export const listSessionsQueryNameSchema = z
	.string()
	.max(128)
	.regex(/^[a-zA-Z0-9_-]+$/)
	.optional()
	.describe(
		"Filter sessions by sandbox name. Only sessions belonging to the specified sandbox are returned.",
	);

export const listSessionsQueryLimitSchema = z
	.number()
	.min(1)
	.max(50)
	.optional()
	.default(20)
	.describe("Maximum number of sessions to return in the response. Used for pagination.");

export const listSessionsQueryCursorSchema = z
	.string()
	.optional()
	.describe("Opaque pagination cursor from a previous response.");

export const listSessionsQuerySortOrderSchema = z
	.enum(["asc", "desc"])
	.optional()
	.default("desc")
	.describe("Sort direction for results by creation time.");

export const listSessionsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const listSessionsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const listSessionsStatus200Schema = z.unknown();

export const listSessionsStatus400Schema = z.unknown();

export const listSessionsStatus401Schema = z.unknown();

export const listSessionsStatus403Schema = z.unknown();

export const listSessionsStatus404Schema = z.unknown();

export const listSessionsStatus429Schema = z.unknown();

export const listSessionsStatus500Schema = z.unknown();

export const listSessionsResponseSchema = z.union([
	listSessionsStatus200Schema,
	listSessionsStatus400Schema,
	listSessionsStatus401Schema,
	listSessionsStatus403Schema,
	listSessionsStatus404Schema,
	listSessionsStatus429Schema,
	listSessionsStatus500Schema,
]);

export const getSessionPathSessionIdSchema = z
	.string()
	.describe("The unique identifier of the session to retrieve.");

export const getSessionQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getSessionQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getSessionStatus200Schema = z.unknown();

export const getSessionStatus400Schema = z.unknown();

export const getSessionStatus401Schema = z.unknown();

export const getSessionStatus403Schema = z.unknown();

export const getSessionStatus404Schema = z.unknown();

export const getSessionStatus429Schema = z.unknown();

export const getSessionStatus500Schema = z.unknown();

export const getSessionResponseSchema = z.union([
	getSessionStatus200Schema,
	getSessionStatus400Schema,
	getSessionStatus401Schema,
	getSessionStatus403Schema,
	getSessionStatus404Schema,
	getSessionStatus429Schema,
	getSessionStatus500Schema,
]);

export const getNamedSandboxPathNameSchema = z
	.string()
	.max(128)
	.regex(/^[a-zA-Z0-9_-]+$/)
	.describe(
		"Name for the sandbox. Must be unique per project and URL-safe (alphanumeric, hyphens, underscores).",
	);

export const getNamedSandboxQueryProjectIdSchema = z
	.string()
	.optional()
	.describe("The project ID or name (required when not using OIDC token).");

export const getNamedSandboxQueryResumeSchema = z
	.boolean()
	.optional()
	.default(false)
	.describe(
		"Whether to automatically resume a stopped named sandbox by creating a new instance from its snapshot. Defaults to false.",
	);

export const getNamedSandboxQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getNamedSandboxQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getNamedSandboxStatus200Schema = z.unknown();

export const getNamedSandboxStatus400Schema = z.unknown();

export const getNamedSandboxStatus401Schema = z.unknown();

export const getNamedSandboxStatus402Schema = z.unknown();

export const getNamedSandboxStatus403Schema = z.unknown();

export const getNamedSandboxStatus404Schema = z.unknown();

export const getNamedSandboxStatus409Schema = z.unknown();

export const getNamedSandboxStatus410Schema = z.unknown();

export const getNamedSandboxStatus429Schema = z.unknown();

export const getNamedSandboxStatus500Schema = z.unknown();

export const getNamedSandboxResponseSchema = z.union([
	getNamedSandboxStatus200Schema,
	getNamedSandboxStatus400Schema,
	getNamedSandboxStatus401Schema,
	getNamedSandboxStatus402Schema,
	getNamedSandboxStatus403Schema,
	getNamedSandboxStatus404Schema,
	getNamedSandboxStatus409Schema,
	getNamedSandboxStatus410Schema,
	getNamedSandboxStatus429Schema,
	getNamedSandboxStatus500Schema,
]);

export const updateSandboxPathNameSchema = z
	.string()
	.max(128)
	.regex(/^[a-zA-Z0-9_-]+$/)
	.describe("The sandbox to update.");

export const updateSandboxQueryProjectIdSchema = z
	.string()
	.max(128)
	.optional()
	.describe(
		"The project ID that owns the named sandbox. When provided, takes precedence over OIDC project context.",
	);

export const updateSandboxQueryResumeSchema = z
	.boolean()
	.optional()
	.default(false)
	.describe(
		"Whether to automatically resume a stopped named sandbox by creating a new instance from its snapshot. Defaults to false.",
	);

export const updateSandboxQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const updateSandboxQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const updateSandboxStatus200Schema = z.unknown();

export const updateSandboxStatus400Schema = z.unknown();

export const updateSandboxStatus401Schema = z.unknown();

export const updateSandboxStatus402Schema = z.unknown();

export const updateSandboxStatus403Schema = z.unknown();

export const updateSandboxStatus404Schema = z.unknown();

export const updateSandboxStatus409Schema = z.unknown();

export const updateSandboxStatus410Schema = z.unknown();

export const updateSandboxStatus422Schema = z.unknown();

export const updateSandboxStatus429Schema = z.unknown();

export const updateSandboxStatus500Schema = z.unknown();

export const updateSandboxResponseSchema = z.union([
	updateSandboxStatus200Schema,
	updateSandboxStatus400Schema,
	updateSandboxStatus401Schema,
	updateSandboxStatus402Schema,
	updateSandboxStatus403Schema,
	updateSandboxStatus404Schema,
	updateSandboxStatus409Schema,
	updateSandboxStatus410Schema,
	updateSandboxStatus422Schema,
	updateSandboxStatus429Schema,
	updateSandboxStatus500Schema,
]);

export const deleteSandboxPathNameSchema = z
	.string()
	.max(128)
	.regex(/^[a-zA-Z0-9_-]+$/)
	.describe("The sandbox name to delete.");

export const deleteSandboxQueryProjectIdSchema = z
	.string()
	.max(128)
	.optional()
	.describe(
		"The project ID that owns the named sandbox. When provided, takes precedence over OIDC project context.",
	);

export const deleteSandboxQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const deleteSandboxQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const deleteSandboxStatus200Schema = z.unknown();

export const deleteSandboxStatus400Schema = z.unknown();

export const deleteSandboxStatus401Schema = z.unknown();

export const deleteSandboxStatus403Schema = z.unknown();

export const deleteSandboxStatus404Schema = z.unknown();

export const deleteSandboxStatus429Schema = z.unknown();

export const deleteSandboxResponseSchema = z.union([
	deleteSandboxStatus200Schema,
	deleteSandboxStatus400Schema,
	deleteSandboxStatus401Schema,
	deleteSandboxStatus403Schema,
	deleteSandboxStatus404Schema,
	deleteSandboxStatus429Schema,
]);

export const listSessionCommandsPathSessionIdSchema = z
	.string()
	.describe("The unique identifier of the session to list commands for.");

export const listSessionCommandsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const listSessionCommandsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const listSessionCommandsStatus200Schema = z.unknown();

export const listSessionCommandsStatus400Schema = z.unknown();

export const listSessionCommandsStatus401Schema = z.unknown();

export const listSessionCommandsStatus403Schema = z.unknown();

export const listSessionCommandsStatus404Schema = z.unknown();

export const listSessionCommandsStatus429Schema = z.unknown();

export const listSessionCommandsResponseSchema = z.union([
	listSessionCommandsStatus200Schema,
	listSessionCommandsStatus400Schema,
	listSessionCommandsStatus401Schema,
	listSessionCommandsStatus403Schema,
	listSessionCommandsStatus404Schema,
	listSessionCommandsStatus429Schema,
]);

export const runSessionCommandPathSessionIdSchema = z
	.string()
	.describe("The unique identifier of the session in which to execute the command.");

export const runSessionCommandQueryCmdIdSchema = z
	.string()
	.describe("The unique identifier of the command to stream logs for.");

export const runSessionCommandQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const runSessionCommandQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const runSessionCommandStatus200Schema = z.unknown();

export const runSessionCommandStatus400Schema = z.unknown();

export const runSessionCommandStatus401Schema = z.unknown();

export const runSessionCommandStatus403Schema = z.unknown();

export const runSessionCommandStatus404Schema = z.unknown();

export const runSessionCommandStatus410Schema = z.unknown();

export const runSessionCommandStatus422Schema = z.unknown();

export const runSessionCommandStatus429Schema = z.unknown();

export const runSessionCommandStatus500Schema = z.unknown();

export const runSessionCommandResponseSchema = z.union([
	runSessionCommandStatus200Schema,
	runSessionCommandStatus400Schema,
	runSessionCommandStatus401Schema,
	runSessionCommandStatus403Schema,
	runSessionCommandStatus404Schema,
	runSessionCommandStatus410Schema,
	runSessionCommandStatus422Schema,
	runSessionCommandStatus429Schema,
	runSessionCommandStatus500Schema,
]);

export const getSessionCommandPathSessionIdSchema = z
	.string()
	.describe("The unique identifier of the session containing the command.");

export const getSessionCommandPathCmdIdSchema = z
	.string()
	.describe("The unique identifier of the command to retrieve.");

export const getSessionCommandQueryWaitSchema = z
	.enum(["true", "false"])
	.optional()
	.default("false")
	.describe(
		'If set to "true", the request will block until the command finishes execution. Useful for synchronously waiting for command completion.',
	);

export const getSessionCommandQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getSessionCommandQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getSessionCommandStatus200Schema = z.unknown();

export const getSessionCommandStatus400Schema = z.unknown();

export const getSessionCommandStatus401Schema = z.unknown();

export const getSessionCommandStatus403Schema = z.unknown();

export const getSessionCommandStatus404Schema = z.unknown();

export const getSessionCommandStatus410Schema = z.unknown();

export const getSessionCommandStatus422Schema = z.unknown();

export const getSessionCommandStatus429Schema = z.unknown();

export const getSessionCommandStatus500Schema = z.unknown();

export const getSessionCommandResponseSchema = z.union([
	getSessionCommandStatus200Schema,
	getSessionCommandStatus400Schema,
	getSessionCommandStatus401Schema,
	getSessionCommandStatus403Schema,
	getSessionCommandStatus404Schema,
	getSessionCommandStatus410Schema,
	getSessionCommandStatus422Schema,
	getSessionCommandStatus429Schema,
	getSessionCommandStatus500Schema,
]);

export const killSessionCommandPathCmdIdSchema = z
	.string()
	.describe("The unique identifier of the command to terminate.");

export const killSessionCommandPathSessionIdSchema = z
	.string()
	.describe("The unique identifier of the session containing the command.");

export const killSessionCommandQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const killSessionCommandQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const killSessionCommandStatus200Schema = z.unknown();

export const killSessionCommandStatus400Schema = z.unknown();

export const killSessionCommandStatus401Schema = z.unknown();

export const killSessionCommandStatus403Schema = z.unknown();

export const killSessionCommandStatus404Schema = z.unknown();

export const killSessionCommandStatus410Schema = z.unknown();

export const killSessionCommandStatus422Schema = z.unknown();

export const killSessionCommandStatus429Schema = z.unknown();

export const killSessionCommandStatus500Schema = z.unknown();

export const killSessionCommandResponseSchema = z.union([
	killSessionCommandStatus200Schema,
	killSessionCommandStatus400Schema,
	killSessionCommandStatus401Schema,
	killSessionCommandStatus403Schema,
	killSessionCommandStatus404Schema,
	killSessionCommandStatus410Schema,
	killSessionCommandStatus422Schema,
	killSessionCommandStatus429Schema,
	killSessionCommandStatus500Schema,
]);

export const getSessionCommandLogsPathSessionIdSchema = z
	.string()
	.describe("The unique identifier of the session containing the command.");

export const getSessionCommandLogsPathCmdIdSchema = z
	.string()
	.describe("The unique identifier of the command to stream logs for.");

export const getSessionCommandLogsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getSessionCommandLogsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getSessionCommandLogsStatus200Schema = z.unknown();

export const getSessionCommandLogsStatus400Schema = z.unknown();

export const getSessionCommandLogsStatus401Schema = z.unknown();

export const getSessionCommandLogsStatus403Schema = z.unknown();

export const getSessionCommandLogsStatus404Schema = z.unknown();

export const getSessionCommandLogsStatus410Schema = z.unknown();

export const getSessionCommandLogsStatus422Schema = z.unknown();

export const getSessionCommandLogsStatus429Schema = z.unknown();

export const getSessionCommandLogsStatus500Schema = z.unknown();

export const getSessionCommandLogsResponseSchema = z.union([
	getSessionCommandLogsStatus200Schema,
	getSessionCommandLogsStatus400Schema,
	getSessionCommandLogsStatus401Schema,
	getSessionCommandLogsStatus403Schema,
	getSessionCommandLogsStatus404Schema,
	getSessionCommandLogsStatus410Schema,
	getSessionCommandLogsStatus422Schema,
	getSessionCommandLogsStatus429Schema,
	getSessionCommandLogsStatus500Schema,
]);

export const stopSessionPathSessionIdSchema = z
	.string()
	.describe("The unique identifier of the session to stop.");

export const stopSessionQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const stopSessionQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const stopSessionStatus200Schema = z.unknown();

export const stopSessionStatus400Schema = z.unknown();

export const stopSessionStatus401Schema = z.unknown();

export const stopSessionStatus403Schema = z.unknown();

export const stopSessionStatus404Schema = z.unknown();

export const stopSessionStatus410Schema = z.unknown();

export const stopSessionStatus422Schema = z.unknown();

export const stopSessionStatus429Schema = z.unknown();

export const stopSessionStatus500Schema = z.unknown();

export const stopSessionResponseSchema = z.union([
	stopSessionStatus200Schema,
	stopSessionStatus400Schema,
	stopSessionStatus401Schema,
	stopSessionStatus403Schema,
	stopSessionStatus404Schema,
	stopSessionStatus410Schema,
	stopSessionStatus422Schema,
	stopSessionStatus429Schema,
	stopSessionStatus500Schema,
]);

export const extendSessionTimeoutPathSessionIdSchema = z
	.string()
	.describe("The unique identifier of the session to extend the timeout for.");

export const extendSessionTimeoutQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const extendSessionTimeoutQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const extendSessionTimeoutStatus200Schema = z.unknown();

export const extendSessionTimeoutStatus400Schema = z.unknown();

export const extendSessionTimeoutStatus401Schema = z.unknown();

export const extendSessionTimeoutStatus403Schema = z.unknown();

export const extendSessionTimeoutStatus404Schema = z.unknown();

export const extendSessionTimeoutStatus410Schema = z.unknown();

export const extendSessionTimeoutStatus422Schema = z.unknown();

export const extendSessionTimeoutStatus429Schema = z.unknown();

export const extendSessionTimeoutStatus500Schema = z.unknown();

export const extendSessionTimeoutResponseSchema = z.union([
	extendSessionTimeoutStatus200Schema,
	extendSessionTimeoutStatus400Schema,
	extendSessionTimeoutStatus401Schema,
	extendSessionTimeoutStatus403Schema,
	extendSessionTimeoutStatus404Schema,
	extendSessionTimeoutStatus410Schema,
	extendSessionTimeoutStatus422Schema,
	extendSessionTimeoutStatus429Schema,
	extendSessionTimeoutStatus500Schema,
]);

export const updateSessionNetworkPolicyPathSessionIdSchema = z
	.string()
	.describe("The unique identifier of the session to update the network policy for.");

export const updateSessionNetworkPolicyQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const updateSessionNetworkPolicyQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const updateSessionNetworkPolicyStatus200Schema = z.unknown();

export const updateSessionNetworkPolicyStatus400Schema = z.unknown();

export const updateSessionNetworkPolicyStatus401Schema = z.unknown();

export const updateSessionNetworkPolicyStatus402Schema = z.unknown();

export const updateSessionNetworkPolicyStatus403Schema = z.unknown();

export const updateSessionNetworkPolicyStatus404Schema = z.unknown();

export const updateSessionNetworkPolicyStatus410Schema = z.unknown();

export const updateSessionNetworkPolicyStatus422Schema = z.unknown();

export const updateSessionNetworkPolicyStatus429Schema = z.unknown();

export const updateSessionNetworkPolicyStatus500Schema = z.unknown();

export const updateSessionNetworkPolicyResponseSchema = z.union([
	updateSessionNetworkPolicyStatus200Schema,
	updateSessionNetworkPolicyStatus400Schema,
	updateSessionNetworkPolicyStatus401Schema,
	updateSessionNetworkPolicyStatus402Schema,
	updateSessionNetworkPolicyStatus403Schema,
	updateSessionNetworkPolicyStatus404Schema,
	updateSessionNetworkPolicyStatus410Schema,
	updateSessionNetworkPolicyStatus422Schema,
	updateSessionNetworkPolicyStatus429Schema,
	updateSessionNetworkPolicyStatus500Schema,
]);

export const readSessionFilePathSessionIdSchema = z
	.string()
	.describe("The unique identifier of the session to read the file from.");

export const readSessionFileQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const readSessionFileQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const readSessionFileStatus200Schema = z.unknown();

export const readSessionFileStatus400Schema = z.unknown();

export const readSessionFileStatus401Schema = z.unknown();

export const readSessionFileStatus403Schema = z.unknown();

export const readSessionFileStatus404Schema = z.unknown();

export const readSessionFileStatus410Schema = z.unknown();

export const readSessionFileStatus422Schema = z.unknown();

export const readSessionFileStatus429Schema = z.unknown();

export const readSessionFileStatus500Schema = z.unknown();

export const readSessionFileResponseSchema = z.union([
	readSessionFileStatus200Schema,
	readSessionFileStatus400Schema,
	readSessionFileStatus401Schema,
	readSessionFileStatus403Schema,
	readSessionFileStatus404Schema,
	readSessionFileStatus410Schema,
	readSessionFileStatus422Schema,
	readSessionFileStatus429Schema,
	readSessionFileStatus500Schema,
]);

export const createSessionDirectoryPathSessionIdSchema = z
	.string()
	.describe("The unique identifier of the session to create the directory in.");

export const createSessionDirectoryQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const createSessionDirectoryQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const createSessionDirectoryStatus200Schema = z.unknown();

export const createSessionDirectoryStatus400Schema = z.unknown();

export const createSessionDirectoryStatus401Schema = z.unknown();

export const createSessionDirectoryStatus403Schema = z.unknown();

export const createSessionDirectoryStatus404Schema = z.unknown();

export const createSessionDirectoryStatus410Schema = z.unknown();

export const createSessionDirectoryStatus422Schema = z.unknown();

export const createSessionDirectoryStatus429Schema = z.unknown();

export const createSessionDirectoryStatus500Schema = z.unknown();

export const createSessionDirectoryResponseSchema = z.union([
	createSessionDirectoryStatus200Schema,
	createSessionDirectoryStatus400Schema,
	createSessionDirectoryStatus401Schema,
	createSessionDirectoryStatus403Schema,
	createSessionDirectoryStatus404Schema,
	createSessionDirectoryStatus410Schema,
	createSessionDirectoryStatus422Schema,
	createSessionDirectoryStatus429Schema,
	createSessionDirectoryStatus500Schema,
]);

export const writeSessionFilesHeaderxCwdSchema = z
	.string()
	.optional()
	.describe(
		"The target directory where the tarball contents will be extracted. If not specified, files are extracted to the sandbox home directory.",
	);

export const writeSessionFilesPathSessionIdSchema = z
	.string()
	.describe("The unique identifier of the session to write files to.");

export const writeSessionFilesQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const writeSessionFilesQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const writeSessionFilesStatus200Schema = z.unknown();

export const writeSessionFilesStatus400Schema = z.unknown();

export const writeSessionFilesStatus401Schema = z.unknown();

export const writeSessionFilesStatus403Schema = z.unknown();

export const writeSessionFilesStatus404Schema = z.unknown();

export const writeSessionFilesStatus410Schema = z.unknown();

export const writeSessionFilesStatus422Schema = z.unknown();

export const writeSessionFilesStatus429Schema = z.unknown();

export const writeSessionFilesStatus500Schema = z.unknown();

export const writeSessionFilesResponseSchema = z.union([
	writeSessionFilesStatus200Schema,
	writeSessionFilesStatus400Schema,
	writeSessionFilesStatus401Schema,
	writeSessionFilesStatus403Schema,
	writeSessionFilesStatus404Schema,
	writeSessionFilesStatus410Schema,
	writeSessionFilesStatus422Schema,
	writeSessionFilesStatus429Schema,
	writeSessionFilesStatus500Schema,
]);

export const createSessionSnapshotPathSessionIdSchema = z
	.string()
	.describe("The unique identifier of the session to snapshot.");

export const createSessionSnapshotQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const createSessionSnapshotQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const createSessionSnapshotStatus201Schema = z.unknown();

export const createSessionSnapshotStatus400Schema = z.unknown();

export const createSessionSnapshotStatus401Schema = z.unknown();

export const createSessionSnapshotStatus402Schema = z.unknown();

export const createSessionSnapshotStatus403Schema = z.unknown();

export const createSessionSnapshotStatus404Schema = z.unknown();

export const createSessionSnapshotStatus410Schema = z.unknown();

export const createSessionSnapshotStatus422Schema = z.unknown();

export const createSessionSnapshotStatus429Schema = z.unknown();

export const createSessionSnapshotStatus500Schema = z.unknown();

export const createSessionSnapshotResponseSchema = z.union([
	createSessionSnapshotStatus201Schema,
	createSessionSnapshotStatus400Schema,
	createSessionSnapshotStatus401Schema,
	createSessionSnapshotStatus402Schema,
	createSessionSnapshotStatus403Schema,
	createSessionSnapshotStatus404Schema,
	createSessionSnapshotStatus410Schema,
	createSessionSnapshotStatus422Schema,
	createSessionSnapshotStatus429Schema,
	createSessionSnapshotStatus500Schema,
]);

export const updateAttackChallengeModeQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const updateAttackChallengeModeQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const updateAttackChallengeModeStatus200Schema = z.unknown();

export const updateAttackChallengeModeStatus400Schema = z.unknown();

export const updateAttackChallengeModeStatus401Schema = z.unknown();

export const updateAttackChallengeModeStatus403Schema = z.unknown();

export const updateAttackChallengeModeStatus404Schema = z.unknown();

export const updateAttackChallengeModeResponseSchema = z.union([
	updateAttackChallengeModeStatus200Schema,
	updateAttackChallengeModeStatus400Schema,
	updateAttackChallengeModeStatus401Schema,
	updateAttackChallengeModeStatus403Schema,
	updateAttackChallengeModeStatus404Schema,
]);

export const putFirewallConfigQueryProjectIdSchema = z.string();

export const putFirewallConfigQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const putFirewallConfigQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const putFirewallConfigStatus200Schema = z.unknown();

export const putFirewallConfigStatus400Schema = z.unknown();

export const putFirewallConfigStatus401Schema = z.unknown();

export const putFirewallConfigStatus402Schema = z.unknown();

export const putFirewallConfigStatus403Schema = z.unknown();

export const putFirewallConfigStatus404Schema = z.unknown();

export const putFirewallConfigStatus500Schema = z.unknown();

export const putFirewallConfigResponseSchema = z.union([
	putFirewallConfigStatus200Schema,
	putFirewallConfigStatus400Schema,
	putFirewallConfigStatus401Schema,
	putFirewallConfigStatus402Schema,
	putFirewallConfigStatus403Schema,
	putFirewallConfigStatus404Schema,
	putFirewallConfigStatus500Schema,
]);

export const updateFirewallConfigQueryProjectIdSchema = z.string();

export const updateFirewallConfigQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const updateFirewallConfigQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const updateFirewallConfigStatus200Schema = z.unknown();

export const updateFirewallConfigStatus400Schema = z.unknown();

export const updateFirewallConfigStatus401Schema = z.unknown();

export const updateFirewallConfigStatus402Schema = z.unknown();

export const updateFirewallConfigStatus403Schema = z.unknown();

export const updateFirewallConfigStatus404Schema = z.unknown();

export const updateFirewallConfigStatus500Schema = z.unknown();

export const updateFirewallConfigResponseSchema = z.union([
	updateFirewallConfigStatus200Schema,
	updateFirewallConfigStatus400Schema,
	updateFirewallConfigStatus401Schema,
	updateFirewallConfigStatus402Schema,
	updateFirewallConfigStatus403Schema,
	updateFirewallConfigStatus404Schema,
	updateFirewallConfigStatus500Schema,
]);

export const getFirewallConfigQueryProjectIdSchema = z.string();

export const getFirewallConfigQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getFirewallConfigQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getFirewallConfigPathConfigVersionSchema = z
	.string()
	.describe("The deployed configVersion for the firewall configuration");

export const getFirewallConfigStatus200Schema = z.unknown();

export const getFirewallConfigStatus400Schema = z.unknown();

export const getFirewallConfigStatus401Schema = z.unknown();

export const getFirewallConfigStatus403Schema = z.unknown();

export const getFirewallConfigStatus404Schema = z.unknown();

export const getFirewallConfigResponseSchema = z.union([
	getFirewallConfigStatus200Schema,
	getFirewallConfigStatus400Schema,
	getFirewallConfigStatus401Schema,
	getFirewallConfigStatus403Schema,
	getFirewallConfigStatus404Schema,
]);

export const getActiveAttackStatusQueryProjectIdSchema = z.string();

export const getActiveAttackStatusQuerySinceSchema = z.number().min(1).optional();

export const getActiveAttackStatusQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getActiveAttackStatusQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getActiveAttackStatusStatus200Schema = z.unknown();

export const getActiveAttackStatusStatus400Schema = z.unknown();

export const getActiveAttackStatusStatus401Schema = z.unknown();

export const getActiveAttackStatusStatus403Schema = z.unknown();

export const getActiveAttackStatusStatus404Schema = z.unknown();

export const getActiveAttackStatusResponseSchema = z.union([
	getActiveAttackStatusStatus200Schema,
	getActiveAttackStatusStatus400Schema,
	getActiveAttackStatusStatus401Schema,
	getActiveAttackStatusStatus403Schema,
	getActiveAttackStatusStatus404Schema,
]);

export const getBypassIpQueryProjectIdSchema = z.string();

export const getBypassIpQueryLimitSchema = z.number().max(256).optional();

export const getBypassIpQuerySourceIpSchema = z
	.string()
	.max(49)
	.optional()
	.describe("Filter by source IP");

export const getBypassIpQueryDomainSchema = z
	.string()
	.max(2544)
	.regex(/([a-z]+[a-z.]+)$/)
	.optional()
	.describe("Filter by domain");

export const getBypassIpQueryProjectScopeSchema = z
	.boolean()
	.optional()
	.describe("Filter by project scoped rules");

export const getBypassIpQueryOffsetSchema = z
	.string()
	.max(2560)
	.optional()
	.describe("Used for pagination. Retrieves results after the provided id");

export const getBypassIpQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getBypassIpQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getBypassIpStatus200Schema = z.unknown();

export const getBypassIpStatus400Schema = z.unknown();

export const getBypassIpStatus401Schema = z.unknown();

export const getBypassIpStatus403Schema = z.unknown();

export const getBypassIpStatus404Schema = z.unknown();

export const getBypassIpStatus500Schema = z.unknown();

export const getBypassIpResponseSchema = z.union([
	getBypassIpStatus200Schema,
	getBypassIpStatus400Schema,
	getBypassIpStatus401Schema,
	getBypassIpStatus403Schema,
	getBypassIpStatus404Schema,
	getBypassIpStatus500Schema,
]);

export const addBypassIpQueryProjectIdSchema = z.string();

export const addBypassIpQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const addBypassIpQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const addBypassIpStatus200Schema = z.unknown();

export const addBypassIpStatus400Schema = z.unknown();

export const addBypassIpStatus401Schema = z.unknown();

export const addBypassIpStatus403Schema = z.unknown();

export const addBypassIpStatus404Schema = z.unknown();

export const addBypassIpStatus500Schema = z.unknown();

export const addBypassIpResponseSchema = z.union([
	addBypassIpStatus200Schema,
	addBypassIpStatus400Schema,
	addBypassIpStatus401Schema,
	addBypassIpStatus403Schema,
	addBypassIpStatus404Schema,
	addBypassIpStatus500Schema,
]);

export const removeBypassIpQueryProjectIdSchema = z.string();

export const removeBypassIpQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const removeBypassIpQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const removeBypassIpStatus200Schema = z.unknown();

export const removeBypassIpStatus400Schema = z.unknown();

export const removeBypassIpStatus401Schema = z.unknown();

export const removeBypassIpStatus403Schema = z.unknown();

export const removeBypassIpStatus404Schema = z.unknown();

export const removeBypassIpStatus500Schema = z.unknown();

export const removeBypassIpResponseSchema = z.union([
	removeBypassIpStatus200Schema,
	removeBypassIpStatus400Schema,
	removeBypassIpStatus401Schema,
	removeBypassIpStatus403Schema,
	removeBypassIpStatus404Schema,
	removeBypassIpStatus500Schema,
]);

export const getSecurityFirewallEventsQueryProjectIdSchema = z.string();

export const getSecurityFirewallEventsQueryStartTimestampSchema = z.number().optional();

export const getSecurityFirewallEventsQueryEndTimestampSchema = z.number().optional();

export const getSecurityFirewallEventsQueryHostsSchema = z.string().optional();

export const getSecurityFirewallEventsStatus200Schema = z.unknown();

export const getSecurityFirewallEventsStatus400Schema = z.unknown();

export const getSecurityFirewallEventsStatus401Schema = z.unknown();

export const getSecurityFirewallEventsStatus403Schema = z.unknown();

export const getSecurityFirewallEventsStatus404Schema = z.unknown();

export const getSecurityFirewallEventsStatus500Schema = z.unknown();

export const getSecurityFirewallEventsResponseSchema = z.union([
	getSecurityFirewallEventsStatus200Schema,
	getSecurityFirewallEventsStatus400Schema,
	getSecurityFirewallEventsStatus401Schema,
	getSecurityFirewallEventsStatus403Schema,
	getSecurityFirewallEventsStatus404Schema,
	getSecurityFirewallEventsStatus500Schema,
]);

export const createIntegrationStoreDirectQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const createIntegrationStoreDirectQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const createIntegrationStoreDirectStatus200Schema = z.unknown();

export const createIntegrationStoreDirectStatus400Schema = z.unknown();

export const createIntegrationStoreDirectStatus401Schema = z.unknown();

export const createIntegrationStoreDirectStatus402Schema = z.unknown();

export const createIntegrationStoreDirectStatus403Schema = z.unknown();

export const createIntegrationStoreDirectStatus404Schema = z.unknown();

export const createIntegrationStoreDirectStatus409Schema = z.unknown();

export const createIntegrationStoreDirectStatus429Schema = z.unknown();

export const createIntegrationStoreDirectStatus500Schema = z.unknown();

export const createIntegrationStoreDirectResponseSchema = z.union([
	createIntegrationStoreDirectStatus200Schema,
	createIntegrationStoreDirectStatus400Schema,
	createIntegrationStoreDirectStatus401Schema,
	createIntegrationStoreDirectStatus402Schema,
	createIntegrationStoreDirectStatus403Schema,
	createIntegrationStoreDirectStatus404Schema,
	createIntegrationStoreDirectStatus409Schema,
	createIntegrationStoreDirectStatus429Schema,
	createIntegrationStoreDirectStatus500Schema,
]);

export const getTeamMembersQueryLimitSchema = z
	.number()
	.min(1)
	.optional()
	.describe("Limit how many teams should be returned");

export const getTeamMembersQuerySinceSchema = z
	.number()
	.optional()
	.describe("Timestamp in milliseconds to only include members added since then.");

export const getTeamMembersQueryUntilSchema = z
	.number()
	.optional()
	.describe("Timestamp in milliseconds to only include members added until then.");

export const getTeamMembersQuerySearchSchema = z
	.string()
	.optional()
	.describe("Search team members by their name, username, and email.");

export const getTeamMembersQueryRoleSchema = z
	.enum([
		"OWNER",
		"MEMBER",
		"DEVELOPER",
		"SECURITY",
		"BILLING",
		"VIEWER",
		"VIEWER_FOR_PLUS",
		"CONTRIBUTOR",
	])
	.optional()
	.describe("Only return members with the specified team role.");

export const getTeamMembersQueryExcludeProjectSchema = z
	.string()
	.optional()
	.describe("Exclude members who belong to the specified project.");

export const getTeamMembersQueryEligibleMembersForProjectIdSchema = z
	.string()
	.optional()
	.describe("Include team members who are eligible to be members of the specified project.");

export const getTeamMembersPathTeamIdSchema = z
	.string()
	.describe("The Team identifier to perform the request on behalf of.");

export const getTeamMembersQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getTeamMembersStatus200Schema = z.unknown();

export const getTeamMembersStatus400Schema = z.unknown();

export const getTeamMembersStatus401Schema = z.unknown();

export const getTeamMembersStatus403Schema = z.unknown();

export const getTeamMembersStatus404Schema = z.unknown();

export const getTeamMembersResponseSchema = z.union([
	getTeamMembersStatus200Schema,
	getTeamMembersStatus400Schema,
	getTeamMembersStatus401Schema,
	getTeamMembersStatus403Schema,
	getTeamMembersStatus404Schema,
]);

export const inviteUserToTeamPathTeamIdSchema = z
	.string()
	.describe("The Team identifier to perform the request on behalf of.");

export const inviteUserToTeamQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const inviteUserToTeamStatus200Schema = z.unknown();

export const inviteUserToTeamStatus400Schema = z.unknown();

export const inviteUserToTeamStatus401Schema = z.unknown();

export const inviteUserToTeamStatus403Schema = z.unknown();

export const inviteUserToTeamStatus503Schema = z.unknown();

export const inviteUserToTeamResponseSchema = z.union([
	inviteUserToTeamStatus200Schema,
	inviteUserToTeamStatus400Schema,
	inviteUserToTeamStatus401Schema,
	inviteUserToTeamStatus403Schema,
	inviteUserToTeamStatus503Schema,
]);

export const requestAccessToTeamPathTeamIdSchema = z
	.string()
	.describe("The unique team identifier");

export const requestAccessToTeamStatus200Schema = z.unknown();

export const requestAccessToTeamStatus400Schema = z.unknown();

export const requestAccessToTeamStatus401Schema = z.unknown();

export const requestAccessToTeamStatus403Schema = z.unknown();

export const requestAccessToTeamStatus404Schema = z.unknown();

export const requestAccessToTeamStatus429Schema = z.unknown();

export const requestAccessToTeamStatus503Schema = z.unknown();

export const requestAccessToTeamResponseSchema = z.union([
	requestAccessToTeamStatus200Schema,
	requestAccessToTeamStatus400Schema,
	requestAccessToTeamStatus401Schema,
	requestAccessToTeamStatus403Schema,
	requestAccessToTeamStatus404Schema,
	requestAccessToTeamStatus429Schema,
	requestAccessToTeamStatus503Schema,
]);

export const getTeamAccessRequestPathUserIdSchema = z
	.string()
	.describe("The unique user identifier");

export const getTeamAccessRequestPathTeamIdSchema = z
	.string()
	.describe("The unique team identifier");

export const getTeamAccessRequestStatus200Schema = z.unknown();

export const getTeamAccessRequestStatus400Schema = z.unknown();

export const getTeamAccessRequestStatus401Schema = z.unknown();

export const getTeamAccessRequestStatus403Schema = z.unknown();

export const getTeamAccessRequestStatus404Schema = z.unknown();

export const getTeamAccessRequestResponseSchema = z.union([
	getTeamAccessRequestStatus200Schema,
	getTeamAccessRequestStatus400Schema,
	getTeamAccessRequestStatus401Schema,
	getTeamAccessRequestStatus403Schema,
	getTeamAccessRequestStatus404Schema,
]);

export const joinTeamPathTeamIdSchema = z.string().describe("The unique team identifier");

export const joinTeamStatus200Schema = z.unknown();

export const joinTeamStatus400Schema = z.unknown();

export const joinTeamStatus401Schema = z.unknown();

export const joinTeamStatus402Schema = z.unknown();

export const joinTeamStatus403Schema = z.unknown();

export const joinTeamStatus404Schema = z.unknown();

export const joinTeamStatus503Schema = z.unknown();

export const joinTeamResponseSchema = z.union([
	joinTeamStatus200Schema,
	joinTeamStatus400Schema,
	joinTeamStatus401Schema,
	joinTeamStatus402Schema,
	joinTeamStatus403Schema,
	joinTeamStatus404Schema,
	joinTeamStatus503Schema,
]);

export const updateTeamMemberPathUidSchema = z.string().describe("The ID of the member.");

export const updateTeamMemberPathTeamIdSchema = z.string().describe("The unique team identifier");

export const updateTeamMemberStatus200Schema = z.unknown();

export const updateTeamMemberStatus400Schema = z.unknown();

export const updateTeamMemberStatus401Schema = z.unknown();

export const updateTeamMemberStatus402Schema = z.unknown();

export const updateTeamMemberStatus403Schema = z.unknown();

export const updateTeamMemberStatus404Schema = z.unknown();

export const updateTeamMemberStatus409Schema = z.unknown();

export const updateTeamMemberStatus500Schema = z.unknown();

export const updateTeamMemberResponseSchema = z.union([
	updateTeamMemberStatus200Schema,
	updateTeamMemberStatus400Schema,
	updateTeamMemberStatus401Schema,
	updateTeamMemberStatus402Schema,
	updateTeamMemberStatus403Schema,
	updateTeamMemberStatus404Schema,
	updateTeamMemberStatus409Schema,
	updateTeamMemberStatus500Schema,
]);

export const removeTeamMemberPathUidSchema = z.string().describe("The user ID of the member.");

export const removeTeamMemberQueryNewDefaultTeamIdSchema = z
	.string()
	.optional()
	.describe("The ID of the team to set as the new default team for the Northstar user.");

export const removeTeamMemberPathTeamIdSchema = z.string().describe("The unique team identifier");

export const removeTeamMemberStatus200Schema = z.unknown();

export const removeTeamMemberStatus400Schema = z.unknown();

export const removeTeamMemberStatus401Schema = z.unknown();

export const removeTeamMemberStatus403Schema = z.unknown();

export const removeTeamMemberStatus404Schema = z.unknown();

export const removeTeamMemberStatus503Schema = z.unknown();

export const removeTeamMemberResponseSchema = z.union([
	removeTeamMemberStatus200Schema,
	removeTeamMemberStatus400Schema,
	removeTeamMemberStatus401Schema,
	removeTeamMemberStatus403Schema,
	removeTeamMemberStatus404Schema,
	removeTeamMemberStatus503Schema,
]);

export const getTeamQuerySlugSchema = z.string().optional();

export const getTeamPathTeamIdSchema = z
	.string()
	.describe("The Team identifier to perform the request on behalf of.");

export const getTeamStatus200Schema = z.unknown();

export const getTeamStatus400Schema = z.unknown();

export const getTeamStatus401Schema = z.unknown();

export const getTeamStatus403Schema = z.unknown();

export const getTeamStatus404Schema = z.unknown();

export const getTeamResponseSchema = z.union([
	getTeamStatus200Schema,
	getTeamStatus400Schema,
	getTeamStatus401Schema,
	getTeamStatus403Schema,
	getTeamStatus404Schema,
]);

export const patchTeamPathTeamIdSchema = z
	.string()
	.describe("The Team identifier to perform the request on behalf of.");

export const patchTeamQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const patchTeamStatus200Schema = z.unknown();

export const patchTeamStatus400Schema = z.unknown();

export const patchTeamStatus401Schema = z.unknown();

export const patchTeamStatus402Schema = z.unknown();

export const patchTeamStatus403Schema = z.unknown();

export const patchTeamStatus428Schema = z.unknown();

export const patchTeamResponseSchema = z.union([
	patchTeamStatus200Schema,
	patchTeamStatus400Schema,
	patchTeamStatus401Schema,
	patchTeamStatus402Schema,
	patchTeamStatus403Schema,
	patchTeamStatus428Schema,
]);

export const getTeamsQueryLimitSchema = z
	.number()
	.optional()
	.describe("Maximum number of Teams which may be returned.");

export const getTeamsQuerySinceSchema = z
	.number()
	.optional()
	.describe("Timestamp (in milliseconds) to only include Teams created since then.");

export const getTeamsQueryUntilSchema = z
	.number()
	.optional()
	.describe("Timestamp (in milliseconds) to only include Teams created until then.");

export const getTeamsStatus200Schema = z.unknown();

export const getTeamsStatus400Schema = z.unknown();

export const getTeamsStatus401Schema = z.unknown();

export const getTeamsStatus403Schema = z.unknown();

export const getTeamsStatus500Schema = z.unknown();

export const getTeamsResponseSchema = z.union([
	getTeamsStatus200Schema,
	getTeamsStatus400Schema,
	getTeamsStatus401Schema,
	getTeamsStatus403Schema,
	getTeamsStatus500Schema,
]);

export const createTeamStatus200Schema = z.unknown();

export const createTeamStatus400Schema = z.unknown();

export const createTeamStatus401Schema = z.unknown();

export const createTeamStatus403Schema = z.unknown();

export const createTeamStatus404Schema = z.unknown();

export const createTeamStatus409Schema = z.unknown();

export const createTeamResponseSchema = z.union([
	createTeamStatus200Schema,
	createTeamStatus400Schema,
	createTeamStatus401Schema,
	createTeamStatus403Schema,
	createTeamStatus404Schema,
	createTeamStatus409Schema,
]);

export const postTeamDsyncRolesPathTeamIdSchema = z
	.string()
	.describe("The Team identifier to perform the request on behalf of.");

export const postTeamDsyncRolesQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const postTeamDsyncRolesStatus200Schema = z.unknown();

export const postTeamDsyncRolesStatus400Schema = z.unknown();

export const postTeamDsyncRolesStatus401Schema = z.unknown();

export const postTeamDsyncRolesStatus403Schema = z.unknown();

export const postTeamDsyncRolesResponseSchema = z.union([
	postTeamDsyncRolesStatus200Schema,
	postTeamDsyncRolesStatus400Schema,
	postTeamDsyncRolesStatus401Schema,
	postTeamDsyncRolesStatus403Schema,
]);

export const deleteTeamQueryNewDefaultTeamIdSchema = z
	.string()
	.optional()
	.describe("Id of the team to be set as the new default team");

export const deleteTeamPathTeamIdSchema = z
	.string()
	.describe("The Team identifier to perform the request on behalf of.");

export const deleteTeamQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const deleteTeamStatus200Schema = z.unknown();

export const deleteTeamStatus400Schema = z.unknown();

export const deleteTeamStatus401Schema = z.unknown();

export const deleteTeamStatus402Schema = z.unknown();

export const deleteTeamStatus403Schema = z.unknown();

export const deleteTeamStatus409Schema = z.unknown();

export const deleteTeamResponseSchema = z.union([
	deleteTeamStatus200Schema,
	deleteTeamStatus400Schema,
	deleteTeamStatus401Schema,
	deleteTeamStatus402Schema,
	deleteTeamStatus403Schema,
	deleteTeamStatus409Schema,
]);

export const deleteTeamInviteCodePathInviteIdSchema = z
	.string()
	.describe("The Team invite code ID.");

export const deleteTeamInviteCodePathTeamIdSchema = z
	.string()
	.describe("The Team identifier to perform the request on behalf of.");

export const deleteTeamInviteCodeStatus200Schema = z.unknown();

export const deleteTeamInviteCodeStatus400Schema = z.unknown();

export const deleteTeamInviteCodeStatus401Schema = z.unknown();

export const deleteTeamInviteCodeStatus403Schema = z.unknown();

export const deleteTeamInviteCodeStatus404Schema = z.unknown();

export const deleteTeamInviteCodeResponseSchema = z.union([
	deleteTeamInviteCodeStatus200Schema,
	deleteTeamInviteCodeStatus400Schema,
	deleteTeamInviteCodeStatus401Schema,
	deleteTeamInviteCodeStatus403Schema,
	deleteTeamInviteCodeStatus404Schema,
]);

export const updateMicrofrontendsGroupPathGroupIdSchema = z.string();

export const updateMicrofrontendsGroupPathTeamIdSchema = z
	.string()
	.describe("The Team identifier to perform the request on behalf of.");

export const updateMicrofrontendsGroupQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const updateMicrofrontendsGroupStatus200Schema = z.unknown();

export const updateMicrofrontendsGroupStatus400Schema = z.unknown();

export const updateMicrofrontendsGroupStatus401Schema = z.unknown();

export const updateMicrofrontendsGroupStatus403Schema = z.unknown();

export const updateMicrofrontendsGroupStatus404Schema = z.unknown();

export const updateMicrofrontendsGroupResponseSchema = z.union([
	updateMicrofrontendsGroupStatus200Schema,
	updateMicrofrontendsGroupStatus400Schema,
	updateMicrofrontendsGroupStatus401Schema,
	updateMicrofrontendsGroupStatus403Schema,
	updateMicrofrontendsGroupStatus404Schema,
]);

export const deleteMicrofrontendsGroupPathGroupIdSchema = z
	.string()
	.describe("The microfrontend group ID to delete.");

export const deleteMicrofrontendsGroupPathTeamIdSchema = z
	.string()
	.describe("The Team identifier to perform the request on behalf of.");

export const deleteMicrofrontendsGroupQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const deleteMicrofrontendsGroupStatus200Schema = z.unknown();

export const deleteMicrofrontendsGroupStatus400Schema = z.unknown();

export const deleteMicrofrontendsGroupStatus401Schema = z.unknown();

export const deleteMicrofrontendsGroupStatus403Schema = z.unknown();

export const deleteMicrofrontendsGroupStatus404Schema = z.unknown();

export const deleteMicrofrontendsGroupStatus500Schema = z.unknown();

export const deleteMicrofrontendsGroupResponseSchema = z.union([
	deleteMicrofrontendsGroupStatus200Schema,
	deleteMicrofrontendsGroupStatus400Schema,
	deleteMicrofrontendsGroupStatus401Schema,
	deleteMicrofrontendsGroupStatus403Schema,
	deleteMicrofrontendsGroupStatus404Schema,
	deleteMicrofrontendsGroupStatus500Schema,
]);

export const uploadFileHeadercontentLengthSchema = z
	.number()
	.optional()
	.describe("The file size in bytes");

export const uploadFileHeaderxVercelDigestSchema = z
	.string()
	.max(40)
	.optional()
	.describe("The file SHA1 used to check the integrity");

export const uploadFileHeaderxNowDigestSchema = z
	.string()
	.max(40)
	.optional()
	.describe("The file SHA1 used to check the integrity");

export const uploadFileHeaderxNowSizeSchema = z
	.number()
	.optional()
	.describe("The file size as an alternative to `Content-Length`");

export const uploadFileQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const uploadFileQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const uploadFileStatus200Schema = z.unknown();

export const uploadFileStatus400Schema = z.unknown();

export const uploadFileStatus401Schema = z.unknown();

export const uploadFileStatus403Schema = z.unknown();

export const uploadFileStatus426Schema = z.unknown();

export const uploadFileResponseSchema = z.union([
	uploadFileStatus200Schema,
	uploadFileStatus400Schema,
	uploadFileStatus401Schema,
	uploadFileStatus403Schema,
	uploadFileStatus426Schema,
]);

export const listAuthTokensStatus200Schema = z.unknown();

export const listAuthTokensStatus400Schema = z.unknown();

export const listAuthTokensStatus401Schema = z.unknown();

export const listAuthTokensStatus403Schema = z.unknown();

export const listAuthTokensResponseSchema = z.union([
	listAuthTokensStatus200Schema,
	listAuthTokensStatus400Schema,
	listAuthTokensStatus401Schema,
	listAuthTokensStatus403Schema,
]);

export const createAuthTokenQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const createAuthTokenQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const createAuthTokenStatus200Schema = z.unknown();

export const createAuthTokenStatus400Schema = z.unknown();

export const createAuthTokenStatus401Schema = z.unknown();

export const createAuthTokenStatus403Schema = z.unknown();

export const createAuthTokenStatus404Schema = z.unknown();

export const createAuthTokenResponseSchema = z.union([
	createAuthTokenStatus200Schema,
	createAuthTokenStatus400Schema,
	createAuthTokenStatus401Schema,
	createAuthTokenStatus403Schema,
	createAuthTokenStatus404Schema,
]);

export const getAuthTokenPathTokenIdSchema = z
	.string()
	.describe(
		'The identifier of the token to retrieve. The special value "current" may be supplied, which returns the metadata for the token that the current HTTP request is authenticated with.',
	);

export const getAuthTokenStatus200Schema = z.unknown();

export const getAuthTokenStatus400Schema = z.unknown();

export const getAuthTokenStatus401Schema = z.unknown();

export const getAuthTokenStatus403Schema = z.unknown();

export const getAuthTokenStatus404Schema = z.unknown();

export const getAuthTokenResponseSchema = z.union([
	getAuthTokenStatus200Schema,
	getAuthTokenStatus400Schema,
	getAuthTokenStatus401Schema,
	getAuthTokenStatus403Schema,
	getAuthTokenStatus404Schema,
]);

export const deleteAuthTokenPathTokenIdSchema = z
	.string()
	.describe(
		'The identifier of the token to invalidate. The special value "current" may be supplied, which invalidates the token that the HTTP request was authenticated with.',
	);

export const deleteAuthTokenStatus200Schema = z.unknown();

export const deleteAuthTokenStatus400Schema = z.unknown();

export const deleteAuthTokenStatus401Schema = z.unknown();

export const deleteAuthTokenStatus403Schema = z.unknown();

export const deleteAuthTokenStatus404Schema = z.unknown();

export const deleteAuthTokenResponseSchema = z.union([
	deleteAuthTokenStatus200Schema,
	deleteAuthTokenStatus400Schema,
	deleteAuthTokenStatus401Schema,
	deleteAuthTokenStatus403Schema,
	deleteAuthTokenStatus404Schema,
]);

export const getAuthUserStatus200Schema = z.unknown();

export const getAuthUserStatus302Schema = z.unknown();

export const getAuthUserStatus400Schema = z.unknown();

export const getAuthUserStatus401Schema = z.unknown();

export const getAuthUserStatus403Schema = z.unknown();

export const getAuthUserStatus409Schema = z.unknown();

export const getAuthUserResponseSchema = z.union([
	getAuthUserStatus200Schema,
	getAuthUserStatus302Schema,
	getAuthUserStatus400Schema,
	getAuthUserStatus401Schema,
	getAuthUserStatus403Schema,
	getAuthUserStatus409Schema,
]);

export const requestDeleteStatus202Schema = z.unknown();

export const requestDeleteStatus400Schema = z.unknown();

export const requestDeleteStatus401Schema = z.unknown();

export const requestDeleteStatus402Schema = z.unknown();

export const requestDeleteStatus403Schema = z.unknown();

export const requestDeleteResponseSchema = z.union([
	requestDeleteStatus202Schema,
	requestDeleteStatus400Schema,
	requestDeleteStatus401Schema,
	requestDeleteStatus402Schema,
	requestDeleteStatus403Schema,
]);

export const createWebhookQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const createWebhookQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const createWebhookStatus200Schema = z.unknown();

export const createWebhookStatus400Schema = z.unknown();

export const createWebhookStatus401Schema = z.unknown();

export const createWebhookStatus403Schema = z.unknown();

export const createWebhookResponseSchema = z.union([
	createWebhookStatus200Schema,
	createWebhookStatus400Schema,
	createWebhookStatus401Schema,
	createWebhookStatus403Schema,
]);

export const getWebhooksQueryProjectIdSchema = z
	.string()
	.regex(/^[a-zA-z0-9_]+$/)
	.optional();

export const getWebhooksQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getWebhooksQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getWebhooksStatus200Schema = z.unknown();

export const getWebhooksStatus400Schema = z.unknown();

export const getWebhooksStatus401Schema = z.unknown();

export const getWebhooksStatus403Schema = z.unknown();

export const getWebhooksResponseSchema = z.union([
	getWebhooksStatus200Schema,
	getWebhooksStatus400Schema,
	getWebhooksStatus401Schema,
	getWebhooksStatus403Schema,
]);

export const getWebhookPathIdSchema = z.string();

export const getWebhookQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getWebhookQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getWebhookStatus200Schema = z.unknown();

export const getWebhookStatus400Schema = z.unknown();

export const getWebhookStatus401Schema = z.unknown();

export const getWebhookStatus403Schema = z.unknown();

export const getWebhookResponseSchema = z.union([
	getWebhookStatus200Schema,
	getWebhookStatus400Schema,
	getWebhookStatus401Schema,
	getWebhookStatus403Schema,
]);

export const deleteWebhookPathIdSchema = z.string();

export const deleteWebhookQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const deleteWebhookQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const deleteWebhookStatus204Schema = z.unknown();

export const deleteWebhookStatus400Schema = z.unknown();

export const deleteWebhookStatus401Schema = z.unknown();

export const deleteWebhookStatus403Schema = z.unknown();

export const deleteWebhookResponseSchema = z.union([
	deleteWebhookStatus204Schema,
	deleteWebhookStatus400Schema,
	deleteWebhookStatus401Schema,
	deleteWebhookStatus403Schema,
]);

export const listDeploymentAliasesPathIdSchema = z
	.string()
	.describe("The ID of the deployment the aliases should be listed for");

export const listDeploymentAliasesQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const listDeploymentAliasesQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const listDeploymentAliasesStatus200Schema = z.unknown();

export const listDeploymentAliasesStatus400Schema = z.unknown();

export const listDeploymentAliasesStatus401Schema = z.unknown();

export const listDeploymentAliasesStatus403Schema = z.unknown();

export const listDeploymentAliasesStatus404Schema = z.unknown();

export const listDeploymentAliasesResponseSchema = z.union([
	listDeploymentAliasesStatus200Schema,
	listDeploymentAliasesStatus400Schema,
	listDeploymentAliasesStatus401Schema,
	listDeploymentAliasesStatus403Schema,
	listDeploymentAliasesStatus404Schema,
]);

export const assignAliasPathIdSchema = z
	.string()
	.describe("The deployment or alias ID or URL to assign from");

export const assignAliasQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const assignAliasQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const assignAliasStatus200Schema = z.unknown();

export const assignAliasStatus400Schema = z.unknown();

export const assignAliasStatus401Schema = z.unknown();

export const assignAliasStatus402Schema = z.unknown();

export const assignAliasStatus403Schema = z.unknown();

export const assignAliasStatus404Schema = z.unknown();

export const assignAliasStatus409Schema = z.unknown();

export const assignAliasResponseSchema = z.union([
	assignAliasStatus200Schema,
	assignAliasStatus400Schema,
	assignAliasStatus401Schema,
	assignAliasStatus402Schema,
	assignAliasStatus403Schema,
	assignAliasStatus404Schema,
	assignAliasStatus409Schema,
]);

export const listAliasesQueryDomainSchema = z
	.union([z.array(z.string()).max(20), z.string()])
	.optional()
	.describe("Get only aliases of the given domain name");

export const listAliasesQueryFromSchema = z
	.number()
	.optional()
	.describe("Get only aliases created after the provided timestamp");

export const listAliasesQueryLimitSchema = z
	.number()
	.optional()
	.describe("Maximum number of aliases to list from a request");

export const listAliasesQueryProjectIdSchema = z
	.string()
	.optional()
	.describe("Filter aliases from the given `projectId`");

export const listAliasesQuerySinceSchema = z
	.number()
	.optional()
	.describe("Get aliases created after this JavaScript timestamp");

export const listAliasesQueryUntilSchema = z
	.number()
	.optional()
	.describe("Get aliases created before this JavaScript timestamp");

export const listAliasesQueryRollbackDeploymentIdSchema = z
	.string()
	.optional()
	.describe("Get aliases that would be rolled back for the given deployment");

export const listAliasesQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const listAliasesQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const listAliasesStatus200Schema = z.unknown();

export const listAliasesStatus400Schema = z.unknown();

export const listAliasesStatus401Schema = z.unknown();

export const listAliasesStatus403Schema = z.unknown();

export const listAliasesStatus404Schema = z.unknown();

export const listAliasesResponseSchema = z.union([
	listAliasesStatus200Schema,
	listAliasesStatus400Schema,
	listAliasesStatus401Schema,
	listAliasesStatus403Schema,
	listAliasesStatus404Schema,
]);

export const getAliasQueryFromSchema = z
	.number()
	.optional()
	.describe("Get the alias only if it was created after the provided timestamp");

export const getAliasPathIdOrAliasSchema = z
	.string()
	.describe("The alias or alias ID to be retrieved");

export const getAliasQueryProjectIdSchema = z
	.string()
	.optional()
	.describe("Get the alias only if it is assigned to the provided project ID");

export const getAliasQuerySinceSchema = z
	.number()
	.optional()
	.describe("Get the alias only if it was created after this JavaScript timestamp");

export const getAliasQueryUntilSchema = z
	.number()
	.optional()
	.describe("Get the alias only if it was created before this JavaScript timestamp");

export const getAliasQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getAliasQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getAliasStatus200Schema = z.unknown();

export const getAliasStatus400Schema = z.unknown();

export const getAliasStatus401Schema = z.unknown();

export const getAliasStatus403Schema = z.unknown();

export const getAliasStatus404Schema = z.unknown();

export const getAliasResponseSchema = z.union([
	getAliasStatus200Schema,
	getAliasStatus400Schema,
	getAliasStatus401Schema,
	getAliasStatus403Schema,
	getAliasStatus404Schema,
]);

export const deleteAliasPathAliasIdSchema = z
	.string()
	.describe("The ID or alias that will be removed");

export const deleteAliasQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const deleteAliasQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const deleteAliasStatus200Schema = z.unknown();

export const deleteAliasStatus400Schema = z.unknown();

export const deleteAliasStatus401Schema = z.unknown();

export const deleteAliasStatus403Schema = z.unknown();

export const deleteAliasStatus404Schema = z.unknown();

export const deleteAliasResponseSchema = z.union([
	deleteAliasStatus200Schema,
	deleteAliasStatus400Schema,
	deleteAliasStatus401Schema,
	deleteAliasStatus403Schema,
	deleteAliasStatus404Schema,
]);

export const patchUrlProtectionBypassPathIdSchema = z
	.string()
	.describe("The alias or deployment ID");

export const patchUrlProtectionBypassQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const patchUrlProtectionBypassQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const patchUrlProtectionBypassStatus200Schema = z.unknown();

export const patchUrlProtectionBypassStatus400Schema = z.unknown();

export const patchUrlProtectionBypassStatus401Schema = z.unknown();

export const patchUrlProtectionBypassStatus403Schema = z.unknown();

export const patchUrlProtectionBypassStatus404Schema = z.unknown();

export const patchUrlProtectionBypassStatus409Schema = z.unknown();

export const patchUrlProtectionBypassStatus428Schema = z.unknown();

export const patchUrlProtectionBypassResponseSchema = z.union([
	patchUrlProtectionBypassStatus200Schema,
	patchUrlProtectionBypassStatus400Schema,
	patchUrlProtectionBypassStatus401Schema,
	patchUrlProtectionBypassStatus403Schema,
	patchUrlProtectionBypassStatus404Schema,
	patchUrlProtectionBypassStatus409Schema,
	patchUrlProtectionBypassStatus428Schema,
]);

export const getCertByIdPathIdSchema = z.string().describe("The cert id");

export const getCertByIdQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getCertByIdQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getCertByIdStatus200Schema = z.unknown();

export const getCertByIdStatus400Schema = z.unknown();

export const getCertByIdStatus401Schema = z.unknown();

export const getCertByIdStatus403Schema = z.unknown();

export const getCertByIdStatus404Schema = z.unknown();

export const getCertByIdResponseSchema = z.union([
	getCertByIdStatus200Schema,
	getCertByIdStatus400Schema,
	getCertByIdStatus401Schema,
	getCertByIdStatus403Schema,
	getCertByIdStatus404Schema,
]);

export const removeCertPathIdSchema = z.string().describe("The cert id to remove");

export const removeCertQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const removeCertQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const removeCertStatus200Schema = z.unknown();

export const removeCertStatus400Schema = z.unknown();

export const removeCertStatus401Schema = z.unknown();

export const removeCertStatus403Schema = z.unknown();

export const removeCertStatus404Schema = z.unknown();

export const removeCertResponseSchema = z.union([
	removeCertStatus200Schema,
	removeCertStatus400Schema,
	removeCertStatus401Schema,
	removeCertStatus403Schema,
	removeCertStatus404Schema,
]);

export const issueCertQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const issueCertQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const issueCertStatus200Schema = z.unknown();

export const issueCertStatus400Schema = z.unknown();

export const issueCertStatus401Schema = z.unknown();

export const issueCertStatus402Schema = z.unknown();

export const issueCertStatus403Schema = z.unknown();

export const issueCertStatus404Schema = z.unknown();

export const issueCertStatus449Schema = z.unknown();

export const issueCertStatus500Schema = z.unknown();

export const issueCertResponseSchema = z.union([
	issueCertStatus200Schema,
	issueCertStatus400Schema,
	issueCertStatus401Schema,
	issueCertStatus402Schema,
	issueCertStatus403Schema,
	issueCertStatus404Schema,
	issueCertStatus449Schema,
	issueCertStatus500Schema,
]);

export const uploadCertQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const uploadCertQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const uploadCertStatus200Schema = z.unknown();

export const uploadCertStatus400Schema = z.unknown();

export const uploadCertStatus401Schema = z.unknown();

export const uploadCertStatus402Schema = z.unknown();

export const uploadCertStatus403Schema = z.unknown();

export const uploadCertResponseSchema = z.union([
	uploadCertStatus200Schema,
	uploadCertStatus400Schema,
	uploadCertStatus401Schema,
	uploadCertStatus402Schema,
	uploadCertStatus403Schema,
]);

export const listDeploymentFilesPathIdSchema = z
	.string()
	.describe("The unique deployment identifier");

export const listDeploymentFilesQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const listDeploymentFilesQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const listDeploymentFilesStatus200Schema = z.unknown();

export const listDeploymentFilesStatus400Schema = z.unknown();

export const listDeploymentFilesStatus401Schema = z.unknown();

export const listDeploymentFilesStatus403Schema = z.unknown();

export const listDeploymentFilesStatus404Schema = z.unknown();

export const listDeploymentFilesResponseSchema = z.union([
	listDeploymentFilesStatus200Schema,
	listDeploymentFilesStatus400Schema,
	listDeploymentFilesStatus401Schema,
	listDeploymentFilesStatus403Schema,
	listDeploymentFilesStatus404Schema,
]);

export const getDeploymentFileContentsPathIdSchema = z
	.string()
	.describe("The unique deployment identifier");

export const getDeploymentFileContentsPathFileIdSchema = z
	.string()
	.describe("The unique file identifier");

export const getDeploymentFileContentsQueryPathSchema = z
	.string()
	.optional()
	.describe("Path to the file to fetch (only for Git deployments)");

export const getDeploymentFileContentsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getDeploymentFileContentsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getDeploymentFileContentsStatus400Schema = z.unknown();

export const getDeploymentFileContentsStatus401Schema = z.unknown();

export const getDeploymentFileContentsStatus403Schema = z.unknown();

export const getDeploymentFileContentsStatus404Schema = z.unknown();

export const getDeploymentFileContentsStatus410Schema = z.unknown();

export const getDeploymentFileContentsResponseSchema = z.union([
	getDeploymentFileContentsStatus400Schema,
	getDeploymentFileContentsStatus401Schema,
	getDeploymentFileContentsStatus403Schema,
	getDeploymentFileContentsStatus404Schema,
	getDeploymentFileContentsStatus410Schema,
]);

export const getDeploymentsQueryAppSchema = z
	.string()
	.optional()
	.describe("Name of the deployment.");

export const getDeploymentsQueryFromSchema = z
	.number()
	.optional()
	.describe("Gets the deployment created after this Date timestamp. (default: current time)");

export const getDeploymentsQueryLimitSchema = z
	.number()
	.optional()
	.describe("Maximum number of deployments to list from a request.");

export const getDeploymentsQueryProjectIdSchema = z
	.string()
	.optional()
	.describe("Filter deployments from the given ID or name.");

export const getDeploymentsQueryProjectIdsSchema = z
	.array(z.string())
	.min(1)
	.max(20)
	.optional()
	.describe(
		"Filter deployments from the given project IDs. Cannot be used when projectId is specified.",
	);

export const getDeploymentsQueryTargetSchema = z
	.string()
	.optional()
	.describe("Filter deployments based on the environment.");

export const getDeploymentsQueryToSchema = z
	.number()
	.optional()
	.describe("Gets the deployment created before this Date timestamp. (default: current time)");

export const getDeploymentsQueryUsersSchema = z
	.string()
	.optional()
	.describe("Filter out deployments based on users who have created the deployment.");

export const getDeploymentsQuerySinceSchema = z
	.number()
	.optional()
	.describe("Get Deployments created after this JavaScript timestamp.");

export const getDeploymentsQueryUntilSchema = z
	.number()
	.optional()
	.describe("Get Deployments created before this JavaScript timestamp.");

export const getDeploymentsQueryStateSchema = z
	.string()
	.optional()
	.describe(
		"Filter deployments based on their state (`BUILDING`, `ERROR`, `INITIALIZING`, `QUEUED`, `READY`, `CANCELED`, `BLOCKED`)",
	);

export const getDeploymentsQueryRollbackCandidateSchema = z
	.boolean()
	.optional()
	.describe("Filter deployments based on their rollback candidacy");

export const getDeploymentsQueryBranchSchema = z
	.string()
	.optional()
	.describe("Filter deployments based on the branch name");

export const getDeploymentsQueryShaSchema = z
	.string()
	.optional()
	.describe("Filter deployments based on the SHA");

export const getDeploymentsQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const getDeploymentsQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const getDeploymentsStatus200Schema = z.unknown();

export const getDeploymentsStatus400Schema = z.unknown();

export const getDeploymentsStatus401Schema = z.unknown();

export const getDeploymentsStatus403Schema = z.unknown();

export const getDeploymentsStatus404Schema = z.unknown();

export const getDeploymentsStatus422Schema = z.unknown();

export const getDeploymentsResponseSchema = z.union([
	getDeploymentsStatus200Schema,
	getDeploymentsStatus400Schema,
	getDeploymentsStatus401Schema,
	getDeploymentsStatus403Schema,
	getDeploymentsStatus404Schema,
	getDeploymentsStatus422Schema,
]);

export const deleteDeploymentPathIdSchema = z
	.string()
	.describe("The ID of the deployment to be deleted");

export const deleteDeploymentQueryUrlSchema = z
	.string()
	.optional()
	.describe("A Deployment or Alias URL. In case it is passed, the ID will be ignored");

export const deleteDeploymentQueryTeamIdSchema = z
	.string()
	.optional()
	.describe("The Team identifier to perform the request on behalf of.");

export const deleteDeploymentQuerySlugSchema = z
	.string()
	.optional()
	.describe("The Team slug to perform the request on behalf of.");

export const deleteDeploymentStatus200Schema = z.unknown();

export const deleteDeploymentStatus400Schema = z.unknown();

export const deleteDeploymentStatus401Schema = z.unknown();

export const deleteDeploymentStatus403Schema = z.unknown();

export const deleteDeploymentStatus404Schema = z.unknown();

export const deleteDeploymentResponseSchema = z.union([
	deleteDeploymentStatus200Schema,
	deleteDeploymentStatus400Schema,
	deleteDeploymentStatus401Schema,
	deleteDeploymentStatus403Schema,
	deleteDeploymentStatus404Schema,
]);
