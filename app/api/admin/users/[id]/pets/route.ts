import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id

    // Fetch user's pets
    const pets = await query(`SELECT * FROM pets WHERE user_id = ? AND is_active = TRUE ORDER BY created_at DESC`, [
      userId,
    ])

    return NextResponse.json(pets)
  } catch (error) {
    console.error("Error fetching user pets:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
