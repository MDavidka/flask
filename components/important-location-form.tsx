"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { addImportantLocation } from "@/lib/server-actions"

interface ImportantLocationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLocationAdded: () => void
}

export function ImportantLocationForm({ open, onOpenChange, onLocationAdded }: ImportantLocationFormProps) {
  const [discovery, setDiscovery] = useState("")
  const [coordinates, setCoordinates] = useState("")
  const [isOwnTerritory, setIsOwnTerritory] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!discovery || !coordinates) return

    setIsSubmitting(true)
    try {
      await addImportantLocation(discovery, coordinates, isOwnTerritory)
      setDiscovery("")
      setCoordinates("")
      setIsOwnTerritory(false)
      onLocationAdded()
      onOpenChange(false)
    } catch (error) {
      console.error("Hiba a fontos hely hozzáadásakor:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white w-[95%] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Fontos hely hozzáadása</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="discovery">Mit találtál?</Label>
            <Input
              id="discovery"
              value={discovery}
              onChange={(e) => setDiscovery(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="coordinates">Mi a pontos koordinátája?</Label>
            <Input
              id="coordinates"
              value={coordinates}
              onChange={(e) => setCoordinates(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
              placeholder="X: 123, Y: 456, Z: 789"
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="territory"
              checked={isOwnTerritory}
              onCheckedChange={(checked) => setIsOwnTerritory(checked === true)}
            />
            <Label htmlFor="territory">Szeretnéd, hogy saját területedként tekintsék?</Label>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full bg-white text-black hover:bg-gray-200">
              {isSubmitting ? "Mentés..." : "Mentés"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

