"use client";

import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";
import { authClient } from "@/lib/auth-client";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
	throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
}

const convex = new ConvexReactClient(convexUrl);

interface AuthProviderProps {
	children: ReactNode;
	initialToken?: string | null;
}

export function AuthProvider({ children, initialToken }: AuthProviderProps) {
	return (
		<ConvexBetterAuthProvider client={convex} authClient={authClient} initialToken={initialToken}>
			{children}
		</ConvexBetterAuthProvider>
	);
}
