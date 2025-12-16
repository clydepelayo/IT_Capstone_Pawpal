import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = request.cookies.get("user_id")?.value
    const petId = params.id

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Fetch transactions related to this pet
    const transactions = await query(
      `
      SELECT 
        t.*,
        'Appointment Payment' as description
      FROM transactions t
      JOIN appointments a ON t.appointment_id = a.id
      WHERE a.pet_id = ? AND t.user_id = ?
      ORDER BY t.created_at DESC
      LIMIT 10
    `,
      [petId, userId],
    )

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching pet transactions:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
