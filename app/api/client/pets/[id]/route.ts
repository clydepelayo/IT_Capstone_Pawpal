import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const petId = Number.parseInt(id)

    console.log("GET /api/client/pets/[id] - Pet ID:", petId)

    if (isNaN(petId)) {
      return NextResponse.json({ message: "Invalid pet ID" }, { status: 400 })
    }

    // Get user ID from cookies (same pattern as your other routes)
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      console.log("No user_id cookie found")
      return NextResponse.json({ message: "Unauthorized - Please login" }, { status: 401 })
    }

    console.log("Authenticated user ID:", userId)

    // Try to fetch the pet without user_id filter first to debug
    const allPets = await query("SELECT * FROM pets WHERE id = ?", [petId])
    console.log("Pet found without user filter:", allPets.length > 0 ? "Yes" : "No")
    if (allPets.length > 0) {
      console.log("Pet belongs to user:", allPets[0].user_id)
    }

    // Now try with user_id filter
    const pets = await query("SELECT * FROM pets WHERE id = ? AND user_id = ?", [petId, userId])
    console.log("Pet found with user filter:", pets.length > 0 ? "Yes" : "No")

    if (pets.length === 0) {
      if (allPets.length > 0) {
        console.log("Pet exists but belongs to user:", allPets[0].user_id, "not", userId)
        return NextResponse.json({ message: "Pet not found or you don't have permission" }, { status: 403 })
      }
      return NextResponse.json({ message: "Pet not found" }, { status: 404 })
    }

    // Get the pet data
    const pet = pets[0]
    console.log("Raw pet data from DB:", pet)

    // Normalize the case for species and gender to match the Select options
    if (pet.species) {
      pet.species = pet.species.charAt(0).toUpperCase() + pet.species.slice(1).toLowerCase()
    }

    if (pet.gender) {
      pet.gender = pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1).toLowerCase()
    }

    console.log("Returning normalized pet data:", {
      id: pet.id,
      name: pet.name,
      species: pet.species,
      gender: pet.gender,
    })

    return NextResponse.json(pet)
  } catch (error) {
    console.error("Error fetching pet:", error)
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const petId = Number.parseInt(id)

    console.log("PUT /api/client/pets/[id] - Pet ID:", petId)

    if (isNaN(petId)) {
      return NextResponse.json({ message: "Invalid pet ID" }, { status: 400 })
    }

    // Get user ID from cookies
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      console.log("No user_id cookie found")
      return NextResponse.json({ message: "Unauthorized - Please login" }, { status: 401 })
    }

    console.log("Authenticated user ID:", userId)

    const body = await request.json()
    console.log("Request body:", body)

    const { name, species, breed, birth_date, gender, weight_kg, color, medical_notes } = body

    // Validation
    if (!name || !species || !birth_date || !gender) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Check if pet exists and belongs to user
    const existingPet = await query("SELECT * FROM pets WHERE id = ? AND user_id = ?", [petId, userId])
    console.log("Existing pet check:", existingPet.length > 0 ? "Found" : "Not found")

    if (existingPet.length === 0) {
      return NextResponse.json({ message: "Pet not found or you don't have permission" }, { status: 403 })
    }

    // Convert species and gender to lowercase for database storage
    const speciesLower = species.toLowerCase()
    const genderLower = gender.toLowerCase()

    console.log("Updating pet with:", {
      name,
      species: speciesLower,
      gender: genderLower,
    })

    // Update query - using 'weight' column as per database schema
    await query(
      `UPDATE pets 
       SET name = ?, species = ?, breed = ?, birth_date = ?, gender = ?, 
           weight = ?, color = ?, medical_notes = ?, updated_at = NOW()
       WHERE id = ? AND user_id = ?`,
      [name, speciesLower, breed, birth_date, genderLower, weight_kg, color, medical_notes, petId, userId],
    )

    console.log("Pet updated successfully")

    // Fetch the updated pet
    const updatedPet = await query("SELECT * FROM pets WHERE id = ?", [petId])

    if (updatedPet.length === 0) {
      return NextResponse.json({ message: "Failed to fetch updated pet" }, { status: 500 })
    }

    // Normalize the case for the response
    if (updatedPet[0].species) {
      updatedPet[0].species =
        updatedPet[0].species.charAt(0).toUpperCase() + updatedPet[0].species.slice(1).toLowerCase()
    }

    if (updatedPet[0].gender) {
      updatedPet[0].gender = updatedPet[0].gender.charAt(0).toUpperCase() + updatedPet[0].gender.slice(1).toLowerCase()
    }

    console.log("Returning updated pet:", updatedPet[0].id)

    return NextResponse.json(updatedPet[0])
  } catch (error) {
    console.error("Error updating pet:", error)
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const petId = Number.parseInt(id)

    console.log("DELETE /api/client/pets/[id] - Pet ID:", petId)

    if (isNaN(petId)) {
      return NextResponse.json({ message: "Invalid pet ID" }, { status: 400 })
    }

    // Get user ID from cookies
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      console.log("No user_id cookie found")
      return NextResponse.json({ message: "Unauthorized - Please login" }, { status: 401 })
    }

    console.log("Authenticated user ID:", userId)

    // Check if pet exists and belongs to user
    const existingPet = await query("SELECT * FROM pets WHERE id = ? AND user_id = ?", [petId, userId])

    if (existingPet.length === 0) {
      return NextResponse.json({ message: "Pet not found or you don't have permission" }, { status: 403 })
    }

    await query("DELETE FROM pets WHERE id = ? AND user_id = ?", [petId, userId])

    console.log("Pet deleted successfully")

    return NextResponse.json({ message: "Pet deleted successfully" })
  } catch (error) {
    console.error("Error deleting pet:", error)
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
