// @ts-nocheck

import * as z from "zod";

export const accountConfigSchema = z.object({
	alexaPin: z.string().describe("The alexa pin - used by alexa for unlock actions"),
	gactionsHomePin: z.string().describe("The google smart home pin - used for unlock actions"),
	otpEnabledDate: z.iso.datetime().optional().describe("The opt enabled date"),
});

export const accountProfileSchema = z.object({
	firstName: z.string().describe("The first name"),
	lastName: z.string().describe("The last name"),
	address: z.string().describe("The address"),
	zip: z.string().describe("The postal code"),
	city: z.string().describe("The city"),
	country: z.string().describe("The 2-letter country code"),
});

export const accountDescentSchema = z.object({
	origin: z.enum(["GOOGLE", "APPLE"]).describe("The account origin source"),
});

export const termsOfUseSchema = z.object({
	state: z.enum(["Accepted", "Inactive"]).optional(),
	publishDate: z.iso.datetime().optional(),
	acceptanceDate: z.iso.datetime().optional(),
});

export const accountSchema = z.object({
	accountId: z.int().describe("The account id"),
	type: z.int().describe("The type: 0 .. user, 1 .. company, 2 .. caretaker"),
	email: z.string().describe("The email address"),
	emailVerified: z.boolean().optional().describe("true, if the email is verified"),
	name: z.string().describe("The name"),
	masterAccountId: z.int().optional().describe("The master account id if it's a sub account"),
	rights: z
		.int()
		.optional()
		.describe(
			"The rights bitmask if it's a sub account: 1 .. manage smartlock, 2 .. operate smartlock, 4 .. manage smartlock config, 8 .. manage smartlock authorizations, 16 .. view smartlock logs, 32 .. manage sub accounts, 64 .. create smartlocks",
		),
	language: z
		.string()
		.optional()
		.describe("The language code")
		.meta({ examples: ["de"] }),
	config: accountConfigSchema.optional().describe("The optional config"),
	profile: accountProfileSchema.optional().describe("The optional profile"),
	creationDate: z.iso.datetime().describe("The creation date"),
	updateDate: z.iso.datetime().describe("The update date"),
	descent: accountDescentSchema
		.optional()
		.describe("Set, if your account is not a standard Nuki Web account"),
	shsSubscriptionType: z
		.enum(["BUSINESS", "STANDARD", "BUSINESS_PLUS", "API_ONLY"])
		.optional()
		.describe("subscription type of the account (b2b)"),
	b2bActive: z.boolean().optional(),
	apiTermsOfUse: termsOfUseSchema.optional(),
});

export const accountEmailChangeSchema = z.object({
	email: z.string().describe("The new email for the account"),
});

export const accountIntegrationSchema = z.object({
	version: z
		.enum(["LEGACY", "HYDRA"])
		.describe("If the integration/device is an legacy or from the new oauth implementation"),
	vendorKey: z
		.string()
		.describe(
			"Enum key identifying the integration/device, values are e.g. ALEXA, IOS, NUKI_WEB, API_TOKEN etc",
		),
	subAccountName: z
		.string()
		.optional()
		.describe(
			"Name of the sub-account or null if there is none, which is associated with this token",
		),
	subAccountId: z
		.int()
		.optional()
		.describe(
			"Id of the sub-account or null if there is none, which is associated with this token",
		),
	subAccount: z.boolean().optional().describe("True if the integration is done via a sub-account"),
	name: z.string().describe("Name of the token"),
	description: z
		.string()
		.optional()
		.describe("Description given by the user, usually only set for api tokens"),
	createdAt: z.iso.datetime().optional().describe("First creation date of the token"),
	lastActiveAt: z.iso.datetime().optional().describe("Last refresh date of the token"),
	scopes: z
		.array(z.string())
		.optional()
		.describe("The scopes which have been granted to the token"),
	warning: z
		.boolean()
		.optional()
		.describe("If this is from a legacy integration this is set to true"),
	tokenId: z.string().optional().describe("The tokenId if this a manual generated api token"),
	advancedType: z
		.string()
		.optional()
		.describe("The enum advanced type (HEALTHCARE e.g.) if this integration is a advanced one"),
	advancedState: z
		.string()
		.optional()
		.describe("The enum advanced state (TESTING e.g.) if this integration is a advanced one"),
	clientId: z
		.string()
		.describe("The clientId of this integration/device used for deleting the integration"),
	sortOrder: z
		.int()
		.optional()
		.describe(
			"Sort order by which the entry should be sorted, is being set by the vendor key enum",
		),
	device: z.boolean().optional().describe("True this is a device and false this is an integration"),
});

export const accountOtpEnableSchema = z.object({
	otp: z.string().describe("The one time password (otp)"),
});

export const accountPasswordResetSchema = z.object({
	email: z.string(),
	deleteApiTokens: z.boolean().optional(),
});

export const staleDeviceSchema = z.object({
	smartlockId: z.coerce.bigint().optional(),
	name: z.string().optional(),
	read: z.boolean().optional(),
});

export const accountSettingWebSchema = z.object({
	deviceViewType: z
		.enum(["LIST", "TILE"])
		.optional()
		.describe("The initial view type of the device page"),
	deviceSortType: z
		.enum(["FAVOURITES_FIRST", "NAME_ASC", "NAME_DESC", "LAST_ADDED_DESC"])
		.optional()
		.describe("The initial sort type of the device page"),
	nukiClubDismissed: z
		.boolean()
		.optional()
		.describe("If true, Nuki Club info is dismissed and no banner is shown"),
	annotations: z
		.object({})
		.catchall(z.object({}))
		.optional()
		.describe(
			'Additional generic settings. Key/Value Pair, key consists of a prefix (DNS subdomain) and a name (can contains alphanumeric characters with dashes, underscores and dots in between) separated by a dash ("/")',
		)
		.meta({ examples: ['{"web.nuki.io/nfcBannerDismissed": true}'] }),
	removedStaledDevices: z
		.array(staleDeviceSchema)
		.optional()
		.describe("List of removed staled devices"),
	markedStaledDevices: z
		.array(staleDeviceSchema)
		.optional()
		.describe("List of marked staled devices"),
});

export const accountSettingSchema = z.object({
	web: accountSettingWebSchema.optional().describe("The account settings for Nuki Web"),
});

export const accountSubCreateSchema = z.object({
	email: z
		.string()
		.describe("The email address")
		.meta({ examples: ["test@test.at"] }),
	password: z.string().describe("The password (must be at least 7 chars long)"),
	name: z.string().describe("The name of the sub account"),
	rights: z
		.int()
		.describe(
			"The right bitmask of the sub account: 1 .. operate smartlock, 2 .. change smartlock config, 4 .. manage smartlock users, 8 .. view smartlock logs, 16 .. manage sub accounts",
		),
	language: z
		.string()
		.describe("The language code")
		.meta({ examples: ["de"] }),
	profile: accountProfileSchema.optional().describe("The optional profile"),
});

export const accountSubUpdateSchema = z.object({
	email: z
		.string()
		.optional()
		.describe("The new email address")
		.meta({ examples: ["test@test.at"] }),
	password: z.string().optional().describe("The new password (must be at least 7 chars long)"),
	name: z.string().optional().describe("The new name of the sub account"),
	rights: z
		.int()
		.optional()
		.describe(
			"The new right bitmask of the sub account: 1 .. operate smartlock, 2 .. change smartlock config, 4 .. manage smartlock users, 8 .. view smartlock logs, 16 .. manage sub accounts, 32 .. manage sub accounts, 64 .. create smartlocks",
		),
	language: z
		.string()
		.describe("The language code")
		.meta({ examples: ["de"] }),
	config: accountConfigSchema.optional().describe("The optional config"),
	profile: accountProfileSchema.optional().describe("The optional profile"),
});

export const accountUpdateSchema = z.object({
	email: z
		.string()
		.optional()
		.describe("The new email address")
		.meta({ examples: ["test@test.at"] }),
	password: z.string().optional().describe("The password (must be at least 7 chars long)"),
	name: z.string().optional().describe("The name of the account"),
	language: z
		.string()
		.describe("The language code")
		.meta({ examples: ["de"] }),
	config: accountConfigSchema.optional().describe("The optional config"),
	profile: accountProfileSchema.optional().describe("The optional profile"),
});

export const accountUserSchema = z.object({
	accountUserId: z.int().describe("The account user id"),
	accountId: z.int().describe("The account id"),
	type: z.int().optional().describe("The optional type: 0 .. user, 1 .. company"),
	email: z.string().describe("The email address"),
	name: z.string().describe("The name"),
	language: z
		.string()
		.optional()
		.describe("The language code")
		.meta({ examples: ["de"] }),
	operationId: z
		.string()
		.optional()
		.describe("The operation id - if set it's locked for another operation"),
	creationDate: z.iso.datetime().describe("The creation date"),
	updateDate: z.iso.datetime().describe("The update date"),
});

export const accountUserCreateSchema = z.object({
	type: z
		.int()
		.optional()
		.describe("The optional type - only allowed for caretakers: 0 .. user, 1 .. company"),
	email: z.string().describe("The email address"),
	name: z.string().describe("The name"),
	language: z
		.enum(["en", "de", "es", "fr", "it", "nl", "cs", "sk"])
		.optional()
		.describe("The language code"),
});

export const accountUserUpdateSchema = z.object({
	email: z
		.string()
		.optional()
		.describe("The new email address")
		.meta({ examples: ["test@test.at"] }),
	name: z.string().optional().describe("The new name of the sub account"),
	language: z
		.enum(["en", "de", "es", "fr", "it", "nl", "cs", "sk"])
		.optional()
		.describe("The new language code"),
});

export const addressSchema = z.object({
	addressId: z.int().describe("The address id"),
	accountId: z.int().describe("The account id"),
	name: z.string().describe("The name of the address"),
	smartlockIds: z.array(z.coerce.bigint()).describe("The smartlocks for this address"),
	serviceId: z
		.enum(["airbnb", "bookingsync"])
		.optional()
		.describe("The optional service id if the address is from an partner service"),
	timeZone: z.string().optional().describe("The timezone"),
	checkInTime: z.int().optional().describe("The optional check in time (minutes of the day)"),
	checkOutTime: z.int().optional().describe("The optional check out time (minutes of the day)"),
	settings: z.object({}).catchall(z.object({})).optional().describe("The optional settings object"),
	creationDate: z.iso.datetime().describe("The creation date"),
	updateDate: z.iso.datetime().describe("The update date"),
});

export const addressCreateSchema = z.object({
	name: z.string().describe("The name of the address"),
	smartlockIds: z.array(z.coerce.bigint()).describe("The smartlocks for this address"),
});

export const addressReservationSchema = z.object({
	id: z.string().describe("The id"),
	addressId: z.int().describe("The address id"),
	accountId: z.int().describe("The account id"),
	email: z.string().describe("The email of the guest"),
	name: z.string().describe("The name of the guest"),
	guests: z.int().describe("The number of guests"),
	guestsIssued: z.int().describe("The number of guests issued"),
	keypadIssued: z.boolean().describe("True if a keypad authorization was issued"),
	state: z.enum(["canceled", "accepted"]).describe("The state"),
	serviceId: z
		.enum(["airbnb", "bookingsync"])
		.optional()
		.describe("The optional service id if the address is from an partner service"),
	reference: z.string().optional().describe("The reference (booking code)"),
	automation: z.int().describe("The automation state"),
	checkedIn: z
		.boolean()
		.optional()
		.describe(
			"True if the user has checked in, false if the check in is pending, null if it isn't monitored",
		),
	startDate: z.iso.datetime().describe("The start date"),
	endDate: z.iso.datetime().describe("The end date"),
	updateDate: z.iso.datetime().describe("The update date"),
	isCurrentlyIssuingAuth: z.boolean(),
	isCurrentlyRevokingAuth: z.boolean(),
	hasCustomAccessTimes: z.boolean(),
	currentlyIssuingAuth: z.boolean().optional(),
	currentlyRevokingAuth: z.boolean().optional(),
});

export const addressTokenSchema = z.object({
	id: z.string().describe("The id"),
	addressId: z.int().describe("The address id"),
	creationDate: z.iso.datetime().describe("The creation date"),
	redeemDate: z.iso.datetime().describe("The redeem date"),
	redeemAccountId: z.int().describe("The redeem account id"),
	inviteKeys: z.array(z.string()).optional().describe("The list of invite keys"),
	redeemResult: z.enum(["ok", "failed"]).optional().describe("The redeem result"),
});

export const addressTokenInfoSchema = z.object({
	id: z.string().describe("The id"),
	addressName: z.string().describe("The address name"),
	smartlockNames: z.array(z.string()).describe("The associated smartlock names"),
});

export const addressUnitSchema = z.object({
	id: z.string().optional().describe("The id"),
	name: z.string().describe("The name of the address unit"),
	addressId: z.int().optional().describe("The address id"),
	addressTokenId: z.string().optional().describe("The address token id"),
	operationId: z
		.string()
		.optional()
		.describe("The operation id - if set it's locked for another operation"),
});

export const addressUnitResponseSchema = z.object({
	id: z.string().optional().describe("The id"),
	name: z.string().describe("The name of the address unit"),
	addressId: z.int().optional().describe("The address id"),
	addressTokenId: z.string().optional().describe("The address token id"),
	operationId: z
		.string()
		.optional()
		.describe("The operation id - if set it's locked for another operation"),
	creationDate: z.iso.datetime().describe("The creation date"),
	redeemDate: z.iso.datetime().describe("The redeem date"),
	redeemResult: z.enum(["ok", "failed"]).optional().describe("The redeem result"),
});

export const addressUpdateSchema = z.object({
	name: z.string().optional().describe("The name of the address"),
	smartlockIds: z.array(z.coerce.bigint()).optional().describe("The smartlocks for this address"),
	settings: z.object({}).catchall(z.object({})).optional().describe("The optional settings"),
});

export const advancedApiKeySchema = z.object({
	name: z.string().describe("The name of the company for which you apply for access"),
	country: z
		.string()
		.describe(
			"The country of the headquarter or the country where you are mainly doing business in",
		),
	description: z
		.string()
		.describe(
			"Describe the services and/or products you offer to your customers and how your customers would use Nuki devices in their processes",
		),
	type: z
		.enum(["ONLY_SECRET", "SHORT_RENTAL", "HEALTHCARE", "SMART_HOME", "OTHER"])
		.describe("The application type"),
	webhookStatus: z
		.enum(["ACTIVE", "DEACTIVATED"])
		.optional()
		.describe("The status of the webhook posting automation"),
	url: z
		.string()
		.describe("A website where we can find more information on the company and its business model"),
	email: z
		.string()
		.describe("An email address where we can contact you for checks on your application"),
	webhookUrl: z.string().describe("The URL where our webhooks should point to"),
	webhookFeatures: z
		.array(
			z.enum([
				"DEVICE_STATUS",
				"DEVICE_MASTERDATA",
				"DEVICE_CONFIG",
				"DEVICE_LOGS",
				"DEVICE_AUTHS",
				"ACCOUNT_USER",
			]),
		)
		.refine((items) => new Set(items).size === items.length, {
			message: "Array entries must be unique",
		})
		.describe("The features to trigger webhooks, for all types except 'ONLY_SECRET'"),
	restricted: z.boolean().describe("Whether the advanced API key is restricted"),
	secret: z
		.string()
		.describe("The client secret, visible if application is approved (status >= 'TESTING')"),
	status: z.enum(["INACTIVE", "APPLIED", "TESTING", "ACTIVE"]).describe("The application status"),
	creationDate: z.iso.datetime().describe("The creation date"),
	updateDate: z.iso.datetime().describe("The update date"),
});

export const advancedApiKeyCreateSchema = z.object({
	name: z.string().describe("The name of the company for which you apply for access"),
	country: z
		.string()
		.describe(
			"The country of the headquarter or the country where you are mainly doing business in",
		),
	description: z
		.string()
		.describe(
			"Describe the services and/or products you offer to your customers and how your customers would use Nuki devices in their processes",
		),
	type: z
		.enum(["ONLY_SECRET", "SHORT_RENTAL", "HEALTHCARE", "SMART_HOME", "OTHER"])
		.describe("The application type"),
	webhookStatus: z
		.enum(["ACTIVE", "DEACTIVATED"])
		.optional()
		.describe("The status of the webhook posting automation"),
	url: z
		.string()
		.describe("A website where we can find more information on the company and its business model"),
	email: z
		.string()
		.describe("An email address where we can contact you for checks on your application"),
	webhookUrl: z.string().describe("The URL where our webhooks should point to"),
	webhookFeatures: z
		.array(
			z.enum([
				"DEVICE_STATUS",
				"DEVICE_MASTERDATA",
				"DEVICE_CONFIG",
				"DEVICE_LOGS",
				"DEVICE_AUTHS",
				"ACCOUNT_USER",
			]),
		)
		.refine((items) => new Set(items).size === items.length, {
			message: "Array entries must be unique",
		})
		.describe("The features to trigger webhooks, for all types except 'ONLY_SECRET'"),
	restricted: z.boolean().describe("Whether the advanced API key is restricted"),
});

export const advancedApiKeyUpdateSchema = z.object({
	webhookUrl: z.string().describe("The URL where our webhooks should point to"),
	webhookFeatures: z
		.array(
			z.enum([
				"DEVICE_STATUS",
				"DEVICE_MASTERDATA",
				"DEVICE_CONFIG",
				"DEVICE_LOGS",
				"DEVICE_AUTHS",
				"ACCOUNT_USER",
			]),
		)
		.refine((items) => new Set(items).size === items.length, {
			message: "Array entries must be unique",
		})
		.describe("The features to trigger webhooks, for all types except 'ONLY_SECRET'"),
});

export const advancedConfirmationResponseSchema = z.object({
	requestId: z
		.string()
		.describe("A UUID to identify the upcoming asynchronously web hook response"),
	error: z
		.string()
		.optional()
		.describe(
			"Contains error message and smartlock IDs, if auths can not be created because they need subscription.",
		),
});

export const apiKeySchema = z.object({
	apiKeyId: z.int().describe("The id"),
	accountId: z.int().describe("The account id"),
	description: z.string().optional().describe("The description"),
	redirectUris: z.array(z.string()).optional().describe("The redirect uris"),
	creationDate: z.iso.datetime().describe("The creation date"),
	apiKey: z.string().optional().describe("The api key"),
});

export const apiKeyAdvancedSchema = z.object({
	name: z.string().optional(),
	country: z.string().optional(),
	description: z.string().optional(),
	type: z.enum(["ONLY_SECRET", "SHORT_RENTAL", "HEALTHCARE", "SMART_HOME", "OTHER"]).optional(),
	url: z.string().optional(),
	email: z.string().optional(),
	webhookFeatures: z
		.array(
			z.enum([
				"DEVICE_STATUS",
				"DEVICE_MASTERDATA",
				"DEVICE_CONFIG",
				"DEVICE_LOGS",
				"DEVICE_AUTHS",
				"ACCOUNT_USER",
			]),
		)
		.refine((items) => new Set(items).size === items.length, {
			message: "Array entries must be unique",
		})
		.optional(),
	webhookUrl: z.string().optional(),
	webhookSentSuccessfully: z.int().optional(),
	webhookSentErroneous: z.int().optional(),
	lastSuccessfulPost: z.iso.datetime().optional(),
	lastPostDuration: z.coerce.bigint().optional(),
	lastPostSuccesful: z.boolean().optional(),
	status: z.enum(["INACTIVE", "APPLIED", "TESTING", "ACTIVE"]).optional(),
	webhookStatus: z.enum(["ACTIVE", "DEACTIVATED"]).optional(),
	creationDate: z.iso.datetime().optional(),
	updateDate: z.iso.datetime().optional(),
	restricted: z.boolean().optional(),
});

export const apiKeyCreateSchema = z.object({
	description: z.string().optional().describe("The description"),
	redirectUris: z.array(z.string()).optional().describe("The list of redirect uris"),
});

export const completableFutureListApiKeySchema = z.object({
	completedExceptionally: z.boolean().optional(),
	numberOfDependents: z.int().optional(),
	done: z.boolean().optional(),
	cancelled: z.boolean().optional(),
});

export const apiKeyServiceSchema = z.object({
	byActiveWebhook: completableFutureListApiKeySchema.optional(),
});

