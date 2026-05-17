export interface PlatformClientOptions {
	/** Base URL of the platform service */
	serviceUrl: string;
	/** Product identifier registered with the platform */
	productId: string;
	/** Service token for server-to-server auth */
	serviceToken: string;
	/** Timeout in milliseconds for HTTP requests (default: 5000) */
	timeout?: number;
	/** Number of retry attempts on failure (default: 2) */
	retries?: number;
	/** Whether to fail-open when the platform is unreachable (default: false) */
	failOpen?: boolean;
}

export interface Account {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image: string | null;
	stripeCustomerId: string | null;
	createdAt: string;
}

export interface Entitlement {
	feature: string;
	enabled: boolean;
	limitValue: number | null;
	limitWindow: string | null;
}

export interface Quota {
	limit: number | null;
	window: string | null;
}

export interface UsageSummary {
	used: number;
	meter: string;
}

export interface Invoice {
	id: string;
	amount: number;
	currency: string;
	status: string | null;
	created: string;
}

export interface Subscription {
	id: string;
	accountId: string;
	productId: string;
	planId: string;
	stripeSubscriptionId: string | null;
	status: string;
	currentPeriodStart: string | null;
	currentPeriodEnd: string | null;
	createdAt: string;
	updatedAt: string;
}

/**
 * Organization as returned by better-auth's organization plugin.
 *
 * The `metadata` field is a JSON string and may be parsed into a record
 * by consumers when present.
 */
export interface Organization {
	id: string;
	name: string;
	slug: string;
	logo: string | null;
	metadata: string | null;
	stripeCustomerId: string | null;
	createdAt: string;
}

export type OrganizationRole = "owner" | "admin" | "member";

export interface Member {
	id: string;
	organizationId: string;
	userId: string;
	role: OrganizationRole | string;
	createdAt: string;
	user?: {
		id: string;
		name: string;
		email: string;
		image: string | null;
	};
}

export type InvitationStatus = "pending" | "accepted" | "rejected" | "canceled";

export interface Invitation {
	id: string;
	email: string;
	inviterId: string;
	organizationId: string;
	role: OrganizationRole | string;
	status: InvitationStatus | string;
	expiresAt: string;
	createdAt?: string;
}

export interface CreateCheckoutSessionOptions {
	priceId?: string;
	planId?: string;
	quantity?: number;
	mode?: "payment" | "subscription";
	successUrl: string;
	cancelUrl: string;
	metadata?: Record<string, string>;
}

export interface CreateOrganizationInput {
	name: string;
	slug: string;
	logo?: string;
	metadata?: Record<string, unknown>;
}

export interface UpdateOrganizationInput {
	name?: string;
	slug?: string;
	logo?: string;
	metadata?: Record<string, unknown>;
}

export interface PlatformClient {
	/**
	 * Validates the incoming request's session token against the platform.
	 * Returns the authenticated account, or null when no/invalid session.
	 */
	verifySession(headers: Headers): Promise<Account | null>;

	/** Check if an account has access to a specific feature */
	can(accountId: string, feature: string): Promise<boolean>;

	/** Get quota information for a feature */
	getQuota(accountId: string, feature: string): Promise<Quota>;

	/** Get all entitlements for an account */
	getEntitlements(accountId: string): Promise<Entitlement[]>;

	/** Report metered usage */
	reportUsage(accountId: string, meter: string, value: number): Promise<void>;

	/** Get usage summary for a meter */
	getUsage(accountId: string, meter: string): Promise<UsageSummary>;

	/** Create a subscription on the account (no Stripe Checkout) */
	subscribe(accountId: string, planId: string): Promise<Subscription>;

	/** Update a subscription to a new plan */
	changePlan(accountId: string, newPlanId: string): Promise<Subscription>;

	/** Cancel a subscription */
	cancelSubscription(accountId: string): Promise<void>;

	/** Create a hosted Stripe Checkout session */
	createCheckoutSession(
		accountId: string,
		options: CreateCheckoutSessionOptions,
	): Promise<{ url: string }>;

	/** Get the current subscription for the account/product, or null when absent */
	getSubscription(accountId: string): Promise<Subscription | null>;

	/** Get Stripe Customer Portal URL */
	getPortalUrl(accountId: string, returnUrl?: string): Promise<string>;

	/** Get invoices */
	getInvoices(accountId: string): Promise<Invoice[]>;

	// ─── Organization plugin wrappers ────────────────────────────────
	// All methods take the incoming request headers so the platform
	// can authenticate as the calling user via forwarded cookies/bearer.

	listOrganizations(headers: Headers): Promise<Organization[]>;
	getOrganization(idOrSlug: string, headers: Headers): Promise<Organization | null>;
	/**
	 * Service-token lookup of an organization by id or slug. Use this when
	 * there is no signed-in user (e.g. public/anonymous routes that need to
	 * resolve an org from a URL slug).
	 */
	lookupOrganization(idOrSlug: string): Promise<Organization | null>;
	createOrganization(input: CreateOrganizationInput, headers: Headers): Promise<Organization>;
	updateOrganization(
		orgId: string,
		input: UpdateOrganizationInput,
		headers: Headers,
	): Promise<Organization>;
	deleteOrganization(orgId: string, headers: Headers): Promise<void>;
	setActiveOrganization(orgId: string, headers: Headers): Promise<void>;

	listMembers(orgId: string, headers: Headers): Promise<Member[]>;
	removeMember(orgId: string, memberId: string, headers: Headers): Promise<void>;
	updateMemberRole(
		orgId: string,
		memberId: string,
		role: OrganizationRole | string,
		headers: Headers,
	): Promise<Member>;

	listInvitations(orgId: string, headers: Headers): Promise<Invitation[]>;
	inviteMember(
		orgId: string,
		input: { email: string; role: OrganizationRole | string },
		headers: Headers,
	): Promise<Invitation>;
	getInvitation(invitationId: string, headers: Headers): Promise<Invitation | null>;
	acceptInvitation(invitationId: string, headers: Headers): Promise<{ organizationId: string }>;
	rejectInvitation(invitationId: string, headers: Headers): Promise<void>;
	cancelInvitation(invitationId: string, headers: Headers): Promise<void>;
}
