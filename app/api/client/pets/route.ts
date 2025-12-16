import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Get user ID from cookies
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      console.error("No user_id cookie found")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    console.log("Fetching pets for user:", userId)

    const pets = await query(
      `SELECT * FROM pets 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId],
    )

    console.log("Pets fetched successfully:", pets.length)
    return NextResponse.json(pets)
  } catch (error) {
    console.error("Error fetching pets:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user ID from cookies
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      console.error("No user_id cookie found")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, species, breed, birth_date, gender, weight, color, microchip_id, medical_notes } = body

    console.log("Adding pet for user:", userId)
    console.log("Pet data:", {
      name,
      species,
      breed,
      birth_date,
      gender,
      weight,
      color,
      microchip_id,
      medical_notes,
    })

    // Validation
    if (!name || !species || !birth_date || !gender) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // IMPORTANT: Use NULL instead of empty string for microchip_id to avoid UNIQUE constraint violation
    const microchipValue = microchip_id && microchip_id.trim() !== "" ? microchip_id : null

    const result = await query(
      `INSERT INTO pets 
       (user_id, name, species, breed, birth_date, gender, weight, color, microchip_id, medical_notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        name,
        species,
        breed,
        birth_date,
        gender,
        weight || null,
        color || null,
        microchipValue,
        medical_notes || null,
      ],
    )

    console.log("Pet added successfully with ID:", result.insertId)

    const newPet = await query("SELECT * FROM pets WHERE id = ?", [result.insertId])

    return NextResponse.json(newPet[0], { status: 201 })
  } catch (error) {
    console.error("Error creating pet:", error)

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("Duplicate entry")) {
        return NextResponse.json({ message: "A pet with this microchip ID already exists" }, { status: 409 })
      }
    }

    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
