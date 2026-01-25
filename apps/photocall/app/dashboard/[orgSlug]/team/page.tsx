"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { ChevronLeft, Crown, Loader2, Mail, Plus, Shield, Trash2, User, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export default function TeamPage() {
	const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
	const router = useRouter();
	const params = useParams();
	const orgSlug = params.orgSlug as string;

	const organization = useQuery(api.organizations.getBySlug, { slug: orgSlug });
	const members = useQuery(
		api.organizations.getMembers,
		organization ? { organizationId: organization._id as Id<"organizations"> } : "skip",
	);
	const invitations = useQuery(
		api.organizations.getInvitations,
		organization ? { organizationId: organization._id as Id<"organizations"> } : "skip",
	);

	const invite = useMutation(api.organizations.invite);
	const _updateRole = useMutation(api.organizations.updateMemberRole);
	const removeMember = useMutation(api.organizations.removeMember);
	const cancelInvitation = useMutation(api.organizations.cancelInvitation);

	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
	const [isInviting, setIsInviting] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);

	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push("/sign-in");
		}
	}, [isAuthenticated, authLoading, router]);

	const handleInvite = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!inviteEmail.trim() || !organization) return;

		setIsInviting(true);
		try {
			await invite({
				organizationId: organization._id as Id<"organizations">,
				email: inviteEmail.trim(),
				role: inviteRole,
			});
			setInviteEmail("");
			setDialogOpen(false);
		} catch (error) {
			console.error("Failed to invite:", error);
		} finally {
			setIsInviting(false);
		}
	};

	const handleRemoveMember = async (userId: Id<"users">) => {
		if (!organization) return;
		if (!confirm("Are you sure you want to remove this member?")) return;

		try {
			await removeMember({
				organizationId: organization._id as Id<"organizations">,
				userId,
			});
		} catch (error) {
			console.error("Failed to remove member:", error);
		}
	};

	const handleCancelInvitation = async (invitationId: Id<"invitations">) => {
		try {
			await cancelInvitation({ invitationId });
		} catch (error) {
			console.error("Failed to cancel invitation:", error);
		}
	};

	if (authLoading || organization === undefined) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!organization) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-2">Organization not found</h1>
					<Button onClick={() => router.push("/dashboard")}>
						<ChevronLeft className="h-4 w-4 mr-2" />
						Back to Dashboard
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<header className="border-b">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Link
								href={`/dashboard/${orgSlug}`}
								className="text-muted-foreground hover:text-foreground"
							>
								<ChevronLeft className="h-5 w-5" />
							</Link>
							<div>
								<h1 className="font-bold text-xl">Team</h1>
								<p className="text-sm text-muted-foreground">{organization.name}</p>
							</div>
						</div>
						<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
							<DialogTrigger asChild>
								<Button>
									<Plus className="h-4 w-4 mr-2" />
									Invite Member
								</Button>
							</DialogTrigger>
							<DialogContent>
								<form onSubmit={handleInvite}>
									<DialogHeader>
										<DialogTitle>Invite Team Member</DialogTitle>
										<DialogDescription>
											Send an invitation to join your organization.
										</DialogDescription>
									</DialogHeader>
									<div className="py-4 space-y-4">
										<div>
											<Label htmlFor="email">Email Address</Label>
											<Input
												id="email"
												type="email"
												value={inviteEmail}
												onChange={(e) => setInviteEmail(e.target.value)}
												placeholder="colleague@example.com"
												className="mt-2"
												required
											/>
										</div>
										<div>
											<Label htmlFor="role">Role</Label>
											<Select
												value={inviteRole}
												onValueChange={(v: "admin" | "member") => setInviteRole(v)}
											>
												<SelectTrigger className="mt-2">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="admin">Admin</SelectItem>
													<SelectItem value="member">Member</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>
									<DialogFooter>
										<Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
											Cancel
										</Button>
										<Button type="submit" disabled={isInviting || !inviteEmail.trim()}>
											{isInviting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
											Send Invitation
										</Button>
									</DialogFooter>
								</form>
							</DialogContent>
						</Dialog>
					</div>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8 max-w-4xl">
				{/* Members */}
				<div className="mb-8">
					<h2 className="text-lg font-semibold mb-4">Members ({members?.length ?? 0})</h2>
					<div className="border rounded-lg divide-y">
						{members?.map((member: any) => (
							<div key={member._id} className="p-4 flex items-center justify-between">
								<div className="flex items-center gap-3">
									<Avatar>
										<AvatarImage src={member.profile?.avatarUrl} />
										<AvatarFallback>
											{member.profile?.name?.charAt(0) ??
												member.user?.email?.charAt(0)?.toUpperCase() ??
												"?"}
										</AvatarFallback>
									</Avatar>
									<div>
										<div className="font-medium flex items-center gap-2">
											{member.profile?.name ?? member.user?.email}
											<RoleBadge role={member.role} />
										</div>
										<div className="text-sm text-muted-foreground">{member.user?.email}</div>
									</div>
								</div>
								{member.role !== "owner" && (
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleRemoveMember(member.userId)}
									>
										<Trash2 className="h-4 w-4 text-destructive" />
									</Button>
								)}
							</div>
						))}
					</div>
				</div>

				{/* Pending Invitations */}
				{invitations && invitations.length > 0 && (
					<div>
						<h2 className="text-lg font-semibold mb-4">
							Pending Invitations ({invitations.length})
						</h2>
						<div className="border rounded-lg divide-y">
							{invitations.map((invitation: any) => (
								<div key={invitation._id} className="p-4 flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
											<Mail className="h-5 w-5 text-muted-foreground" />
										</div>
										<div>
											<div className="font-medium flex items-center gap-2">
												{invitation.email}
												<RoleBadge role={invitation.role} />
											</div>
											<div className="text-sm text-muted-foreground">
												Expires {new Date(invitation.expiresAt).toLocaleDateString()}
											</div>
										</div>
									</div>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleCancelInvitation(invitation._id as Id<"invitations">)}
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							))}
						</div>
					</div>
				)}
			</main>
		</div>
	);
}

function RoleBadge({ role }: { role: string }) {
	const config = {
		owner: { icon: Crown, label: "Owner", className: "bg-yellow-100 text-yellow-700" },
		admin: { icon: Shield, label: "Admin", className: "bg-blue-100 text-blue-700" },
		member: { icon: User, label: "Member", className: "bg-gray-100 text-gray-700" },
	};

	const { icon: Icon, label, className } = config[role as keyof typeof config] ?? config.member;

	return (
		<span
			className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${className}`}
		>
			<Icon className="h-3 w-3" />
			{label}
		</span>
	);
}