export const apiKeyTokenSchema = z.object({
	id: z.string().describe("The id"),
	accountId: z.int().describe("The account id"),
	description: z.string().optional().describe("The description"),
	accessToken: z.string().optional().describe("The access token"),
	scopes: z.array(z.string()).describe("The list of scopes"),
	creationDate: z.iso.datetime().describe("The creation date"),
});

export const apiKeyTokenCreateSchema = z.object({
	description: z.string().optional().describe("The description"),
	scopes: z.array(z.string()).optional().describe("The list of scopes"),
});

export const apiKeyTokenUpdateSchema = z.object({
	description: z.string().optional().describe("The description"),
	scopes: z.array(z.string()).optional().describe("The list of scopes"),
});

export const apiKeyUpdateSchema = z.object({
	description: z.string().optional().describe("The description"),
	redirectUris: z.array(z.string()).optional().describe("The list of redirect uris"),
});

export const filterSchema = z.object({});

export const levelSchema = z.object({
	name: z.string().optional(),
	resourceBundleName: z.string().optional(),
	localizedName: z.string().optional(),
});

export const formatterSchema = z.object({});

export const errorManagerSchema = z.object({});

export const handlerSchema = z.object({
	filter: filterSchema.optional(),
	formatter: formatterSchema.optional(),
	errorManager: errorManagerSchema.optional(),
	encoding: z.string().optional(),
	level: levelSchema.optional(),
});

export const localeSchema = z.object({
	language: z.string().optional(),
	displayName: z.string().optional(),
	country: z.string().optional(),
	variant: z.string().optional(),
	script: z.string().optional(),
	unicodeLocaleAttributes: z
		.array(z.string())
		.refine((items) => new Set(items).size === items.length, {
			message: "Array entries must be unique",
		})
		.optional(),
	unicodeLocaleKeys: z
		.array(z.string())
		.refine((items) => new Set(items).size === items.length, {
			message: "Array entries must be unique",
		})
		.optional(),
	displayLanguage: z.string().optional(),
	displayScript: z.string().optional(),
	displayCountry: z.string().optional(),
	displayVariant: z.string().optional(),
	extensionKeys: z
		.array(z.string())
		.refine((items) => new Set(items).size === items.length, {
			message: "Array entries must be unique",
		})
		.optional(),
	iso3Language: z.string().optional(),
	iso3Country: z.string().optional(),
});

export const enumerationStringSchema = z.object({});

export const resourceBundleSchema = z.object({
	locale: localeSchema.optional(),
	keys: enumerationStringSchema.optional(),
	baseBundleName: z.string().optional(),
});

export const loggerSchema = z.object({
	name: z.string().optional(),
	get parent() {
		return loggerSchema.optional();
	},
	filter: filterSchema.optional(),
	level: levelSchema.optional(),
	resourceBundleName: z.string().optional(),
	handlers: z.array(handlerSchema).optional(),
	useParentHandlers: z.boolean().optional(),
	resourceBundle: resourceBundleSchema.optional(),
});

export const restletSchema = z.object({
	author: z.string().optional(),
	get context() {
		return contextSchema.optional();
	},
	description: z.string().optional(),
	name: z.string().optional(),
	owner: z.string().optional(),
	started: z.boolean().optional(),
	get logger() {
		return loggerSchema.optional();
	},
	get application() {
		return applicationSchema.optional();
	},
	stopped: z.boolean().optional(),
});

export const parameterSchema = z.object({
	name: z.string().optional(),
	value: z.string().optional(),
});

export const enrolerSchema = z.object({});

export const verifierSchema = z.object({});

export const scheduledExecutorServiceSchema = z.object({
	terminated: z.boolean().optional(),
	shutdown: z.boolean().optional(),
});

export const contextSchema = z.object({
	get clientDispatcher() {
		return restletSchema.optional();
	},
	get serverDispatcher() {
		return restletSchema.optional();
	},
	attributes: z.object({}).catchall(z.object({})).optional(),
	get logger() {
		return loggerSchema.optional();
	},
	parameters: z.array(parameterSchema).optional(),
	defaultEnroler: enrolerSchema.optional(),
	defaultVerifier: verifierSchema.optional(),
	executorService: scheduledExecutorServiceSchema.optional(),
});

export const roleSchema = z.object({
	get application() {
		return applicationSchema.optional();
	},
	get childRoles() {
		return z.array(roleSchema).optional();
	},
	description: z.string().optional(),
	name: z.string().optional(),
});

export const serviceSchema = z.object({
	get context() {
		return contextSchema.optional();
	},
	enabled: z.boolean().optional(),
	started: z.boolean().optional(),
	stopped: z.boolean().optional(),
});

export const connegServiceSchema = z.object({
	get context() {
		return contextSchema.optional();
	},
	enabled: z.boolean().optional(),
	started: z.boolean().optional(),
	strict: z.boolean().optional(),
	stopped: z.boolean().optional(),
});

export const converterServiceSchema = z.object({
	get context() {
		return contextSchema.optional();
	},
	enabled: z.boolean().optional(),
	started: z.boolean().optional(),
	stopped: z.boolean().optional(),
});

export const metadataSchema = z.object({
	description: z.string().optional(),
	name: z.string().optional(),
	get parent() {
		return metadataSchema.optional();
	},
});

export const characterSetSchema = z.object({
	description: z.string().optional(),
	name: z.string().optional(),
	get parent() {
		return metadataSchema.optional();
	},
});

export const encodingSchema = z.object({
	description: z.string().optional(),
	name: z.string().optional(),
	get parent() {
		return metadataSchema.optional();
	},
});

export const languageSchema = z.object({
	description: z.string().optional(),
	name: z.string().optional(),
	subTags: z.array(z.string()).optional(),
	get parent() {
		return languageSchema.optional();
	},
	primaryTag: z.string().optional(),
});

export const mediaTypeSchema = z.object({
	description: z.string().optional(),
	name: z.string().optional(),
	parameters: z.array(parameterSchema).optional(),
	get parent() {
		return mediaTypeSchema.optional();
	},
	mainType: z.string().optional(),
	concrete: z.boolean().optional(),
	subType: z.string().optional(),
});

export const metadataServiceSchema = z.object({
	get context() {
		return contextSchema.optional();
	},
	enabled: z.boolean().optional(),
	started: z.boolean().optional(),
	defaultCharacterSet: characterSetSchema.optional(),
	defaultEncoding: encodingSchema.optional(),
	get defaultLanguage() {
		return languageSchema.optional();
	},
	get defaultMediaType() {
		return mediaTypeSchema.optional();
	},
	allEncodingExtensionNames: z.array(z.string()).optional(),
	allCharacterSetExtensionNames: z.array(z.string()).optional(),
	allExtensionNames: z.array(z.string()).optional(),
	allLanguageExtensionNames: z.array(z.string()).optional(),
	allMediaTypeExtensionNames: z.array(z.string()).optional(),
	stopped: z.boolean().optional(),
});

export const rangeServiceSchema = z.object({
	get context() {
		return contextSchema.optional();
	},
	enabled: z.boolean().optional(),
	started: z.boolean().optional(),
	stopped: z.boolean().optional(),
});

export const protocolSchema = z.object({
	confidential: z.boolean().optional(),
	defaultPort: z.int().optional(),
	description: z.string().optional(),
	name: z.string().optional(),
	schemeName: z.string().optional(),
	technicalName: z.string().optional(),
	version: z.string().optional(),
});

export const referenceSchema = z.object({
	get baseRef() {
		return referenceSchema.optional();
	},
	absolute: z.boolean().optional(),
	scheme: z.string().optional(),
	opaque: z.boolean().optional(),
	authority: z.string().optional(),
	relative: z.boolean().optional(),
	query: z.string().optional(),
	path: z.string().optional(),
	userInfo: z.string().optional(),
	schemeSpecificPart: z.string().optional(),
	fragment: z.string().optional(),
	extensions: z.string().optional(),
	extensionsAsArray: z.array(z.string()).optional(),
	hierarchicalPart: z.string().optional(),
	hostDomain: z.string().optional(),
	hostIdentifier: z.string().optional(),
	hostPort: z.int().optional(),
	lastSegment: z.string().optional(),
	get parentRef() {
		return referenceSchema.optional();
	},
	relativePart: z.string().optional(),
	get relativeRef() {
		return referenceSchema.optional();
	},
	remainingPart: z.string().optional(),
	schemeProtocol: protocolSchema.optional(),
	segments: z.array(z.string()).optional(),
	get targetRef() {
		return referenceSchema.optional();
	},
	hierarchical: z.boolean().optional(),
	identifier: z.string().optional(),
	matrix: z.string().optional(),
	matrixAsForm: z.array(parameterSchema).optional(),
	queryAsForm: z.array(parameterSchema).optional(),
});

export const statusServiceSchema = z.object({
	get context() {
		return contextSchema.optional();
	},
	enabled: z.boolean().optional(),
	started: z.boolean().optional(),
	get connegService() {
		return connegServiceSchema.optional();
	},
	contactEmail: z.string().optional(),
	get converterService() {
		return converterServiceSchema.optional();
	},
	get homeRef() {
		return referenceSchema.optional();
	},
	get metadataService() {
		return metadataServiceSchema.optional();
	},
	overwriting: z.boolean().optional(),
	stopped: z.boolean().optional(),
});

export const taskServiceSchema = z.object({
	get context() {
		return contextSchema.optional();
	},
	enabled: z.boolean().optional(),
	started: z.boolean().optional(),
	corePoolSize: z.int().optional(),
	daemon: z.boolean().optional(),
	shutdownAllowed: z.boolean().optional(),
	terminated: z.boolean().optional(),
	shutdown: z.boolean().optional(),
	stopped: z.boolean().optional(),
});

export const tunnelServiceSchema = z.object({
	get context() {
		return contextSchema.optional();
	},
	enabled: z.boolean().optional(),
	started: z.boolean().optional(),
	characterSetParameter: z.string().optional(),
	encodingParameter: z.string().optional(),
	extensionsTunnel: z.boolean().optional(),
	headersTunnel: z.boolean().optional(),
	languageParameter: z.string().optional(),
	mediaTypeParameter: z.string().optional(),
	methodHeader: z.string().optional(),
	methodParameter: z.string().optional(),
	methodTunnel: z.boolean().optional(),
	preferencesTunnel: z.boolean().optional(),
	queryTunnel: z.boolean().optional(),
	userAgentTunnel: z.boolean().optional(),
	stopped: z.boolean().optional(),
});

export const connectorServiceSchema = z.object({
	get context() {
		return contextSchema.optional();
	},
	enabled: z.boolean().optional(),
	started: z.boolean().optional(),
	clientProtocols: z.array(protocolSchema).optional(),
	serverProtocols: z.array(protocolSchema).optional(),
	stopped: z.boolean().optional(),
});

export const decoderServiceSchema = z.object({
	get context() {
		return contextSchema.optional();
	},
	enabled: z.boolean().optional(),
	started: z.boolean().optional(),
	stopped: z.boolean().optional(),
});

export const encoderServiceSchema = z.object({
	get context() {
		return contextSchema.optional();
	},
	enabled: z.boolean().optional(),
	started: z.boolean().optional(),
	get acceptedMediaTypes() {
		return z.array(mediaTypeSchema).optional();
	},
	get ignoredMediaTypes() {
		return z.array(mediaTypeSchema).optional();
	},
	minimumSize: z.coerce.bigint().optional(),
	stopped: z.boolean().optional(),
});

export const applicationSchema = z.object({
	author: z.string().optional(),
	get context() {
		return contextSchema.optional();
	},
	description: z.string().optional(),
	name: z.string().optional(),
	owner: z.string().optional(),
	started: z.boolean().optional(),
	debugging: z.boolean().optional(),
	get inboundRoot() {
		return restletSchema.optional();
	},
	get outboundRoot() {
		return restletSchema.optional();
	},
	get roles() {
		return z.array(roleSchema).optional();
	},
	get services() {
		return z.array(serviceSchema).optional();
	},
	get connegService() {
		return connegServiceSchema.optional();
	},
	get converterService() {
		return converterServiceSchema.optional();
	},
	get metadataService() {
		return metadataServiceSchema.optional();
	},
	get rangeService() {
		return rangeServiceSchema.optional();
	},
	get statusService() {
		return statusServiceSchema.optional();
	},
	get taskService() {
		return taskServiceSchema.optional();
	},
	get tunnelService() {
		return tunnelServiceSchema.optional();
	},
	get connectorService() {
		return connectorServiceSchema.optional();
	},
	get decoderService() {
		return decoderServiceSchema.optional();
	},
	get encoderService() {
		return encoderServiceSchema.optional();
	},
	get logger() {
		return loggerSchema.optional();
	},
	get application() {
		return applicationSchema.optional();
	},
	stopped: z.boolean().optional(),
});

export const authenticationInfoSchema = z.object({
	nextServerNonce: z.string().optional(),
	nonceCount: z.int().optional(),
	clientNonce: z.string().optional(),
	quality: z.string().optional(),
	responseDigest: z.string().optional(),
});

export const smartlockWebConfigSchema = z.object({
	batteryWarningPerMailEnabled: z
		.boolean()
		.optional()
		.describe(
			"True if a battery warning is send via email, if null/not send, the value is not being updated",
		),
	dismissedLiftUpHandleWarning: z
		.array(z.int())
		.optional()
		.describe(
			"Contains the account ids which have dismissed the lift up handle warning, if null/not send, the value is not being updated. To clear send a empty array []",
		),
});

export const webConfigRequestSchema = z.object({
	smartlockId: z.coerce.bigint().optional(),
	webConfig: smartlockWebConfigSchema.optional(),
});

export const bulkWebConfigRequestSchema = z.object({
	webConfigRequests: z.array(webConfigRequestSchema).optional(),
});

export const cacheDirectiveSchema = z.object({
	digit: z.boolean().optional(),
	name: z.string().optional(),
	value: z.string().optional(),
});

export const publicKeySchema = z.object({
	encoded: z.array(z.string()).optional(),
	format: z.string().optional(),
	algorithm: z.string().optional(),
});

export const certificateSchema = z.object({
	type: z.string().optional(),
	encoded: z.array(z.string()).optional(),
	publicKey: publicKeySchema.optional(),
});

export const challengeSchemeSchema = z.object({
	description: z.string().optional(),
	name: z.string().optional(),
	technicalName: z.string().optional(),
});

export const challengeRequestSchema = z.object({
	rawValue: z.string().optional(),
	parameters: z.array(parameterSchema).optional(),
	scheme: challengeSchemeSchema.optional(),
	serverNonce: z.string().optional(),
	realm: z.string().optional(),
	opaque: z.string().optional(),
	digestAlgorithm: z.string().optional(),
	qualityOptions: z.array(z.string()).optional(),
	get domainRefs() {
		return z.array(referenceSchema).optional();
	},
	stale: z.boolean().optional(),
});

export const principalSchema = z.object({
	name: z.string().optional(),
});

export const challengeResponseSchema = z.object({
	rawValue: z.string().optional(),
	parameters: z.array(parameterSchema).optional(),
	scheme: challengeSchemeSchema.optional(),
	serverNonce: z.string().optional(),
	realm: z.string().optional(),
	opaque: z.string().optional(),
	digestAlgorithm: z.string().optional(),
	clientNonce: z.string().optional(),
	get digestRef() {
		return referenceSchema.optional();
	},
	identifier: z.string().optional(),
	quality: z.string().optional(),
	secret: z.array(z.string()).optional(),
	secretAlgorithm: z.string().optional(),
	serverNounceCount: z.int().optional(),
	timeIssued: z.coerce.bigint().optional(),
	principal: principalSchema.optional(),
	serverNounceCountAsHex: z.string().optional(),
});

export const preferenceCharacterSetSchema = z.object({
	metadata: characterSetSchema.optional(),
	parameters: z.array(parameterSchema).optional(),
	quality: z.number().optional(),
});

export const preferenceEncodingSchema = z.object({
	metadata: encodingSchema.optional(),
	parameters: z.array(parameterSchema).optional(),
	quality: z.number().optional(),
});

export const preferenceLanguageSchema = z.object({
	get metadata() {
		return languageSchema.optional();
	},
	parameters: z.array(parameterSchema).optional(),
	quality: z.number().optional(),
});

export const preferenceMediaTypeSchema = z.object({
	get metadata() {
		return mediaTypeSchema.optional();
	},
	parameters: z.array(parameterSchema).optional(),
	quality: z.number().optional(),
});

export const productSchema = z.object({
	comment: z.string().optional(),
	name: z.string().optional(),
	version: z.string().optional(),
});

export const expectationSchema = z.object({
	name: z.string().optional(),
	parameters: z.array(parameterSchema).optional(),
	value: z.string().optional(),
});

export const userSchema = z.object({
	email: z.string().optional(),
	firstName: z.string().optional(),
	identifier: z.string().optional(),
	lastName: z.string().optional(),
	secret: z.array(z.string()).optional(),
	name: z.string().optional(),
});

export const clientInfoSchema = z.object({
	acceptedCharacterSets: z.array(preferenceCharacterSetSchema).optional(),
	acceptedEncodings: z.array(preferenceEncodingSchema).optional(),
	acceptedLanguages: z.array(preferenceLanguageSchema).optional(),
	acceptedMediaTypes: z.array(preferenceMediaTypeSchema).optional(),
	acceptedPatches: z.array(preferenceMediaTypeSchema).optional(),
	address: z.string().optional(),
	agent: z.string().optional(),
	agentAttributes: z.object({}).catchall(z.string()).optional(),
	agentProducts: z.array(productSchema).optional(),
	authenticated: z.boolean().optional(),
	certificates: z.array(certificateSchema).optional(),
	cipherSuite: z.string().optional(),
	expectations: z.array(expectationSchema).optional(),
	forwardedAddresses: z.array(z.string()).optional(),
	from: z.string().optional(),
	port: z.int().optional(),
	principals: z.array(principalSchema).optional(),
	get roles() {
		return z.array(roleSchema).optional();
	},
	user: userSchema.optional(),
	agentName: z.string().optional(),
	agentVersion: z.string().optional(),
	mainAgentProduct: productSchema.optional(),
	upstreamAddress: z.string().optional(),
});

export const companySchema = z.object({
	name: z.string().optional(),
	email: z.string().optional(),
});

export const completableFutureSchema = z.object({
	completedExceptionally: z.boolean().optional(),
	numberOfDependents: z.int().optional(),
	done: z.boolean().optional(),
	cancelled: z.boolean().optional(),
});

export const tagSchema = z.object({
	name: z.string().optional(),
	weak: z.boolean().optional(),
});

export const conditionsSchema = z.object({
	match: z.array(tagSchema).optional(),
	modifiedSince: z.iso.datetime().optional(),
	noneMatch: z.array(tagSchema).optional(),
	rangeDate: z.iso.datetime().optional(),
	rangeTag: tagSchema.optional(),
	unmodifiedSince: z.iso.datetime().optional(),
});

export const cookieSchema = z.object({
	domain: z.string().optional(),
	name: z.string().optional(),
	path: z.string().optional(),
	value: z.string().optional(),
	version: z.int().optional(),
});

export const cookieSettingSchema = z.object({
	domain: z.string().optional(),
	name: z.string().optional(),
	path: z.string().optional(),
	value: z.string().optional(),
	version: z.int().optional(),
	accessRestricted: z.boolean().optional(),
	comment: z.string().optional(),
	maxAge: z.int().optional(),
	secure: z.boolean().optional(),
	description: z.string().optional(),
});

export const decentralWebhookSchema = z.object({
	id: z.int().optional().describe("The identifier"),
	secret: z.string().optional().describe("The secret to sign the webhook's payload"),
	webhookUrl: z
		.string()
		.describe("The URL where our webhooks (POST requests) should point to (needs to be https)"),
	webhookFeatures: z
		.array(
			z.enum([
				"DEVICE_STATUS",
				"DEVICE_MASTERDATA",
				"DEVICE_CONFIG",
				"DEVICE_LOGS",
				"DEVICE_AUTHS",
				"ACCOUNT_USER",
			]),
		)
		.refine((items) => new Set(items).size === items.length, {
			message: "Array entries must be unique",
		})
		.describe(
			"The features to trigger webhooks, set values: DEVICE_STATUS, DEVICE_MASTERDATA, DEVICE_CONFIG, DEVICE_LOGS, DEVICE_AUTHS, ACCOUNT_USER",
		),
});

export const digestSchema = z.object({
	algorithm: z.string().optional(),
	value: z.array(z.string()).optional(),
});

