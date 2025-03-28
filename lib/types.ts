export interface ServerData {
  ip: string
  off_request_sent: "yes" | "no"
  backup_in_progress: "yes" | "no"
  last_backup_time: Date | null
  players: {
    current: number
    max: number
  }
  cpu: number
  ram: number
  ping: number
  lastUpdated: Date
}

export interface ImportantLocation {
  id: string
  discovery: string
  coordinates: string
  isOwnTerritory: boolean
  createdAt: Date
}

