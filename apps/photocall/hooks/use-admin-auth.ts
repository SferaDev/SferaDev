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

	const login = useCallback(() => {
		const session: AdminSession = {
			authenticated: true,
			expiresAt: Date.now() + SESSION_DURATION,
		};
		localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
		setIsAuthenticated(true);
	}, []);

	const logout = useCallback(() => {
		localStorage.removeItem(ADMIN_SESSION_KEY);
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
		login,
		logout,
		extendSession,
	};
}