export const dispositionSchema = z.object({
	parameters: z.array(parameterSchema).optional(),
	type: z.string().optional(),
	filename: z.string().optional(),
});

export const enumerationSchema = z.object({});

export const headerSchema = z.object({
	name: z.string().optional(),
	value: z.string().optional(),
});

export const inputStreamSchema = z.object({});

export const methodSchema = z.object({
	description: z.string().optional(),
	idempotent: z.boolean().optional(),
	name: z.string().optional(),
	replying: z.boolean().optional(),
	safe: z.boolean().optional(),
	uri: z.string().optional(),
});

export const myAccountSchema = z.object({
	accountId: z.int().describe("The account id"),
	type: z.int().describe("The type: 0 .. user, 1 .. company, 2 .. caretaker"),
	email: z.string().describe("The email address"),
	emailVerified: z.boolean().optional().describe("true, if the email is verified"),
	name: z.string().describe("The name"),
	masterAccountId: z.int().optional().describe("The master account id if it's a sub account"),
	rights: z
		.int()
		.optional()
		.describe(
			"The rights bitmask if it's a sub account: 1 .. manage smartlock, 2 .. operate smartlock, 4 .. manage smartlock config, 8 .. manage smartlock authorizations, 16 .. view smartlock logs, 32 .. manage sub accounts, 64 .. create smartlocks",
		),
	language: z
		.string()
		.optional()
		.describe("The language code")
		.meta({ examples: ["de"] }),
	config: accountConfigSchema.optional().describe("The optional config"),
	profile: accountProfileSchema.optional().describe("The optional profile"),
	secret: z.array(z.string()).optional().describe("The secret base64 encoded"),
	creationDate: z.iso.datetime().describe("The creation date"),
	updateDate: z.iso.datetime().describe("The update date"),
	descent: accountDescentSchema
		.optional()
		.describe("Set, if your account is not a standard Nuki Web account"),
	shsSubscriptionType: z
		.enum(["BUSINESS", "STANDARD", "BUSINESS_PLUS", "API_ONLY"])
		.optional()
		.describe("subscription type of the account (b2b)"),
	b2bActive: z.boolean().optional(),
	apiTermsOfUse: termsOfUseSchema.optional(),
});

export const namedValueSchema = z.object({
	name: z.string().optional(),
	value: z.object({}).optional(),
});

export const namedValueStringSchema = z.object({
	name: z.string().optional(),
	value: z.string().optional(),
});

export const notificationSettingSchema = z.object({
	smartlockId: z.coerce
		.bigint()
		.optional()
		.describe(
			"The smartlock ID, if not set all Smart Locks of the account  are enabled for push notifications",
		),
	triggerEvents: z
		.array(z.string())
		.refine((items) => new Set(items).size === items.length, {
			message: "Array entries must be unique",
		})
		.describe(
			"A set on which push notifications should be triggered: lock, unlock, unlatch, lockngo, open, ring, doorsensor, warnings, smartlock",
		),
	authIds: z
		.array(z.string())
		.refine((items) => new Set(items).size === items.length, {
			message: "Array entries must be unique",
		})
		.optional()
		.describe(
			"A set of auth IDs to filter push notifications to certain  users or keypads. If no entry push notifications are triggered for all users and keypads",
		),
});

export const notificationSchema = z.object({
	notificationId: z.string().optional().describe("The unique notificationId for the notification"),
	referenceId: z
		.string()
		.optional()
		.describe("The reference ID, an ID to identify a foreign system"),
	pushId: z.string().describe("The push ID or the POST URL for a webhook"),
	secret: z
		.string()
		.optional()
		.describe(
			"The 40 byte hex string to sign the checksumof the POST payload if the notification is webhook (os=2)",
		)
		.meta({ examples: ["8d41a187c3954f886f9de3a88c2ef22df0eac190"] }),
	os: z.int().describe("The operating system: 0 .. Android, 1 .. iOS, 2 .. web hook"),
	language: z
		.string()
		.optional()
		.describe("The language of push messages: cs, de, en (default), es, fr, it, nl, sk"),
	status: z.int().optional().describe("Current state: 0 .. init, 1 .. active, 2 .. failed"),
	lastActiveDate: z.iso.datetime().optional().describe("The last active date"),
	settings: z.array(notificationSettingSchema).describe("Settings per Smart Lock"),
});

export const objectIdSchema = z.object({
	timestamp: z.int().optional(),
	counter: z.int().optional(),
	time: z.coerce.bigint().optional(),
	date: z.iso.datetime().optional(),
	machineIdentifier: z.int().optional(),
	processIdentifier: z.int().optional(),
	timeSecond: z.int().optional(),
});

export const openerIntercomBrandSchema = z.object({
	brandId: z.int().describe("The brand ID"),
	brand: z.string().describe("The brand name"),
});

export const openerIntercomModelSchema = z.object({
	intercomId: z.int().describe("The intercom ID"),
	brandId: z.int().describe("The related brand ID"),
	type: z.int().describe("The type of the model"),
	model: z.string().describe("The model name"),
	verified: z
		.int()
		.describe(
			"Verified Nuki intercom: 1 .. verified to work, 2 .. may be compatible, but not verified, 3 .. not compatible",
		),
	conGndBus: z.string().describe("Connection for ground BUS"),
	conBusAudio: z.string().describe("Connection for audio BUS"),
	conAudioout: z.string().describe("Connection for audio out"),
	conDoorbellPlus: z.string().describe("Connection for doorbell plus"),
	conDoorbellMinus: z.string().describe("Connection for doorbell minus"),
	conOpendoor: z.string().describe("Connection for open the door"),
	conGndAnalogue: z.string().describe("Connection for ground analogue"),
	busModeSwitch: z.int().describe("Settings value for BUS mode switch"),
	busModeSwitchShortCircuitDuration: z
		.int()
		.describe("Settings value for BUS mode switch short cicuit duration"),
	creationDate: z.iso.datetime().optional().describe("The creation date"),
	updateDate: z.iso.datetime().optional().describe("The update date"),
});

export const paginationSchema = z.object({
	totalItems: z.coerce.bigint().optional(),
	totalPages: z.int().optional(),
	currentPage: z.int().optional(),
	nextPage: z.string().optional(),
	prevPage: z.string().optional(),
	pageSize: z.int().optional(),
});

export const paginatedResponseSchema = z.object({
	results: z.array(z.object({})).optional(),
	pagination: paginationSchema.optional(),
});

export const preferenceSchema = z.object({
	get metadata() {
		return metadataSchema.optional();
	},
	parameters: z.array(parameterSchema).optional(),
	quality: z.number().optional(),
});

export const rangeSchema = z.object({
	index: z.coerce.bigint().optional(),
	instanceSize: z.coerce.bigint().optional(),
	size: z.coerce.bigint().optional(),
	unitName: z.string().optional(),
});

export const readableByteChannelSchema = z.object({
	open: z.boolean().optional(),
});

export const readerSchema = z.object({});

export const recipientInfoSchema = z.object({
	protocol: protocolSchema.optional(),
	comment: z.string().optional(),
	name: z.string().optional(),
});

export const selectionListenerSchema = z.object({});

export const selectableChannelSchema = z.object({
	registered: z.boolean().optional(),
	blocking: z.boolean().optional(),
	open: z.boolean().optional(),
});

export const wakeupListenerSchema = z.object({});

export const selectionRegistrationSchema = z.object({
	canceling: z.boolean().optional(),
	interestOperations: z.int().optional(),
	selectionListener: selectionListenerSchema.optional(),
	readyOperations: z.int().optional(),
	selectableChannel: selectableChannelSchema.optional(),
	wakeupListener: wakeupListenerSchema.optional(),
	readable: z.boolean().optional(),
	writable: z.boolean().optional(),
	connectable: z.boolean().optional(),
	interestReady: z.boolean().optional(),
});

export const representationSchema = z.object({
	characterSet: characterSetSchema.optional(),
	encodings: z.array(encodingSchema).optional(),
	get locationRef() {
		return referenceSchema.optional();
	},
	get languages() {
		return z.array(languageSchema).optional();
	},
	get mediaType() {
		return mediaTypeSchema.optional();
	},
	modificationDate: z.iso.datetime().optional(),
	tag: tagSchema.optional(),
	available: z.boolean().optional(),
	digest: digestSchema.optional(),
	disposition: dispositionSchema.optional(),
	expirationDate: z.iso.datetime().optional(),
	range: rangeSchema.optional(),
	size: z.coerce.bigint().optional(),
	empty: z.boolean().optional(),
	channel: readableByteChannelSchema.optional(),
	transient: z.boolean().optional(),
	text: z.string().optional(),
	reader: readerSchema.optional(),
	availableSize: z.coerce.bigint().optional(),
	registration: selectionRegistrationSchema.optional(),
	stream: inputStreamSchema.optional(),
	selectable: z.boolean().optional(),
});

export const uniformSchema = z.object({});

export const stackTraceElementSchema = z.object({
	classLoaderName: z.string().optional(),
	moduleName: z.string().optional(),
	moduleVersion: z.string().optional(),
	methodName: z.string().optional(),
	fileName: z.string().optional(),
	lineNumber: z.int().optional(),
	className: z.string().optional(),
	nativeMethod: z.boolean().optional(),
});

export const throwableSchema = z.object({
	get cause() {
		return throwableSchema.optional();
	},
	stackTrace: z.array(stackTraceElementSchema).optional(),
	message: z.string().optional(),
	get suppressed() {
		return z.array(throwableSchema).optional();
	},
	localizedMessage: z.string().optional(),
});

export const statusSchema = z.object({
	code: z.int().optional(),
	description: z.string().optional(),
	reasonPhrase: z.string().optional(),
	get throwable() {
		return throwableSchema.optional();
	},
	uri: z.string().optional(),
	error: z.boolean().optional(),
	success: z.boolean().optional(),
	globalError: z.boolean().optional(),
	informational: z.boolean().optional(),
	redirection: z.boolean().optional(),
	recoverableError: z.boolean().optional(),
	serverError: z.boolean().optional(),
	connectorError: z.boolean().optional(),
	clientError: z.boolean().optional(),
});

export const warningSchema = z.object({
	agent: z.string().optional(),
	date: z.iso.datetime().optional(),
	status: statusSchema.optional(),
	text: z.string().optional(),
});

export const requestSchema = z.object({
	attributes: z.object({}).catchall(z.object({})).optional(),
	cacheDirectives: z.array(cacheDirectiveSchema).optional(),
	date: z.iso.datetime().optional(),
	entity: representationSchema.optional(),
	onError: uniformSchema.optional(),
	onSent: uniformSchema.optional(),
	recipientsInfo: z.array(recipientInfoSchema).optional(),
	warnings: z.array(warningSchema).optional(),
	accessControlRequestHeaders: z
		.array(z.string())
		.refine((items) => new Set(items).size === items.length, {
			message: "Array entries must be unique",
		})
		.optional(),
	accessControlRequestMethod: methodSchema.optional(),
	challengeResponse: challengeResponseSchema.optional(),
	clientInfo: clientInfoSchema.optional(),
	conditions: conditionsSchema.optional(),
	cookies: z.array(cookieSchema).optional(),
	get hostRef() {
		return referenceSchema.optional();
	},
	loggable: z.boolean().optional(),
	maxForwards: z.int().optional(),
	method: methodSchema.optional(),
	onResponse: uniformSchema.optional(),
	get originalRef() {
		return referenceSchema.optional();
	},
	protocol: protocolSchema.optional(),
	proxyChallengeResponse: challengeResponseSchema.optional(),
	ranges: z.array(rangeSchema).optional(),
	get referrerRef() {
		return referenceSchema.optional();
	},
	get resourceRef() {
		return referenceSchema.optional();
	},
	get rootRef() {
		return referenceSchema.optional();
	},
	asynchronous: z.boolean().optional(),
	entityAvailable: z.boolean().optional(),
	expectingResponse: z.boolean().optional(),
	synchronous: z.boolean().optional(),
	confidential: z.boolean().optional(),
	entityAsText: z.string().optional(),
	headers: z.array(headerSchema).optional(),
});

export const reservationAccessTimesUpdateSchema = z.object({
	checkInTime: z.int().optional().describe("Custom check in time in minutes from midnight"),
	checkOutTime: z.int().optional().describe("Custom check out time in minutes from midnight"),
});

export const serverInfoSchema = z.object({
	acceptingRanges: z.boolean().optional(),
	address: z.string().optional(),
	agent: z.string().optional(),
	port: z.int().optional(),
});

export const responseSchema = z.object({
	attributes: z.object({}).catchall(z.object({})).optional(),
	cacheDirectives: z.array(cacheDirectiveSchema).optional(),
	date: z.iso.datetime().optional(),
	entity: representationSchema.optional(),
	onError: uniformSchema.optional(),
	onSent: uniformSchema.optional(),
	recipientsInfo: z.array(recipientInfoSchema).optional(),
	warnings: z.array(warningSchema).optional(),
	accessControlAllowCredentials: z.boolean().optional(),
	accessControlAllowHeaders: z
		.array(z.string())
		.refine((items) => new Set(items).size === items.length, {
			message: "Array entries must be unique",
		})
		.optional(),
	accessControlAllowMethods: z
		.array(methodSchema)
		.refine((items) => new Set(items).size === items.length, {
			message: "Array entries must be unique",
		})
		.optional(),
	accessControlAllowOrigin: z.string().optional(),
	accessControlExposeHeaders: z
		.array(z.string())
		.refine((items) => new Set(items).size === items.length, {
			message: "Array entries must be unique",
		})
		.optional(),
	accessControlMaxAge: z.int().optional(),
	age: z.int().optional(),
	allowedMethods: z
		.array(methodSchema)
		.refine((items) => new Set(items).size === items.length, {
			message: "Array entries must be unique",
		})
		.optional(),
	authenticationInfo: authenticationInfoSchema.optional(),
	autoCommitting: z.boolean().optional(),
	challengeRequests: z.array(challengeRequestSchema).optional(),
	committed: z.boolean().optional(),
	cookieSettings: z.array(cookieSettingSchema).optional(),
	dimensions: z
		.array(
			z.enum([
				"AUTHORIZATION",
				"CHARACTER_SET",
				"CLIENT_ADDRESS",
				"CLIENT_AGENT",
				"UNSPECIFIED",
				"ENCODING",
				"LANGUAGE",
				"MEDIA_TYPE",
				"TIME",
				"ORIGIN",
			]),
		)
		.refine((items) => new Set(items).size === items.length, {
			message: "Array entries must be unique",
		})
		.optional(),
	get locationRef() {
		return referenceSchema.optional();
	},
	proxyChallengeRequests: z.array(challengeRequestSchema).optional(),
	request: requestSchema.optional(),
	retryAfter: z.iso.datetime().optional(),
	serverInfo: serverInfoSchema.optional(),
	status: statusSchema.optional(),
	final: z.boolean().optional(),
	provisional: z.boolean().optional(),
	confidential: z.boolean().optional(),
	entityAvailable: z.boolean().optional(),
	entityAsText: z.string().optional(),
	headers: z.array(headerSchema).optional(),
});

export const shsSubscriptionSchema = z.object({
	type: z.enum(["B2C", "B2B"]).optional(),
	state: z
		.enum(["ACTIVE", "INACTIVE", "CANCELLED", "EXPIRED", "ON_HOLD", "PENDING", "PENDING_CANCEL"])
		.optional(),
	shsSubscriptionType: z.enum(["BUSINESS", "STANDARD", "BUSINESS_PLUS", "API_ONLY"]).optional(),
	updateDate: z.iso.datetime().optional(),
	creationDate: z.iso.datetime().optional(),
	expirationDate: z.iso.datetime().optional(),
	isInGracePeriod: z.boolean().optional(),
	isGracePeriodWarningDismissed: z.boolean().optional(),
	gracePeriodWarningEmailSent: z.boolean().optional(),
	contractId: z.uuid().optional(),
});

export const smartlockConfigSchema = z.object({
	name: z.string().describe("The name of the smartlock for new users"),
	latitude: z.number().describe("The latitude of the smartlock position"),
	longitude: z.number().describe("The longitude of the smartlock position"),
	capabilities: z
		.int()
		.optional()
		.describe(
			"The capabilities indicate whether door opening via app is possible, RTO is possible or both: 0 .. only door opening possible, 1 .. both possible, 2 .. only RTO possible (only for type=2)",
		),
	autoUnlatch: z
		.boolean()
		.optional()
		.describe(
			"True if the door should be unlatched on unlocking (knob) (only for type=1 and type=3)",
		),
	liftUpHandle: z
		.boolean()
		.optional()
		.describe(
			"True if the door has a lift up handle, which is required to be lifted up to lock the door",
		),
	pairingEnabled: z
		.boolean()
		.optional()
		.describe("True if the pairing is allowed via the smartlock button"),
	buttonEnabled: z.boolean().optional().describe("True if the button on the smartlock is enabled"),
	ledEnabled: z.boolean().optional().describe("True if the LED on the smartlock is enabled"),
	ledBrightness: z
		.int()
		.optional()
		.describe("The brightness of the LED: 0 .. off, 5 .. max (only for type=1 and type=3)"),
	timezoneOffset: z.int().describe("[deprecated] The timezone offset (in minutes)"),
	daylightSavingMode: z
		.int()
		.optional()
		.describe("[deprecated] The daylight saving mode: 0 .. off, 1 .. european"),
	fobPaired: z.boolean().optional().describe("True if a fob is paired with the smartlock"),
	fobAction1: z
		.int()
		.optional()
		.describe(
			"The fob action if button is pressed once: type=0/3/4: 0 .. none, 1 .. unlock, 2 .. lock, 3 .. lock 'n' go, 4 .. intelligent (lock/unlocked based on the current state); type=2: 0 .. none, 1 .. toggle ring to open, 2 .. activate ring to open, 3 .. deactivate ring to open, 7 .. open (electric strike actuation), 8 .. ring",
		),
	fobAction2: z
		.int()
		.optional()
		.describe(
			"The fob action if button is pressed twice: type=0/3/4: 0 .. none, 1 .. unlock, 2 .. lock, 3 .. lock 'n' go, 4 .. intelligent (lock/unlocked based on the current state); type=2: 0 .. none, 1 .. toggle ring to open, 2 .. activate ring to open, 3 .. deactivate ring to open, 7 .. open (electric strike actuation), 8 .. ring",
		),
	fobAction3: z
		.int()
		.optional()
		.describe(
			"The fob action if button is pressed 3 times: type=0/3/4: 0 .. none, 1 .. unlock, 2 .. lock, 3 .. lock 'n' go, 4 .. intelligent (lock/unlocked based on the current state); type=2: 0 .. none, 1 .. toggle ring to open, 2 .. activate ring to open, 3 .. deactivate ring to open, 7 .. open (electric strike actuation), 8 .. ring",
		),
	singleLock: z
		.boolean()
		.describe("True if the smartlock should only lock once (instead of twice) (only for type=1)"),
	operatingMode: z
		.int()
		.optional()
		.describe(
			"The operating mode of the opener (only for type=2): 0x00 .. generic door opener, 0x01 .. analogue intercom, 0x02 .. digital intercom, 0x03 .. digital intercom Siedle, 0x04 .. digital intercom TCS, 0x05 .. digital intercom Bticino, 0x06 .. analog intercom Siedle HTS, 0x07 .. digital intercom STR, 0x08 .. digital intercom Ritto, 0x09 .. digital intercom Fermax, 0x0A .. digital intercom Comelit, 0x0B .. digital intercom Urmet BiBus, 0x0C .. digital intercom Urmet 2Voice, 0x0D .. digital intercom Golmar, 0x0E .. digital intercom SKS, 0x0F .. digital intercom Spare",
		),
	advertisingMode: z
		.int()
		.describe(
			"The advertising mode (battery saving): 0 .. automatic, 1 .. normal, 2 .. slow, 3 .. slowest",
		),
	keypadPaired: z.boolean().optional().describe("True if a keypad is paired with the smartlock"),
	keypad2Paired: z.boolean().optional().describe("True if a keypad 2 is paired with the smartlock"),
	homekitState: z
		.int()
		.optional()
		.describe(
			"The homekit state: 0 .. unavailable, 1 .. disabled, 2 .. enabled, 3 .. enabled & paired",
		),
	matterState: z
		.int()
		.optional()
		.describe(
			"The matter state: 0 .. not available, 1 .. disabled and no certificate available, 2 .. disabled, 3 .. enabled, 4 .. enabled & paired",
		),
	timezoneId: z.int().describe("The timezone id (check https://developer.nuki.io for ids)"),
	deviceType: z.int().optional().describe("The device type of a Nuki device"),
	wifiEnabled: z
		.boolean()
		.optional()
		.describe("Flag that indicates if the devices internal WIFI module can be used"),
	operationId: z
		.string()
		.optional()
		.describe("The operation id - if set it's locked for another operation"),
	productVariant: z
		.int()
		.optional()
		.describe("The product variant for Smartlock 5: 1 .. Go, 2 .. Pro, 3 .. Ultra"),
});

