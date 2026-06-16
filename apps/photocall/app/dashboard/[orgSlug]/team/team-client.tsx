"use client";

import { ChevronLeft, Crown, Loader2, Mail, Plus, Shield, Trash2, User, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import {
	cancelInvitation,
	getInvitations,
	getMembers,
	getOrganizationBySlug,
	inviteMember,
	removeMember,
	updateMemberRole,
} from "@/actions/organizations";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/lib/auth-client";

export default function TeamPage() {
	const { data: session, isPending: authLoading } = useSession();
	const isAuthenticated = !!session;
	const router = useRouter();
	const params = useParams();
	const orgSlug = params.orgSlug as string;
	const { mutate } = useSWRConfig();

	const { data: organization } = useSWR(["organizations", orgSlug], () =>
		getOrganizationBySlug(orgSlug),
	);
	const { data: members } = useSWR(organization ? ["members", organization.id] : null, () =>
		getMembers(organization!.id),
	);
	const { data: invitations } = useSWR(organization ? ["invitations", organization.id] : null, () =>
		getInvitations(organization!.id),
	);

	const { toast } = useToast();
	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteEmailError, setInviteEmailError] = useState<string | null>(null);
	const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
	const [isInviting, setIsInviting] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [updatingRoleFor, setUpdatingRoleFor] = useState<string | null>(null);

	const currentMembership = members?.find((m) => m.userId === session?.user?.id);
	const canManageRoles = currentMembership?.role === "owner";

	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push("/sign-in");
		}
	}, [isAuthenticated, authLoading, router]);

	const handleInvite = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = inviteEmail.trim();
		if (!trimmed || !organization) return;

		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailPattern.test(trimmed)) {
			setInviteEmailError("Please enter a valid email address");
			return;
		}
		setInviteEmailError(null);

		setIsInviting(true);
		try {
			await inviteMember(organization.id, trimmed, inviteRole);
			mutate((key) => Array.isArray(key) && key[0] === "invitations");
			setInviteEmail("");
			setDialogOpen(false);
			toast({ title: "Invitation sent", description: trimmed });
		} catch (error) {
			toast({
				title: "Could not send invitation",
				description: error instanceof Error ? error.message : "Unknown error",
				variant: "destructive",
			});
		} finally {
			setIsInviting(false);
		}
	};

	const handleRemoveMember = async (memberId: string) => {
		if (!organization) return;
		if (!confirm("Are you sure you want to remove this member?")) return;

		try {
			await removeMember(organization.id, memberId);
			mutate((key) => Array.isArray(key) && key[0] === "members");
			toast({ title: "Member removed" });
		} catch (error) {
			toast({
				title: "Could not remove member",
				description: error instanceof Error ? error.message : "Unknown error",
				variant: "destructive",
			});
		}
	};

	const handleCancelInvitation = async (invitationId: string) => {
		try {
			await cancelInvitation(invitationId);
			mutate((key) => Array.isArray(key) && key[0] === "invitations");
			toast({ title: "Invitation cancelled" });
		} catch (error) {
			toast({
				title: "Could not cancel invitation",
				description: error instanceof Error ? error.message : "Unknown error",
				variant: "destructive",
			});
		}
	};

	const handleChangeRole = async (memberId: string, role: "admin" | "member") => {
		if (!organization) return;
		setUpdatingRoleFor(memberId);
		try {
			await updateMemberRole(organization.id, memberId, role);
			mutate((key) => Array.isArray(key) && key[0] === "members");
			toast({ title: "Role updated", description: `Member is now ${role}.` });
		} catch (error) {
			toast({
				title: "Could not update role",
				description: error instanceof Error ? error.message : "Unknown error",
				variant: "destructive",
			});
		} finally {
			setUpdatingRoleFor(null);
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
												onChange={(e) => {
													setInviteEmail(e.target.value);
													if (inviteEmailError) setInviteEmailError(null);
												}}
												placeholder="colleague@example.com"
												className="mt-2"
												aria-invalid={inviteEmailError ? "true" : undefined}
												aria-describedby={inviteEmailError ? "invite-email-error" : undefined}
												required
											/>
											{inviteEmailError ? (
												<p id="invite-email-error" className="mt-2 text-sm text-destructive">
													{inviteEmailError}
												</p>
											) : null}
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
						{members?.map((member) => {
							const fallback =
								member.user?.name?.charAt(0)?.toUpperCase() ??
								member.user?.email?.charAt(0)?.toUpperCase() ??
								"?";
							return (
								<div key={member.id} className="p-4 flex items-center justify-between">
									<div className="flex items-center gap-3">
										<Avatar>
											<AvatarImage src={member.user?.image ?? undefined} />
											<AvatarFallback>{fallback}</AvatarFallback>
										</Avatar>
										<div>
											<div className="font-medium flex items-center gap-2">
												{member.user?.name ?? member.user?.email ?? member.userId}
												<RoleBadge role={member.role} />
											</div>
											<div className="text-sm text-muted-foreground">{member.user?.email}</div>
										</div>
									</div>
									<div className="flex items-center gap-2">
										{canManageRoles && member.role !== "owner" ? (
											<Select
												value={member.role === "admin" ? "admin" : "member"}
												disabled={updatingRoleFor === member.id}
												onValueChange={(value: "admin" | "member") =>
													handleChangeRole(member.id, value)
												}
											>
												<SelectTrigger
													className="w-32"
													aria-label={`Role for ${member.user?.email ?? "member"}`}
												>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="admin">Admin</SelectItem>
													<SelectItem value="member">Member</SelectItem>
												</SelectContent>
											</Select>
										) : null}
										{member.role !== "owner" && (
											<Button
												variant="ghost"
												size="icon"
												aria-label={`Remove ${member.user?.email ?? "member"}`}
												onClick={() => handleRemoveMember(member.id)}
											>
												<Trash2 className="h-4 w-4 text-destructive" />
											</Button>
										)}
									</div>
								</div>
							);
						})}
					</div>
				</div>

				{/* Pending Invitations */}
				{invitations && invitations.length > 0 && (
					<div>
						<h2 className="text-lg font-semibold mb-4">
							Pending Invitations ({invitations.length})
						</h2>
						<div className="border rounded-lg divide-y">
							{invitations.map((invitation) => (
								<div key={invitation.id} className="p-4 flex items-center justify-between">
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
										onClick={() => handleCancelInvitation(invitation.id)}
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
		owner: { icon: Crown, label: "Owner", variant: "warning" as const },
		admin: { icon: Shield, label: "Admin", variant: "info" as const },
		member: { icon: User, label: "Member", variant: "secondary" as const },
	};

	const { icon: Icon, label, variant } = config[role as keyof typeof config] ?? config.member;

	return (
		<Badge variant={variant}>
			<Icon />
			{label}
		</Badge>
	);
}
