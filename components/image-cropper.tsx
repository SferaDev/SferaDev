"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"

interface ImageCropperProps {
  image: string
  open: boolean
  onClose: () => void
  onCrop: (croppedImage: string) => void
}

export function ImageCropper({ image, open, onClose, onCrop }: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.3)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null)
  const [minScale, setMinScale] = useState(0.1)

  const cropSize = 200

  useEffect(() => {
    if (!image) return
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      setImageEl(img)
      const fitScale = cropSize / Math.max(img.width, img.height)
      setMinScale(fitScale * 0.3) // Allow zooming out to 30% of fit scale
      setScale(fitScale) // Start with image fitting inside the circle
      setPosition({ x: 0, y: 0 })
    }
    img.src = image
  }, [image])

  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(true)
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
    setDragStart({ x: clientX, y: clientY })
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDragging) return
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY
      const dx = clientX - dragStart.x
      const dy = clientY - dragStart.y
      setPosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }))
      setDragStart({ x: clientX, y: clientY })
    },
    [isDragging, dragStart],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleZoom = (delta: number) => {
    setScale((prev) => Math.max(minScale, Math.min(3, prev + delta)))
  }

  const handleReset = () => {
    if (imageEl) {
      const fitScale = cropSize / Math.max(imageEl.width, imageEl.height)
      setScale(fitScale)
      setPosition({ x: 0, y: 0 })
    }
  }

  const handleCrop = () => {
    if (!canvasRef.current || !imageEl) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = cropSize
    canvas.height = cropSize

    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, cropSize, cropSize)

    const scaledWidth = imageEl.width * scale
    const scaledHeight = imageEl.height * scale

    // Calculate the offset to crop from center
    const offsetX = (cropSize - scaledWidth) / 2 + position.x
    const offsetY = (cropSize - scaledHeight) / 2 + position.y

    ctx.drawImage(imageEl, offsetX, offsetY, scaledWidth, scaledHeight)

    const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.9)
    onCrop(croppedDataUrl)
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crop Photo</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <div
            ref={containerRef}
            className="relative overflow-hidden rounded-full border-4 border-primary/30 cursor-move select-none"
            style={{ width: cropSize, height: cropSize }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
          >
            {imageEl && (
              <div
                className="absolute pointer-events-none"
                style={{
                  width: imageEl.width * scale,
                  height: imageEl.height * scale,
                  left: `calc(50% + ${position.x}px)`,
                  top: `calc(50% + ${position.y}px)`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <img
                  src={image || "/placeholder.svg"}
                  alt="Crop preview"
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
            )}
            {/* Overlay hint */}
            <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-primary/20 rounded-full" />
          </div>

          <p className="text-sm text-muted-foreground text-center">Drag to reposition, use buttons to zoom</p>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => handleZoom(-0.05)}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => handleZoom(0.05)}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCrop}>Save Photo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