export const smartlockAdvancedConfigSchema = z.object({
	lngTimeout: z.int().optional().describe("Timeout in seconds for lock ‘n’ go"),
	singleButtonPressAction: z
		.int()
		.optional()
		.describe(
			"The desired action, if the button is pressed once: 0 .. no action, 1 .. intelligent, 2 .. unlock, 3 .. lock, 4 .. unlatch, 5 .. lock 'n' go, 6 .. show status",
		),
	doubleButtonPressAction: z
		.int()
		.optional()
		.describe(
			"The desired action, if the button is pressed twice: 0 .. no action, 1 .. intelligent, 2 .. unlock, 3 .. lock, 4 .. unlatch, 5 .. lock 'n' go, 6 .. show status",
		),
	automaticBatteryTypeDetection: z
		.boolean()
		.optional()
		.describe("Flag that indicates if the automatic detection of the battery type is enabled"),
	unlatchDuration: z
		.int()
		.optional()
		.describe("Duration in seconds for holding the latch in unlatched position"),
	operationId: z
		.string()
		.optional()
		.describe("The operation id - if set it's locked for another operation"),
	totalDegrees: z
		.int()
		.describe("The absolute total position in degrees that has been reached during calibration"),
	singleLockedPositionOffsetDegrees: z
		.int()
		.describe("Offset that alters the single locked position"),
	unlockedToLockedTransitionOffsetDegrees: z
		.int()
		.optional()
		.describe("Offset that alters the position where transition from unlocked to locked happens"),
	unlockedPositionOffsetDegrees: z.int().describe("Offset that alters the unlocked position"),
	lockedPositionOffsetDegrees: z.int().describe("Offset that alters the locked position"),
	detachedCylinder: z
		.boolean()
		.optional()
		.describe(
			"Flag that indicates that the inner side of the used cylinder is detached from the outer side",
		),
	batteryType: z
		.int()
		.describe(
			"The type of the batteries present in the smart lock: 0 .. alkali, 1 .. accumulator, 2 .. lithium",
		),
	autoLock: z
		.boolean()
		.optional()
		.describe(
			"New separate flag with FW >= 2.7.8/1.9.1: The Auto Lock feature automatically locks your door when it has been unlocked for a certain period of time",
		),
	autoLockTimeout: z
		.int()
		.optional()
		.describe(
			"Seconds until the smart lock relocks itself after it has been unlocked. FW < 2.7.8/1.9.1: No auto relock if value is 0, FW >= 2.7.8/1.9.1: has to be >=2 (defaults to 2 for values <2 if autoLock is set to true)",
		),
	autoUpdateEnabled: z
		.boolean()
		.optional()
		.describe(
			"Flag that indicates if available firmware updates for the deviceshould be installed automatically",
		),
	motorSpeed: z
		.int()
		.optional()
		.describe(
			"Field used for setting the motor speed. 0x00 ... standard, 0x01 ... fast, 0x02 ... slow",
		),
	enableSlowSpeedDuringNightmode: z
		.boolean()
		.optional()
		.describe("Flag indicating if the slow speed shall be applied during NightMode"),
});

export const smartlockOpenerAdvancedConfigSchema = z.object({
	intercomId: z.int().describe("The database ID of the connected intercom"),
	busModeSwitch: z.int().describe("Method to switch between data and analogue mode"),
	shortCircuitDuration: z
		.int()
		.describe("Duration of the short circuit for BUS mode switching in ms"),
	electricStrikeDelay: z
		.int()
		.describe(
			"Delay of electric strike activation in ms after lock action 3 'electric strike actuation'",
		),
	randomElectricStrikeDelay: z
		.boolean()
		.describe(
			"Random electricStrikeDelay (range 3000 - 7000 ms) in order to simulate a person inside actuating the electric strike",
		),
	electricStrikeDuration: z
		.int()
		.describe(
			"Duration in ms of electric strike actuation lock action 3 'electric strike actuation'",
		),
	disableRtoAfterRing: z.boolean().describe("Flag to disable RTO after ring"),
	rtoTimeout: z
		.int()
		.describe("After this period of time in minutes, RTO gets deactivated automatically"),
	doorbellSuppression: z
		.int()
		.describe(
			"The doorbell supression bitmask: first bit (least significant) .. whenever the doorbell rings and CM and RTO are inactive, second bit .. RTO is active, third bit .. CM is active",
		),
	doorbellSuppressionDuration: z
		.int()
		.describe(
			"Duration in ms of doorbell suppression (only in Operating mode 2 'digital Intercom')",
		),
	soundRing: z
		.int()
		.describe("The sound for ring: 0 .. no sound, 1 .. Sound1, 2 .. Sound2, 3 .. Sound3"),
	soundOpen: z
		.int()
		.describe("The sound for open: 0 .. no sound, 1 .. Sound1, 2 .. Sound2, 3 .. Sound3"),
	soundRto: z
		.int()
		.describe("The sound for RTO: 0 .. no sound, 1 .. Sound1, 2 .. Sound2, 3 .. Sound3"),
	soundCm: z
		.int()
		.describe("The sound for CM: 0 .. no sound, 1 .. Sound1, 2 .. Sound2, 3 .. Sound3"),
	soundConfirmation: z.int().describe("The sound confirmation: 0 .. no sound, 1 .. sound"),
	soundLevel: z.int().describe("The sound level"),
	singleButtonPressAction: z
		.int()
		.describe(
			"The desired action, if the button is pressed once: 0 .. no action, 1 .. toggle RTO, 2 .. activate RTO, 3 .. deactivate RTO, 4 .. toggle CM, 5 .. activate CM, 6 .. deactivate CM, 7 .. open",
		),
	doubleButtonPressAction: z
		.int()
		.describe(
			"The desired action, if the button is pressed twice: 0 .. no action, 1 .. toggle RTO, 2 .. activate RTO, 3 .. deactivate RTO, 4 .. toggle CM, 5 .. activate CM, 6 .. deactivate CM, 7 .. open",
		),
	batteryType: z
		.int()
		.describe(
			"The type of the batteries present in the smart lock: 0 .. alkali, 1 .. accumulator, 2 .. lithium, 3 .. fixed",
		),
	automaticBatteryTypeDetection: z
		.boolean()
		.optional()
		.describe("Flag that indicates if the automatic detection of the battery type is enabled"),
	autoUpdateEnabled: z
		.boolean()
		.optional()
		.describe(
			"Flag that indicates if available firmware updates for the deviceshould be installed automatically",
		),
	operationId: z
		.string()
		.optional()
		.describe("The operation id - if set it's locked for another operation"),
});

export const smartlockSmartdoorAdvancedConfigSchema = z.object({
	lngTimeout: z.int().optional().describe("Timeout in seconds for lock ‘n’ go"),
	singleButtonPressAction: z
		.int()
		.optional()
		.describe(
			"The desired action, if the button is pressed once: 0 .. no action, 1 .. intelligent, 2 .. unlock, 3 .. lock, 4 .. unlatch, 5 .. lock 'n' go, 6 .. show status",
		),
	doubleButtonPressAction: z
		.int()
		.optional()
		.describe(
			"The desired action, if the button is pressed twice: 0 .. no action, 1 .. intelligent, 2 .. unlock, 3 .. lock, 4 .. unlatch, 5 .. lock 'n' go, 6 .. show status",
		),
	automaticBatteryTypeDetection: z
		.boolean()
		.optional()
		.describe("Flag that indicates if the automatic detection of the battery type is enabled"),
	unlatchDuration: z
		.int()
		.optional()
		.describe("Duration in seconds for holding the latch in unlatched position"),
	operationId: z
		.string()
		.optional()
		.describe("The operation id - if set it's locked for another operation"),
	buzzerVolume: z
		.int()
		.optional()
		.describe("The volume of the buzzer: 0 .. off, 1 .. low, 2 .. normal"),
	supportedBatteryTypes: z
		.array(z.int())
		.refine((items) => new Set(items).size === items.length, {
			message: "Array entries must be unique",
		})
		.optional()
		.describe(
			"Set of supported battery types: 0 .. alkali, 1 .. accumulator, 2 .. lithium, 3 .. fixed, 254 .. automatic, 255 .. unknown",
		),
	batteryType: z
		.int()
		.describe(
			"The type of the batteries present in the smart lock: 0 .. alkali, 1 .. accumulator, 2 .. lithium, 3 .. fixed, 255 .. unknown",
		),
	autoLockTimeout: z
		.int()
		.optional()
		.describe(
			"Seconds until the smart lock relocks itself after it has been unlocked. No auto relock if value is 0",
		),
	autoLock: z
		.boolean()
		.describe(
			"The Auto Lock feature automatically locks your door when it has been unlocked for a certain period of time",
		),
});

export const smartlockStateSchema = z.object({
	mode: z
		.int()
		.describe(
			"The smartlock mode: 0 .. uninitialized, 1 .. pairing, 2 .. door (default), 3 .. continuous (type=2 only), 4 .. maintenance, 5 .. off-door charging",
		),
	state: z
		.int()
		.describe(
			"The smartlock state: type=0/3/4: 0 .. uncalibrated, 1 .. locked, 2 .. unlocking, 3 .. unlocked, 4 .. locking, 5 .. unlatched, 6 .. unlocked (lock 'n' go), 7 .. unlatching, 224 .. Error wrong entry code, 225 .. Error wrong Fingerprint, 254 .. motor blocked, 255 .. undefined; type=2: 0 .. untrained, 1 .. online, 3 .. ring to open active, 5 .. open, 7 .. opening, 253 .. boot run, 255 .. undefined",
		),
	trigger: z
		.int()
		.describe(
			" The state trigger: 0 .. system, 1 .. manual, 2 .. button, 3 .. automatic, 4 .. web (type=1 only), 5 .. app (type=1 only), 6 .. continuous mode (type=2 only), 7 .. accessory (type=3 only)",
		),
	lastAction: z
		.int()
		.describe(
			"The action: type=0/3/4: 1 .. unlock, 2 .. lock, 3 .. unlatch, 4 .. lock 'n' go, 5 .. lock 'n' go with unlatch; type=1: 1 .. unlock; type=2: 1 .. activate ring to open, 2 .. deactivate ring to open, 3 .. open (electric strike actuation)",
		),
	batteryCritical: z.boolean().describe("True if the battery state of the device is critical"),
	batteryCharging: z
		.boolean()
		.optional()
		.describe("True if a Nuki battery pack in a Smart Lock is currently charging"),
	batteryCharge: z.int().optional().describe("Remaining capacity of a Nuki battery pack in %"),
	keypadBatteryCritical: z
		.boolean()
		.optional()
		.describe(
			"True if the battery of a paired Keypad is critical (only available for supported devices)",
		),
	doorsensorBatteryCritical: z
		.boolean()
		.optional()
		.describe(
			"True if the battery of a paired doorsensor is critical (only available for supported devices)",
		),
	doorState: z
		.int()
		.describe(
			"The door state: 0 .. unavailable/not paired, 1 .. deactivated, 2 .. door closed, 3 .. door opened, 4 .. door state unknown, 5 .. calibrating, 16 .. uncalibrated, 240 .. removed, 255 .. unknown",
		),
	ringToOpenTimer: z
		.int()
		.describe(
			"[deprecated] Remaining ring to open time; 0 if ring to open is not active (type=2 only)",
		),
	ringToOpenEnd: z.iso
		.datetime()
		.optional()
		.describe("End date of ring to open timeout; null if ring to open is not active (type=2 only)"),
	nightMode: z.boolean().describe("True if night mode currently active"),
	operationId: z
		.string()
		.optional()
		.describe("The operation id - if set it's locked for another operation"),
});

export const smartlockSchema = z.object({
	smartlockId: z.coerce.bigint().describe("The smartlock id"),
	accountId: z.int().describe("The account id"),
	type: z
		.int()
		.describe(
			"The type: 0 .. Smartlock 1/2, 1 .. Box, 2 .. Opener, 3 .. Smartdoor, 4 .. Smartlock 3/4, 5 .. Smartlock 5",
		),
	lmType: z
		.int()
		.optional()
		.describe(
			"The lock mechanism used in the smart door lock: 1 .. MyEVO, 2 .. KFV Genius (only for type = 3)",
		),
	authId: z.int().describe("The authorization id"),
	name: z.string().describe("The name of the smartlock"),
	favorite: z.boolean().describe("The favorite flag"),
	config: smartlockConfigSchema.optional().describe("The config"),
	advancedConfig: smartlockAdvancedConfigSchema.optional().describe("The advanced config"),
	openerAdvancedConfig: smartlockOpenerAdvancedConfigSchema
		.optional()
		.describe("The opener advanced config"),
	smartdoorAdvancedConfig: smartlockSmartdoorAdvancedConfigSchema
		.optional()
		.describe("The smartdoor advanced config"),
	webConfig: smartlockWebConfigSchema.optional().describe("The web config"),
	state: smartlockStateSchema.optional().describe("The state"),
	firmwareVersion: z.int().optional().describe("The firmware version"),
	hardwareVersion: z.int().optional().describe("The hardware version"),
	operationId: z
		.string()
		.optional()
		.describe("The operation id - if set it's locked for another operation"),
	serverState: z
		.int()
		.describe(
			"The server state: 0 .. ok, 1 .. unregistered, 2 .. auth uuid invalid, 3 .. auth invalid, 4 .. offline",
		),
	adminPinState: z.int().describe("The admin pin state: 0 .. ok, 1 .. missing, 2 .. invalid"),
	virtualDevice: z.boolean().optional().describe("The flag indicating a virtual Smart Lock"),
	creationDate: z.iso.datetime().optional().describe("The creation date"),
	updateDate: z.iso.datetime().optional().describe("The update date"),
	error: z.string().optional().describe("In case of any error, it contains the error message"),
	previousSubscriptions: z
		.array(shsSubscriptionSchema)
		.optional()
		.describe("Previous Subscriptions"),
	currentSubscription: shsSubscriptionSchema.optional().describe("Current Subscription"),
	region: z.int().optional().describe("The region"),
	mountingVariant: z.int().optional().describe("The mounting variant"),
	opener: z.boolean().optional(),
	box: z.boolean().optional(),
	smartDoor: z.boolean().optional(),
	keyturner: z.boolean().optional(),
});

export const smartlockActionSchema = z.object({
	action: z
		.int()
		.describe(
			"The action: type=0/3/4: 1 .. unlock, 2 .. lock, 3 .. unlatch, 4 .. lock 'n' go, 5 .. lock 'n' go with unlatch; type=1: 1 .. unlock; type=2: 1 activate ring to open, 2 .. deactivate ring to open, 3 .. open (electric strike actuation), 6 ... activate continuous mode, 7 ... deactivate continuous mode",
		),
	option: z.int().optional().describe("The option mask: 0 .. none, 2 .. force, 4 .. full lock"),
});

export const smartlockAdminPinUpdateSchema = z.object({
	adminPin: z.int().describe("The admin pin"),
});

export const smartlockAuthSchema = z.object({
	id: z.string().describe("The unique id for the smartlock authorization"),
	smartlockId: z.coerce.bigint().describe("The smartlock id"),
	accountUserId: z.int().optional().describe("The id of the linked account user"),
	authId: z.int().optional().describe("The smartlock authorization id"),
	code: z.int().optional().describe("The keypad code (only for type keypad)"),
	fingerprints: z.object({}).catchall(z.string()).optional(),
	type: z
		.int()
		.describe(
			"The type of the authorization: 0 .. app, 1 .. bridge, 2 .. fob, 3 .. keypad, 13 .. keypad code, 14 .. z-key, 15 .. virtual",
		),
	name: z.string().describe("The name of the authorization (max 32 chars)"),
	enabled: z.boolean().describe("True if the auth is enabled"),
	remoteAllowed: z.boolean().describe("True if the auth has remote access"),
	lockCount: z.int().describe("The lock count"),
	allowedFromDate: z.iso.datetime().optional().describe("The allowed from date"),
	allowedUntilDate: z.iso.datetime().optional().describe("The allowed until date"),
	allowedWeekDays: z
		.int()
		.optional()
		.describe(
			"The allowed weekdays bitmask: 64 .. monday, 32 .. tuesday, 16 .. wednesday, 8 .. thursday, 4 .. friday, 2 .. saturday, 1 .. sunday",
		),
	allowedFromTime: z.int().optional().describe("The allowed from time (in minutes from midnight)"),
	allowedUntilTime: z
		.int()
		.optional()
		.describe("The allowed until time (in minutes from midnight)"),
	lastActiveDate: z.iso.datetime().optional().describe("The last active date"),
	creationDate: z.iso.datetime().optional().describe("The creation date"),
	updateDate: z.iso.datetime().optional().describe("The update date"),
	operationId: objectIdSchema
		.optional()
		.describe("The operation id - if set the auth is locked for another operations."),
	error: z.string().optional().describe("In case of any error, it contains the error message"),
	appId: z.int().optional().describe("The ID of the Nuki App"),
	authTypeAsString: z.string().optional(),
});

export const smartlockAuthCreateSchema = z.object({
	name: z.string().describe("The name of the authorization (max 32 chars)"),
	allowedFromDate: z.iso.datetime().optional().describe("The allowed from date"),
	allowedUntilDate: z.iso.datetime().optional().describe("The allowed until date"),
	allowedWeekDays: z
		.int()
		.optional()
		.describe(
			"The allowed weekdays bitmask: 64 .. monday, 32 .. tuesday, 16 .. wednesday, 8 .. thursday, 4 .. friday, 2 .. saturday, 1 .. sunday",
		),
	allowedFromTime: z.int().optional().describe("The allowed from time (in minutes from midnight)"),
	allowedUntilTime: z
		.int()
		.optional()
		.describe("The allowed until time (in minutes from midnight)"),
	accountUserId: z
		.int()
		.optional()
		.describe("The id of the linked account user (required if type is NOT 13 .. keypad)"),
	remoteAllowed: z.boolean().describe("True if the auth has remote access"),
	smartActionsEnabled: z.boolean().optional().describe("The smart actions enabled flag"),
	type: z
		.int()
		.optional()
		.describe("The optional type of the auth 0 .. app (default), 2 .. fob, 13 .. keypad"),
	code: z.int().optional().describe("The code of the keypad authorization (only for keypad)"),
});

export const smartlockAuthMultiUpdateSchema = z.object({
	name: z.string().describe("The name of the authorization (max 32 chars)"),
	allowedFromDate: z.iso.datetime().optional().describe("The allowed from date"),
	allowedUntilDate: z.iso.datetime().optional().describe("The allowed until date"),
	allowedWeekDays: z
		.int()
		.optional()
		.describe(
			"The allowed weekdays bitmask: 64 .. monday, 32 .. tuesday, 16 .. wednesday, 8 .. thursday, 4 .. friday, 2 .. saturday, 1 .. sunday",
		),
	allowedFromTime: z.int().optional().describe("The allowed from time (in minutes from midnight)"),
	allowedUntilTime: z
		.int()
		.optional()
		.describe("The allowed until time (in minutes from midnight)"),
	accountUserId: z.int().optional().describe("The id of the linked account user"),
	enabled: z.boolean().optional().describe("True if the auth is enabled"),
	remoteAllowed: z.boolean().optional().describe("True if the auth has remote access"),
	code: z.int().optional().describe("The code of the keypad authorization (only for keypad)"),
	id: z.string().describe("The unique id for the smartlock authorization"),
});

