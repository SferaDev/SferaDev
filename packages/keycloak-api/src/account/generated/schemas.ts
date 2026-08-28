// @ts-nocheck

import * as z from "zod";

export const organizationRepresentationSchema = z.object({
	id: z.string().optional(),
	name: z.string().optional(),
	alias: z.string().optional(),
	description: z.string().optional(),
	enabled: z.boolean().optional(),
	domains: z.array(z.string()).optional(),
});

export const groupRepresentationSchema = z.object({
	access: z.object({}).catchall(z.unknown()).optional(),
	attributes: z.object({}).catchall(z.unknown()).optional(),
	clientRoles: z.object({}).catchall(z.unknown()).optional(),
	id: z.string().optional(),
	name: z.string().optional(),
	path: z.string().optional(),
	realmRoles: z.array(z.string()).optional(),
	get subGroups() {
		return z.array(groupRepresentationSchema).optional();
	},
});

export const consentScopeRepresentationSchema = z.object({
	id: z.string().optional(),
	name: z.string().optional(),
	displayText: z.string().optional(),
});

export const consentRepresentationSchema = z.object({
	createdDate: z.number().optional(),
	lastUpdatedDate: z.number().optional(),
	grantedScopes: z.array(consentScopeRepresentationSchema).optional(),
});

export const clientRepresentationSchema = z.object({
	clientId: z.string().optional(),
	clientName: z.string().optional(),
	description: z.string().optional(),
	userConsentRequired: z.boolean().optional(),
	inUse: z.boolean().optional(),
	offlineAccess: z.boolean().optional(),
	rootUrl: z.string().optional(),
	baseUrl: z.string().optional(),
	effectiveUrl: z.string().optional(),
	logoUri: z.string().optional(),
	policyUri: z.string().optional(),
	tosUri: z.string().optional(),
	consent: consentRepresentationSchema.optional(),
});

export const linkedAccountRepresentationSchema = z.object({
	connected: z.boolean().optional(),
	social: z.boolean().optional(),
	providerAlias: z.string().optional(),
	providerName: z.string().optional(),
	displayName: z.string().optional(),
	linkedUsername: z.string().optional(),
});

export const accountLinkUriRepresentationSchema = z.object({
	accountLinkUri: z.string().optional(),
	nonce: z.string().optional(),
	hash: z.string().optional(),
});

export const userProfileMetadataAttributeRepresentationSchema = z.object({
	name: z.string().optional(),
	displayName: z.string().optional(),
	required: z.boolean().optional(),
	readOnly: z.boolean().optional(),
	validators: z.object({}).optional(),
});

export const userProfileMetadataRepresentationSchema = z.object({
	attributes: z.array(userProfileMetadataAttributeRepresentationSchema).optional(),
});

export const userProfileAttributesRepresentationSchema = z.object({
	locale: z.array(z.string()).optional(),
});

export const accountRepresentationSchema = z.object({
	id: z.string().optional(),
	username: z.string().optional(),
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	email: z.string().optional(),
	emailVerified: z.boolean().optional(),
	userProfileMetadata: userProfileMetadataRepresentationSchema.optional(),
	attributes: userProfileAttributesRepresentationSchema.optional(),
});

export const credentialMetadataRepresentationSchema = z.object({
	id: z.string().optional(),
	type: z.string().optional(),
	userLabel: z.string().optional(),
	createdDate: z.string().optional(),
	credentialData: z.object({}).optional(),
});

export const userCredentialMetadataRepresentationSchema = z.object({
	credential: credentialMetadataRepresentationSchema.optional(),
});

export const credentialRepresentationSchema = z.object({
	type: z.string().optional(),
	category: z.string().optional(),
	displayName: z.string().optional(),
	helpText: z.string().optional(),
	iconCssClass: z.string().optional(),
	updateAction: z.string().optional(),
	removeable: z.boolean().optional(),
	userCredentialMetadatas: z.array(userCredentialMetadataRepresentationSchema).optional(),
});

export const sessionRepresentationSchema = z.object({
	id: z.string().optional(),
	ipAddress: z.string().optional(),
	started: z.number().optional(),
	lastAccess: z.number().optional(),
	expires: z.number().optional(),
	browser: z.string().optional(),
	current: z.boolean().optional(),
	clients: z.array(clientRepresentationSchema).optional(),
});

