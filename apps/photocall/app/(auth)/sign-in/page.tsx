"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SignInForm } from "@/components/auth/sign-in-form";
import { useSession } from "@/lib/auth-client";

export default function SignInPage() {
	const { data: session, isPending } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (!isPending && session) {
			router.push("/dashboard");
		}
	}, [session, isPending, router]);

	if (isPending) {
		return (
			<div className="flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
			</div>
		);
	}

	return <SignInForm />;
}
