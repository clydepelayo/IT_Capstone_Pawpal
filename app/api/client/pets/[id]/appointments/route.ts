import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = request.cookies.get("user_id")?.value
    const petId = params.id

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Fetch appointments for this pet
    const appointments = await query(
      `
      SELECT 
        a.*,
        s.name as service_name,
        s.price
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      WHERE a.pet_id = ? AND a.user_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
      LIMIT 10
    `,
      [petId, userId],
    )

    return NextResponse.json(appointments)
  } catch (error) {
    console.error("Error fetching pet appointments:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
