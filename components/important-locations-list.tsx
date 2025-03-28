"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { getImportantLocations } from "@/lib/server-actions"
import type { ImportantLocation } from "@/lib/types"

interface ImportantLocationsListProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportantLocationsList({ open, onOpenChange }: ImportantLocationsListProps) {
  const [locations, setLocations] = useState<ImportantLocation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open) {
      const fetchLocations = async () => {
        try {
          const data = await getImportantLocations()
          setLocations(data)
        } catch (error) {
          console.error("Hiba a fontos helyek lekérésekor:", error)
        } finally {
          setLoading(false)
        }
      }

      fetchLocations()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white w-[95%] max-w-lg mx-auto">
        <DialogHeader>
          <DialogTitle>Feljegyzett koordináták</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : locations.length === 0 ? (
          <p className="text-center py-8 text-zinc-400">Nincsenek feljegyzett koordináták</p>
        ) : (
          <ScrollArea className="h-[50vh] pr-4">
            <div className="space-y-4">
              {locations.map((location) => (
                <div key={location.id} className="bg-zinc-800 p-4 rounded-md">
                  <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                    <h3 className="font-medium">{location.discovery}</h3>
                    {location.isOwnTerritory && <Badge className="bg-white text-black">Saját terület</Badge>}
                  </div>
                  <p className="text-zinc-400 text-sm mb-2">Koordináták: {location.coordinates}</p>
                  <p className="text-zinc-500 text-xs">
                    Feljegyezve: {new Date(location.createdAt).toLocaleString("hu-HU")}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}

