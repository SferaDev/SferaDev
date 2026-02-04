import type { SeatingData } from "./types"

const STORAGE_KEY = "wedding-seating-data"

export function loadData(): SeatingData {
  if (typeof window === "undefined") {
    return { guests: [], tables: [] }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error("Failed to load data from localStorage", e)
  }

  return { guests: [], tables: [] }
}

export function saveData(data: SeatingData): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error("Failed to save data to localStorage", e)
  }
}
