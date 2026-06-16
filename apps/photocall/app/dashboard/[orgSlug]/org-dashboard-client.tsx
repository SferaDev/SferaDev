"use client";

import {
	BarChart3,
	Calendar,
	Camera,
	ChevronLeft,
	Copy,
	CreditCard,
	Loader2,
	MoreHorizontal,
	Play,
	Plus,
	Settings,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { createEvent, duplicateEvent, listEvents } from "@/actions/events";
import { getOrganizationBySlug, getUsage } from "@/actions/organizations";
import { DashboardLanguagePicker } from "@/components/dashboard-language-picker";
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/lib/auth-client";

export default function OrganizationDashboard() {
	const { data: session, isPending: authLoading } = useSession();
	const isAuthenticated = !!session;
	const router = useRouter();
	const params = useParams();
	const orgSlug = params.orgSlug as string;
	const { mutate } = useSWRConfig();
	const t = useTranslations("dashboard.events");
	const tc = useTranslations("dashboard.common");
	const to = useTranslations("dashboard.orgs");

	const { data: organization } = useSWR(["organizations", orgSlug], () =>
		getOrganizationBySlug(orgSlug),
	);
	const { data: events } = useSWR(organization ? ["events", organization.id] : null, () =>
		listEvents(organization!.id),
	);
	const { data: usage } = useSWR(organization ? ["usage", organization.id] : null, () =>
		getUsage(organization!.id),
	);

	const { toast } = useToast();
	const [newEventName, setNewEventName] = useState("");
	const [isCreating, setIsCreating] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push("/sign-in");
		}
	}, [isAuthenticated, authLoading, router]);

	const handleCreateEvent = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newEventName.trim() || !organization) return;

		setIsCreating(true);
		try {
			await createEvent(organization.id, newEventName.trim());
			mutate((key) => Array.isArray(key) && key[0] === "events");
			setNewEventName("");
			setDialogOpen(false);
			toast({ title: t("created"), description: newEventName.trim() });
		} catch (error) {
			toast({
				title: t("couldNotCreate"),
				description: error instanceof Error ? error.message : tc("unknownError"),
				variant: "destructive",
			});
		} finally {
			setIsCreating(false);
		}
	};

	const handleDuplicate = async (eventId: string, eventName: string) => {
		setDuplicatingId(eventId);
		try {
			await duplicateEvent(eventId);
			mutate((key) => Array.isArray(key) && key[0] === "events");
			toast({
				title: t("duplicated"),
				description: t("duplicatedDescription", { name: eventName }),
			});
		} catch (error) {
			toast({
				title: t("couldNotDuplicate"),
				description: error instanceof Error ? error.message : tc("unknownError"),
				variant: "destructive",
			});
		} finally {
			setDuplicatingId(null);
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
					<p className="text-muted-foreground mb-4">{to("notFoundDescription")}</p>
					<Button onClick={() => router.push("/dashboard")}>
						<ChevronLeft className="h-4 w-4 mr-2" />
						{tc("backToDashboard")}
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
							<Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
								<ChevronLeft className="h-5 w-5" />
							</Link>
							<div className="flex items-center gap-2">
								<Camera className="h-6 w-6" />
								<span className="font-bold text-xl">{organization.name}</span>
							</div>
						</div>
						<nav className="flex items-center gap-2">
							<Button variant="ghost" size="sm" asChild>
								<Link href={`/dashboard/${orgSlug}/team`}>
									<Users className="h-4 w-4 mr-2" />
									{tc("team")}
								</Link>
							</Button>
							<Button variant="ghost" size="sm" asChild>
								<Link href={`/dashboard/${orgSlug}/billing`}>
									<CreditCard className="h-4 w-4 mr-2" />
									{tc("billing")}
								</Link>
							</Button>
							<Button variant="ghost" size="sm" asChild>
								<Link href={`/dashboard/${orgSlug}/settings`}>
									<Settings className="h-4 w-4 mr-2" />
									{tc("settings")}
								</Link>
							</Button>
							<DashboardLanguagePicker />
						</nav>
					</div>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8">
				{/* Usage Stats */}
				{usage && (
					<div className="grid gap-4 md:grid-cols-4 mb-8">
						<div className="p-4 border rounded-lg">
							<div className="text-sm text-muted-foreground">{t("stats.events")}</div>
							<div className="text-2xl font-bold">
								{usage.events.used}
								{usage.events.limit !== -1 && (
									<span className="text-sm font-normal text-muted-foreground">
										/{usage.events.limit}
									</span>
								)}
							</div>
						</div>
						<div className="p-4 border rounded-lg">
							<div className="text-sm text-muted-foreground">{t("stats.totalPhotos")}</div>
							<div className="text-2xl font-bold">{usage.photos}</div>
						</div>
						<div className="p-4 border rounded-lg">
							<div className="text-sm text-muted-foreground">{t("stats.sessions")}</div>
							<div className="text-2xl font-bold">{usage.sessions}</div>
						</div>
						<div className="p-4 border rounded-lg">
							<div className="text-sm text-muted-foreground">{t("stats.storage")}</div>
							<div className="text-2xl font-bold">
								{formatBytes(usage.storage.used)}
								{usage.storage.limit !== -1 && (
									<span className="text-sm font-normal text-muted-foreground">
										/{formatBytes(usage.storage.limit)}
									</span>
								)}
							</div>
						</div>
					</div>
				)}

				{/* Events */}
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-bold">{t("title")}</h2>
					<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
						<DialogTrigger asChild>
							<Button>
								<Plus className="h-4 w-4 mr-2" />
								{t("newEvent")}
							</Button>
						</DialogTrigger>
						<DialogContent>
							<form onSubmit={handleCreateEvent}>
								<DialogHeader>
									<DialogTitle>{t("createEvent")}</DialogTitle>
									<DialogDescription>{t("createDialogDescription")}</DialogDescription>
								</DialogHeader>
								<div className="py-4">
									<Label htmlFor="event-name">{t("eventName")}</Label>
									<Input
										id="event-name"
										value={newEventName}
										onChange={(e) => setNewEventName(e.target.value)}
										placeholder={t("eventNamePlaceholder")}
										className="mt-2"
									/>
								</div>
								<DialogFooter>
									<Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
										{tc("cancel")}
									</Button>
									<Button type="submit" disabled={isCreating || !newEventName.trim()}>
										{isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
										{tc("create")}
									</Button>
								</DialogFooter>
							</form>
						</DialogContent>
					</Dialog>
				</div>

				{events === undefined ? (
					<div className="flex justify-center py-12">
						<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					</div>
				) : events.length === 0 ? (
					<div className="text-center py-16 border rounded-lg bg-muted/50">
						<Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
						<h2 className="text-xl font-semibold mb-2">{t("emptyTitle")}</h2>
						<p className="text-muted-foreground mb-4">{t("emptyDescription")}</p>
						<Button onClick={() => setDialogOpen(true)}>
							<Plus className="h-4 w-4 mr-2" />
							{t("createEvent")}
						</Button>
					</div>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{events.map((event) => (
							<div
								key={event.id}
								className="p-6 border rounded-lg hover:border-primary transition-colors"
							>
								<div className="flex items-start justify-between mb-4">
									<div>
										<h3 className="font-semibold">{event.name}</h3>
										<StatusBadge status={event.status} />
									</div>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
												aria-label={t("actionsFor", { name: event.name })}
												disabled={duplicatingId === event.id}
											>
												{duplicatingId === event.id ? (
													<Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
												) : (
													<MoreHorizontal className="h-4 w-4" aria-hidden="true" />
												)}
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem asChild>
												<Link href={`/dashboard/${orgSlug}/${event.slug}`}>
													<BarChart3 className="mr-2 h-4 w-4" aria-hidden="true" />
													{t("openDashboard")}
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link href={`/dashboard/${orgSlug}/${event.slug}/settings`}>
													<Settings className="mr-2 h-4 w-4" aria-hidden="true" />
													{tc("settings")}
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => handleDuplicate(event.id, event.name)}>
												<Copy className="mr-2 h-4 w-4" aria-hidden="true" />
												{t("duplicate")}
											</DropdownMenuItem>
											{event.status === "active" ? (
												<DropdownMenuItem asChild>
													<Link href={`/kiosk/${orgSlug}/${event.slug}`} target="_blank">
														<Play className="mr-2 h-4 w-4" aria-hidden="true" />
														{t("openKiosk")}
													</Link>
												</DropdownMenuItem>
											) : null}
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
								<div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
									<div>
										<div className="font-medium text-foreground">{event.photoCount}</div>
										<div>{t("photos")}</div>
									</div>
									<div>
										<div className="font-medium text-foreground">{event.sessionCount}</div>
										<div>{t("sessions")}</div>
									</div>
								</div>
								<div className="flex gap-2">
									<Button size="sm" variant="outline" className="flex-1" asChild>
										<Link href={`/dashboard/${orgSlug}/${event.slug}`}>
											<BarChart3 className="h-4 w-4 mr-2" />
											{t("dashboard")}
										</Link>
									</Button>
									{event.status === "active" && (
										<Button size="sm" className="flex-1" asChild>
											<Link href={`/kiosk/${orgSlug}/${event.slug}`} target="_blank">
												<Play className="h-4 w-4 mr-2" />
												{t("kiosk")}
											</Link>
										</Button>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</main>
		</div>
	);
}

function StatusBadge({ status }: { status: string }) {
	const ts = useTranslations("dashboard.eventStatus");
	const variants = {
		draft: "secondary",
		active: "success",
		paused: "warning",
		archived: "outline",
	} as const;
	const isKnown = status in variants;

	return (
		<Badge
			variant={variants[status as keyof typeof variants] ?? "secondary"}
			className="capitalize"
		>
			{isKnown ? ts(status as keyof typeof variants) : status}
		</Badge>
	);
}

function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}
