"use client";

import { Check, ChevronLeft, Copy, Crown, Loader2, Shield, Trash2, User } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import {
	deleteOrganization,
	getMembers,
	getOrganizationBySlug,
	updateOrganization,
} from "@/actions/organizations";
import { DashboardLanguagePicker } from "@/components/dashboard-language-picker";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/lib/auth-client";

export default function OrgSettingsPage() {
	const { data: session, isPending: authLoading } = useSession();
	const isAuthenticated = !!session;
	const router = useRouter();
	const params = useParams();
	const orgSlug = params.orgSlug as string;
	const { mutate } = useSWRConfig();
	const { toast } = useToast();
	const t = useTranslations("dashboard.settings");
	const tc = useTranslations("dashboard.common");
	const to = useTranslations("dashboard.orgs");

	const { data: organization } = useSWR(["organizations", orgSlug], () =>
		getOrganizationBySlug(orgSlug),
	);
	const { data: members } = useSWR(organization ? ["members", organization.id] : null, () =>
		getMembers(organization!.id),
	);

	const currentMembership = members?.find((m) => m.userId === session?.user?.id);
	const role = currentMembership?.role ?? "member";
	const canEdit = role === "owner" || role === "admin";
	const canDelete = role === "owner";

	const [name, setName] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [copied, setCopied] = useState(false);
	const [deleteConfirm, setDeleteConfirm] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		if (!authLoading && !isAuthenticated) router.push("/sign-in");
	}, [isAuthenticated, authLoading, router]);

	useEffect(() => {
		if (organization) setName(organization.name);
	}, [organization]);

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!organization) return;
		const trimmed = name.trim();
		if (!trimmed) return;

		setIsSaving(true);
		try {
			await updateOrganization(organization.id, { name: trimmed });
			mutate((key) => Array.isArray(key) && key[0] === "organizations");
			toast({ title: t("settingsSaved"), description: t("settingsSavedDescription") });
		} catch (error) {
			toast({
				title: t("couldNotSave"),
				description: error instanceof Error ? error.message : tc("unknownError"),
				variant: "destructive",
			});
		} finally {
			setIsSaving(false);
		}
	};

	const handleCopySlug = async () => {
		if (!organization) return;
		await navigator.clipboard.writeText(organization.slug);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	};

	const handleDelete = async () => {
		if (!organization) return;
		setIsDeleting(true);
		try {
			await deleteOrganization(organization.id);
			toast({ title: t("organizationDeleted") });
			router.push("/dashboard");
		} catch (error) {
			toast({
				title: t("couldNotDeleteOrganization"),
				description: error instanceof Error ? error.message : tc("unknownError"),
				variant: "destructive",
			});
			setIsDeleting(false);
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
					<h1 className="text-2xl font-bold mb-2">{to("notFoundTitle")}</h1>
					<Button onClick={() => router.push("/dashboard")}>
						<ChevronLeft className="h-4 w-4 mr-2" />
						{tc("backToDashboard")}
					</Button>
				</div>
			</div>
		);
	}

	const nameUnchanged = name.trim() === organization.name;

	return (
		<div className="min-h-screen bg-background">
			<header className="border-b">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center gap-4">
						<Link
							href={`/dashboard/${orgSlug}`}
							className="text-muted-foreground hover:text-foreground"
							aria-label={t("backToOrganization")}
						>
							<ChevronLeft className="h-5 w-5" />
						</Link>
						<div className="flex items-center gap-3">
							<Avatar className="h-9 w-9">
								<AvatarImage src={organization.logoUrl ?? undefined} />
								<AvatarFallback>{organization.name.charAt(0).toUpperCase()}</AvatarFallback>
							</Avatar>
							<div>
								<h1 className="font-bold text-xl">{t("title")}</h1>
								<p className="text-sm text-muted-foreground">{organization.name}</p>
							</div>
						</div>
						<div className="ml-auto flex items-center gap-2">
							<DashboardLanguagePicker />
							<RoleBadge role={role} />
						</div>
					</div>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
				{/* General */}
				<Card>
					<form onSubmit={handleSave}>
						<CardHeader>
							<CardTitle>{t("general")}</CardTitle>
							<CardDescription>{t("generalDescription")}</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="org-name">{t("organizationName")}</Label>
								<Input
									id="org-name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									disabled={!canEdit || isSaving}
									required
								/>
								{!canEdit && (
									<p className="text-sm text-muted-foreground">{t("onlyAdminsCanEdit")}</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="org-slug">{t("slug")}</Label>
								<div className="flex items-center gap-2">
									<Input
										id="org-slug"
										value={organization.slug}
										readOnly
										className="font-mono text-muted-foreground"
									/>
									<Button
										type="button"
										variant="outline"
										size="icon"
										onClick={handleCopySlug}
										aria-label={t("copySlug")}
									>
										{copied ? (
											<Check className="h-4 w-4 text-emerald-600" />
										) : (
											<Copy className="h-4 w-4" />
										)}
									</Button>
								</div>
								<p className="text-sm text-muted-foreground">{t("slugHelp")}</p>
							</div>
						</CardContent>
						{canEdit && (
							<CardFooter className="justify-end">
								<Button type="submit" disabled={isSaving || nameUnchanged || !name.trim()}>
									{isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
									{tc("saveChanges")}
								</Button>
							</CardFooter>
						)}
					</form>
				</Card>

				{/* Danger zone */}
				{canDelete && (
					<Card className="border-destructive/40">
						<CardHeader>
							<CardTitle className="text-destructive">{t("dangerZone")}</CardTitle>
							<CardDescription>{t("dangerZoneDescription")}</CardDescription>
						</CardHeader>
						<CardFooter className="justify-end">
							<AlertDialog
								onOpenChange={(open) => {
									if (!open) setDeleteConfirm("");
								}}
							>
								<AlertDialogTrigger asChild>
									<Button variant="destructive">
										<Trash2 className="h-4 w-4 mr-2" />
										{t("deleteOrganization")}
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>
											{t("deleteConfirmTitle", { name: organization.name })}
										</AlertDialogTitle>
										<AlertDialogDescription>
											{t.rich("deleteConfirmDescription", {
												name: organization.name,
												strong: (chunks) => (
													<span className="font-mono font-medium text-foreground">{chunks}</span>
												),
											})}
										</AlertDialogDescription>
									</AlertDialogHeader>
									<Input
										value={deleteConfirm}
										onChange={(e) => setDeleteConfirm(e.target.value)}
										placeholder={organization.name}
										aria-label={t("confirmNameLabel")}
									/>
									<AlertDialogFooter>
										<AlertDialogCancel disabled={isDeleting}>{tc("cancel")}</AlertDialogCancel>
										<AlertDialogAction
											onClick={(e) => {
												e.preventDefault();
												handleDelete();
											}}
											disabled={deleteConfirm !== organization.name || isDeleting}
											className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
										>
											{isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
											{t("deleteForever")}
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</CardFooter>
					</Card>
				)}
			</main>
		</div>
	);
}

function RoleBadge({ role }: { role: string }) {
	const tr = useTranslations("dashboard.roles");
	const config = {
		owner: { icon: Crown, key: "owner" as const, variant: "warning" as const },
		admin: { icon: Shield, key: "admin" as const, variant: "info" as const },
		member: { icon: User, key: "member" as const, variant: "secondary" as const },
	};
	const { icon: Icon, key, variant } = config[role as keyof typeof config] ?? config.member;
	return (
		<Badge variant={variant}>
			<Icon />
			{tr(key)}
		</Badge>
	);
}
