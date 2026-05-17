"use client";

import useSWR, { useSWRConfig } from "swr";

/**
 * Client-side session helpers. Auth is handled entirely by the platform via
 * the `/api/auth/*` reverse proxy (see `middleware.ts`). These helpers hit
 * better-auth endpoints through the proxy so cookies stay first-party on the
 * photocall domain.
 */

export interface ClientUser {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image: string | null;
}

export interface ClientSession {
	user: ClientUser;
	session: {
		id: string;
		token: string;
		expiresAt: string;
		activeOrganizationId?: string | null;
	};
}

const SESSION_KEY = "/api/auth/get-session";

async function fetcher<T>(url: string): Promise<T | null> {
	const res = await fetch(url, { credentials: "include" });
	if (!res.ok) return null;
	const text = await res.text();
	if (!text) return null;
	return JSON.parse(text) as T;
}

/**
 * Returns the current session via the platform proxy.
 */
export function useSession(): {
	data: ClientSession | null | undefined;
	isPending: boolean;
	error: unknown;
} {
	const { data, error, isLoading } = useSWR<ClientSession | null>(SESSION_KEY, fetcher, {
		shouldRetryOnError: false,
		revalidateOnFocus: false,
	});
	return { data: data ?? null, isPending: isLoading, error };
}

export function useSessionMutate(): () => Promise<void> {
	const { mutate } = useSWRConfig();
	return () => mutate(SESSION_KEY) as Promise<void>;
}

export interface SignInResult {
	error: { message: string } | null;
}

export const authClient = {
	signIn: {
		async email(input: { email: string; password: string }): Promise<SignInResult> {
			const res = await fetch("/api/auth/sign-in/email", {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(input),
			});
			if (res.ok) return { error: null };
			const body = await res.json().catch(() => ({ message: "Sign in failed" }));
			return { error: { message: body.message ?? `HTTP ${res.status}` } };
		},

		async social(input: { provider: string; callbackURL?: string }): Promise<void> {
			const res = await fetch("/api/auth/sign-in/social", {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(input),
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({ message: "Sign in failed" }));
				throw new Error(body.message ?? `HTTP ${res.status}`);
			}
			const data = (await res.json()) as { url?: string; redirect?: boolean };
			if (data.url) {
				window.location.href = data.url;
			}
		},
	},
	signUp: {
		async email(input: { email: string; password: string; name: string }): Promise<SignInResult> {
			const res = await fetch("/api/auth/sign-up/email", {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(input),
			});
			if (res.ok) return { error: null };
			const body = await res.json().catch(() => ({ message: "Sign up failed" }));
			return { error: { message: body.message ?? `HTTP ${res.status}` } };
		},
	},
	async signOut(): Promise<void> {
		await fetch("/api/auth/sign-out", {
			method: "POST",
			credentials: "include",
		});
	},
};

export const signIn = authClient.signIn;
export const signUp = authClient.signUp;
export const signOut = () => authClient.signOut();
