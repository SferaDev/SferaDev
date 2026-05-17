"use client";

import { Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			role="img"
			viewBox="0 0 24 24"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			aria-label="GitHub"
			{...props}
		>
			<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
		</svg>
	);
}

export function SignInForm() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [mode, setMode] = useState<"signin" | "signup">("signin");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		try {
			if (mode === "signup") {
				const result = await authClient.signUp.email({
					email,
					password,
					name: name || email.split("@")[0],
				});
				if (result.error) {
					setError(result.error.message || "Failed to sign up");
				} else {
					router.push("/dashboard");
				}
			} else {
				const result = await authClient.signIn.email({
					email,
					password,
				});
				if (result.error) {
					setError(result.error.message || "Failed to sign in");
				} else {
					router.push("/dashboard");
				}
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	const handleOAuth = async (provider: "github" | "google") => {
		setIsLoading(true);
		setError("");

		try {
			await authClient.signIn.social({
				provider,
				callbackURL: "/dashboard",
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="space-y-2 text-center">
				<h1 className="text-2xl font-bold">
					{mode === "signin" ? "Welcome back" : "Create an account"}
				</h1>
				<p className="text-muted-foreground">
					{mode === "signin"
						? "Sign in to your account to continue"
						: "Sign up to get started with Photocall"}
				</p>
			</div>

			<div className="grid gap-4">
				<Button
					variant="outline"
					onClick={() => handleOAuth("github")}
					disabled={isLoading}
					className="w-full"
					type="button"
				>
					<GithubIcon className="mr-2 h-4 w-4" />
					Continue with GitHub
				</Button>
				<Button
					variant="outline"
					onClick={() => handleOAuth("google")}
					disabled={isLoading}
					className="w-full"
					type="button"
				>
					<Mail className="mr-2 h-4 w-4" />
					Continue with Google
				</Button>
			</div>

			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<Separator />
				</div>
				<div className="relative flex justify-center text-xs uppercase">
					<span className="bg-background px-2 text-muted-foreground">Or continue with</span>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				{mode === "signup" && (
					<div className="space-y-2">
						<Label htmlFor="name">Name</Label>
						<Input
							id="name"
							type="text"
							placeholder="Your name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							disabled={isLoading}
						/>
					</div>
				)}
				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						placeholder="you@example.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						disabled={isLoading}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="password">Password</Label>
					<Input
						id="password"
						type="password"
						placeholder="Enter your password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						disabled={isLoading}
						minLength={8}
					/>
				</div>

				{error && <div className="text-sm text-destructive">{error}</div>}

				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					{mode === "signin" ? "Sign In" : "Sign Up"}
				</Button>
			</form>

			<div className="text-center text-sm">
				{mode === "signin" ? (
					<p>
						Don&apos;t have an account?{" "}
						<button
							type="button"
							onClick={() => setMode("signup")}
							className="underline hover:text-primary"
						>
							Sign up
						</button>
					</p>
				) : (
					<p>
						Already have an account?{" "}
						<button
							type="button"
							onClick={() => setMode("signin")}
							className="underline hover:text-primary"
						>
							Sign in
						</button>
					</p>
				)}
			</div>
		</div>
	);
}
