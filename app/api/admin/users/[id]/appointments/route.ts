import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id

    // Fetch user's appointments
    const appointments = await query(
      `
      SELECT 
        a.*,
        p.name as pet_name,
        s.name as service_name,
        s.price
      FROM appointments a
      JOIN pets p ON a.pet_id = p.id
      JOIN services s ON a.service_id = s.id
      WHERE a.user_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `,
      [userId],
    )

    return NextResponse.json(appointments)
  } catch (error) {
    console.error("Error fetching user appointments:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
