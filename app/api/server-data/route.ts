import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const serverData = await db.collection("serverMetrics").findOne({})

    if (!serverData) {
      return NextResponse.json({ error: "Nem található szerver adat" }, { status: 404 })
    }

    return NextResponse.json(serverData)
  } catch (error) {
    console.error("Hiba a szerver adatok lekérésekor:", error)
    return NextResponse.json({ error: "Nem sikerült lekérni a szerver adatokat" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()
    const data = await request.json()

    // Validate the data
    if (!data) {
      return NextResponse.json({ error: "Nincs megadva adat" }, { status: 400 })
    }

    // Update the server data
    await db.collection("serverMetrics").updateOne({}, { $set: { ...data, lastUpdated: new Date() } }, { upsert: true })

    const updatedData = await db.collection("serverMetrics").findOne({})
    return NextResponse.json(updatedData)
  } catch (error) {
    console.error("Hiba a szerver adatok frissítésekor:", error)
    return NextResponse.json({ error: "Nem sikerült frissíteni a szerver adatokat" }, { status: 500 })
  }
}

