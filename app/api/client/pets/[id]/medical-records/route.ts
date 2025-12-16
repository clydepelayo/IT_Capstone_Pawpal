import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = request.cookies.get("user_id")?.value
    const petId = params.id

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Fetch medical records for this pet
    const medicalRecords = await query(
      `
      SELECT 
        mr.*,
        a.appointment_date as visit_date
      FROM medical_records mr
      JOIN appointments a ON mr.appointment_id = a.id
      WHERE a.pet_id = ? AND a.user_id = ?
      ORDER BY a.appointment_date DESC
      LIMIT 10
    `,
      [petId, userId],
    )

    return NextResponse.json(medicalRecords)
  } catch (error) {
    console.error("Error fetching medical records:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
