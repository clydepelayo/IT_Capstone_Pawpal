import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminId = request.cookies.get("user_id")?.value
    const appointmentId = params.id

    // if (!adminId) {
    //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    // }

    const body = await request.json()
    const { diagnosis, treatment, medications, next_visit_date, veterinarian_name } = body

    if (!diagnosis || !diagnosis.trim()) {
      return NextResponse.json({ error: "Diagnosis is required" }, { status: 400 })
    }

    // Get appointment details to get pet_id
    const appointmentResult = await query(`SELECT pet_id FROM appointments WHERE id = ?`, [appointmentId])

    if (!Array.isArray(appointmentResult) || appointmentResult.length === 0) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    const appointment = appointmentResult[0] as { pet_id: number }

    // Insert medical record
    await query(
      `INSERT INTO medical_records 
       (pet_id, appointment_id, record_type, diagnosis, treatment, medications, next_visit_date, veterinarian_name, record_date) 
       VALUES (?, ?, 'appointment', ?, ?, ?, ?, ?, NOW())`,
      [
        appointment.pet_id,
        appointmentId,
        diagnosis,
        treatment || null,
        medications || null,
        next_visit_date || null,
        veterinarian_name || null,
      ],
    )

    return NextResponse.json({ message: "Medical record created successfully" })
  } catch (error) {
    console.error("Error creating medical record:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
