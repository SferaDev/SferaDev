"use client";

import { useMutation } from "convex/react";
import { Camera, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { useAdminAuth } from "@/hooks/use-admin-auth";

export default function AdminLoginPage() {
	const router = useRouter();
	const { isAuthenticated, isLoading: authLoading, login } = useAdminAuth();
	const [pin, setPin] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const validatePin = useMutation(api.settings.validatePin);

	// Redirect if already authenticated
	if (authLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (isAuthenticated) {
		router.push("/admin/dashboard");
		return null;
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			const result = await validatePin({ pin });
			if (result.valid) {
				login();
				router.push("/admin/dashboard");
			} else {
				setError("Invalid PIN. Please try again.");
			}
		} catch {
			setError("An error occurred. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-rose-50 to-white p-4 dark:from-rose-950 dark:to-background">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900">
						<Camera className="h-8 w-8 text-rose-600" />
					</div>
					<CardTitle className="text-2xl">Admin Access</CardTitle>
					<CardDescription>Enter your PIN to access the admin panel</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="pin">PIN</Label>
							<Input
								id="pin"
								type="password"
								inputMode="numeric"
								pattern="[0-9]*"
								placeholder="Enter PIN"
								value={pin}
								onChange={(e) => setPin(e.target.value)}
								className="text-center text-2xl tracking-widest"
								maxLength={8}
								autoFocus
							/>
						</div>
						{error && <p className="text-sm text-destructive">{error}</p>}
						<Button type="submit" className="w-full" disabled={isLoading || pin.length < 4}>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Verifying...
								</>
							) : (
								"Enter Admin Panel"
							)}
						</Button>
					</form>
					<p className="mt-4 text-center text-sm text-muted-foreground">
						First time? Enter any 4+ digit PIN to set it as your admin PIN.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
