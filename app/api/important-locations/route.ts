import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import type { ImportantLocation } from "@/lib/types"
import { v4 as uuidv4 } from "uuid"

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const locations = await db.collection("importantLocations").find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(locations)
  } catch (error) {
    console.error("Hiba a fontos helyek lekérésekor:", error)
    return NextResponse.json({ error: "Nem sikerült lekérni a fontos helyeket" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const data = await request.json()

    // Validate the data
    if (!data || !data.discovery || !data.coordinates) {
      return NextResponse.json({ error: "Hiányzó adatok" }, { status: 400 })
    }

    const newLocation: ImportantLocation = {
      id: uuidv4(),
      discovery: data.discovery,
      coordinates: data.coordinates,
      isOwnTerritory: data.isOwnTerritory || false,
      createdAt: new Date(),
    }

    await db.collection("importantLocations").insertOne(newLocation)

    return NextResponse.json(newLocation)
  } catch (error) {
    console.error("Hiba a fontos hely hozzáadásakor:", error)
    return NextResponse.json({ error: "Nem sikerült hozzáadni a fontos helyet" }, { status: 500 })
  }
}