export const smartlockAuthUpdateSchema = z.object({
	name: z.string().describe("The name of the authorization (max 32 chars)"),
	allowedFromDate: z.iso.datetime().optional().describe("The allowed from date"),
	allowedUntilDate: z.iso.datetime().optional().describe("The allowed until date"),
	allowedWeekDays: z
		.int()
		.optional()
		.describe(
			"The allowed weekdays bitmask: 64 .. monday, 32 .. tuesday, 16 .. wednesday, 8 .. thursday, 4 .. friday, 2 .. saturday, 1 .. sunday",
		),
	allowedFromTime: z.int().optional().describe("The allowed from time (in minutes from midnight)"),
	allowedUntilTime: z
		.int()
		.optional()
		.describe("The allowed until time (in minutes from midnight)"),
	accountUserId: z.int().optional().describe("The id of the linked account user"),
	enabled: z.boolean().optional().describe("True if the auth is enabled"),
	remoteAllowed: z.boolean().optional().describe("True if the auth has remote access"),
	code: z.int().optional().describe("The code of the keypad authorization (only for keypad)"),
});

export const smartlockAuthWithSharedKeyCreateSchema = z.object({
	name: z.string().describe("The name of the authorization (max 32 chars)"),
	allowedFromDate: z.iso.datetime().optional().describe("The allowed from date"),
	allowedUntilDate: z.iso.datetime().optional().describe("The allowed until date"),
	allowedWeekDays: z
		.int()
		.optional()
		.describe(
			"The allowed weekdays bitmask: 64 .. monday, 32 .. tuesday, 16 .. wednesday, 8 .. thursday, 4 .. friday, 2 .. saturday, 1 .. sunday",
		),
	allowedFromTime: z.int().optional().describe("The allowed from time (in minutes from midnight)"),
	allowedUntilTime: z
		.int()
		.optional()
		.describe("The allowed until time (in minutes from midnight)"),
	accountUserId: z.int().optional().describe("The id of the linked account user"),
});

export const smartlockLogOpenerLogSchema = z.object({
	activeCm: z.boolean().describe("Flag indicating if continuous mode was active"),
	activeRto: z.boolean().describe("Flag indicating if ring to open was active"),
	source: z
		.int()
		.describe(
			"The cause of the activation of ring to open or continuous mode: 0 .. doorbell, 1 .. timecontrol, 2 .. app, 3 .. button, 4 .. fob, 5 .. bridge, 6 .. keypad",
		),
	flagGeoFence: z.boolean().describe("Flag indicating a geo fence induced action"),
	flagForce: z.boolean().describe("Flag indicating a force induced action"),
	flagDoorbellSuppression: z
		.boolean()
		.describe("Flag indicating if doorbell suppression was active"),
});

export const smartlockLogSchema = z.object({
	id: z.string().describe("The unique id for the smartlock log"),
	smartlockId: z.coerce.bigint().describe("The smartlock id"),
	deviceType: z
		.int()
		.describe(
			"The device type: 0 .. Smartlock 1/2 + Box, 2 .. Opener, 3 .. Smartdoor, 4 .. Smartlock 3/4, 5 .. Smartlock 5",
		),
	accountUserId: z.int().optional().describe("The id of the linked account user"),
	authId: z.string().optional().describe("The id of the linked smartlock auth"),
	name: z.string().describe("The name"),
	action: z
		.int()
		.describe(
			"The action: 1 .. unlock, 2 .. lock, 3 .. unlatch, 4 .. lock'n'go, 5 .. lock'n'go with unlatch, 11 .. Restore reset to default setting, 208 .. door warning ajar, 209 door warning status mismatch, 224 .. doorbell recognition (only Opener), 240 .. door opened, 241 .. door closed, 242 .. door sensor jammed, 243 .. firmware update, 250 .. door log enabled, 251 .. door log disabled, 252 .. initialization, 253 .. calibration, 254 .. log enabled, 255 .. log disabled",
		),
	trigger: z
		.int()
		.describe(
			"The trigger: 0 .. system, 1 .. manual, 2 .. button, 3 .. automatic, 4 .. web, 5 .. app, 6 .. auto lock, 7 .. accessory, 253 .. keypad error, 254 .. nuki mode, 255 .. keypad",
		),
	state: z
		.int()
		.describe(
			"The completion state: 0 .. Success, 1 .. Motor blocked, 2 .. Canceled, 3 .. Too recent, 4 .. Busy, 5 .. Low motor voltage, 6 .. Clutch failure, 7 .. Motor power failure, 8 .. Incomplete, 9 .. Rejected, 10 .. Rejected night mode, 224 .. Invalid Code, 225 .. Invalid Fingerprint, 226 .. Invalid NFC Tag, 254 .. Other error, 255 .. Unknown error\nFor source=3 and trigger=253 the following states are used: 0 .. Access document revoked, 1 .. Send NFC failed, 2 .. Control flow, 3 .. Command time expired, 7 .. Invalid data content, 37 .. Invalid access rights, 255 .. Unknown",
		),
	autoUnlock: z.boolean().describe("True if it was an auto unlock"),
	date: z.iso.datetime().describe("The log date"),
	openerLog: smartlockLogOpenerLogSchema.optional().describe("The opener specific log"),
	ajarTimeout: z
		.int()
		.optional()
		.describe("The door sensor warning ajar timeout (in minutes, only for action = 208)"),
	source: z
		.int()
		.optional()
		.describe(
			"The source of action: 1 .. Keypad code, 2 .. Fingerprint, 3 .. Tap to Unlock, 0 .. Default",
		),
	error: z.string().optional().describe("In case of any error, it contains the error message"),
});

export const smartlockUpdateSchema = z.object({
	name: z.string().optional().describe("The new name of the smartlock"),
	favorite: z.boolean().optional().describe("True if the smartlock is favorite"),
});

export const smartlocksAuthAdvancedCreateSchema = z.object({
	name: z.string().describe("The name of the authorization (max 32 chars)"),
	allowedFromDate: z.iso.datetime().optional().describe("The allowed from date"),
	allowedUntilDate: z.iso.datetime().optional().describe("The allowed until date"),
	allowedWeekDays: z
		.int()
		.optional()
		.describe(
			"The allowed weekdays bitmask: 64 .. monday, 32 .. tuesday, 16 .. wednesday, 8 .. thursday, 4 .. friday, 2 .. saturday, 1 .. sunday",
		),
	allowedFromTime: z.int().optional().describe("The allowed from time (in minutes from midnight)"),
	allowedUntilTime: z
		.int()
		.optional()
		.describe("The allowed until time (in minutes from midnight)"),
	accountUserId: z.int().describe("The id of the linked account user"),
	smartlockIds: z.array(z.coerce.bigint()).describe("The list of smartlock ids"),
	remoteAllowed: z.boolean().describe("True if the auth has remote access"),
	smartActionsEnabled: z.boolean().optional().describe("The smart actions enabled flag"),
});

export const smartlocksAuthCreateSchema = z.object({
	name: z.string().describe("The name of the authorization (max 32 chars)"),
	allowedFromDate: z.iso.datetime().optional().describe("The allowed from date"),
	allowedUntilDate: z.iso.datetime().optional().describe("The allowed until date"),
	allowedWeekDays: z
		.int()
		.optional()
		.describe(
			"The allowed weekdays bitmask: 64 .. monday, 32 .. tuesday, 16 .. wednesday, 8 .. thursday, 4 .. friday, 2 .. saturday, 1 .. sunday",
		),
	allowedFromTime: z.int().optional().describe("The allowed from time (in minutes from midnight)"),
	allowedUntilTime: z
		.int()
		.optional()
		.describe("The allowed until time (in minutes from midnight)"),
	accountUserId: z
		.int()
		.optional()
		.describe("The id of the linked account user (required if type is NOT 13 .. keypad)"),
	smartlockIds: z.array(z.coerce.bigint()).optional().describe("The list of smartlock ids"),
	remoteAllowed: z.boolean().describe("True if the auth has remote access"),
	smartActionsEnabled: z.boolean().optional().describe("The smart actions enabled flag"),
	type: z
		.int()
		.optional()
		.describe("The optional type of the auth 0 .. app (default), 2 .. fob, 13 .. keypad"),
	code: z.int().optional().describe("The code of the keypad authorization (only for keypad)"),
});

export const variantSchema = z.object({
	characterSet: characterSetSchema.optional(),
	encodings: z.array(encodingSchema).optional(),
	get locationRef() {
		return referenceSchema.optional();
	},
	get languages() {
		return z.array(languageSchema).optional();
	},
	get mediaType() {
		return mediaTypeSchema.optional();
	},
});

export const webhookMessageSchema = z.object({
	headers: z.object({}).catchall(z.string()).describe("Http Headers as key value pairs"),
	body: z.object({}).catchall(z.object({})).optional().describe("Http Body as Json"),
	timestamp: z.iso.datetime().optional().describe("The timestamp when the message was created"),
	path: z.string().describe("Path of the message"),
});

export const webhookLogSchema = z.object({
	id: z.string().describe("The WebhookLog id"),
	requestId: z
		.string()
		.optional()
		.describe("Request id, set when api-triggered request otherwise empty"),
	succeeded: z.boolean().optional().describe("If the webhooks sends the data successfully"),
	responseStatus: z.int().optional().describe("Http Status code of the webhook response"),
	duration: z.coerce.bigint().optional().describe("The duration of the webhook in milli seconds"),
	accountId: z.int().describe("The account id"),
	request: webhookMessageSchema.optional().describe("Only set if webhook triggered by user"),
	response: webhookMessageSchema.optional().describe("Set if webhook sent"),
	apiKeyId: z.int().describe("Used Api Key for the webhook"),
	updated: z.iso.datetime().describe("last updated time"),
	created: z.iso.datetime().describe("Creation Date"),
});

export const getAccountsResourceStatus200Schema = myAccountSchema;

export const getAccountsResourceStatus401Schema = z.unknown();

export const getAccountsResourceResponseSchema = getAccountsResourceStatus200Schema;

export const getAccountsResourceErrorSchema = getAccountsResourceStatus401Schema;

export const postAccountsResourceQueryDeleteApiTokensSchema = z
	.boolean()
	.optional()
	.default(true)
	.describe("If false existing API tokens are not deleted if the password is changed");

export const postAccountsResourceStatus204Schema = z.unknown();

export const postAccountsResourceStatus400Schema = z.unknown();

export const postAccountsResourceStatus401Schema = z.unknown();

export const postAccountsResourceStatus409Schema = z.unknown();

export const postAccountsResourceResponseSchema = postAccountsResourceStatus204Schema;

export const postAccountsResourceErrorSchema = z.union([
	postAccountsResourceStatus400Schema,
	postAccountsResourceStatus401Schema,
	postAccountsResourceStatus409Schema,
]);

export const postAccountsResourceBodySchema = accountUpdateSchema.describe(
	"Account update representation",
);

export const deleteAccountsResourceStatus204Schema = z.unknown();

export const deleteAccountsResourceStatus401Schema = z.unknown();

export const deleteAccountsResourceResponseSchema = deleteAccountsResourceStatus204Schema;

export const deleteAccountsResourceErrorSchema = deleteAccountsResourceStatus401Schema;

export const postAccountEmailChangeResourceStatus204Schema = z.unknown();

export const postAccountEmailChangeResourceStatus400Schema = z.unknown();

export const postAccountEmailChangeResourceStatus401Schema = z.unknown();

export const postAccountEmailChangeResourceStatus409Schema = z.unknown();

export const postAccountEmailChangeResourceResponseSchema =
	postAccountEmailChangeResourceStatus204Schema;

export const postAccountEmailChangeResourceErrorSchema = z.union([
	postAccountEmailChangeResourceStatus400Schema,
	postAccountEmailChangeResourceStatus401Schema,
	postAccountEmailChangeResourceStatus409Schema,
]);

export const postAccountEmailChangeResourceBodySchema = accountEmailChangeSchema.describe(
	"Account email change representation",
);

export const postAccountEmailVerifyResourceStatus204Schema = z.unknown();

export const postAccountEmailVerifyResourceStatus400Schema = z.unknown();

export const postAccountEmailVerifyResourceStatus401Schema = z.unknown();

export const postAccountEmailVerifyResourceStatus409Schema = z.unknown();

export const postAccountEmailVerifyResourceResponseSchema =
	postAccountEmailVerifyResourceStatus204Schema;

export const postAccountEmailVerifyResourceErrorSchema = z.union([
	postAccountEmailVerifyResourceStatus400Schema,
	postAccountEmailVerifyResourceStatus401Schema,
	postAccountEmailVerifyResourceStatus409Schema,
]);

export const getAccountIntegrationsResourceStatus200Schema = z.array(accountIntegrationSchema);

export const getAccountIntegrationsResourceStatus401Schema = z.unknown();

export const getAccountIntegrationsResourceResponseSchema =
	getAccountIntegrationsResourceStatus200Schema;

export const getAccountIntegrationsResourceErrorSchema =
	getAccountIntegrationsResourceStatus401Schema;

export const deleteAccountIntegrationsResourceQueryApiKeyIdSchema = z
	.int()
	.optional()
	.describe(
		"The api key id to delete (this also removes all tokens if no specific tokenId is given)",
	);

export const deleteAccountIntegrationsResourceQueryTokenIdSchema = z
	.int()
	.optional()
	.describe("The token id if a specific token has to be deleted but not the full api key");

export const deleteAccountIntegrationsResourceStatus204Schema = z.unknown();

export const deleteAccountIntegrationsResourceStatus401Schema = z.unknown();

export const deleteAccountIntegrationsResourceResponseSchema =
	deleteAccountIntegrationsResourceStatus204Schema;

export const deleteAccountIntegrationsResourceErrorSchema =
	deleteAccountIntegrationsResourceStatus401Schema;

export const postAccountOtpResourceStatus204Schema = z.unknown();

export const postAccountOtpResourceStatus400Schema = z.unknown();

export const postAccountOtpResourceStatus401Schema = z.unknown();

export const postAccountOtpResourceStatus429Schema = z.unknown();

export const postAccountOtpResourceResponseSchema = postAccountOtpResourceStatus204Schema;

export const postAccountOtpResourceErrorSchema = z.union([
	postAccountOtpResourceStatus400Schema,
	postAccountOtpResourceStatus401Schema,
	postAccountOtpResourceStatus429Schema,
]);

export const postAccountOtpResourceBodySchema = accountOtpEnableSchema.describe(
	"Account one time password enable representation",
);

export const putAccountOtpResourceStatus200Schema = z.string();

export const putAccountOtpResourceStatus405Schema = z.unknown();

export const putAccountOtpResourceResponseSchema = putAccountOtpResourceStatus200Schema;

export const putAccountOtpResourceErrorSchema = putAccountOtpResourceStatus405Schema;

export const deleteAccountOtpResourceStatus204Schema = z.unknown();

export const deleteAccountOtpResourceStatus401Schema = z.unknown();

export const deleteAccountOtpResourceResponseSchema = deleteAccountOtpResourceStatus204Schema;

export const deleteAccountOtpResourceErrorSchema = deleteAccountOtpResourceStatus401Schema;

export const postAccountPasswordResetResourceStatus204Schema = z.unknown();

export const postAccountPasswordResetResourceStatus401Schema = z.unknown();

export const postAccountPasswordResetResourceResponseSchema =
	postAccountPasswordResetResourceStatus204Schema;

export const postAccountPasswordResetResourceErrorSchema =
	postAccountPasswordResetResourceStatus401Schema;

export const postAccountPasswordResetResourceBodySchema = accountPasswordResetSchema.describe(
	"Account password reset representation",
);

export const getAccountSettingResourceStatus200Schema = accountSettingSchema;

export const getAccountSettingResourceStatus401Schema = z.unknown();

export const getAccountSettingResourceStatus403Schema = z.unknown();

export const getAccountSettingResourceStatus404Schema = z.unknown();

export const getAccountSettingResourceResponseSchema = getAccountSettingResourceStatus200Schema;

export const getAccountSettingResourceErrorSchema = z.union([
	getAccountSettingResourceStatus401Schema,
	getAccountSettingResourceStatus403Schema,
	getAccountSettingResourceStatus404Schema,
]);

export const putAccountSettingResourceStatus200Schema = accountSettingSchema;

export const putAccountSettingResourceStatus400Schema = z.unknown();

export const putAccountSettingResourceStatus401Schema = z.unknown();

export const putAccountSettingResourceResponseSchema = putAccountSettingResourceStatus200Schema;

export const putAccountSettingResourceErrorSchema = z.union([
	putAccountSettingResourceStatus400Schema,
	putAccountSettingResourceStatus401Schema,
]);

export const putAccountSettingResourceBodySchema = accountSettingSchema.describe(
	"Account setting representation",
);

export const deleteAccountSettingResourceStatus204Schema = z.unknown();

export const deleteAccountSettingResourceStatus401Schema = z.unknown();

export const deleteAccountSettingResourceStatus403Schema = z.unknown();

export const deleteAccountSettingResourceResponseSchema =
	deleteAccountSettingResourceStatus204Schema;

export const deleteAccountSettingResourceErrorSchema = z.union([
	deleteAccountSettingResourceStatus401Schema,
	deleteAccountSettingResourceStatus403Schema,
]);

export const getAccountSubsResourceQueryEmailSchema = z
	.string()
	.optional()
	.describe("The optional email (regex)");

export const getAccountSubsResourceStatus200Schema = accountSchema;

export const getAccountSubsResourceStatus401Schema = z.unknown();

export const getAccountSubsResourceResponseSchema = getAccountSubsResourceStatus200Schema;

export const getAccountSubsResourceErrorSchema = getAccountSubsResourceStatus401Schema;

export const putAccountSubsResourceStatus200Schema = myAccountSchema;

export const putAccountSubsResourceStatus400Schema = z.unknown();

export const putAccountSubsResourceResponseSchema = putAccountSubsResourceStatus200Schema;

export const putAccountSubsResourceErrorSchema = putAccountSubsResourceStatus400Schema;

export const putAccountSubsResourceBodySchema = accountSubCreateSchema.describe(
	"Account sub create representation",
);

export const getAccountSubResourcePathAccountIdSchema = z.int().describe("The account ID");

export const getAccountSubResourceStatus200Schema = accountSchema;

export const getAccountSubResourceStatus401Schema = z.unknown();

export const getAccountSubResourceResponseSchema = getAccountSubResourceStatus200Schema;

export const getAccountSubResourceErrorSchema = getAccountSubResourceStatus401Schema;

export const postAccountSubResourcePathAccountIdSchema = z.int().describe("The account ID");

export const postAccountSubResourceStatus204Schema = z.unknown();

export const postAccountSubResourceStatus400Schema = z.unknown();

export const postAccountSubResourceStatus401Schema = z.unknown();

export const postAccountSubResourceStatus409Schema = z.unknown();

export const postAccountSubResourceResponseSchema = postAccountSubResourceStatus204Schema;

export const postAccountSubResourceErrorSchema = z.union([
	postAccountSubResourceStatus400Schema,
	postAccountSubResourceStatus401Schema,
	postAccountSubResourceStatus409Schema,
]);

export const postAccountSubResourceBodySchema = accountSubUpdateSchema.describe(
	"Account update representation",
);

export const deleteAccountSubResourcePathAccountIdSchema = z.int().describe("The account ID");

export const deleteAccountSubResourceStatus204Schema = z.unknown();

export const deleteAccountSubResourceStatus401Schema = z.unknown();

export const deleteAccountSubResourceResponseSchema = deleteAccountSubResourceStatus204Schema;

export const deleteAccountSubResourceErrorSchema = deleteAccountSubResourceStatus401Schema;

export const getAccountUsersResourceQueryEmailSchema = z
	.string()
	.optional()
	.describe("Filter for email");

export const getAccountUsersResourceQueryOffsetSchema = z
	.int()
	.optional()
	.describe("The offset of the first user in the collection to return");

export const getAccountUsersResourceQueryLimitSchema = z
	.int()
	.optional()
	.describe(
		"The maximum number of users to return. If the value exceeds the maximum, then the maximum value will be used.",
	);

export const getAccountUsersResourceStatus200Schema = z.array(accountUserSchema);

export const getAccountUsersResourceStatus401Schema = z.unknown();

export const getAccountUsersResourceResponseSchema = getAccountUsersResourceStatus200Schema;

export const getAccountUsersResourceErrorSchema = getAccountUsersResourceStatus401Schema;

export const putAccountUsersResourceStatus200Schema = accountUserSchema;

export const putAccountUsersResourceStatus400Schema = z.unknown();

export const putAccountUsersResourceResponseSchema = putAccountUsersResourceStatus200Schema;

export const putAccountUsersResourceErrorSchema = putAccountUsersResourceStatus400Schema;

export const putAccountUsersResourceBodySchema = accountUserCreateSchema.describe(
	"Account sub create representation",
);

export const getAccountUserResourcePathAccountUserIdSchema = z
	.int()
	.describe("The account user ID");

