"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Activity, Users, Cpu, HardDrive, Wifi, Power, PowerOff, Plus, Map, Clock, Save } from "lucide-react"
import { cn } from "@/lib/utils"
import { fetchServerData, startServer, stopServer, requestBackup } from "@/lib/server-actions"
import type { ServerData } from "@/lib/types"
import { ImportantLocationForm } from "./important-location-form"
import { ImportantLocationsList } from "./important-locations-list"
import { DraggableMap } from "./draggable-map"

export default function ServerDashboard() {
  const [serverData, setServerData] = useState<ServerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [backupLoading, setBackupLoading] = useState(false)
  const [showLocationForm, setShowLocationForm] = useState(false)
  const [showLocationsList, setShowLocationsList] = useState(false)

  useEffect(() => {
    const loadServerData = async () => {
      try {
        const data = await fetchServerData()
        setServerData(data)
      } catch (error) {
        console.error("Nem sikerült betölteni a szerver adatait:", error)
      } finally {
        setLoading(false)
      }
    }

    loadServerData()
    // Poll for updates every 10 seconds
    const interval = setInterval(loadServerData, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleStartServer = async () => {
    if (serverData?.off_request_sent === "no") return
    setActionLoading(true)
    try {
      const data = await startServer()
      setServerData(data)
    } catch (error) {
      console.error("Nem sikerült elindítani a szervert:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleStopServer = async () => {
    if (serverData?.off_request_sent === "yes") return
    setActionLoading(true)
    try {
      const data = await stopServer()
      setServerData(data)
    } catch (error) {
      console.error("Nem sikerült leállítani a szervert:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleRequestBackup = async () => {
    if (serverData?.backup_in_progress === "yes") return
    setBackupLoading(true)
    try {
      const data = await requestBackup()
      setServerData(data)
    } catch (error) {
      console.error("Nem sikerült kérelmezni a biztonsági mentést:", error)
    } finally {
      setBackupLoading(false)
    }
  }

  const formatDate = (date: Date | null) => {
    if (!date) return "Soha"
    return new Date(date).toLocaleString("hu-HU")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Szerver adatok betöltése...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Szerver Figyelő</h1>
        <div className="flex items-center justify-center gap-2 mb-4">
          <h2 className="text-xl">{serverData?.ip || "IP nem elérhető"}</h2>
          <Badge variant={serverData?.off_request_sent === "no" ? "default" : "destructive"} className="text-sm py-1">
            {serverData?.off_request_sent === "no" ? "ONLINE" : "OFFLINE"}
          </Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Szerver Vezérlés</h3>
              <Activity className="h-5 w-5 text-white" />
            </div>
            {serverData?.off_request_sent === "yes" ? (
              <div className="text-center py-4">
                <div className="text-red-500 font-bold mb-4">A szervergép hamarosan leáll</div>
                {/* Show start button when server is offline */}
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-gray-200 py-6 px-8"
                  disabled={actionLoading}
                  onClick={handleStartServer}
                >
                  <Power className="mr-2 h-5 w-5" />
                  Indítás
                </Button>
              </div>
            ) : (
              <div className="flex gap-4 justify-center">
                <Button
                  size="lg"
                  className={cn(
                    "flex-1 py-6",
                    serverData?.off_request_sent === "no" ? "bg-white text-black hover:bg-gray-200" : "bg-zinc-800",
                  )}
                  disabled={serverData?.off_request_sent === "no" || actionLoading}
                  onClick={handleStartServer}
                >
                  <Power className="mr-2 h-5 w-5" />
                  Indítás
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className={cn(
                    "flex-1 py-6",
                    serverData?.off_request_sent === "yes"
                      ? "bg-zinc-800 text-white"
                      : "border-white text-white hover:bg-zinc-800",
                  )}
                  disabled={serverData?.off_request_sent === "yes" || actionLoading}
                  onClick={handleStopServer}
                >
                  <PowerOff className="mr-2 h-5 w-5" />
                  Leállítás
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Játékosok</h3>
              <Users className="h-5 w-5 text-white" />
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold mb-2">{serverData?.players.current || 0}</p>
              <p className="text-sm text-zinc-400">a maximum {serverData?.players.max || 0} játékosból</p>
              <Progress
                value={((serverData?.players.current || 0) / (serverData?.players.max || 1)) * 100}
                className="h-2 mt-4 bg-zinc-800"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="CPU Használat"
          value={`${serverData?.cpu || 0}%`}
          icon={<Cpu className="h-5 w-5 text-white" />}
          progress={serverData?.cpu || 0}
        />
        <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              title="Ping"
              value={`${serverData?.ping || 0}ms`}
              icon={<Wifi className="h-5 w-5 text-white" />}
              progress={Math.min((serverData?.ping || 0) / 2, 100)}
            />
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">Biztonsági Mentés</h3>
                  <Save className="h-4 w-4 text-white" />
                </div>
                <div className="text-xs text-zinc-400 mb-2 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Utolsó: {formatDate(serverData?.last_backup_time)}
                </div>
                {serverData?.backup_in_progress === "yes" ? (
                  <div className="text-xs text-green-400">Biztonsági mentés készül...</div>
                ) : (
                  <Button
                    size="sm"
                    className="w-full text-xs bg-white text-black hover:bg-gray-200"
                    disabled={backupLoading}
                    onClick={handleRequestBackup}
                  >
                    Mentés kérelmezése
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
          <MetricCard
            title="RAM Használat"
            value={`${serverData?.ram || 0}%`}
            icon={<HardDrive className="h-5 w-5 text-white" />}
            progress={serverData?.ram || 0}
          />
        </div>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 overflow-hidden mb-8">
        <CardContent className="p-0">
          <div className="p-4 bg-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h3 className="text-lg font-medium">Szerver Térkép</h3>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                size="sm"
                variant="outline"
                className="border-white text-white hover:bg-zinc-700 flex-1 sm:flex-none"
                onClick={() => setShowLocationsList(true)}
              >
                <Map className="h-4 w-4 mr-1" />
                Feljegyzett koordináták
              </Button>
              <Button
                size="sm"
                className="bg-white text-black hover:bg-gray-200 flex-1 sm:flex-none"
                onClick={() => setShowLocationForm(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Fontos hely
              </Button>
            </div>
          </div>
          <div className="relative aspect-video h-[50vh]">
            <DraggableMap imageUrl="/server-map-large.png" alt="Szerver Térkép" />
          </div>
        </CardContent>
      </Card>

      <footer className="text-center text-zinc-500 py-4 border-t border-zinc-800">
        <p>A weboldalt Dávid kodolta és publikálta</p>
      </footer>

      <ImportantLocationForm
        open={showLocationForm}
        onOpenChange={setShowLocationForm}
        onLocationAdded={() => {
          // Refresh locations list if it's open
          if (showLocationsList) {
            setShowLocationsList(false)
            setTimeout(() => setShowLocationsList(true), 100)
          }
        }}
      />

      <ImportantLocationsList open={showLocationsList} onOpenChange={setShowLocationsList} />
    </div>
  )
}

function MetricCard({
  title,
  value,
  icon,
  progress,
}: {
  title: string
  value: string
  icon: React.ReactNode
  progress: number
}) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">{title}</h3>
          {icon}
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold mb-2">{value}</p>
          <Progress value={progress} className="h-2 mt-2 bg-zinc-800" />
        </div>
      </CardContent>
    </Card>
  )
}

