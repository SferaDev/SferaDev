"use client";

import { useMutation, useQuery } from "convex/react";
import { ArrowRight, Building2, Camera, Loader2, Plus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { authClient, useSession } from "@/lib/auth-client";

export default function DashboardClient() {
	const { data: session, isPending: authLoading } = useSession();
	const isAuthenticated = !!session;
	const router = useRouter();
	const organizations = useQuery(api.users.getOrganizations);
	const createOrg = useMutation(api.organizations.create);
	const [newOrgName, setNewOrgName] = useState("");
	const [isCreating, setIsCreating] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);

	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push("/sign-in");
		}
	}, [isAuthenticated, authLoading, router]);

	const handleCreateOrg = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newOrgName.trim()) return;

		setIsCreating(true);
		try {
			await createOrg({ name: newOrgName.trim() });
			setNewOrgName("");
			setDialogOpen(false);
		} catch (error) {
			console.error("Failed to create organization:", error);
		} finally {
			setIsCreating(false);
		}
	};

	if (authLoading || !isAuthenticated) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<header className="border-b">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Camera className="h-6 w-6" />
						<span className="font-bold text-xl">Photocall</span>
					</div>
					<UserMenu />
				</div>
			</header>

			<main className="container mx-auto px-4 py-8">
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-3xl font-bold">Your Organizations</h1>
						<p className="text-muted-foreground mt-1">
							Manage your photo booth events across organizations
						</p>
					</div>
					<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
						<DialogTrigger asChild>
							<Button>
								<Plus className="h-4 w-4 mr-2" />
								New Organization
							</Button>
						</DialogTrigger>
						<DialogContent>
							<form onSubmit={handleCreateOrg}>
								<DialogHeader>
									<DialogTitle>Create Organization</DialogTitle>
									<DialogDescription>
										Organizations help you manage events and team members.
									</DialogDescription>
								</DialogHeader>
								<div className="py-4">
									<Label htmlFor="org-name">Organization Name</Label>
									<Input
										id="org-name"
										value={newOrgName}
										onChange={(e) => setNewOrgName(e.target.value)}
										placeholder="My Wedding Business"
										className="mt-2"
									/>
								</div>
								<DialogFooter>
									<Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
										Cancel
									</Button>
									<Button type="submit" disabled={isCreating || !newOrgName.trim()}>
										{isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
										Create
									</Button>
								</DialogFooter>
							</form>
						</DialogContent>
					</Dialog>
				</div>

				{organizations === undefined ? (
					<div className="flex justify-center py-12">
						<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					</div>
				) : organizations.length === 0 ? (
					<div className="text-center py-16 border rounded-lg bg-muted/50">
						<Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
						<h2 className="text-xl font-semibold mb-2">No organizations yet</h2>
						<p className="text-muted-foreground mb-4">
							Create your first organization to start managing events
						</p>
						<Button onClick={() => setDialogOpen(true)}>
							<Plus className="h-4 w-4 mr-2" />
							Create Organization
						</Button>
					</div>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{organizations.map((org: any) => (
							<button
								key={org._id}
								type="button"
								onClick={() => router.push(`/dashboard/${org.slug}`)}
								className="text-left p-6 border rounded-lg hover:border-primary transition-colors group"
							>
								<div className="flex items-start justify-between">
									<div className="flex items-center gap-3">
										{org.logoUrl ? (
											<img
												src={org.logoUrl}
												alt=""
												className="h-10 w-10 rounded-full object-cover"
											/>
										) : (
											<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
												<Building2 className="h-5 w-5 text-primary" />
											</div>
										)}
										<div>
											<h3 className="font-semibold">{org.name}</h3>
											<p className="text-sm text-muted-foreground capitalize">
												{org.subscriptionTier} plan
											</p>
										</div>
									</div>
									<ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
								</div>
								<div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
									<span className="flex items-center gap-1">
										<Users className="h-4 w-4" />
										{org.role}
									</span>
								</div>
							</button>
						))}
					</div>
				)}
			</main>
		</div>
	);
}

function UserMenu() {
	const { data: session } = useSession();
	const router = useRouter();

	const handleSignOut = async () => {
		await authClient.signOut();
		router.push("/");
	};

	return (
		<div className="flex items-center gap-4">
			<span className="text-sm text-muted-foreground">{session?.user?.email ?? "Loading..."}</span>
			<Button variant="outline" size="sm" onClick={handleSignOut}>
				Sign Out
			</Button>
		</div>
	);
}