export const getAccountUserResourceStatus200Schema = accountUserSchema;

export const getAccountUserResourceStatus401Schema = z.unknown();

export const getAccountUserResourceResponseSchema = getAccountUserResourceStatus200Schema;

export const getAccountUserResourceErrorSchema = getAccountUserResourceStatus401Schema;

export const postAccountUserResourcePathAccountUserIdSchema = z
	.int()
	.describe("The account user ID");

export const postAccountUserResourceStatus200Schema = accountUserSchema;

export const postAccountUserResourceStatus204Schema = z.unknown();

export const postAccountUserResourceStatus400Schema = z.unknown();

export const postAccountUserResourceStatus401Schema = z.unknown();

export const postAccountUserResourceStatus409Schema = z.unknown();

export const postAccountUserResourceResponseSchema = z.union([
	postAccountUserResourceStatus200Schema,
	postAccountUserResourceStatus204Schema,
]);

export const postAccountUserResourceErrorSchema = z.union([
	postAccountUserResourceStatus400Schema,
	postAccountUserResourceStatus401Schema,
	postAccountUserResourceStatus409Schema,
]);

export const postAccountUserResourceBodySchema = accountUserUpdateSchema.describe(
	"Account update representation",
);

export const deleteAccountUserResourcePathAccountUserIdSchema = z
	.int()
	.describe("The account user ID");

export const deleteAccountUserResourceStatus204Schema = z.unknown();

export const deleteAccountUserResourceStatus401Schema = z.unknown();

export const deleteAccountUserResourceStatus423Schema = z.unknown();

export const deleteAccountUserResourceResponseSchema = deleteAccountUserResourceStatus204Schema;

export const deleteAccountUserResourceErrorSchema = z.union([
	deleteAccountUserResourceStatus401Schema,
	deleteAccountUserResourceStatus423Schema,
]);

export const getAddressesResourceStatus200Schema = z.array(addressSchema);

export const getAddressesResourceStatus401Schema = z.unknown();

export const getAddressesResourceResponseSchema = getAddressesResourceStatus200Schema;

export const getAddressesResourceErrorSchema = getAddressesResourceStatus401Schema;

export const putAddressesResourceStatus200Schema = addressSchema;

export const putAddressesResourceStatus400Schema = z.unknown();

export const putAddressesResourceStatus401Schema = z.unknown();

export const putAddressesResourceResponseSchema = putAddressesResourceStatus200Schema;

export const putAddressesResourceErrorSchema = z.union([
	putAddressesResourceStatus400Schema,
	putAddressesResourceStatus401Schema,
]);

export const putAddressesResourceBodySchema = addressCreateSchema.describe(
	"Address create representation",
);

export const getAddressTokenResourcePathIdSchema = z.string().describe("The token ID");

export const getAddressTokenResourceStatus200Schema = addressTokenInfoSchema;

export const getAddressTokenResourceStatus401Schema = z.unknown();

export const getAddressTokenResourceStatus404Schema = z.unknown();

export const getAddressTokenResourceResponseSchema = getAddressTokenResourceStatus200Schema;

export const getAddressTokenResourceErrorSchema = z.union([
	getAddressTokenResourceStatus401Schema,
	getAddressTokenResourceStatus404Schema,
]);

export const getAddressTokenRedeemResourcePathIdSchema = z.string().describe("The token ID");

export const getAddressTokenRedeemResourceStatus200Schema = addressTokenSchema;

export const getAddressTokenRedeemResourceStatus401Schema = z.unknown();

export const getAddressTokenRedeemResourceStatus404Schema = z.unknown();

export const getAddressTokenRedeemResourceResponseSchema =
	getAddressTokenRedeemResourceStatus200Schema;

export const getAddressTokenRedeemResourceErrorSchema = z.union([
	getAddressTokenRedeemResourceStatus401Schema,
	getAddressTokenRedeemResourceStatus404Schema,
]);

export const postAddressTokenRedeemResourcePathIdSchema = z.string().describe("The token ID");

export const postAddressTokenRedeemResourceQueryEmailSchema = z
	.boolean()
	.optional()
	.describe("If false, no email will be sent");

export const postAddressTokenRedeemResourceStatus204Schema = z.unknown();

export const postAddressTokenRedeemResourceStatus400Schema = z.unknown();

export const postAddressTokenRedeemResourceStatus401Schema = z.unknown();

export const postAddressTokenRedeemResourceStatus404Schema = z.unknown();

export const postAddressTokenRedeemResourceResponseSchema =
	postAddressTokenRedeemResourceStatus204Schema;

export const postAddressTokenRedeemResourceErrorSchema = z.union([
	postAddressTokenRedeemResourceStatus400Schema,
	postAddressTokenRedeemResourceStatus401Schema,
	postAddressTokenRedeemResourceStatus404Schema,
]);

export const postAddressResourcePathAddressIdSchema = z.int().describe("The address ID");

export const postAddressResourceStatus204Schema = z.unknown();

export const postAddressResourceStatus400Schema = z.unknown();

export const postAddressResourceStatus401Schema = z.unknown();

export const postAddressResourceStatus403Schema = z.unknown();

export const postAddressResourceResponseSchema = postAddressResourceStatus204Schema;

export const postAddressResourceErrorSchema = z.union([
	postAddressResourceStatus400Schema,
	postAddressResourceStatus401Schema,
	postAddressResourceStatus403Schema,
]);

export const postAddressResourceBodySchema = addressUpdateSchema.describe(
	"Address update representation",
);

export const deleteAddressResourcePathAddressIdSchema = z.int().describe("The address ID");

export const deleteAddressResourceStatus204Schema = z.unknown();

export const deleteAddressResourceStatus401Schema = z.unknown();

export const deleteAddressResourceStatus403Schema = z.unknown();

export const deleteAddressResourceResponseSchema = deleteAddressResourceStatus204Schema;

export const deleteAddressResourceErrorSchema = z.union([
	deleteAddressResourceStatus401Schema,
	deleteAddressResourceStatus403Schema,
]);

export const getAddressReservationsResourcePathAddressIdSchema = z.int().describe("The address ID");

export const getAddressReservationsResourceStatus200Schema = z.array(addressReservationSchema);

export const getAddressReservationsResourceStatus401Schema = z.unknown();

export const getAddressReservationsResourceResponseSchema =
	getAddressReservationsResourceStatus200Schema;

export const getAddressReservationsResourceErrorSchema =
	getAddressReservationsResourceStatus401Schema;

export const postAddressReservationIssueResourcePathAddressIdSchema = z
	.int()
	.describe("The address ID");

export const postAddressReservationIssueResourcePathIdSchema = z
	.string()
	.describe("The address reservation ID");

export const postAddressReservationIssueResourceStatus204Schema = z.unknown();

export const postAddressReservationIssueResourceStatus400Schema = z.unknown();

export const postAddressReservationIssueResourceStatus401Schema = z.unknown();

export const postAddressReservationIssueResourceResponseSchema =
	postAddressReservationIssueResourceStatus204Schema;

export const postAddressReservationIssueResourceErrorSchema = z.union([
	postAddressReservationIssueResourceStatus400Schema,
	postAddressReservationIssueResourceStatus401Schema,
]);

export const postAddressReservationRevokeResourcePathAddressIdSchema = z
	.int()
	.describe("The address ID");

export const postAddressReservationRevokeResourcePathIdSchema = z
	.string()
	.describe("The address reservation ID");

export const postAddressReservationRevokeResourceStatus204Schema = z.unknown();

export const postAddressReservationRevokeResourceStatus400Schema = z.unknown();

export const postAddressReservationRevokeResourceStatus401Schema = z.unknown();

export const postAddressReservationRevokeResourceResponseSchema =
	postAddressReservationRevokeResourceStatus204Schema;

export const postAddressReservationRevokeResourceErrorSchema = z.union([
	postAddressReservationRevokeResourceStatus400Schema,
	postAddressReservationRevokeResourceStatus401Schema,
]);

export const postReservationAccessTimesUpdateResourcePathAddressIdSchema = z
	.int()
	.describe("The address ID");

export const postReservationAccessTimesUpdateResourcePathIdSchema = z
	.string()
	.describe("The reservation ID");

export const postReservationAccessTimesUpdateResourceStatus204Schema = z.unknown();

export const postReservationAccessTimesUpdateResourceStatus400Schema = z.unknown();

export const postReservationAccessTimesUpdateResourceStatus401Schema = z.unknown();

export const postReservationAccessTimesUpdateResourceResponseSchema =
	postReservationAccessTimesUpdateResourceStatus204Schema;

export const postReservationAccessTimesUpdateResourceErrorSchema = z.union([
	postReservationAccessTimesUpdateResourceStatus400Schema,
	postReservationAccessTimesUpdateResourceStatus401Schema,
]);

export const postReservationAccessTimesUpdateResourceBodySchema =
	reservationAccessTimesUpdateSchema.describe("Reservation access times update representation");

export const getAddressTokensResourcePathAddressIdSchema = z.int().describe("The address ID");

export const getAddressTokensResourceStatus200Schema = z.array(addressTokenSchema);

export const getAddressTokensResourceStatus400Schema = z.unknown();

export const getAddressTokensResourceStatus401Schema = z.unknown();

export const getAddressTokensResourceResponseSchema = getAddressTokensResourceStatus200Schema;

export const getAddressTokensResourceErrorSchema = z.union([
	getAddressTokensResourceStatus400Schema,
	getAddressTokensResourceStatus401Schema,
]);

export const getAddressUnitsResourcePathAddressIdSchema = z.int().describe("The address ID");

export const getAddressUnitsResourceStatus200Schema = z.array(addressUnitResponseSchema);

export const getAddressUnitsResourceStatus400Schema = z.unknown();

export const getAddressUnitsResourceStatus401Schema = z.unknown();

export const getAddressUnitsResourceResponseSchema = getAddressUnitsResourceStatus200Schema;

export const getAddressUnitsResourceErrorSchema = z.union([
	getAddressUnitsResourceStatus400Schema,
	getAddressUnitsResourceStatus401Schema,
]);

export const putAddressUnitsResourcePathAddressIdSchema = z.int().describe("The address ID");

export const putAddressUnitsResourceStatus200Schema = addressUnitResponseSchema;

export const putAddressUnitsResourceStatus400Schema = z.unknown();

export const putAddressUnitsResourceStatus401Schema = z.unknown();

export const putAddressUnitsResourceStatus403Schema = z.unknown();

export const putAddressUnitsResourceResponseSchema = putAddressUnitsResourceStatus200Schema;

export const putAddressUnitsResourceErrorSchema = z.union([
	putAddressUnitsResourceStatus400Schema,
	putAddressUnitsResourceStatus401Schema,
	putAddressUnitsResourceStatus403Schema,
]);

export const putAddressUnitsResourceBodySchema = addressUnitSchema
	.omit({ id: true, addressId: true, addressTokenId: true, operationId: true })
	.describe("Address unit representation");

export const deleteAddressUnitsResourcePathAddressIdSchema = z.int().describe("The address ID");

export const deleteAddressUnitsResourceStatus200Schema = advancedConfirmationResponseSchema;

export const deleteAddressUnitsResourceStatus400Schema = z.unknown();

export const deleteAddressUnitsResourceStatus401Schema = z.unknown();

export const deleteAddressUnitsResourceStatus403Schema = z.unknown();

export const deleteAddressUnitsResourceStatus423Schema = z.unknown();

export const deleteAddressUnitsResourceResponseSchema = deleteAddressUnitsResourceStatus200Schema;

export const deleteAddressUnitsResourceErrorSchema = z.union([
	deleteAddressUnitsResourceStatus400Schema,
	deleteAddressUnitsResourceStatus401Schema,
	deleteAddressUnitsResourceStatus403Schema,
	deleteAddressUnitsResourceStatus423Schema,
]);

export const deleteAddressUnitsResourceBodySchema = z
	.array(z.string())
	.describe("Address unit IDs to delete");

export const deleteAddressUnitResourcePathAddressIdSchema = z.int().describe("The address ID");

export const deleteAddressUnitResourcePathIdSchema = z.string().describe("The address unit ID");

export const deleteAddressUnitResourceStatus200Schema = advancedConfirmationResponseSchema;

export const deleteAddressUnitResourceStatus401Schema = z.unknown();

export const deleteAddressUnitResourceStatus403Schema = z.unknown();

export const deleteAddressUnitResourceStatus423Schema = z.unknown();

export const deleteAddressUnitResourceResponseSchema = deleteAddressUnitResourceStatus200Schema;

export const deleteAddressUnitResourceErrorSchema = z.union([
	deleteAddressUnitResourceStatus401Schema,
	deleteAddressUnitResourceStatus403Schema,
	deleteAddressUnitResourceStatus423Schema,
]);

export const getDecentralWebhooksResourceStatus200Schema = z.array(decentralWebhookSchema);

export const getDecentralWebhooksResourceStatus401Schema = z.unknown();

export const getDecentralWebhooksResourceStatus403Schema = z.unknown();

export const getDecentralWebhooksResourceResponseSchema =
	getDecentralWebhooksResourceStatus200Schema;

export const getDecentralWebhooksResourceErrorSchema = z.union([
	getDecentralWebhooksResourceStatus401Schema,
	getDecentralWebhooksResourceStatus403Schema,
]);

export const putDecentralWebhooksResourceStatus200Schema = decentralWebhookSchema;

export const putDecentralWebhooksResourceStatus400Schema = z.unknown();

export const putDecentralWebhooksResourceStatus401Schema = z.unknown();

export const putDecentralWebhooksResourceStatus403Schema = z.unknown();

export const putDecentralWebhooksResourceResponseSchema =
	putDecentralWebhooksResourceStatus200Schema;

export const putDecentralWebhooksResourceErrorSchema = z.union([
	putDecentralWebhooksResourceStatus400Schema,
	putDecentralWebhooksResourceStatus401Schema,
	putDecentralWebhooksResourceStatus403Schema,
]);

export const putDecentralWebhooksResourceBodySchema = decentralWebhookSchema
	.omit({ id: true, secret: true })
	.describe("Decentral webhook representation");

export const deleteDecentralWebhookResourcePathIdSchema = z
	.int()
	.describe("The ID of the decentral webhook");

export const deleteDecentralWebhookResourceStatus204Schema = z.unknown();

export const deleteDecentralWebhookResourceStatus401Schema = z.unknown();

export const deleteDecentralWebhookResourceStatus403Schema = z.unknown();

export const deleteDecentralWebhookResourceResponseSchema =
	deleteDecentralWebhookResourceStatus204Schema;

export const deleteDecentralWebhookResourceErrorSchema = z.union([
	deleteDecentralWebhookResourceStatus401Schema,
	deleteDecentralWebhookResourceStatus403Schema,
]);

export const getApiKeysResourceStatus200Schema = z.array(apiKeySchema);

export const getApiKeysResourceStatus401Schema = z.unknown();

export const getApiKeysResourceResponseSchema = getApiKeysResourceStatus200Schema;

export const getApiKeysResourceErrorSchema = getApiKeysResourceStatus401Schema;

export const putApiKeysResourceStatus200Schema = apiKeySchema;

export const putApiKeysResourceStatus400Schema = z.unknown();

export const putApiKeysResourceStatus401Schema = z.unknown();

export const putApiKeysResourceResponseSchema = putApiKeysResourceStatus200Schema;

export const putApiKeysResourceErrorSchema = z.union([
	putApiKeysResourceStatus400Schema,
	putApiKeysResourceStatus401Schema,
]);

export const putApiKeysResourceBodySchema = apiKeyCreateSchema.describe(
	"Api key create representation",
);

export const postApiKeyResourcePathApiKeyIdSchema = z.int().describe("The API key ID");

export const postApiKeyResourceStatus204Schema = z.unknown();

export const postApiKeyResourceStatus400Schema = z.unknown();

export const postApiKeyResourceStatus401Schema = z.unknown();

export const postApiKeyResourceStatus503Schema = z.unknown();

export const postApiKeyResourceResponseSchema = postApiKeyResourceStatus204Schema;

export const postApiKeyResourceErrorSchema = z.union([
	postApiKeyResourceStatus400Schema,
	postApiKeyResourceStatus401Schema,
	postApiKeyResourceStatus503Schema,
]);

export const postApiKeyResourceBodySchema = apiKeyUpdateSchema.describe(
	"Api key update representation",
);

export const deleteApiKeyResourcePathApiKeyIdSchema = z.int().describe("The API key ID");

export const deleteApiKeyResourceStatus204Schema = z.unknown();

export const deleteApiKeyResourceStatus401Schema = z.unknown();

export const deleteApiKeyResourceResponseSchema = deleteApiKeyResourceStatus204Schema;

export const deleteApiKeyResourceErrorSchema = deleteApiKeyResourceStatus401Schema;

export const getApiKeyAdvancedResourcePathApiKeyIdSchema = z.int().describe("The API key ID");

export const getApiKeyAdvancedResourceStatus200Schema = advancedApiKeySchema;

export const getApiKeyAdvancedResourceStatus401Schema = z.unknown();

export const getApiKeyAdvancedResourceStatus403Schema = z.unknown();

export const getApiKeyAdvancedResourceStatus404Schema = z.unknown();

export const getApiKeyAdvancedResourceResponseSchema = getApiKeyAdvancedResourceStatus200Schema;

export const getApiKeyAdvancedResourceErrorSchema = z.union([
	getApiKeyAdvancedResourceStatus401Schema,
	getApiKeyAdvancedResourceStatus403Schema,
	getApiKeyAdvancedResourceStatus404Schema,
]);

export const postApiKeyAdvancedResourcePathApiKeyIdSchema = z.int().describe("The API key ID");

export const postApiKeyAdvancedResourceStatus204Schema = z.unknown();

export const postApiKeyAdvancedResourceStatus400Schema = z.unknown();

export const postApiKeyAdvancedResourceStatus401Schema = z.unknown();

export const postApiKeyAdvancedResourceResponseSchema = postApiKeyAdvancedResourceStatus204Schema;

export const postApiKeyAdvancedResourceErrorSchema = z.union([
	postApiKeyAdvancedResourceStatus400Schema,
	postApiKeyAdvancedResourceStatus401Schema,
]);

export const postApiKeyAdvancedResourceBodySchema = advancedApiKeyUpdateSchema.describe(
	"Update for advaced api key representation",
);

export const putApiKeyAdvancedResourcePathApiKeyIdSchema = z.int().describe("The API key ID");

export const putApiKeyAdvancedResourceStatus204Schema = z.unknown();

export const putApiKeyAdvancedResourceStatus400Schema = z.unknown();

export const putApiKeyAdvancedResourceStatus401Schema = z.unknown();

export const putApiKeyAdvancedResourceResponseSchema = putApiKeyAdvancedResourceStatus204Schema;

export const putApiKeyAdvancedResourceErrorSchema = z.union([
	putApiKeyAdvancedResourceStatus400Schema,
	putApiKeyAdvancedResourceStatus401Schema,
]);

export const putApiKeyAdvancedResourceBodySchema = advancedApiKeyCreateSchema
	.omit({ webhookStatus: true })
	.describe("Apply for advaced api key representation");

export const deleteApiKeyAdvancedResourcePathApiKeyIdSchema = z.int().describe("The API key ID");

export const deleteApiKeyAdvancedResourceStatus204Schema = z.unknown();

export const deleteApiKeyAdvancedResourceStatus401Schema = z.unknown();

export const deleteApiKeyAdvancedResourceResponseSchema =
	deleteApiKeyAdvancedResourceStatus204Schema;

export const deleteApiKeyAdvancedResourceErrorSchema = deleteApiKeyAdvancedResourceStatus401Schema;

export const postApiKeyAdvancedReactivateResourcePathApiKeyIdSchema = z
	.int()
	.describe("The API key ID");

export const postApiKeyAdvancedReactivateResourceStatus204Schema = z.unknown();

export const postApiKeyAdvancedReactivateResourceStatus400Schema = z.unknown();

export const postApiKeyAdvancedReactivateResourceStatus401Schema = z.unknown();

export const postApiKeyAdvancedReactivateResourceResponseSchema =
	postApiKeyAdvancedReactivateResourceStatus204Schema;

export const postApiKeyAdvancedReactivateResourceErrorSchema = z.union([
	postApiKeyAdvancedReactivateResourceStatus400Schema,
	postApiKeyAdvancedReactivateResourceStatus401Schema,
]);

