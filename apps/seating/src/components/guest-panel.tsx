"use client";

import {
	Circle,
	ImagePlus,
	Plus,
	RectangleHorizontal,
	Trash2,
	UserPlus,
	Users,
	X,
} from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { ImageCropper } from "@/components/image-cropper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { Guest, Table } from "@/lib/types";

interface GuestPanelProps {
	guests: Guest[];
	tables: Table[];
	allGuests: Guest[];
	onAddGuest: (name: string, photo: string | null) => void;
	onRemoveGuest: (guestId: string) => void;
	onAddTable: (
		name: string,
		seats: number,
		shape: "round" | "rectangle",
		seatArrangement?: "around" | "one-side" | "single-row",
	) => void;
	onAssignGuest: (guestId: string, tableId: string) => void;
	onClose?: () => void;
}

export function GuestPanel({
	guests,
	tables,
	allGuests,
	onAddGuest,
	onRemoveGuest,
	onAddTable,
	onAssignGuest,
	onClose,
}: GuestPanelProps) {
	const [guestName, setGuestName] = useState("");
	const [guestPhoto, setGuestPhoto] = useState<string | null>(null);
	const [tableName, setTableName] = useState("");
	const [tableSeats, setTableSeats] = useState("8");
	const [tableShape, setTableShape] = useState<"round" | "rectangle">("round");
	const [seatArrangement, setSeatArrangement] = useState<"around" | "one-side" | "single-row">(
		"around",
	);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [cropperImage, setCropperImage] = useState<string | null>(null);
	const [showCropper, setShowCropper] = useState(false);

	const handleAddGuest = () => {
		if (guestName.trim()) {
			onAddGuest(guestName.trim(), guestPhoto);
			setGuestName("");
			setGuestPhoto(null);
		}
	};

	const handleAddTable = () => {
		if (tableName.trim()) {
			onAddTable(
				tableName.trim(),
				Number.parseInt(tableSeats, 10),
				tableShape,
				tableShape === "rectangle" ? seatArrangement : undefined,
			);
			setTableName("");
			setTableSeats("8");
			setTableShape("round");
			setSeatArrangement("around");
		}
	};

	const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setCropperImage(reader.result as string);
				setShowCropper(true);
			};
			reader.readAsDataURL(file);
		}
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleCroppedImage = (croppedImage: string) => {
		setGuestPhoto(croppedImage);
		setShowCropper(false);
		setCropperImage(null);
	};

	const handleCloseCropper = () => {
		setShowCropper(false);
		setCropperImage(null);
	};

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	const getTablesWithSpace = () => {
		return tables.filter((table) => {
			const seatedCount = allGuests.filter((g) => g.tableId === table.id).length;
			return seatedCount < table.seats;
		});
	};

	const tablesWithSpace = getTablesWithSpace();

	return (
		<div className="w-80 max-w-[85vw] h-full border-r border-border bg-card flex flex-col shadow-xl lg:shadow-none">
			{cropperImage && (
				<ImageCropper
					image={cropperImage}
					open={showCropper}
					onClose={handleCloseCropper}
					onCrop={handleCroppedImage}
				/>
			)}

			<div className="flex items-center justify-between p-3 border-b border-border lg:hidden">
				<span className="font-semibold text-foreground">Guest Manager</span>
				<Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9">
					<X className="w-5 h-5" />
				</Button>
			</div>

			<div
				className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
				style={{ WebkitOverflowScrolling: "touch" }}
			>
				<div className="p-4 space-y-6 pb-8">
					{/* Add Guest Section */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-lg flex items-center gap-2">
								<UserPlus className="w-5 h-5 text-primary" />
								Add Guest
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="space-y-2">
								<Label htmlFor="guest-name">Name</Label>
								<Input
									id="guest-name"
									placeholder="Enter guest name"
									value={guestName}
									onChange={(e) => setGuestName(e.target.value)}
									onKeyDown={(e) => e.key === "Enter" && handleAddGuest()}
								/>
							</div>

							<div className="space-y-2">
								<Label>Photo (optional)</Label>
								<div className="flex items-center gap-3">
									{guestPhoto ? (
										<Avatar className="w-12 h-12 border-2 border-primary/20">
											<AvatarImage src={guestPhoto ?? undefined} />
										</Avatar>
									) : (
										<div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
											<ImagePlus className="w-5 h-5 text-muted-foreground" />
										</div>
									)}
									<div className="flex flex-col gap-1">
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => fileInputRef.current?.click()}
										>
											{guestPhoto ? "Change Photo" : "Upload Photo"}
										</Button>
										{guestPhoto && (
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="text-xs text-muted-foreground h-7"
												onClick={() => setGuestPhoto(null)}
											>
												Remove
											</Button>
										)}
									</div>
									<input
										ref={fileInputRef}
										type="file"
										accept="image/*"
										className="hidden"
										onChange={handlePhotoChange}
									/>
								</div>
							</div>

							<Button onClick={handleAddGuest} className="w-full gap-2">
								<Plus className="w-4 h-4" />
								Add Guest
							</Button>
						</CardContent>
					</Card>

					{/* Add Table Section */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-lg flex items-center gap-2">
								<Users className="w-5 h-5 text-primary" />
								Add Table
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="space-y-2">
								<Label htmlFor="table-name">Table Name</Label>
								<Input
									id="table-name"
									placeholder="e.g., Table 1, Family, VIP"
									value={tableName}
									onChange={(e) => setTableName(e.target.value)}
									onKeyDown={(e) => e.key === "Enter" && handleAddTable()}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="table-seats">Number of Seats</Label>
								<Select value={tableSeats} onValueChange={setTableSeats}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{[5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
											<SelectItem key={n} value={n.toString()}>
												{n} seats
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label>Table Shape</Label>
								<div className="flex gap-2">
									<Button
										type="button"
										variant={tableShape === "round" ? "default" : "outline"}
										className="flex-1 gap-2"
										onClick={() => setTableShape("round")}
									>
										<Circle className="w-4 h-4" />
										Round
									</Button>
									<Button
										type="button"
										variant={tableShape === "rectangle" ? "default" : "outline"}
										className="flex-1 gap-2"
										onClick={() => setTableShape("rectangle")}
									>
										<RectangleHorizontal className="w-4 h-4" />
										Rectangle
									</Button>
								</div>
							</div>

							{tableShape === "rectangle" && (
								<div className="space-y-2">
									<Label>Seat Arrangement</Label>
									<Select
										value={seatArrangement}
										onValueChange={(v) =>
											setSeatArrangement(v as "around" | "one-side" | "single-row")
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="around">Seats around table</SelectItem>
											<SelectItem value="one-side">Seats on opposite sides</SelectItem>
											<SelectItem value="single-row">Single row (all one side)</SelectItem>
										</SelectContent>
									</Select>
								</div>
							)}

							<Button onClick={handleAddTable} className="w-full gap-2">
								<Plus className="w-4 h-4" />
								Add Table
							</Button>
						</CardContent>
					</Card>

					{/* Unseated Guests */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-lg">Unseated Guests ({guests.length})</CardTitle>
						</CardHeader>
						<CardContent>
							{guests.length === 0 ? (
								<p className="text-sm text-muted-foreground text-center py-4">
									No unseated guests. Add guests above!
								</p>
							) : (
								<div className="space-y-2">
									{guests.map((guest) => (
										<div
											key={guest.id}
											className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
										>
											<Avatar className="w-10 h-10 border-2 border-primary/20 bg-white">
												<AvatarImage src={guest.photo || undefined} />
												<AvatarFallback className="bg-primary/10 text-primary text-xs">
													{getInitials(guest.name)}
												</AvatarFallback>
											</Avatar>

											<div className="flex-1 min-w-0">
												<p className="text-sm font-medium truncate">{guest.name}</p>
												{tablesWithSpace.length > 0 ? (
													<Select onValueChange={(tableId) => onAssignGuest(guest.id, tableId)}>
														<SelectTrigger className="h-7 text-xs mt-1">
															<SelectValue placeholder="Assign to table..." />
														</SelectTrigger>
														<SelectContent>
															{tablesWithSpace.map((table) => {
																const seatedCount = allGuests.filter(
																	(g) => g.tableId === table.id,
																).length;
																return (
																	<SelectItem key={table.id} value={table.id}>
																		{table.name} ({seatedCount}/{table.seats})
																	</SelectItem>
																);
															})}
														</SelectContent>
													</Select>
												) : (
													<p className="text-xs text-muted-foreground mt-1">No tables with space</p>
												)}
											</div>

											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-muted-foreground hover:text-destructive"
												onClick={() => onRemoveGuest(guest.id)}
											>
												<Trash2 className="w-4 h-4" />
											</Button>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
