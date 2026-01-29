"use client";

import type { FunctionReturnType } from "convex/server";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import {
	BarChart3,
	Calendar,
	Camera,
	ChevronLeft,
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
import type { Id } from "@/convex/_generated/dataModel";

type Event = NonNullable<FunctionReturnType<typeof api.events.list>>[number];

export default function OrganizationDashboard() {
	const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
	const router = useRouter();
	const params = useParams();
	const orgSlug = params.orgSlug as string;

	const organization = useQuery(api.organizations.getBySlug, { slug: orgSlug });
	const events = useQuery(
		api.events.list,
		organization ? { organizationId: organization._id as Id<"organizations"> } : "skip",
	);
	const usage = useQuery(
		api.organizations.getUsage,
		organization ? { organizationId: organization._id as Id<"organizations"> } : "skip",
	);

	const createEvent = useMutation(api.events.create);

	const [newEventName, setNewEventName] = useState("");
	const [isCreating, setIsCreating] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);

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
			const eventId = await createEvent({
				organizationId: organization._id as Id<"organizations">,
				name: newEventName.trim(),
			});
			setNewEventName("");
			setDialogOpen(false);
			// Navigate to the new event
			const newEvent = events?.find((e: Event) => e._id === eventId);
			if (newEvent) {
				router.push(`/dashboard/${orgSlug}/${newEvent.slug}`);
			}
		} catch (error) {
			console.error("Failed to create event:", error);
		} finally {
			setIsCreating(false);
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
					<p className="text-muted-foreground mb-4">
						The organization you&apos;re looking for doesn&apos;t exist or you don&apos;t have
						access.
					</p>
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
									Team
								</Link>
							</Button>
							<Button variant="ghost" size="sm" asChild>
								<Link href={`/dashboard/${orgSlug}/billing`}>
									<CreditCard className="h-4 w-4 mr-2" />
									Billing
								</Link>
							</Button>
							<Button variant="ghost" size="sm" asChild>
								<Link href={`/dashboard/${orgSlug}/settings`}>
									<Settings className="h-4 w-4 mr-2" />
									Settings
								</Link>
							</Button>
						</nav>
					</div>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8">
				{/* Usage Stats */}
				{usage && (
					<div className="grid gap-4 md:grid-cols-4 mb-8">
						<div className="p-4 border rounded-lg">
							<div className="text-sm text-muted-foreground">Events</div>
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
							<div className="text-sm text-muted-foreground">Total Photos</div>
							<div className="text-2xl font-bold">{usage.photos}</div>
						</div>
						<div className="p-4 border rounded-lg">
							<div className="text-sm text-muted-foreground">Sessions</div>
							<div className="text-2xl font-bold">{usage.sessions}</div>
						</div>
						<div className="p-4 border rounded-lg">
							<div className="text-sm text-muted-foreground">Storage</div>
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
					<h2 className="text-2xl font-bold">Events</h2>
					<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
						<DialogTrigger asChild>
							<Button>
								<Plus className="h-4 w-4 mr-2" />
								New Event
							</Button>
						</DialogTrigger>
						<DialogContent>
							<form onSubmit={handleCreateEvent}>
								<DialogHeader>
									<DialogTitle>Create Event</DialogTitle>
									<DialogDescription>
										Create a new photo booth event for your organization.
									</DialogDescription>
								</DialogHeader>
								<div className="py-4">
									<Label htmlFor="event-name">Event Name</Label>
									<Input
										id="event-name"
										value={newEventName}
										onChange={(e) => setNewEventName(e.target.value)}
										placeholder="Sarah & John's Wedding"
										className="mt-2"
									/>
								</div>
								<DialogFooter>
									<Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
										Cancel
									</Button>
									<Button type="submit" disabled={isCreating || !newEventName.trim()}>
										{isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
										Create
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
						<h2 className="text-xl font-semibold mb-2">No events yet</h2>
						<p className="text-muted-foreground mb-4">
							Create your first event to start capturing memories
						</p>
						<Button onClick={() => setDialogOpen(true)}>
							<Plus className="h-4 w-4 mr-2" />
							Create Event
						</Button>
					</div>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{events.map((event: Event) => (
							<div
								key={event._id}
								className="p-6 border rounded-lg hover:border-primary transition-colors"
							>
								<div className="flex items-start justify-between mb-4">
									<div>
										<h3 className="font-semibold">{event.name}</h3>
										<StatusBadge status={event.status} />
									</div>
									<Button variant="ghost" size="icon" asChild>
										<Link href={`/dashboard/${orgSlug}/${event.slug}/settings`}>
											<MoreHorizontal className="h-4 w-4" />
										</Link>
									</Button>
								</div>
								<div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-4">
									<div>
										<div className="font-medium text-foreground">{event.photoCount}</div>
										<div>Photos</div>
									</div>
									<div>
										<div className="font-medium text-foreground">{event.sessionCount}</div>
										<div>Sessions</div>
									</div>
								</div>
								<div className="flex gap-2">
									<Button size="sm" variant="outline" className="flex-1" asChild>
										<Link href={`/dashboard/${orgSlug}/${event.slug}`}>
											<BarChart3 className="h-4 w-4 mr-2" />
											Dashboard
										</Link>
									</Button>
									{event.status === "active" && (
										<Button size="sm" className="flex-1" asChild>
											<Link href={`/kiosk/${orgSlug}/${event.slug}`} target="_blank">
												<Play className="h-4 w-4 mr-2" />
												Kiosk
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
	const styles = {
		draft: "bg-muted text-muted-foreground",
		active: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
		paused: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
		archived: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
	};

	return (
		<span
			className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles[status as keyof typeof styles] || styles.draft}`}
		>
			{status}
		</span>
	);
}

function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}
