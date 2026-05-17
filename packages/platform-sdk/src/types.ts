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

export interface PlatformClient {
	/**
	 * Returns auth middleware compatible with any framework that
	 * provides a `Request`-like object with headers.
	 *
	 * The middleware validates the session token against the platform
	 * and returns the authenticated account, or null if invalid.
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

	/** Create a subscription */
	subscribe(accountId: string, planId: string): Promise<Subscription>;

	/** Update a subscription to a new plan */
	changePlan(accountId: string, newPlanId: string): Promise<Subscription>;

	/** Cancel a subscription */
	cancelSubscription(accountId: string): Promise<void>;

	/** Get Stripe Customer Portal URL */
	getPortalUrl(accountId: string): Promise<string>;

	/** Get invoices */
	getInvoices(accountId: string): Promise<Invoice[]>;
}
