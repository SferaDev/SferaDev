export interface Guest {
  id: string
  name: string
  photo: string | null
  tableId: string | null
  seatIndex: number | null
}

export interface Table {
  id: string
  name: string
  seats: number
  shape: "round" | "rectangle"
  seatArrangement?: "around" | "one-side" | "single-row"
  x: number
  y: number
}

export interface SeatingData {
  guests: Guest[]
  tables: Table[]
}
