export const GUEST_GROUPS = ["Family", "Friends", "Coworkers", "Other"] as const;
export type GuestGroup = (typeof GUEST_GROUPS)[number];

export const GROUP_COLORS: Record<GuestGroup, string> = {
	Family: "blue",
	Friends: "green",
	Coworkers: "orange",
	Other: "gray",
};

export interface Guest {
	id: string;
	name: string;
	photo: string | null;
	tableId: string | null;
	seatIndex: number | null;
	group?: GuestGroup;
}

export interface Table {
	id: string;
	name: string;
	seats: number;
	shape: "round" | "rectangle";
	seatArrangement: "around" | "one-side" | "single-row";
	x: number;
	y: number;
}

export interface SeatingData {
	guests: Guest[];
	tables: Table[];
}