export const getApiKeyTokensResourcePathApiKeyIdSchema = z.int().describe("The API key ID");

export const getApiKeyTokensResourceStatus200Schema = z.array(apiKeyTokenSchema);

export const getApiKeyTokensResourceStatus401Schema = z.unknown();

export const getApiKeyTokensResourceResponseSchema = getApiKeyTokensResourceStatus200Schema;

export const getApiKeyTokensResourceErrorSchema = getApiKeyTokensResourceStatus401Schema;

export const putApiKeyTokensResourcePathApiKeyIdSchema = z.int().describe("The API key ID");

export const putApiKeyTokensResourceStatus200Schema = apiKeyTokenSchema;

export const putApiKeyTokensResourceStatus400Schema = z.unknown();

export const putApiKeyTokensResourceStatus401Schema = z.unknown();

export const putApiKeyTokensResourceResponseSchema = putApiKeyTokensResourceStatus200Schema;

export const putApiKeyTokensResourceErrorSchema = z.union([
	putApiKeyTokensResourceStatus400Schema,
	putApiKeyTokensResourceStatus401Schema,
]);

export const putApiKeyTokensResourceBodySchema = apiKeyTokenCreateSchema.describe(
	"Api key token create representation",
);

export const postApiKeyTokenResourcePathApiKeyIdSchema = z.int().describe("The API key ID");

export const postApiKeyTokenResourcePathIdSchema = z.string().describe("The API key token ID");

export const postApiKeyTokenResourceStatus204Schema = z.unknown();

export const postApiKeyTokenResourceStatus400Schema = z.unknown();

export const postApiKeyTokenResourceStatus401Schema = z.unknown();

export const postApiKeyTokenResourceResponseSchema = postApiKeyTokenResourceStatus204Schema;

export const postApiKeyTokenResourceErrorSchema = z.union([
	postApiKeyTokenResourceStatus400Schema,
	postApiKeyTokenResourceStatus401Schema,
]);

export const postApiKeyTokenResourceBodySchema = apiKeyTokenUpdateSchema.describe(
	"Api key token update representation",
);

export const deleteApiKeyTokenResourcePathApiKeyIdSchema = z.int().describe("The API key ID");

export const deleteApiKeyTokenResourcePathIdSchema = z.string().describe("The API key token ID");

export const deleteApiKeyTokenResourceStatus204Schema = z.unknown();

export const deleteApiKeyTokenResourceStatus401Schema = z.unknown();

export const deleteApiKeyTokenResourceResponseSchema = deleteApiKeyTokenResourceStatus204Schema;

export const deleteApiKeyTokenResourceErrorSchema = deleteApiKeyTokenResourceStatus401Schema;

export const getWebhookLogsResourcePathApiKeyIdSchema = z.int().describe("The API key ID");

export const getWebhookLogsResourceQueryIdSchema = z
	.string()
	.optional()
	.describe("Optionally filter for older logs");

export const getWebhookLogsResourceQueryLimitSchema = z
	.int()
	.optional()
	.default(50)
	.describe("Amount of logs (max: 100)");

export const getWebhookLogsResourceStatus200Schema = z.array(webhookLogSchema);

export const getWebhookLogsResourceStatus401Schema = z.unknown();

export const getWebhookLogsResourceResponseSchema = getWebhookLogsResourceStatus200Schema;

export const getWebhookLogsResourceErrorSchema = getWebhookLogsResourceStatus401Schema;

export const postSmartlockBulkWebConfigResourceStatus204Schema = z.unknown();

export const postSmartlockBulkWebConfigResourceStatus400Schema = z.unknown();

export const postSmartlockBulkWebConfigResourceStatus401Schema = z.unknown();

export const postSmartlockBulkWebConfigResourceResponseSchema =
	postSmartlockBulkWebConfigResourceStatus204Schema;

export const postSmartlockBulkWebConfigResourceErrorSchema = z.union([
	postSmartlockBulkWebConfigResourceStatus400Schema,
	postSmartlockBulkWebConfigResourceStatus401Schema,
]);

export const postSmartlockBulkWebConfigResourceBodySchema = bulkWebConfigRequestSchema.describe(
	"Smartlocks web config update representation",
);

export const getCompaniesResourceStatus200Schema = z.array(companySchema);

export const getCompaniesResourceStatus401Schema = z.unknown();

export const getCompaniesResourceStatus403Schema = z.unknown();

export const getCompaniesResourceResponseSchema = getCompaniesResourceStatus200Schema;

export const getCompaniesResourceErrorSchema = z.union([
	getCompaniesResourceStatus401Schema,
	getCompaniesResourceStatus403Schema,
]);

export const getNotificationsResourceQueryReferenceIdSchema = z
	.string()
	.optional()
	.describe("The reference ID to the third party system");

export const getNotificationsResourceStatus200Schema = z.array(notificationSchema);

export const getNotificationsResourceStatus401Schema = z.unknown();

export const getNotificationsResourceResponseSchema = getNotificationsResourceStatus200Schema;

export const getNotificationsResourceErrorSchema = getNotificationsResourceStatus401Schema;

export const putNotificationsResourceStatus200Schema = notificationSchema;

export const putNotificationsResourceStatus400Schema = z.unknown();

export const putNotificationsResourceStatus401Schema = z.unknown();

export const putNotificationsResourceStatus403Schema = z.unknown();

export const putNotificationsResourceResponseSchema = putNotificationsResourceStatus200Schema;

export const putNotificationsResourceErrorSchema = z.union([
	putNotificationsResourceStatus400Schema,
	putNotificationsResourceStatus401Schema,
	putNotificationsResourceStatus403Schema,
]);

export const putNotificationsResourceBodySchema = notificationSchema.describe(
	"Notification representation",
);

export const getNotificationResourcePathNotificationIdSchema = z
	.string()
	.describe("The unique notification ID");

export const getNotificationResourceStatus200Schema = notificationSchema;

export const getNotificationResourceStatus401Schema = z.unknown();

export const getNotificationResourceStatus403Schema = z.unknown();

export const getNotificationResourceStatus404Schema = z.unknown();

export const getNotificationResourceResponseSchema = getNotificationResourceStatus200Schema;

export const getNotificationResourceErrorSchema = z.union([
	getNotificationResourceStatus401Schema,
	getNotificationResourceStatus403Schema,
	getNotificationResourceStatus404Schema,
]);

export const postNotificationResourcePathNotificationIdSchema = z
	.string()
	.describe("The unique notification ID");

export const postNotificationResourceStatus200Schema = notificationSchema;

export const postNotificationResourceStatus400Schema = z.unknown();

export const postNotificationResourceStatus401Schema = z.unknown();

export const postNotificationResourceStatus403Schema = z.unknown();

export const postNotificationResourceResponseSchema = postNotificationResourceStatus200Schema;

export const postNotificationResourceErrorSchema = z.union([
	postNotificationResourceStatus400Schema,
	postNotificationResourceStatus401Schema,
	postNotificationResourceStatus403Schema,
]);

export const postNotificationResourceBodySchema = notificationSchema.describe(
	"Notification update representation",
);

export const deleteNotificationResourcePathNotificationIdSchema = z
	.string()
	.describe("The unique notification ID");

export const deleteNotificationResourceStatus204Schema = z.unknown();

export const deleteNotificationResourceStatus401Schema = z.unknown();

export const deleteNotificationResourceStatus403Schema = z.unknown();

export const deleteNotificationResourceStatus405Schema = z.unknown();

export const deleteNotificationResourceResponseSchema = deleteNotificationResourceStatus204Schema;

export const deleteNotificationResourceErrorSchema = z.union([
	deleteNotificationResourceStatus401Schema,
	deleteNotificationResourceStatus403Schema,
	deleteNotificationResourceStatus405Schema,
]);

export const getOpenerBrandsResourceStatus200Schema = z.array(openerIntercomBrandSchema);

export const getOpenerBrandsResourceResponseSchema = getOpenerBrandsResourceStatus200Schema;

export const getOpenerBrandResourcePathBrandIdSchema = z.int().describe("The brand ID");

export const getOpenerBrandResourceStatus200Schema = openerIntercomBrandSchema;

export const getOpenerBrandResourceResponseSchema = getOpenerBrandResourceStatus200Schema;

export const getOpenerIntercomsResourceQueryBrandIdSchema = z
	.int()
	.optional()
	.describe("Filter for brandId. Required if 'recentlyChanged' is not set");

export const getOpenerIntercomsResourceQueryIgnoreVerifiedSchema = z
	.boolean()
	.optional()
	.describe("If true, return intercoms ignoring their verified value");

export const getOpenerIntercomsResourceQueryRecentlyChangedSchema = z
	.boolean()
	.optional()
	.describe("If true, return all intercoms which recently were updated");

export const getOpenerIntercomsResourceStatus200Schema = z.array(openerIntercomModelSchema);

export const getOpenerIntercomsResourceResponseSchema = getOpenerIntercomsResourceStatus200Schema;

export const getOpenerIntercomResourcePathIntercomIdSchema = z.int().describe("The intercom ID");

export const getOpenerIntercomResourceStatus200Schema = openerIntercomModelSchema;

export const getOpenerIntercomResourceResponseSchema = getOpenerIntercomResourceStatus200Schema;

export const getServicesResourceQueryServiceIdsSchema = z
	.string()
	.optional()
	.describe("Filter for service IDs (comma-separated eg: airbnb,guesty,smoobu)");

export const getServicesResourceStatus200Schema = z.array(z.lazy(() => serviceSchema));

export const getServicesResourceStatus401Schema = z.unknown();

export const getServicesResourceResponseSchema = getServicesResourceStatus200Schema;

export const getServicesResourceErrorSchema = getServicesResourceStatus401Schema;

export const getServiceResourcePathServiceIdSchema = z.string().describe("The service ID");

export const getServiceResourceStatus200Schema = z.lazy(() => serviceSchema);

export const getServiceResourceStatus401Schema = z.unknown();

export const getServiceResourceResponseSchema = getServiceResourceStatus200Schema;

export const getServiceResourceErrorSchema = getServiceResourceStatus401Schema;

export const postServiceLinkResourcePathServiceIdSchema = z.string().describe("The service ID");

export const postServiceLinkResourceStatus200Schema = z.string();

export const postServiceLinkResourceStatus400Schema = z.unknown();

export const postServiceLinkResourceStatus401Schema = z.unknown();

export const postServiceLinkResourceResponseSchema = postServiceLinkResourceStatus200Schema;

export const postServiceLinkResourceErrorSchema = z.union([
	postServiceLinkResourceStatus400Schema,
	postServiceLinkResourceStatus401Schema,
]);

export const postServiceSyncResourcePathServiceIdSchema = z.string().describe("The service ID");

export const postServiceSyncResourceStatus204Schema = z.unknown();

export const postServiceSyncResourceStatus400Schema = z.unknown();

export const postServiceSyncResourceStatus401Schema = z.unknown();

export const postServiceSyncResourceResponseSchema = postServiceSyncResourceStatus204Schema;

export const postServiceSyncResourceErrorSchema = z.union([
	postServiceSyncResourceStatus400Schema,
	postServiceSyncResourceStatus401Schema,
]);

export const postServiceUnlinkResourcePathServiceIdSchema = z.string().describe("The service ID");

export const postServiceUnlinkResourceStatus204Schema = z.unknown();

export const postServiceUnlinkResourceStatus400Schema = z.unknown();

export const postServiceUnlinkResourceStatus401Schema = z.unknown();

export const postServiceUnlinkResourceResponseSchema = postServiceUnlinkResourceStatus204Schema;

export const postServiceUnlinkResourceErrorSchema = z.union([
	postServiceUnlinkResourceStatus400Schema,
	postServiceUnlinkResourceStatus401Schema,
]);

export const getSmartlocksResourceQueryAuthIdSchema = z
	.int()
	.optional()
	.describe("Filter for authId");

export const getSmartlocksResourceQueryTypeSchema = z.int().optional().describe("Filter for type");

export const getSmartlocksResourceStatus200Schema = z.array(smartlockSchema);

export const getSmartlocksResourceStatus401Schema = z.unknown();

export const getSmartlocksResourceResponseSchema = getSmartlocksResourceStatus200Schema;

export const getSmartlocksResourceErrorSchema = getSmartlocksResourceStatus401Schema;

export const getSmartlocksAuthsResourceQueryAccountUserIdSchema = z
	.int()
	.optional()
	.describe(
		"Filter for account users:  set to a positive number will filter for authorizations with this specific accountUserId, set to a negative number will filter without set accountUserId",
	);

export const getSmartlocksAuthsResourceQueryTypesSchema = z
	.string()
	.optional()
	.describe("Filter for authorization's types (comma-separated eg: 0,2,3)");

export const getSmartlocksAuthsResourceStatus200Schema = z.array(smartlockAuthSchema);

export const getSmartlocksAuthsResourceStatus401Schema = z.unknown();

export const getSmartlocksAuthsResourceResponseSchema = getSmartlocksAuthsResourceStatus200Schema;

export const getSmartlocksAuthsResourceErrorSchema = getSmartlocksAuthsResourceStatus401Schema;

export const postSmartlocksAuthsResourceStatus204Schema = z.unknown();

export const postSmartlocksAuthsResourceStatus400Schema = z.unknown();

export const postSmartlocksAuthsResourceStatus401Schema = z.unknown();

export const postSmartlocksAuthsResourceStatus403Schema = z.unknown();

export const postSmartlocksAuthsResourceStatus409Schema = z.unknown();

export const postSmartlocksAuthsResourceStatus423Schema = z.unknown();

export const postSmartlocksAuthsResourceResponseSchema = postSmartlocksAuthsResourceStatus204Schema;

export const postSmartlocksAuthsResourceErrorSchema = z.union([
	postSmartlocksAuthsResourceStatus400Schema,
	postSmartlocksAuthsResourceStatus401Schema,
	postSmartlocksAuthsResourceStatus403Schema,
	postSmartlocksAuthsResourceStatus409Schema,
	postSmartlocksAuthsResourceStatus423Schema,
]);

export const postSmartlocksAuthsResourceBodySchema = z
	.array(smartlockAuthMultiUpdateSchema)
	.describe("Smartlock authorization update representations");

export const putSmartlocksAuthsResourceStatus204Schema = z.unknown();

export const putSmartlocksAuthsResourceStatus400Schema = z.unknown();

export const putSmartlocksAuthsResourceStatus402Schema = z.unknown();

export const putSmartlocksAuthsResourceStatus409Schema = z.unknown();

export const putSmartlocksAuthsResourceStatus426Schema = z.unknown();

export const putSmartlocksAuthsResourceResponseSchema = putSmartlocksAuthsResourceStatus204Schema;

export const putSmartlocksAuthsResourceErrorSchema = z.union([
	putSmartlocksAuthsResourceStatus400Schema,
	putSmartlocksAuthsResourceStatus402Schema,
	putSmartlocksAuthsResourceStatus409Schema,
	putSmartlocksAuthsResourceStatus426Schema,
]);

export const putSmartlocksAuthsResourceBodySchema = smartlocksAuthCreateSchema.describe(
	"Smartlock authorization create representation",
);

export const deleteSmartlocksAuthsResourceStatus204Schema = z.unknown();

export const deleteSmartlocksAuthsResourceStatus400Schema = z.unknown();

export const deleteSmartlocksAuthsResourceStatus401Schema = z.unknown();

export const deleteSmartlocksAuthsResourceStatus403Schema = z.unknown();

export const deleteSmartlocksAuthsResourceStatus423Schema = z.unknown();

export const deleteSmartlocksAuthsResourceResponseSchema =
	deleteSmartlocksAuthsResourceStatus204Schema;

export const deleteSmartlocksAuthsResourceErrorSchema = z.union([
	deleteSmartlocksAuthsResourceStatus400Schema,
	deleteSmartlocksAuthsResourceStatus401Schema,
	deleteSmartlocksAuthsResourceStatus403Schema,
	deleteSmartlocksAuthsResourceStatus423Schema,
]);

export const deleteSmartlocksAuthsResourceBodySchema = z
	.array(z.string())
	.describe("Smartlock authorization IDs to delete");

export const putSmartlockAuthsAdvancedResourceStatus200Schema = advancedConfirmationResponseSchema;

export const putSmartlockAuthsAdvancedResourceStatus400Schema = z.unknown();

export const putSmartlockAuthsAdvancedResourceStatus402Schema = z.unknown();

export const putSmartlockAuthsAdvancedResourceStatus409Schema = z.unknown();

export const putSmartlockAuthsAdvancedResourceStatus426Schema = z.unknown();

export const putSmartlockAuthsAdvancedResourceResponseSchema =
	putSmartlockAuthsAdvancedResourceStatus200Schema;

export const putSmartlockAuthsAdvancedResourceErrorSchema = z.union([
	putSmartlockAuthsAdvancedResourceStatus400Schema,
	putSmartlockAuthsAdvancedResourceStatus402Schema,
	putSmartlockAuthsAdvancedResourceStatus409Schema,
	putSmartlockAuthsAdvancedResourceStatus426Schema,
]);

export const putSmartlockAuthsAdvancedResourceBodySchema =
	smartlocksAuthAdvancedCreateSchema.describe("Smartlock authorization create representation");

export const getSmartlocksAuthsPaginatedResourceQueryPageSchema = z
	.int()
	.optional()
	.default(0)
	.describe("The page number, starting from 0");

export const getSmartlocksAuthsPaginatedResourceQuerySizeSchema = z
	.int()
	.optional()
	.default(100)
	.describe("The number of items in one page");

export const getSmartlocksAuthsPaginatedResourceQueryAccountUserIdSchema = z
	.int()
	.optional()
	.describe(
		"Filter for account users:  set to a positive number will filter for authorizations with this specific accountUserId, set to a negative number will filter without set accountUserId",
	);

export const getSmartlocksAuthsPaginatedResourceQueryTypesSchema = z
	.string()
	.optional()
	.describe("Filter for authorization's types (comma-separated eg: 0,2,3)");

export const getSmartlocksAuthsPaginatedResourceStatus200Schema = paginatedResponseSchema;

export const getSmartlocksAuthsPaginatedResourceStatus401Schema = z.unknown();

export const getSmartlocksAuthsPaginatedResourceResponseSchema =
	getSmartlocksAuthsPaginatedResourceStatus200Schema;

export const getSmartlocksAuthsPaginatedResourceErrorSchema =
	getSmartlocksAuthsPaginatedResourceStatus401Schema;

export const getSmartlocksLogsResourceQueryAccountUserIdSchema = z
	.int()
	.optional()
	.describe("Filter for account users");

export const getSmartlocksLogsResourceQueryFromDateSchema = z
	.string()
	.optional()
	.describe("Filter for date (RFC3339)");

export const getSmartlocksLogsResourceQueryToDateSchema = z
	.string()
	.optional()
	.describe("Filter for date (RFC3339)");

export const getSmartlocksLogsResourceQueryActionSchema = z
	.int()
	.optional()
	.describe("Filter for action");

export const getSmartlocksLogsResourceQueryIdSchema = z
	.string()
	.optional()
	.describe("Filter for older logs");

export const getSmartlocksLogsResourceQueryLimitSchema = z
	.int()
	.optional()
	.default(20)
	.describe("Amount of logs (max: 50)");

export const getSmartlocksLogsResourceStatus200Schema = z.array(smartlockLogSchema);

export const getSmartlocksLogsResourceStatus401Schema = z.unknown();

export const getSmartlocksLogsResourceResponseSchema = getSmartlocksLogsResourceStatus200Schema;

export const getSmartlocksLogsResourceErrorSchema = getSmartlocksLogsResourceStatus401Schema;

export const getSmartlockResourcePathSmartlockIdSchema = z.int().describe("The smartlock ID");

export const getSmartlockResourceStatus200Schema = smartlockSchema;

export const getSmartlockResourceStatus401Schema = z.unknown();

export const getSmartlockResourceStatus403Schema = z.unknown();

export const getSmartlockResourceStatus404Schema = z.unknown();

export const getSmartlockResourceResponseSchema = getSmartlockResourceStatus200Schema;

export const getSmartlockResourceErrorSchema = z.union([
	getSmartlockResourceStatus401Schema,
	getSmartlockResourceStatus403Schema,
	getSmartlockResourceStatus404Schema,
]);

export const postSmartlockResourcePathSmartlockIdSchema = z.int().describe("The smartlock ID");

export const postSmartlockResourceStatus204Schema = z.unknown();

