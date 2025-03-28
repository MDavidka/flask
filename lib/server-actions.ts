"use server"

import { connectToDatabase } from "./mongodb"
import type { ServerData, ImportantLocation } from "./types"
import { v4 as uuidv4 } from "uuid"

export async function fetchServerData(): Promise<ServerData> {
  const { db } = await connectToDatabase()

  // Try to find existing server data
  let serverData = await db.collection("serverMetrics").findOne({})

  // If no data exists, create default data
  if (!serverData) {
    const defaultData: ServerData = {
      ip: "192.168.1.100",
      off_request_sent: "no",
      backup_in_progress: "no",
      last_backup_time: new Date(Date.now() - 86400000), // 1 day ago
      players: {
        current: 0,
        max: 100,
      },
      cpu: 0,
      ram: 0,
      ping: 0,
      lastUpdated: new Date(),
    }

    await db.collection("serverMetrics").insertOne(defaultData)
    serverData = defaultData
  }

  return serverData as ServerData
}

export async function startServer(): Promise<ServerData> {
  const { db } = await connectToDatabase()

  // Update the off_request_sent field to 'no'
  const updatedData: Partial<ServerData> = {
    off_request_sent: "no",
    lastUpdated: new Date(),
  }

  await db.collection("serverMetrics").updateOne({}, { $set: updatedData }, { upsert: true })

  return await fetchServerData()
}

export async function stopServer(): Promise<ServerData> {
  const { db } = await connectToDatabase()

  // Update the off_request_sent field to 'yes'
  const updatedData: Partial<ServerData> = {
    off_request_sent: "yes",
    lastUpdated: new Date(),
  }

  await db.collection("serverMetrics").updateOne({}, { $set: updatedData }, { upsert: true })

  return await fetchServerData()
}

export async function requestBackup(): Promise<ServerData> {
  const { db } = await connectToDatabase()

  // Update the backup_in_progress field to 'yes'
  const updatedData: Partial<ServerData> = {
    backup_in_progress: "yes",
    lastUpdated: new Date(),
  }

  await db.collection("serverMetrics").updateOne({}, { $set: updatedData }, { upsert: true })

  // Simulate backup completion after 5 seconds
  setTimeout(async () => {
    await db.collection("serverMetrics").updateOne(
      {},
      {
        $set: {
          backup_in_progress: "no",
          last_backup_time: new Date(),
        },
      },
    )
  }, 5000)

  return await fetchServerData()
}

export async function addImportantLocation(
  discovery: string,
  coordinates: string,
  isOwnTerritory: boolean,
): Promise<ImportantLocation> {
  const { db } = await connectToDatabase()

  const newLocation: ImportantLocation = {
    id: uuidv4(),
    discovery,
    coordinates,
    isOwnTerritory,
    createdAt: new Date(),
  }

  await db.collection("importantLocations").insertOne(newLocation)

  return newLocation
}

export async function getImportantLocations(): Promise<ImportantLocation[]> {
  const { db } = await connectToDatabase()

  const locations = await db.collection("importantLocations").find({}).sort({ createdAt: -1 }).toArray()

  return locations as ImportantLocation[]
}

