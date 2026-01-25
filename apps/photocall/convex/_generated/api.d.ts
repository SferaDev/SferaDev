/* eslint-disable */
// This file is a stub for TypeScript checking before running convex dev
// Running `npx convex dev` will generate the actual file with proper types

export declare const api: {
	auth: {
		signIn: any;
		signOut: any;
	};
	events: {
		create: any;
		list: any;
		get: any;
		getBySlug: any;
		getPublic: any;
		update: any;
		remove: any;
		duplicate: any;
		setKioskPin: any;
		validateKioskPin: any;
		getStats: any;
		generateUploadUrl: any;
	};
	organizations: {
		create: any;
		get: any;
		getBySlug: any;
		update: any;
		remove: any;
		getMembers: any;
		updateMemberRole: any;
		removeMember: any;
		invite: any;
		getInvitations: any;
		cancelInvitation: any;
		acceptInvitation: any;
		getInvitationByToken: any;
		getUsage: any;
		generateUploadUrl: any;
	};
	photos: {
		create: any;
		generateUploadUrl: any;
		get: any;
		getByHumanCode: any;
		getByShareToken: any;
		getCount: any;
		list: any;
		listRecent: any;
		listRecentPublic: any;
		remove: any;
		removeAll: any;
	};
	sessions: {
		abandon: any;
		complete: any;
		create: any;
		get: any;
		getStats: any;
		list: any;
		personalize: any;
		saveCapture: any;
		selectTemplate: any;
	};
	stripe: {
		createCheckoutSession: any;
		createPortalSession: any;
		getSubscription: any;
	};
	templates: {
		create: any;
		generateUploadUrl: any;
		get: any;
		list: any;
		listPublic: any;
		remove: any;
		reorder: any;
		update: any;
	};
	users: {
		me: any;
		getProfile: any;
		createProfile: any;
		updateProfile: any;
		completeOnboarding: any;
		getOrganizations: any;
	};
};

export declare const internal: {
	stripe: {
		getOrganization: any;
		updateStripeCustomerId: any;
		handleSubscriptionUpdated: any;
		handleSubscriptionCanceled: any;
	};
};