export const postSmartlockResourceStatus400Schema = z.unknown();

export const postSmartlockResourceStatus401Schema = z.unknown();

export const postSmartlockResourceStatus403Schema = z.unknown();

export const postSmartlockResourceResponseSchema = postSmartlockResourceStatus204Schema;

export const postSmartlockResourceErrorSchema = z.union([
	postSmartlockResourceStatus400Schema,
	postSmartlockResourceStatus401Schema,
	postSmartlockResourceStatus403Schema,
]);

export const postSmartlockResourceBodySchema = smartlockUpdateSchema.describe(
	"Smartlock update representation",
);

export const deleteSmartlockResourcePathSmartlockIdSchema = z.int().describe("The smartlock ID");

export const deleteSmartlockResourceStatus204Schema = z.unknown();

export const deleteSmartlockResourceStatus400Schema = z.unknown();

export const deleteSmartlockResourceStatus401Schema = z.unknown();

export const deleteSmartlockResourceStatus403Schema = z.unknown();

export const deleteSmartlockResourceResponseSchema = deleteSmartlockResourceStatus204Schema;

export const deleteSmartlockResourceErrorSchema = z.union([
	deleteSmartlockResourceStatus400Schema,
	deleteSmartlockResourceStatus401Schema,
	deleteSmartlockResourceStatus403Schema,
]);

export const postSmartlockActionResourcePathSmartlockIdSchema = z
	.string()
	.describe("The smartlock ID");

export const postSmartlockActionResourceStatus204Schema = z.unknown();

export const postSmartlockActionResourceStatus400Schema = z.unknown();

export const postSmartlockActionResourceStatus401Schema = z.unknown();

export const postSmartlockActionResourceStatus402Schema = z.unknown();

export const postSmartlockActionResourceResponseSchema = postSmartlockActionResourceStatus204Schema;

export const postSmartlockActionResourceErrorSchema = z.union([
	postSmartlockActionResourceStatus400Schema,
	postSmartlockActionResourceStatus401Schema,
	postSmartlockActionResourceStatus402Schema,
]);

export const postSmartlockActionResourceBodySchema = smartlockActionSchema.describe(
	"Smartlock action representation",
);

export const postSmartlockActionAdvancedResourcePathSmartlockIdSchema = z
	.string()
	.describe("The smartlock ID");

export const postSmartlockActionAdvancedResourceStatus200Schema =
	advancedConfirmationResponseSchema;

export const postSmartlockActionAdvancedResourceStatus400Schema = z.unknown();

export const postSmartlockActionAdvancedResourceStatus402Schema = z.unknown();

export const postSmartlockActionAdvancedResourceStatus409Schema = z.unknown();

export const postSmartlockActionAdvancedResourceStatus426Schema = z.unknown();

export const postSmartlockActionAdvancedResourceResponseSchema =
	postSmartlockActionAdvancedResourceStatus200Schema;

export const postSmartlockActionAdvancedResourceErrorSchema = z.union([
	postSmartlockActionAdvancedResourceStatus400Schema,
	postSmartlockActionAdvancedResourceStatus402Schema,
	postSmartlockActionAdvancedResourceStatus409Schema,
	postSmartlockActionAdvancedResourceStatus426Schema,
]);

export const postSmartlockActionAdvancedResourceBodySchema = smartlockActionSchema.describe(
	"Smartlock action representation",
);

export const postSmartlockLockActionResourcePathSmartlockIdSchema = z
	.string()
	.describe("The smartlock ID");

export const postSmartlockLockActionResourceStatus204Schema = z.unknown();

export const postSmartlockLockActionResourceStatus400Schema = z.unknown();

export const postSmartlockLockActionResourceStatus401Schema = z.unknown();

export const postSmartlockLockActionResourceStatus405Schema = z.unknown();

export const postSmartlockLockActionResourceResponseSchema =
	postSmartlockLockActionResourceStatus204Schema;

export const postSmartlockLockActionResourceErrorSchema = z.union([
	postSmartlockLockActionResourceStatus400Schema,
	postSmartlockLockActionResourceStatus401Schema,
	postSmartlockLockActionResourceStatus405Schema,
]);

export const postSmartlockLockActionAdvancedResourcePathSmartlockIdSchema = z
	.string()
	.describe("The smartlock ID");

export const postSmartlockLockActionAdvancedResourceStatus200Schema =
	advancedConfirmationResponseSchema;

export const postSmartlockLockActionAdvancedResourceStatus400Schema = z.unknown();

export const postSmartlockLockActionAdvancedResourceStatus401Schema = z.unknown();

export const postSmartlockLockActionAdvancedResourceStatus405Schema = z.unknown();

export const postSmartlockLockActionAdvancedResourceResponseSchema =
	postSmartlockLockActionAdvancedResourceStatus200Schema;

export const postSmartlockLockActionAdvancedResourceErrorSchema = z.union([
	postSmartlockLockActionAdvancedResourceStatus400Schema,
	postSmartlockLockActionAdvancedResourceStatus401Schema,
	postSmartlockLockActionAdvancedResourceStatus405Schema,
]);

export const postSmartlockUnlockActionResourcePathSmartlockIdSchema = z
	.string()
	.describe("The smartlock ID");

export const postSmartlockUnlockActionResourceStatus204Schema = z.unknown();

export const postSmartlockUnlockActionResourceStatus400Schema = z.unknown();

export const postSmartlockUnlockActionResourceStatus401Schema = z.unknown();

export const postSmartlockUnlockActionResourceStatus405Schema = z.unknown();

export const postSmartlockUnlockActionResourceResponseSchema =
	postSmartlockUnlockActionResourceStatus204Schema;

export const postSmartlockUnlockActionResourceErrorSchema = z.union([
	postSmartlockUnlockActionResourceStatus400Schema,
	postSmartlockUnlockActionResourceStatus401Schema,
	postSmartlockUnlockActionResourceStatus405Schema,
]);

export const postSmartlockUnlockActionAdvancedResourcePathSmartlockIdSchema = z
	.string()
	.describe("The smartlock ID");

export const postSmartlockUnlockActionAdvancedResourceStatus200Schema =
	advancedConfirmationResponseSchema;

export const postSmartlockUnlockActionAdvancedResourceStatus400Schema = z.unknown();

export const postSmartlockUnlockActionAdvancedResourceStatus401Schema = z.unknown();

export const postSmartlockUnlockActionAdvancedResourceStatus405Schema = z.unknown();

export const postSmartlockUnlockActionAdvancedResourceResponseSchema =
	postSmartlockUnlockActionAdvancedResourceStatus200Schema;

export const postSmartlockUnlockActionAdvancedResourceErrorSchema = z.union([
	postSmartlockUnlockActionAdvancedResourceStatus400Schema,
	postSmartlockUnlockActionAdvancedResourceStatus401Schema,
	postSmartlockUnlockActionAdvancedResourceStatus405Schema,
]);

export const postSmartlockAdminPinResourcePathSmartlockIdSchema = z
	.int()
	.describe("The smartlock ID");

export const postSmartlockAdminPinResourceStatus204Schema = z.unknown();

export const postSmartlockAdminPinResourceStatus400Schema = z.unknown();

export const postSmartlockAdminPinResourceStatus401Schema = z.unknown();

export const postSmartlockAdminPinResourceResponseSchema =
	postSmartlockAdminPinResourceStatus204Schema;

export const postSmartlockAdminPinResourceErrorSchema = z.union([
	postSmartlockAdminPinResourceStatus400Schema,
	postSmartlockAdminPinResourceStatus401Schema,
]);

export const postSmartlockAdminPinResourceBodySchema = smartlockAdminPinUpdateSchema.describe(
	"Smartlock admin pin update representation",
);

export const postSmartlockAdvancedConfigResourcePathSmartlockIdSchema = z
	.int()
	.describe("The smartlock ID");

export const postSmartlockAdvancedConfigResourceStatus204Schema = z.unknown();

export const postSmartlockAdvancedConfigResourceStatus400Schema = z.unknown();

export const postSmartlockAdvancedConfigResourceStatus401Schema = z.unknown();

export const postSmartlockAdvancedConfigResourceResponseSchema =
	postSmartlockAdvancedConfigResourceStatus204Schema;

export const postSmartlockAdvancedConfigResourceErrorSchema = z.union([
	postSmartlockAdvancedConfigResourceStatus400Schema,
	postSmartlockAdvancedConfigResourceStatus401Schema,
]);

export const postSmartlockAdvancedConfigResourceBodySchema = smartlockAdvancedConfigSchema
	.omit({ operationId: true, totalDegrees: true })
	.describe("Smartlock config update representation");

export const postSmartlockOpenerAdvancedConfigResourcePathSmartlockIdSchema = z
	.int()
	.describe("The smartlock (opener) ID");

export const postSmartlockOpenerAdvancedConfigResourceStatus204Schema = z.unknown();

export const postSmartlockOpenerAdvancedConfigResourceStatus400Schema = z.unknown();

export const postSmartlockOpenerAdvancedConfigResourceStatus401Schema = z.unknown();

export const postSmartlockOpenerAdvancedConfigResourceResponseSchema =
	postSmartlockOpenerAdvancedConfigResourceStatus204Schema;

export const postSmartlockOpenerAdvancedConfigResourceErrorSchema = z.union([
	postSmartlockOpenerAdvancedConfigResourceStatus400Schema,
	postSmartlockOpenerAdvancedConfigResourceStatus401Schema,
]);

export const postSmartlockOpenerAdvancedConfigResourceBodySchema =
	smartlockOpenerAdvancedConfigSchema
		.omit({ intercomId: true, busModeSwitch: true, operationId: true })
		.describe("Opener advanced config update representation");

export const postSmartdoorAdvancedConfigResourcePathSmartlockIdSchema = z
	.int()
	.describe("The smartdoor ID");

export const postSmartdoorAdvancedConfigResourceStatus204Schema = z.unknown();

export const postSmartdoorAdvancedConfigResourceStatus400Schema = z.unknown();

export const postSmartdoorAdvancedConfigResourceStatus401Schema = z.unknown();

export const postSmartdoorAdvancedConfigResourceResponseSchema =
	postSmartdoorAdvancedConfigResourceStatus204Schema;

export const postSmartdoorAdvancedConfigResourceErrorSchema = z.union([
	postSmartdoorAdvancedConfigResourceStatus400Schema,
	postSmartdoorAdvancedConfigResourceStatus401Schema,
]);

export const postSmartdoorAdvancedConfigResourceBodySchema = smartlockSmartdoorAdvancedConfigSchema
	.omit({ operationId: true, supportedBatteryTypes: true })
	.describe("Smartdoor advanced config update representation");

export const getSmartlockAuthsResourcePathSmartlockIdSchema = z.int().describe("The smartlock ID");

export const getSmartlockAuthsResourceQueryTypesSchema = z
	.string()
	.optional()
	.describe("Filter for smartlock authorization's types (comma-separated eg: 0,2,3)");

export const getSmartlockAuthsResourceQueryIncludeEmailSchema = z
	.boolean()
	.optional()
	.describe("Indicates if email should be included in the response");

export const getSmartlockAuthsResourceStatus200Schema = z.array(smartlockAuthSchema);

export const getSmartlockAuthsResourceStatus401Schema = z.unknown();

export const getSmartlockAuthsResourceStatus403Schema = z.unknown();

export const getSmartlockAuthsResourceResponseSchema = getSmartlockAuthsResourceStatus200Schema;

export const getSmartlockAuthsResourceErrorSchema = z.union([
	getSmartlockAuthsResourceStatus401Schema,
	getSmartlockAuthsResourceStatus403Schema,
]);

export const putSmartlockAuthsResourcePathSmartlockIdSchema = z.int().describe("The smartlock ID");

export const putSmartlockAuthsResourceStatus204Schema = z.unknown();

export const putSmartlockAuthsResourceStatus400Schema = z.unknown();

export const putSmartlockAuthsResourceStatus402Schema = z.unknown();

export const putSmartlockAuthsResourceStatus409Schema = z.unknown();

export const putSmartlockAuthsResourceStatus426Schema = z.unknown();

export const putSmartlockAuthsResourceResponseSchema = putSmartlockAuthsResourceStatus204Schema;

export const putSmartlockAuthsResourceErrorSchema = z.union([
	putSmartlockAuthsResourceStatus400Schema,
	putSmartlockAuthsResourceStatus402Schema,
	putSmartlockAuthsResourceStatus409Schema,
	putSmartlockAuthsResourceStatus426Schema,
]);

export const putSmartlockAuthsResourceBodySchema = smartlockAuthCreateSchema.describe(
	"Smartlock authorization create representation",
);

export const postSmartlockAuthWithSharedKeyResourcePathSmartlockIdSchema = z
	.int()
	.describe("The smartlock ID");

export const postSmartlockAuthWithSharedKeyResourceStatus200Schema = z.array(smartlockAuthSchema);

export const postSmartlockAuthWithSharedKeyResourceStatus401Schema = z.unknown();

export const postSmartlockAuthWithSharedKeyResourceStatus403Schema = z.unknown();

export const postSmartlockAuthWithSharedKeyResourceStatus404Schema = z.unknown();

export const postSmartlockAuthWithSharedKeyResourceResponseSchema =
	postSmartlockAuthWithSharedKeyResourceStatus200Schema;

export const postSmartlockAuthWithSharedKeyResourceErrorSchema = z.union([
	postSmartlockAuthWithSharedKeyResourceStatus401Schema,
	postSmartlockAuthWithSharedKeyResourceStatus403Schema,
	postSmartlockAuthWithSharedKeyResourceStatus404Schema,
]);

export const postSmartlockAuthWithSharedKeyResourceBodySchema =
	smartlockAuthWithSharedKeyCreateSchema.describe("Smartlock auth create with shared key");

export const getSmartlockAuthResourcePathSmartlockIdSchema = z.int().describe("The smartlock ID");

export const getSmartlockAuthResourcePathIdSchema = z
	.string()
	.describe("The smartlock auth unique ID");

export const getSmartlockAuthResourceStatus200Schema = smartlockAuthSchema;

export const getSmartlockAuthResourceStatus401Schema = z.unknown();

export const getSmartlockAuthResourceStatus403Schema = z.unknown();

export const getSmartlockAuthResourceResponseSchema = getSmartlockAuthResourceStatus200Schema;

export const getSmartlockAuthResourceErrorSchema = z.union([
	getSmartlockAuthResourceStatus401Schema,
	getSmartlockAuthResourceStatus403Schema,
]);

export const postSmartlockAuthResourcePathSmartlockIdSchema = z.int().describe("The smartlock ID");

export const postSmartlockAuthResourcePathIdSchema = z
	.string()
	.describe("The smartlock authorization unique ID");

export const postSmartlockAuthResourceStatus204Schema = z.unknown();

export const postSmartlockAuthResourceStatus400Schema = z.unknown();

export const postSmartlockAuthResourceStatus401Schema = z.unknown();

export const postSmartlockAuthResourceStatus403Schema = z.unknown();

export const postSmartlockAuthResourceStatus409Schema = z.unknown();

export const postSmartlockAuthResourceStatus423Schema = z.unknown();

export const postSmartlockAuthResourceResponseSchema = postSmartlockAuthResourceStatus204Schema;

export const postSmartlockAuthResourceErrorSchema = z.union([
	postSmartlockAuthResourceStatus400Schema,
	postSmartlockAuthResourceStatus401Schema,
	postSmartlockAuthResourceStatus403Schema,
	postSmartlockAuthResourceStatus409Schema,
	postSmartlockAuthResourceStatus423Schema,
]);

export const postSmartlockAuthResourceBodySchema = smartlockAuthUpdateSchema.describe(
	"Smartlock authorization update representation",
);

export const deleteSmartlockAuthResourcePathSmartlockIdSchema = z
	.int()
	.describe("The smartlock ID");

export const deleteSmartlockAuthResourcePathIdSchema = z
	.string()
	.describe("The smartlock authorization unique ID");

export const deleteSmartlockAuthResourceStatus204Schema = z.unknown();

export const deleteSmartlockAuthResourceStatus401Schema = z.unknown();

export const deleteSmartlockAuthResourceStatus403Schema = z.unknown();

export const deleteSmartlockAuthResourceStatus423Schema = z.unknown();

export const deleteSmartlockAuthResourceResponseSchema = deleteSmartlockAuthResourceStatus204Schema;

export const deleteSmartlockAuthResourceErrorSchema = z.union([
	deleteSmartlockAuthResourceStatus401Schema,
	deleteSmartlockAuthResourceStatus403Schema,
	deleteSmartlockAuthResourceStatus423Schema,
]);

export const postSmartlockConfigResourcePathSmartlockIdSchema = z
	.int()
	.describe("The smartlock ID");

export const postSmartlockConfigResourceStatus204Schema = z.unknown();

export const postSmartlockConfigResourceStatus400Schema = z.unknown();

export const postSmartlockConfigResourceStatus401Schema = z.unknown();

export const postSmartlockConfigResourceResponseSchema = postSmartlockConfigResourceStatus204Schema;

export const postSmartlockConfigResourceErrorSchema = z.union([
	postSmartlockConfigResourceStatus400Schema,
	postSmartlockConfigResourceStatus401Schema,
]);

export const postSmartlockConfigResourceBodySchema = smartlockConfigSchema
	.omit({
		capabilities: true,
		fobPaired: true,
		fobAction1: true,
		fobAction2: true,
		fobAction3: true,
		operatingMode: true,
		keypadPaired: true,
		keypad2Paired: true,
		homekitState: true,
		matterState: true,
		deviceType: true,
		wifiEnabled: true,
		operationId: true,
		productVariant: true,
	})
	.describe("Smartlock config update representation");

export const getSmartlockLogsResourcePathSmartlockIdSchema = z.int().describe("The smartlock ID");

export const getSmartlockLogsResourceQueryAuthIdSchema = z
	.string()
	.optional()
	.describe("Filter for auths");

export const getSmartlockLogsResourceQueryAccountUserIdSchema = z
	.int()
	.optional()
	.describe("Filter for account users");

export const getSmartlockLogsResourceQueryFromDateSchema = z
	.string()
	.optional()
	.describe("Filter for date (RFC3339)");

export const getSmartlockLogsResourceQueryToDateSchema = z
	.string()
	.optional()
	.describe("Filter for date (RFC3339)");

export const getSmartlockLogsResourceQueryActionSchema = z
	.int()
	.optional()
	.describe("Filter for action");

export const getSmartlockLogsResourceQueryIdSchema = z
	.string()
	.optional()
	.describe("Filter for older logs");

export const getSmartlockLogsResourceQueryLimitSchema = z
	.int()
	.optional()
	.default(20)
	.describe("Amount of logs (max: 50)");

export const getSmartlockLogsResourceStatus200Schema = z.array(smartlockLogSchema);

export const getSmartlockLogsResourceStatus401Schema = z.unknown();

export const getSmartlockLogsResourceResponseSchema = getSmartlockLogsResourceStatus200Schema;

export const getSmartlockLogsResourceErrorSchema = getSmartlockLogsResourceStatus401Schema;

export const postSmartlockSyncResourcePathSmartlockIdSchema = z
	.string()
	.describe("The smartlock ID");

export const postSmartlockSyncResourceStatus204Schema = z.unknown();

export const postSmartlockSyncResourceStatus400Schema = z.unknown();

export const postSmartlockSyncResourceStatus401Schema = z.unknown();

export const postSmartlockSyncResourceResponseSchema = postSmartlockSyncResourceStatus204Schema;

export const postSmartlockSyncResourceErrorSchema = z.union([
	postSmartlockSyncResourceStatus400Schema,
	postSmartlockSyncResourceStatus401Schema,
]);

export const postSmartlockWebConfigResourcePathSmartlockIdSchema = z
	.int()
	.describe("The smartlock ID");

export const postSmartlockWebConfigResourceStatus204Schema = z.unknown();

export const postSmartlockWebConfigResourceStatus400Schema = z.unknown();

export const postSmartlockWebConfigResourceStatus401Schema = z.unknown();

export const postSmartlockWebConfigResourceResponseSchema =
	postSmartlockWebConfigResourceStatus204Schema;

export const postSmartlockWebConfigResourceErrorSchema = z.union([
	postSmartlockWebConfigResourceStatus400Schema,
	postSmartlockWebConfigResourceStatus401Schema,
]);

export const postSmartlockWebConfigResourceBodySchema = smartlockWebConfigSchema.describe(
	"Smartlock web config update representation",
);
