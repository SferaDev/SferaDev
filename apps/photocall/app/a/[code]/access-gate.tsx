"use client";

import { Lock, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { unlockAlbumWithIdentity, unlockAlbumWithPin } from "@/actions/album";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AlbumAccessMode } from "@/lib/db/schema";

export function AccessGate({
	token,
	mode,
	eventName,
	coupleNames,
}: {
	token: string;
	mode: AlbumAccessMode;
	eventName: string;
	coupleNames: string | null;
}) {
	const router = useRouter();
	const [value, setValue] = useState("");
	const [error, setError] = useState(false);
	const [pending, setPending] = useState(false);

	const title = coupleNames || eventName;
	const isPin = mode === "link_pin";

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setPending(true);
		setError(false);
		try {
			const result = isPin
				? await unlockAlbumWithPin(token, value.trim())
				: await unlockAlbumWithIdentity(token, value);
			if (result.ok) {
				router.refresh();
			} else {
				setError(true);
				setPending(false);
			}
		} catch {
			setError(true);
			setPending(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-linear-to-b from-rose-50 to-white p-4 dark:from-rose-950 dark:to-background">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900">
						{isPin ? (
							<Lock className="h-6 w-6 text-rose-500" />
						) : (
							<UserRound className="h-6 w-6 text-rose-500" />
						)}
					</div>
					<CardTitle>{title}</CardTitle>
					<CardDescription>
						{isPin
							? "Enter the album PIN shared by the host to view the photos."
							: "Tell us your name to enter the album."}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="flex flex-col gap-4">
						<div className="flex flex-col gap-2">
							<Label htmlFor="gate-value">{isPin ? "Album PIN" : "Your name"}</Label>
							<Input
								id="gate-value"
								type={isPin ? "text" : "text"}
								inputMode={isPin ? "numeric" : "text"}
								value={value}
								onChange={(e) => setValue(e.target.value)}
								autoFocus
								required
								placeholder={isPin ? "••••" : "e.g. Alex"}
							/>
							{error && (
								<p className="text-sm text-destructive">
									{isPin ? "Incorrect PIN. Please try again." : "Please enter a valid name."}
								</p>
							)}
						</div>
						<Button type="submit" disabled={pending || value.trim().length === 0}>
							{pending ? "Checking…" : "Enter album"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
