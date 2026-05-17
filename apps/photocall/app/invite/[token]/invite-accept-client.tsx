"use client";

import { Loader2, Mail } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { acceptInvitation, getInvitationByToken } from "@/actions/organizations";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

export default function InviteAcceptClient() {
	const { data: session, isPending: authLoading } = useSession();
	const isAuthenticated = !!session;
	const router = useRouter();
	const params = useParams();
	const token = params.token as string;

	const { data: invitation, isLoading: invitationLoading } = useSWR(
		isAuthenticated ? ["invitation", token] : null,
		() => getInvitationByToken(token),
	);

	const [accepting, setAccepting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	if (authLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!isAuthenticated) {
		// Redirect to sign in with return URL
		router.push(`/sign-in?redirect=/invite/${token}`);
		return null;
	}

	if (invitationLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!invitation) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center max-w-md">
					<h1 className="text-2xl font-bold mb-2">Invalid Invitation</h1>
					<p className="text-muted-foreground mb-4">
						This invitation link is invalid or has expired.
					</p>
					<Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
				</div>
			</div>
		);
	}

	const handleAccept = async () => {
		setAccepting(true);
		setError(null);
		try {
			await acceptInvitation(token);
			router.push("/dashboard");
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Failed to accept invitation";
			setError(message);
		} finally {
			setAccepting(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="text-center max-w-md p-8 border rounded-lg">
				<Mail className="h-12 w-12 mx-auto text-primary mb-4" />
				<h1 className="text-2xl font-bold mb-2">Team Invitation</h1>
				<p className="text-muted-foreground mb-6">
					You've been invited to join <strong>{invitation.organizationName}</strong> as a{" "}
					{invitation.role}.
				</p>
				{error && <p className="text-destructive mb-4">{error}</p>}
				<div className="flex gap-3 justify-center">
					<Button variant="outline" onClick={() => router.push("/dashboard")}>
						Decline
					</Button>
					<Button onClick={handleAccept} disabled={accepting}>
						{accepting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
						Accept Invitation
					</Button>
				</div>
			</div>
		</div>
	);
}