export const deviceRepresentationSchema = z.object({
	id: z.string().optional(),
	ipAddress: z.string().optional(),
	os: z.string().optional(),
	osVersion: z.string().optional(),
	browser: z.string().optional(),
	device: z.string().optional(),
	lastAccess: z.number().optional(),
	current: z.boolean().optional(),
	mobile: z.boolean().optional(),
	sessions: z.array(sessionRepresentationSchema).optional(),
});

export const getAccountQueryUserProfileMetadataSchema = z.boolean().optional();

export const getAccountStatus200Schema = accountRepresentationSchema;

export const getAccountResponseSchema = getAccountStatus200Schema;

export const updateAccountStatus204Schema = z.unknown();

export const updateAccountResponseSchema = updateAccountStatus204Schema;

export const updateAccountBodySchema = accountRepresentationSchema;

export const getApplicationsQueryNameSchema = z.string().optional();

export const getApplicationsStatus200Schema = z.array(clientRepresentationSchema);

export const getApplicationsResponseSchema = getApplicationsStatus200Schema;

export const getConsentPathClientIdSchema = z.string().describe("client id");

export const getConsentStatus200Schema = consentRepresentationSchema;

export const getConsentResponseSchema = getConsentStatus200Schema;

export const createConsentPathClientIdSchema = z.string().describe("client id");

export const createConsentStatus200Schema = consentRepresentationSchema;

export const createConsentResponseSchema = createConsentStatus200Schema;

export const updateConsentPathClientIdSchema = z.string().describe("client id");

export const updateConsentStatus200Schema = consentRepresentationSchema;

export const updateConsentResponseSchema = updateConsentStatus200Schema;

export const deleteConsentPathClientIdSchema = z.string().describe("client id");

export const deleteConsentStatus204Schema = z.unknown();

export const deleteConsentResponseSchema = deleteConsentStatus204Schema;

export const getCredentialsQueryTypeSchema = z.string().optional();

export const getCredentialsQueryUserCredentialsSchema = z.boolean().optional();

export const getCredentialsStatus200Schema = z.array(credentialRepresentationSchema);

export const getCredentialsResponseSchema = getCredentialsStatus200Schema;

export const deleteCredentialPathCredentialIdSchema = z.string().describe("Credential ID");

export const deleteCredentialStatus204Schema = z.unknown();

export const deleteCredentialResponseSchema = deleteCredentialStatus204Schema;

export const updateCredentialLabelPathCredentialIdSchema = z.string().describe("Credential ID");

export const updateCredentialLabelStatus204Schema = z.unknown();

export const updateCredentialLabelResponseSchema = updateCredentialLabelStatus204Schema;

export const updateCredentialLabelBodySchema = z.string().optional();

export const getSessionsStatus200Schema = z.array(sessionRepresentationSchema);

export const getSessionsResponseSchema = getSessionsStatus200Schema;

export const deleteCurrentSessionStatus204Schema = z.unknown();

export const deleteCurrentSessionResponseSchema = deleteCurrentSessionStatus204Schema;

export const getDevicesStatus200Schema = z.array(deviceRepresentationSchema);

export const getDevicesResponseSchema = getDevicesStatus200Schema;

export const deleteSessionPathSessionIdSchema = z.string().describe("Session ID");

export const deleteSessionStatus204Schema = z.unknown();

export const deleteSessionResponseSchema = deleteSessionStatus204Schema;

export const getLinkedAccountsStatus200Schema = z.array(linkedAccountRepresentationSchema);

export const getLinkedAccountsResponseSchema = getLinkedAccountsStatus200Schema;

export const buildLinkingUriPathProviderIdSchema = z.string().describe("Provider ID");

export const buildLinkingUriQueryRedirectUriSchema = z
	.string()
	.describe("Redirect URI to return to after account linking");

export const buildLinkingUriStatus200Schema = accountLinkUriRepresentationSchema;

export const buildLinkingUriResponseSchema = buildLinkingUriStatus200Schema;

export const deleteLinkedProviderPathProviderIdSchema = z.string().describe("Provider ID");

export const deleteLinkedProviderStatus204Schema = z.unknown();

export const deleteLinkedProviderResponseSchema = deleteLinkedProviderStatus204Schema;

export const getGroupsQueryBriefRepresentationSchema = z.boolean().optional().default(true);

export const getGroupsStatus200Schema = z.array(z.lazy(() => groupRepresentationSchema));

export const getGroupsResponseSchema = getGroupsStatus200Schema;

export const getOrganizationsStatus200Schema = z.array(organizationRepresentationSchema);

export const getOrganizationsResponseSchema = getOrganizationsStatus200Schema;
