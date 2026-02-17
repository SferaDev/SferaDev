"use client";

import { AlertCircle, CheckCircle, FileSpreadsheet, Upload, X } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface ParsedGuest {
	name: string;
	photoUrl: string | null;
	isValid: boolean;
	error?: string;
	rowNumber: number;
}

interface ImportGuestsDialogProps {
	open: boolean;
	onClose: () => void;
	onImport: (guests: Array<{ name: string; photo: string | null }>) => void;
}

function parseCSV(text: string): ParsedGuest[] {
	const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
	if (lines.length === 0) return [];

	// Check if first line is a header
	const firstLine = lines[0].toLowerCase();
	const hasHeader = firstLine.includes("name") || firstLine.includes("photo");
	const dataLines = hasHeader ? lines.slice(1) : lines;

	return dataLines.map((line, index) => {
		const rowNumber = hasHeader ? index + 2 : index + 1;

		// Handle CSV parsing with quoted fields
		const fields: string[] = [];
		let current = "";
		let inQuotes = false;

		for (let i = 0; i < line.length; i++) {
			const char = line[i];
			if (char === '"') {
				inQuotes = !inQuotes;
			} else if (char === "," && !inQuotes) {
				fields.push(current.trim());
				current = "";
			} else {
				current += char;
			}
		}
		fields.push(current.trim());

		const name = fields[0]?.replace(/^"|"$/g, "").trim() || "";
		const photoUrl = fields[1]?.replace(/^"|"$/g, "").trim() || null;

		if (!name) {
			return {
				name: "",
				photoUrl: null,
				isValid: false,
				error: "Name is required",
				rowNumber,
			};
		}

		// Basic URL validation if photo URL is provided
		if (photoUrl && !isValidUrl(photoUrl)) {
			return {
				name,
				photoUrl: null,
				isValid: true, // Still valid, just ignore invalid URL
				error: "Invalid photo URL (will be skipped)",
				rowNumber,
			};
		}

		return {
			name,
			photoUrl: photoUrl || null,
			isValid: true,
			rowNumber,
		};
	});
}

function isValidUrl(string: string): boolean {
	try {
		const url = new URL(string);
		return url.protocol === "http:" || url.protocol === "https:";
	} catch {
		return false;
	}
}

function getInitials(name: string) {
	return name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

export function ImportGuestsDialog({ open, onClose, onImport }: ImportGuestsDialogProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [parsedGuests, setParsedGuests] = useState<ParsedGuest[]>([]);
	const [fileName, setFileName] = useState<string | null>(null);
	const [parseError, setParseError] = useState<string | null>(null);

	const validGuests = parsedGuests.filter((g) => g.isValid);
	const invalidGuests = parsedGuests.filter((g) => !g.isValid);

	const processFile = (file: File) => {
		setFileName(file.name);
		setParseError(null);

		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				const text = event.target?.result as string;
				const guests = parseCSV(text);
				if (guests.length === 0) {
					setParseError("No valid data found in the file");
					setParsedGuests([]);
				} else {
					setParsedGuests(guests);
				}
			} catch {
				setParseError("Failed to parse the file. Please check the format.");
				setParsedGuests([]);
			}
		};
		reader.onerror = () => {
			setParseError("Failed to read the file");
			setParsedGuests([]);
		};
		reader.readAsText(file);
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		processFile(file);
		// Reset file input
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		const file = e.dataTransfer.files[0];
		if (file) processFile(file);
	};

	const handleImport = () => {
		const guestsToImport = validGuests.map((g) => ({
			name: g.name,
			photo: g.photoUrl,
		}));
		onImport(guestsToImport);
		handleClose();
	};

	const handleClose = () => {
		setParsedGuests([]);
		setFileName(null);
		setParseError(null);
		onClose();
	};

	const handleReset = () => {
		setParsedGuests([]);
		setFileName(null);
		setParseError(null);
	};

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
			<DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<FileSpreadsheet className="w-5 h-5 text-primary" />
						Import Guests from CSV
					</DialogTitle>
				</DialogHeader>

				<div className="flex-1 overflow-hidden flex flex-col gap-4">
					{parsedGuests.length === 0 ? (
						<>
							<div
								className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
								onClick={() => fileInputRef.current?.click()}
								onDrop={handleDrop}
								onDragOver={(e) => e.preventDefault()}
							>
								<Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
								<p className="text-sm font-medium mb-1">
									{fileName ? fileName : "Click to select a CSV file"}
								</p>
								<p className="text-xs text-muted-foreground">or drag and drop</p>
							</div>

							<input
								ref={fileInputRef}
								type="file"
								accept=".csv,text/csv"
								className="hidden"
								onChange={handleFileSelect}
							/>

							{parseError && (
								<div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
									<AlertCircle className="w-4 h-4 shrink-0" />
									{parseError}
								</div>
							)}

							<div className="bg-muted/50 rounded-lg p-4">
								<p className="text-sm font-medium mb-2">Expected CSV format:</p>
								<pre className="text-xs text-muted-foreground bg-background rounded p-2 overflow-x-auto">
									{`Name,PhotoURL
John Smith,https://example.com/photo.jpg
Jane Doe,`}
								</pre>
								<p className="text-xs text-muted-foreground mt-2">
									The Name column is required. PhotoURL is optional.
								</p>
							</div>
						</>
					) : (
						<>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4 text-sm">
									<span className="flex items-center gap-1.5 text-green-600">
										<CheckCircle className="w-4 h-4" />
										{validGuests.length} valid
									</span>
									{invalidGuests.length > 0 && (
										<span className="flex items-center gap-1.5 text-destructive">
											<AlertCircle className="w-4 h-4" />
											{invalidGuests.length} invalid
										</span>
									)}
								</div>
								<Button variant="ghost" size="sm" onClick={handleReset} className="text-xs">
									<X className="w-3 h-3 mr-1" />
									Clear
								</Button>
							</div>

							<div className="flex-1 overflow-y-auto border rounded-lg divide-y">
								{parsedGuests.map((guest, index) => (
									<div
										key={index}
										className={`flex items-center gap-3 p-3 ${
											guest.isValid ? "" : "bg-destructive/5"
										}`}
									>
										<Avatar className="w-9 h-9 border bg-card">
											<AvatarImage src={guest.photoUrl || undefined} />
											<AvatarFallback className="bg-primary/10 text-primary text-xs">
												{guest.name ? getInitials(guest.name) : "?"}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium truncate">
												{guest.name || (
													<span className="text-muted-foreground italic">Empty name</span>
												)}
											</p>
											{guest.photoUrl && (
												<p className="text-xs text-muted-foreground truncate">{guest.photoUrl}</p>
											)}
											{guest.error && <p className="text-xs text-destructive">{guest.error}</p>}
										</div>
										<span className="text-xs text-muted-foreground">Row {guest.rowNumber}</span>
										{guest.isValid ? (
											<CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
										) : (
											<AlertCircle className="w-4 h-4 text-destructive shrink-0" />
										)}
									</div>
								))}
							</div>
						</>
					)}
				</div>

				<DialogFooter className="gap-2 sm:gap-0">
					<Button variant="outline" onClick={handleClose}>
						Cancel
					</Button>
					{parsedGuests.length > 0 && (
						<Button onClick={handleImport} disabled={validGuests.length === 0}>
							Import {validGuests.length} Guest{validGuests.length !== 1 ? "s" : ""}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
