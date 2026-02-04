"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  ControlButton,
  type Node,
  type NodeChange,
  applyNodeChanges,
  ReactFlowProvider,
  useReactFlow,
  getNodesBounds,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import type { Guest, Table, SeatingData } from "@/lib/types"
import { loadData, saveData } from "@/lib/storage"
import { GuestPanel } from "./guest-panel"
import { TableNode } from "./table-node"
import { toPng } from "html-to-image"
import { PanelLeftOpen, PanelLeftClose, Download, Upload, ImageIcon, Maximize, Minimize } from "lucide-react"
import { Button } from "@/components/ui/button"

const nodeTypes = {
  tableNode: TableNode,
}

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

if (typeof window !== "undefined") {
  window.addEventListener("error", (e) => {
    if (e.message?.includes("ResizeObserver")) {
      e.stopImmediatePropagation()
      e.preventDefault()
    }
  })
}

const SNAP_THRESHOLD = 8

interface AlignmentLine {
  type: "vertical" | "horizontal"
  position: number
  start: number
  end: number
}

function SeatingPlannerInner() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [nodes, setNodes] = useState<Node[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isPanelOpen, setIsPanelOpen] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [alignmentLines, setAlignmentLines] = useState<AlignmentLine[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { getNodes, fitView } = useReactFlow()

  const handleRemoveTable = useCallback((tableId: string) => {
    setTables((prev) => prev.filter((t) => t.id !== tableId))
    setGuests((prev) => prev.map((g) => (g.tableId === tableId ? { ...g, tableId: null, seatIndex: null } : g)))
  }, [])

  const handleRemoveGuestFromTable = useCallback((guestId: string) => {
    setGuests((prev) => prev.map((g) => (g.id === guestId ? { ...g, tableId: null, seatIndex: null } : g)))
  }, [])

  const handleUpdateTableName = useCallback((tableId: string, name: string) => {
    setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, name } : t)))
  }, [])

  const handleSwapGuests = useCallback((guestId: string, targetTableId: string, targetSeatIndex: number) => {
    setGuests((prev) => {
      const existingGuest = prev.find((g) => g.tableId === targetTableId && g.seatIndex === targetSeatIndex)
      const movingGuest = prev.find((g) => g.id === guestId)

      if (!movingGuest) return prev

      return prev.map((g) => {
        if (g.id === guestId) {
          return { ...g, tableId: targetTableId, seatIndex: targetSeatIndex }
        }
        if (existingGuest && g.id === existingGuest.id) {
          return { ...g, tableId: movingGuest.tableId, seatIndex: movingGuest.seatIndex }
        }
        return g
      })
    })
  }, [])

  const handleUpdateTable = useCallback((tableId: string, updates: Partial<Table>) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id === tableId) {
          const newSeats = updates.seats ?? t.seats
          return { ...t, ...updates }
        }
        return t
      }),
    )
    if (updates.seats !== undefined) {
      setGuests((prev) =>
        prev.map((g) => {
          if (g.tableId === tableId && g.seatIndex !== null && g.seatIndex >= updates.seats!) {
            return { ...g, tableId: null, seatIndex: null }
          }
          return g
        }),
      )
    }
  }, [])

  const handleUpdateGuestPhoto = useCallback((guestId: string, photo: string) => {
    setGuests((prev) => prev.map((g) => (g.id === guestId ? { ...g, photo } : g)))
  }, [])

  useEffect(() => {
    const data = loadData()
    const migratedTables = data.tables.map((t) => ({
      ...t,
      shape: t.shape === "square" ? "rectangle" : t.shape || "round",
      seatArrangement: t.seatArrangement || "around",
    })) as Table[]
    setGuests(data.guests)
    setTables(migratedTables)
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      saveData({ guests, tables })
    }
  }, [guests, tables, isLoaded])

  useEffect(() => {
    const tableNodes: Node[] = tables.map((table) => ({
      id: table.id,
      type: "tableNode",
      position: { x: table.x, y: table.y },
      data: {
        table,
        guests: guests.filter((g) => g.tableId === table.id),
        allGuests: guests,
        onRemoveTable: handleRemoveTable,
        onRemoveGuest: handleRemoveGuestFromTable,
        onUpdateTableName: handleUpdateTableName,
        onSwapGuests: handleSwapGuests,
        onUpdateTable: handleUpdateTable,
        onAssignGuest: (guestId: string) => {
          const table_t = tables.find((t) => t.id === table.id)
          if (!table_t) return
          const seatedGuests = guests.filter((g) => g.tableId === table.id)
          if (seatedGuests.length >= table_t.seats) return
          const takenSeats = seatedGuests.map((g) => g.seatIndex)
          let seatIndex = 0
          while (takenSeats.includes(seatIndex)) seatIndex++
          setGuests((prev) => prev.map((g) => (g.id === guestId ? { ...g, tableId: table.id, seatIndex } : g)))
        },
        onUpdateGuestPhoto: handleUpdateGuestPhoto,
      },
      draggable: true,
    }))
    setNodes(tableNodes)
  }, [
    tables,
    guests,
    handleRemoveTable,
    handleRemoveGuestFromTable,
    handleUpdateTableName,
    handleSwapGuests,
    handleUpdateTable,
    handleUpdateGuestPhoto,
  ])

  useEffect(() => {
    const handler = (e: CustomEvent<{ guestId: string; photo: string }>) => {
      handleUpdateGuestPhoto(e.detail.guestId, e.detail.photo)
    }
    window.addEventListener("updateGuestPhoto", handler as EventListener)
    return () => window.removeEventListener("updateGuestPhoto", handler as EventListener)
  }, [handleUpdateGuestPhoto])

  const getNodeBounds = useCallback(
    (node: Node) => {
      const table = tables.find((t) => t.id === node.id)
      if (!table) return { x: node.position.x, y: node.position.y, width: 200, height: 200 }

      let width = 200
      let height = 200

      if (table.shape === "round") {
        const seatSize = 48
        const seatSpacing = 16
        const minTableRadius = 60
        const circumferenceNeeded = table.seats * (seatSize + seatSpacing * 0.5)
        const tableRadius = Math.max(minTableRadius, circumferenceNeeded / (2 * Math.PI))
        const seatRadius = tableRadius + seatSize / 2 + 12
        const totalSize = seatRadius * 2 + 44 * 2 + seatSize + 40
        width = totalSize
        height = totalSize
      } else {
        const seatSize = 48
        const seatSpacing = 16
        const arrangement = table.seatArrangement || "around"

        if (arrangement === "single-row") {
          width = table.seats * (seatSize + seatSpacing) + 100
          height = seatSize + 44 + 50 + 60
        } else if (arrangement === "one-side") {
          const seatsPerSide = Math.ceil(table.seats / 2)
          width = seatsPerSide * (seatSize + seatSpacing) + 100
          height = 60 + seatSize * 2 + 44 * 2 + 60
        } else {
          const seatsPerSide = Math.ceil(table.seats / 4)
          width = Math.max(160, seatsPerSide * (seatSize + seatSpacing) + 40) + seatSize * 2 + 44 * 2 + 40
          height = 80 + seatSize * 2 + 44 * 2 + 40
        }
      }

      return {
        x: node.position.x,
        y: node.position.y,
        width,
        height,
        centerX: node.position.x + width / 2,
        centerY: node.position.y + height / 2,
        right: node.position.x + width,
        bottom: node.position.y + height,
      }
    },
    [tables],
  )

  const snapToAlignment = useCallback(
    (draggingNodeId: string, position: { x: number; y: number }) => {
      const otherNodes = nodes.filter((n) => n.id !== draggingNodeId)
      if (otherNodes.length === 0) return { position, lines: [] }

      const draggingNode = nodes.find((n) => n.id === draggingNodeId)
      if (!draggingNode) return { position, lines: [] }

      const draggingBounds = getNodeBounds({ ...draggingNode, position })
      const lines: AlignmentLine[] = []

      let snappedX = position.x
      let snappedY = position.y
      let snappedXType: "left" | "center" | "right" | null = null
      let snappedYType: "top" | "center" | "bottom" | null = null

      for (const otherNode of otherNodes) {
        const otherBounds = getNodeBounds(otherNode)

        if (Math.abs(draggingBounds.x - otherBounds.x) < SNAP_THRESHOLD && !snappedXType) {
          snappedX = otherBounds.x
          snappedXType = "left"
        }
        if (Math.abs(draggingBounds.centerX! - otherBounds.centerX!) < SNAP_THRESHOLD && !snappedXType) {
          snappedX = otherBounds.centerX! - draggingBounds.width / 2
          snappedXType = "center"
        }
        if (Math.abs(draggingBounds.right! - otherBounds.right!) < SNAP_THRESHOLD && !snappedXType) {
          snappedX = otherBounds.right! - draggingBounds.width
          snappedXType = "right"
        }
        if (Math.abs(draggingBounds.x - otherBounds.right!) < SNAP_THRESHOLD && !snappedXType) {
          snappedX = otherBounds.right!
          snappedXType = "left"
        }
        if (Math.abs(draggingBounds.right! - otherBounds.x) < SNAP_THRESHOLD && !snappedXType) {
          snappedX = otherBounds.x - draggingBounds.width
          snappedXType = "right"
        }

        if (Math.abs(draggingBounds.y - otherBounds.y) < SNAP_THRESHOLD && !snappedYType) {
          snappedY = otherBounds.y
          snappedYType = "top"
        }
        if (Math.abs(draggingBounds.centerY! - otherBounds.centerY!) < SNAP_THRESHOLD && !snappedYType) {
          snappedY = otherBounds.centerY! - draggingBounds.height / 2
          snappedYType = "center"
        }
        if (Math.abs(draggingBounds.bottom! - otherBounds.bottom!) < SNAP_THRESHOLD && !snappedYType) {
          snappedY = otherBounds.bottom! - draggingBounds.height
          snappedYType = "bottom"
        }
        if (Math.abs(draggingBounds.y - otherBounds.bottom!) < SNAP_THRESHOLD && !snappedYType) {
          snappedY = otherBounds.bottom!
          snappedYType = "top"
        }
        if (Math.abs(draggingBounds.bottom! - otherBounds.y) < SNAP_THRESHOLD && !snappedYType) {
          snappedY = otherBounds.y - draggingBounds.height
          snappedYType = "bottom"
        }
      }

      const snappedBounds = {
        ...draggingBounds,
        x: snappedX,
        y: snappedY,
        centerX: snappedX + draggingBounds.width / 2,
        centerY: snappedY + draggingBounds.height / 2,
        right: snappedX + draggingBounds.width,
        bottom: snappedY + draggingBounds.height,
      }

      for (const otherNode of otherNodes) {
        const otherBounds = getNodeBounds(otherNode)

        if (snappedXType === "left" && Math.abs(snappedBounds.x - otherBounds.x) < 1) {
          lines.push({
            type: "vertical",
            position: otherBounds.x,
            start: Math.min(snappedBounds.y, otherBounds.y),
            end: Math.max(snappedBounds.bottom!, otherBounds.bottom!),
          })
        }
        if (snappedXType === "center" && Math.abs(snappedBounds.centerX! - otherBounds.centerX!) < 1) {
          lines.push({
            type: "vertical",
            position: otherBounds.centerX!,
            start: Math.min(snappedBounds.y, otherBounds.y),
            end: Math.max(snappedBounds.bottom!, otherBounds.bottom!),
          })
        }
        if (snappedXType === "right" && Math.abs(snappedBounds.right! - otherBounds.right!) < 1) {
          lines.push({
            type: "vertical",
            position: otherBounds.right!,
            start: Math.min(snappedBounds.y, otherBounds.y),
            end: Math.max(snappedBounds.bottom!, otherBounds.bottom!),
          })
        }

        if (snappedYType === "top" && Math.abs(snappedBounds.y - otherBounds.y) < 1) {
          lines.push({
            type: "horizontal",
            position: otherBounds.y,
            start: Math.min(snappedBounds.x, otherBounds.x),
            end: Math.max(snappedBounds.right!, otherBounds.right!),
          })
        }
        if (snappedYType === "center" && Math.abs(snappedBounds.centerY! - otherBounds.centerY!) < 1) {
          lines.push({
            type: "horizontal",
            position: otherBounds.centerY!,
            start: Math.min(snappedBounds.x, otherBounds.x),
            end: Math.max(snappedBounds.right!, otherBounds.right!),
          })
        }
        if (snappedYType === "bottom" && Math.abs(snappedBounds.bottom! - otherBounds.bottom!) < 1) {
          lines.push({
            type: "horizontal",
            position: otherBounds.bottom!,
            start: Math.min(snappedBounds.x, otherBounds.x),
            end: Math.max(snappedBounds.right!, otherBounds.right!),
          })
        }
      }

      return { position: { x: snappedX, y: snappedY }, lines }
    },
    [nodes, getNodeBounds],
  )

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const updatedChanges = changes

      changes.forEach((change) => {
        if (change.type === "position") {
          if (change.dragging) {
            setIsDragging(true)
            if (change.position) {
              const { position: snappedPosition, lines } = snapToAlignment(change.id, change.position)
              change.position = snappedPosition
              setAlignmentLines(lines)
            }
          } else {
            setIsDragging(false)
            setAlignmentLines([])
          }
        }
      })

      setNodes((nds) => applyNodeChanges(updatedChanges, nds))

      changes.forEach((change) => {
        if (change.type === "position" && change.dragging === false && change.position) {
          setTables((prev) =>
            prev.map((t) => (t.id === change.id ? { ...t, x: change.position!.x, y: change.position!.y } : t)),
          )
        }
      })
    },
    [snapToAlignment],
  )

  const handleAddGuest = useCallback((name: string, photo: string | null) => {
    const newGuest: Guest = {
      id: generateId(),
      name,
      photo,
      tableId: null,
      seatIndex: null,
    }
    setGuests((prev) => [...prev, newGuest])
  }, [])

  const handleRemoveGuest = useCallback((guestId: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== guestId))
  }, [])

  const handleAddTable = useCallback(
    (
      name: string,
      seats: number,
      shape: "round" | "rectangle",
      seatArrangement?: "around" | "one-side" | "single-row",
    ) => {
      const newTable: Table = {
        id: generateId(),
        name,
        seats,
        shape,
        seatArrangement: shape === "rectangle" ? seatArrangement || "around" : undefined,
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200,
      }
      setTables((prev) => [...prev, newTable])
    },
    [],
  )

  const handleAssignGuest = useCallback(
    (guestId: string, tableId: string) => {
      const table = tables.find((t) => t.id === tableId)
      if (!table) return

      const seatedGuests = guests.filter((g) => g.tableId === tableId)
      if (seatedGuests.length >= table.seats) return

      const takenSeats = seatedGuests.map((g) => g.seatIndex)
      let seatIndex = 0
      while (takenSeats.includes(seatIndex)) seatIndex++
      setGuests((prev) => prev.map((g) => (g.id === guestId ? { ...g, tableId, seatIndex } : g)))
    },
    [tables, guests],
  )

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      reactFlowWrapper.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  const handleExportImage = useCallback(async () => {
    const currentNodes = getNodes()
    if (currentNodes.length === 0) return

    const bounds = getNodesBounds(currentNodes)
    const padding = 80

    let maxNodeWidth = 0
    let maxNodeHeight = 0
    currentNodes.forEach((node) => {
      const table = tables.find((t) => t.id === node.id)
      if (table) {
        const estimatedSize = Math.max(200, table.seats * 30)
        maxNodeWidth = Math.max(maxNodeWidth, estimatedSize + 150)
        maxNodeHeight = Math.max(maxNodeHeight, estimatedSize + 150)
      }
    })

    const contentWidth = bounds.width + maxNodeWidth + padding * 2
    const contentHeight = bounds.height + maxNodeHeight + padding * 2

    const elementsToHide = document.querySelectorAll(
      ".export-hide, .react-flow__controls, .react-flow__background, .react-flow__minimap",
    )
    elementsToHide.forEach((el) => {
      ;(el as HTMLElement).style.visibility = "hidden"
    })

    const flowElement = document.querySelector(".react-flow") as HTMLElement
    if (!flowElement) return

    const originalBg = flowElement.style.backgroundColor
    flowElement.style.backgroundColor = "#faf8f5"

    fitView()

    try {
      const viewport = document.querySelector(".react-flow__viewport") as HTMLElement
      if (!viewport) return

      const tempContainer = document.createElement("div")
      tempContainer.style.position = "fixed"
      tempContainer.style.left = "0"
      tempContainer.style.top = "0"
      tempContainer.style.width = `${contentWidth}px`
      tempContainer.style.height = `${contentHeight}px`
      tempContainer.style.backgroundColor = "#faf8f5"
      tempContainer.style.zIndex = "-9999"
      tempContainer.style.overflow = "visible"
      document.body.appendChild(tempContainer)

      const nodesContainer = document.querySelector(".react-flow__nodes") as HTMLElement
      if (!nodesContainer) {
        document.body.removeChild(tempContainer)
        return
      }

      const clonedNodes = nodesContainer.cloneNode(true) as HTMLElement
      clonedNodes.style.transform = `translate(${-bounds.x + padding}px, ${-bounds.y + padding}px)`
      clonedNodes.querySelectorAll(".export-hide").forEach((el) => el.remove())

      tempContainer.appendChild(clonedNodes)

      const dataUrl = await toPng(tempContainer, {
        backgroundColor: "#faf8f5",
        quality: 1,
        pixelRatio: 3,
        skipFonts: true,
        cacheBust: true,
        width: contentWidth,
        height: contentHeight,
      })

      const link = document.createElement("a")
      link.download = "wedding-seating-plan.png"
      link.href = dataUrl
      link.click()

      document.body.removeChild(tempContainer)
    } catch (error) {
      console.error("Failed to export image:", error)
    } finally {
      elementsToHide.forEach((el) => {
        ;(el as HTMLElement).style.visibility = "visible"
      })
      flowElement.style.backgroundColor = originalBg
    }
  }, [getNodes, tables, fitView])

  const handleExportJSON = useCallback(() => {
    const data: SeatingData = { guests, tables }
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.download = "wedding-seating-plan.json"
    link.href = url
    link.click()

    URL.revokeObjectURL(url)
  }, [guests, tables])

  const handleImportJSON = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string) as SeatingData

        if (!Array.isArray(data.guests) || !Array.isArray(data.tables)) {
          throw new Error("Invalid data structure")
        }

        const migratedTables = data.tables.map((t) => ({
          ...t,
          shape: t.shape === "square" ? "rectangle" : t.shape || "round",
          seatArrangement: t.seatArrangement || "around",
        })) as Table[]

        setGuests(data.guests)
        setTables(migratedTables)
      } catch (error) {
        console.error("Failed to import JSON:", error)
        alert("Failed to import file. Please ensure it's a valid seating plan JSON file.")
      }
    }
    reader.readAsText(file)

    e.target.value = ""
  }, [])

  const unseatedGuests = guests.filter((g) => g.tableId === null)

  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-background">
      <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />

      <div className="flex flex-1 overflow-hidden relative">
        <Button
          variant="outline"
          size="icon"
          className="absolute left-2 top-2 z-20 lg:hidden shadow-md bg-card"
          onClick={() => setIsPanelOpen(!isPanelOpen)}
        >
          {isPanelOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
        </Button>

        <div
          className={`
            absolute lg:relative inset-y-0 left-0 z-10 
            transition-transform duration-300 ease-in-out
            ${isPanelOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <GuestPanel
            guests={unseatedGuests}
            tables={tables}
            allGuests={guests}
            onAddGuest={handleAddGuest}
            onRemoveGuest={handleRemoveGuest}
            onAddTable={handleAddTable}
            onAssignGuest={handleAssignGuest}
            onClose={() => setIsPanelOpen(false)}
          />
        </div>

        {isPanelOpen && (
          <div className="absolute inset-0 bg-black/20 z-[5] lg:hidden" onClick={() => setIsPanelOpen(false)} />
        )}

        <div ref={reactFlowWrapper} className="flex-1 bg-muted/30 relative">
          <ReactFlow
            nodes={nodes}
            onNodesChange={onNodesChange}
            nodeTypes={nodeTypes}
            fitView
            className="bg-muted/30"
            panOnScroll={false}
            panOnDrag={true}
            zoomOnScroll={false}
            zoomOnPinch={true}
            zoomOnDoubleClick={false}
            preventScrolling={true}
            minZoom={0.3}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
            noDragClassName="nodrag"
            noPanClassName="nopan"
          >
            <Background color="#c4a48440" gap={20} />
            <Controls className="bg-card border border-border rounded-lg shadow-lg" showInteractive={false}>
              <ControlButton onClick={handleExportImage} title="Export as Image">
                <ImageIcon className="w-4 h-4" />
              </ControlButton>
              <ControlButton onClick={handleExportJSON} title="Export as JSON">
                <Download className="w-4 h-4" />
              </ControlButton>
              <ControlButton onClick={handleImportJSON} title="Import JSON">
                <Upload className="w-4 h-4" />
              </ControlButton>
              <ControlButton onClick={toggleFullscreen} title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </ControlButton>
            </Controls>

            {isDragging && alignmentLines.length > 0 && (
              <svg className="absolute inset-0 pointer-events-none z-50" style={{ overflow: "visible" }}>
                {alignmentLines.map((line, index) => (
                  <line
                    key={index}
                    x1={line.type === "vertical" ? line.position : line.start}
                    y1={line.type === "horizontal" ? line.position : line.start}
                    x2={line.type === "vertical" ? line.position : line.end}
                    y2={line.type === "horizontal" ? line.position : line.end}
                    stroke="#c4a484"
                    strokeWidth="1"
                    strokeDasharray="4 2"
                  />
                ))}
              </svg>
            )}
          </ReactFlow>
        </div>
      </div>
    </div>
  )
}

export function SeatingPlanner() {
  return (
    <ReactFlowProvider>
      <SeatingPlannerInner />
    </ReactFlowProvider>
  )
}
