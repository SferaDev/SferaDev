"use client"

import type React from "react"
import { memo, useState, useCallback } from "react"
import { Handle, Position } from "@xyflow/react"
import type { Guest, Table } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Trash2, X, Check, Settings, Camera, UserPlus } from "lucide-react"
import { ImageCropper } from "./image-cropper"

interface TableNodeProps {
  data: {
    table: Table
    guests: Guest[]
    allGuests: Guest[]
    onRemoveTable: (tableId: string) => void
    onRemoveGuest: (guestId: string) => void
    onUpdateTableName: (tableId: string, name: string) => void
    onSwapGuests: (guestId: string, tableId: string, seatIndex: number) => void
    onUpdateTable: (tableId: string, updates: Partial<Table>) => void
    onAssignGuest: (guestId: string) => void
  }
}

function TableNodeComponent({ data }: TableNodeProps) {
  const {
    table,
    guests,
    allGuests,
    onRemoveTable,
    onRemoveGuest,
    onUpdateTableName,
    onSwapGuests,
    onUpdateTable,
    onAssignGuest,
  } = data
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(table.name)
  const [dragOverSeat, setDragOverSeat] = useState<number | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [draggingGuestId, setDraggingGuestId] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [cropperOpen, setCropperOpen] = useState(false)
  const [cropperImage, setCropperImage] = useState<string | null>(null)
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const seatSize = 52
  const seatSpacing = 18
  const labelOffset = 48

  const calculateLayout = useCallback(() => {
    const seats: Array<{
      index: number
      x: number
      y: number
      labelX: number
      labelY: number
      labelAnchor: "start" | "middle" | "end"
      guest: Guest | undefined
    }> = []

    if (table.shape === "round") {
      const minTableRadius = 70
      const circumferenceNeeded = table.seats * (seatSize + seatSpacing * 0.5)
      const tableRadius = Math.max(minTableRadius, circumferenceNeeded / (2 * Math.PI))
      const seatRadius = tableRadius + seatSize / 2 + 16
      const totalSize = seatRadius * 2 + labelOffset * 2 + seatSize + 50
      const center = totalSize / 2

      for (let i = 0; i < table.seats; i++) {
        const angle = (i * 2 * Math.PI) / table.seats - Math.PI / 2
        const x = center + seatRadius * Math.cos(angle)
        const y = center + seatRadius * Math.sin(angle)
        const guest = guests.find((g) => g.seatIndex === i)

        const labelRadius = seatRadius + seatSize / 2 + 18
        const labelX = center + labelRadius * Math.cos(angle)
        const labelY = center + labelRadius * Math.sin(angle)

        seats.push({ index: i, x, y, labelX, labelY, labelAnchor: "middle", guest })
      }

      return { seats, totalSize, tableRadius, center: { x: center, y: center }, isRound: true }
    } else {
      const arrangement = table.seatArrangement || "around"

      if (arrangement === "single-row") {
        const tableWidth = table.seats * (seatSize + seatSpacing) + 80
        const tableHeight = 56
        const totalWidth = tableWidth + 50
        const totalHeight = seatSize + labelOffset + tableHeight + 70
        const centerX = totalWidth / 2
        const tableTopY = seatSize + labelOffset + 25

        for (let i = 0; i < table.seats; i++) {
          const x = centerX - ((table.seats - 1) * (seatSize + seatSpacing)) / 2 + i * (seatSize + seatSpacing)
          const y = tableTopY - seatSize / 2 - 16
          const guest = guests.find((g) => g.seatIndex === i)

          seats.push({
            index: i,
            x,
            y,
            labelX: x,
            labelY: y - labelOffset,
            labelAnchor: "middle",
            guest,
          })
        }

        return {
          seats,
          totalSize: Math.max(totalWidth, totalHeight),
          totalWidth,
          totalHeight,
          tableSize: { width: tableWidth, height: tableHeight },
          center: { x: centerX, y: tableTopY + tableHeight / 2 },
          isRound: false,
        }
      } else if (arrangement === "one-side") {
        const seatsPerSide = Math.ceil(table.seats / 2)
        const tableWidth = seatsPerSide * (seatSize + seatSpacing) + 80
        const tableHeight = 70
        const totalWidth = tableWidth + 50
        const totalHeight = tableHeight + seatSize * 2 + labelOffset * 2 + 70
        const centerX = totalWidth / 2
        const centerY = totalHeight / 2

        let seatIndex = 0

        const topSeats = Math.ceil(table.seats / 2)
        for (let i = 0; i < topSeats && seatIndex < table.seats; i++) {
          const x = centerX - ((topSeats - 1) * (seatSize + seatSpacing)) / 2 + i * (seatSize + seatSpacing)
          const y = centerY - tableHeight / 2 - seatSize / 2 - 16
          const guest = guests.find((g) => g.seatIndex === seatIndex)
          seats.push({
            index: seatIndex,
            x,
            y,
            labelX: x,
            labelY: y - labelOffset,
            labelAnchor: "middle",
            guest,
          })
          seatIndex++
        }

        const bottomSeats = table.seats - topSeats
        for (let i = 0; i < bottomSeats && seatIndex < table.seats; i++) {
          const x = centerX - ((bottomSeats - 1) * (seatSize + seatSpacing)) / 2 + i * (seatSize + seatSpacing)
          const y = centerY + tableHeight / 2 + seatSize / 2 + 16
          const guest = guests.find((g) => g.seatIndex === seatIndex)
          seats.push({
            index: seatIndex,
            x,
            y,
            labelX: x,
            labelY: y + labelOffset,
            labelAnchor: "middle",
            guest,
          })
          seatIndex++
        }

        return {
          seats,
          totalSize: Math.max(totalWidth, totalHeight),
          totalWidth,
          totalHeight,
          tableSize: { width: tableWidth, height: tableHeight },
          center: { x: centerX, y: centerY },
          isRound: false,
        }
      } else {
        const seatsPerSide = Math.ceil(table.seats / 4)
        const minWidth = Math.max(180, seatsPerSide * (seatSize + seatSpacing) + 60)
        const tableWidth = minWidth
        const tableHeight = 90

        const totalWidth = tableWidth + seatSize * 2 + labelOffset * 2 + 50
        const totalHeight = tableHeight + seatSize * 2 + labelOffset * 2 + 50
        const centerX = totalWidth / 2
        const centerY = totalHeight / 2

        let seatIndex = 0

        const topSeats = Math.ceil(table.seats / 4)
        const bottomSeats = Math.ceil(table.seats / 4)
        const leftSeats = Math.floor((table.seats - topSeats - bottomSeats) / 2)
        const rightSeats = table.seats - topSeats - bottomSeats - leftSeats

        for (let i = 0; i < topSeats && seatIndex < table.seats; i++) {
          const x = centerX - ((topSeats - 1) * (seatSize + seatSpacing)) / 2 + i * (seatSize + seatSpacing)
          const y = centerY - tableHeight / 2 - seatSize / 2 - 16
          const guest = guests.find((g) => g.seatIndex === seatIndex)
          seats.push({ index: seatIndex, x, y, labelX: x, labelY: y - labelOffset, labelAnchor: "middle", guest })
          seatIndex++
        }

        for (let i = 0; i < rightSeats && seatIndex < table.seats; i++) {
          const x = centerX + tableWidth / 2 + seatSize / 2 + 16
          const y = centerY - ((rightSeats - 1) * (seatSize + seatSpacing)) / 2 + i * (seatSize + seatSpacing)
          const guest = guests.find((g) => g.seatIndex === seatIndex)
          seats.push({ index: seatIndex, x, y, labelX: x + labelOffset, labelY: y, labelAnchor: "middle", guest })
          seatIndex++
        }

        for (let i = 0; i < bottomSeats && seatIndex < table.seats; i++) {
          const x = centerX + ((bottomSeats - 1) * (seatSize + seatSpacing)) / 2 - i * (seatSize + seatSpacing)
          const y = centerY + tableHeight / 2 + seatSize / 2 + 16
          const guest = guests.find((g) => g.seatIndex === seatIndex)
          seats.push({ index: seatIndex, x, y, labelX: x, labelY: y + labelOffset, labelAnchor: "middle", guest })
          seatIndex++
        }

        for (let i = 0; i < leftSeats && seatIndex < table.seats; i++) {
          const x = centerX - tableWidth / 2 - seatSize / 2 - 16
          const y = centerY + ((leftSeats - 1) * (seatSize + seatSpacing)) / 2 - i * (seatSize + seatSpacing)
          const guest = guests.find((g) => g.seatIndex === seatIndex)
          seats.push({ index: seatIndex, x, y, labelX: x - labelOffset, labelY: y, labelAnchor: "middle", guest })
          seatIndex++
        }

        return {
          seats,
          totalSize: Math.max(totalWidth, totalHeight),
          totalWidth,
          totalHeight,
          tableSize: { width: tableWidth, height: tableHeight },
          center: { x: centerX, y: centerY },
          isRound: false,
        }
      }
    }
  }, [table.shape, table.seats, table.seatArrangement, guests])

  const layout = calculateLayout()

  const handleSave = () => {
    if (editName.trim()) {
      onUpdateTableName(table.id, editName.trim())
    } else {
      setEditName(table.name)
    }
    setIsEditing(false)
  }

  const handleDragStart = (e: React.DragEvent, guestId: string) => {
    e.stopPropagation()
    setDraggingGuestId(guestId)
    const dragData = JSON.stringify({ guestId, sourceTableId: table.id })
    e.dataTransfer.setData("application/json", dragData)
    e.dataTransfer.setData("text/plain", dragData)
    e.dataTransfer.effectAllowed = "move"
    if (e.currentTarget instanceof HTMLElement) {
      e.dataTransfer.setDragImage(e.currentTarget, 24, 24)
    }
  }

  const handleDragEnd = () => {
    setDraggingGuestId(null)
    setDragOverSeat(null)
  }

  const handleDragOver = (e: React.DragEvent, seatIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = "move"
    setDragOverSeat(seatIndex)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverSeat(null)
  }

  const handleDrop = (e: React.DragEvent, seatIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverSeat(null)
    setDraggingGuestId(null)

    let rawData = e.dataTransfer.getData("application/json")
    if (!rawData) {
      rawData = e.dataTransfer.getData("text/plain")
    }

    if (rawData) {
      try {
        const data = JSON.parse(rawData)
        if (data.guestId) {
          onSwapGuests(data.guestId, table.id, seatIndex)
        }
      } catch (err) {
        // Silent fail
      }
    }
  }

  const handlePhotoUpload = (guestId: string, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setCropperImage(result)
      setEditingGuestId(guestId)
      setCropperOpen(true)
    }
    reader.readAsDataURL(file)
  }

  const handleCropComplete = (croppedImage: string) => {
    if (editingGuestId) {
      // Update guest photo through parent - we need a new callback for this
      // For now, we'll update via the allGuests reference
      const event = new CustomEvent("updateGuestPhoto", {
        detail: { guestId: editingGuestId, photo: croppedImage },
      })
      window.dispatchEvent(event)
    }
    setCropperOpen(false)
    setCropperImage(null)
    setEditingGuestId(null)
  }

  const center = layout.center as { x: number; y: number }
  const tableRadius = layout.isRound ? (layout as { tableRadius: number }).tableRadius : 0
  const tableSize = layout.isRound ? null : (layout.tableSize as { width: number; height: number })

  const hasEmptySeats = guests.length < table.seats

  const unseatedGuests = allGuests.filter((g) => g.tableId === null)

  return (
    <div
      className="relative select-none group"
      style={{
        width: (layout as { totalWidth?: number }).totalWidth || layout.totalSize,
        height: (layout as { totalHeight?: number }).totalHeight || layout.totalSize,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />

      <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            className={`export-hide absolute h-8 w-8 rounded-full z-20 shadow-lg transition-opacity duration-200 bg-card border border-border ${
              isHovered || settingsOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            style={{
              left: 0,
              top: 0,
            }}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4" align="start">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Table Name</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => {
                  if (editName.trim() && editName !== table.name) {
                    onUpdateTableName(table.id, editName.trim())
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && editName.trim()) {
                    onUpdateTableName(table.id, editName.trim())
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Seats</label>
              <Select
                value={table.seats.toString()}
                onValueChange={(v) => onUpdateTable(table.id, { seats: Number.parseInt(v) })}
              >
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
            {table.shape === "rectangle" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Seat Arrangement</label>
                <Select
                  value={table.seatArrangement || "around"}
                  onValueChange={(v) =>
                    onUpdateTable(table.id, { seatArrangement: v as "around" | "one-side" | "single-row" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="around">Seats around</SelectItem>
                    <SelectItem value="one-side">Two sides</SelectItem>
                    <SelectItem value="single-row">Single row</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={() => {
                setSettingsOpen(false)
                onRemoveTable(table.id)
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Table
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {hasEmptySeats && unseatedGuests.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className={`export-hide absolute h-8 w-8 rounded-full z-20 shadow-lg transition-opacity duration-200 bg-card border border-border ${
                isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              style={{
                right: 0,
                top: 0,
              }}
            >
              <UserPlus className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="end">
            <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Add guest to table</div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {unseatedGuests.map((guest) => (
                <button
                  key={guest.id}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted text-left text-sm"
                  onClick={() => onAssignGuest(guest.id)}
                >
                  <Avatar className="w-6 h-6 bg-white">
                    <AvatarImage src={guest.photo || undefined} />
                    <AvatarFallback className="text-xs bg-primary/20">{getInitials(guest.name)}</AvatarFallback>
                  </Avatar>
                  <span className="truncate">{guest.name}</span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Table center */}
      {layout.isRound ? (
        <div
          className="absolute bg-gradient-to-br from-primary/20 to-primary/10 border-[3px] border-primary/50 rounded-full flex items-center justify-center shadow-lg"
          style={{
            width: tableRadius * 2,
            height: tableRadius * 2,
            left: center.x - tableRadius,
            top: center.y - tableRadius,
          }}
        >
          <div className="text-center px-3">
            {isEditing ? (
              <div className="flex items-center gap-1">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-7 text-sm w-24 text-center bg-background"
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  onBlur={handleSave}
                  autoFocus
                />
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleSave}>
                  <Check className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <div
                className="cursor-pointer"
                onDoubleClick={() => setIsEditing(true)}
                title="Double-click to edit name"
              >
                <span className="font-semibold text-foreground text-base">{table.name}</span>
                {hasEmptySeats && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {guests.length}/{table.seats}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          className="absolute bg-gradient-to-br from-primary/20 to-primary/10 border-[3px] border-primary/50 rounded-2xl flex items-center justify-center shadow-lg"
          style={{
            width: tableSize!.width,
            height: tableSize!.height,
            left: center.x - tableSize!.width / 2,
            top: center.y - tableSize!.height / 2,
          }}
        >
          <div className="text-center px-3">
            {isEditing ? (
              <div className="flex items-center gap-1">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-7 text-sm w-24 text-center bg-background"
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  onBlur={handleSave}
                  autoFocus
                />
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleSave}>
                  <Check className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <div
                className="cursor-pointer"
                onDoubleClick={() => setIsEditing(true)}
                title="Double-click to edit name"
              >
                <span className="font-semibold text-foreground text-base">{table.name}</span>
                {hasEmptySeats && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {guests.length}/{table.seats}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Seats */}
      {layout.seats.map((seat) => (
        <div key={seat.index}>
          <div
            className="absolute"
            style={{
              left: seat.x - seatSize / 2,
              top: seat.y - seatSize / 2,
              width: seatSize,
              height: seatSize,
            }}
            onDragOver={(e) => handleDragOver(e, seat.index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, seat.index)}
          >
            {seat.guest ? (
              <div
                className="relative group/seat cursor-grab active:cursor-grabbing nodrag nopan"
                draggable="true"
                onDragStart={(e) => handleDragStart(e, seat.guest!.id)}
                onDragEnd={handleDragEnd}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  opacity: draggingGuestId === seat.guest.id ? 0.5 : 1,
                }}
              >
                <Avatar
                  className="border-[3px] border-primary/60 shadow-lg pointer-events-none bg-white"
                  style={{ width: seatSize, height: seatSize }}
                >
                  <AvatarImage src={seat.guest.photo || undefined} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/20 text-primary text-sm font-semibold">
                    {getInitials(seat.guest.name)}
                  </AvatarFallback>
                </Avatar>

                <label
                  className="export-hide absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-card border border-border text-muted-foreground flex items-center justify-center 
                    opacity-100 md:opacity-0 md:group-hover/seat:opacity-100 transition-opacity shadow-sm cursor-pointer nodrag nopan hover:bg-muted"
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <Camera className="w-3 h-3" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handlePhotoUpload(seat.guest!.id, file)
                      e.target.value = ""
                    }}
                  />
                </label>

                <button
                  className="export-hide absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center 
                    opacity-100 md:opacity-0 md:group-hover/seat:opacity-100 transition-opacity shadow-sm nodrag nopan"
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    onRemoveGuest(seat.guest!.id)
                  }}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div
                className={`w-full h-full rounded-full border-2 border-dashed flex items-center justify-center transition-all nodrag nopan ${
                  dragOverSeat === seat.index
                    ? "border-primary bg-primary/30 scale-110"
                    : "border-muted-foreground/30 bg-muted/30"
                }`}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <span className="text-xs text-muted-foreground/60">{seat.index + 1}</span>
              </div>
            )}
          </div>

          {seat.guest && (
            <div
              className="absolute pointer-events-none whitespace-nowrap"
              style={{
                left: seat.labelX,
                top: seat.labelY,
                transform: "translate(-50%, -50%)",
              }}
            >
              <span className="text-xs font-medium text-foreground bg-card/95 px-2 py-1 rounded-full shadow-sm border border-border/50">
                {seat.guest.name.split(" ")[0]}
              </span>
            </div>
          )}
        </div>
      ))}

      <Handle type="source" position={Position.Bottom} className="opacity-0" />

      {cropperOpen && cropperImage && (
        <ImageCropper
          image={cropperImage}
          onCrop={handleCropComplete}
          onCancel={() => {
            setCropperOpen(false)
            setCropperImage(null)
            setEditingGuestId(null)
          }}
        />
      )}
    </div>
  )
}

export const TableNode = memo(TableNodeComponent)
