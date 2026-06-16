"use client";

import { useCallback, useEffect, useState } from "react";

const ADMIN_SESSION_KEY = "photocall_admin_session";
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

interface AdminSession {
	authenticated: boolean;
	expiresAt: number;
}

export function useAdminAuth() {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	// The validated PIN is kept only in memory (never persisted) so server
	// actions that require server-side PIN verification can re-present it during
	// this admin session. A reload clears it: the operator must re-enter the PIN,
	// which is the intended behaviour for the bypassable localStorage flag below.
	const [pin, setPin] = useState<string | null>(null);

	// Check session on mount
	useEffect(() => {
		const session = localStorage.getItem(ADMIN_SESSION_KEY);
		if (session) {
			try {
				const parsed: AdminSession = JSON.parse(session);
				if (parsed.authenticated && parsed.expiresAt > Date.now()) {
					setIsAuthenticated(true);
				} else {
					localStorage.removeItem(ADMIN_SESSION_KEY);
				}
			} catch {
				localStorage.removeItem(ADMIN_SESSION_KEY);
			}
		}
		setIsLoading(false);
	}, []);

	const login = useCallback((validatedPin: string) => {
		const session: AdminSession = {
			authenticated: true,
			expiresAt: Date.now() + SESSION_DURATION,
		};
		localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
		setPin(validatedPin);
		setIsAuthenticated(true);
	}, []);

	const logout = useCallback(() => {
		localStorage.removeItem(ADMIN_SESSION_KEY);
		setPin(null);
		setIsAuthenticated(false);
	}, []);

	const extendSession = useCallback(() => {
		if (isAuthenticated) {
			const session: AdminSession = {
				authenticated: true,
				expiresAt: Date.now() + SESSION_DURATION,
			};
			localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
		}
	}, [isAuthenticated]);

	return {
		isAuthenticated,
		isLoading,
		pin,
		login,
		logout,
		extendSession,
	};
}
