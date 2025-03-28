"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

interface DraggableMapProps {
  imageUrl: string
  alt: string
}

export function DraggableMap({ imageUrl, alt }: DraggableMapProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // Center the map initially
  useEffect(() => {
    if (containerRef.current && imageRef.current) {
      const containerWidth = containerRef.current.clientWidth
      const containerHeight = containerRef.current.clientHeight
      const imageWidth = imageRef.current.naturalWidth
      const imageHeight = imageRef.current.naturalHeight

      // Center the image
      setPosition({
        x: (containerWidth - imageWidth) / 2,
        y: (containerHeight - imageHeight) / 2,
      })
    }
  }, [])

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    setStartPos({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      setStartPos({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return

    setPosition({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y,
    })
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || e.touches.length !== 1) return

    setPosition({
      x: e.touches[0].clientX - startPos.x,
      y: e.touches[0].clientY - startPos.y,
    })

    // Prevent scrolling while dragging
    e.preventDefault()
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden cursor-move"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <img
        ref={imageRef}
        src={imageUrl || "/placeholder.svg"}
        alt={alt}
        className="absolute"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          maxWidth: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
        draggable="false"
      />
      <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
        Mozgatáshoz húzd a térképet
      </div>
    </div>
  )
}

