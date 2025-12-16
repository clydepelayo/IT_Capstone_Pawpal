import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = request.cookies.get("user_id")?.value
    const { id: appointmentId } = await params

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Verify the appointment belongs to the user and is rejected
    const appointments = await query(
      `SELECT id, status, boarding_id_url, boarding_signature_url 
       FROM appointments 
       WHERE id = ? AND user_id = ?`,
      [appointmentId, userId],
    )

    if (appointments.length === 0) {
      return NextResponse.json({ message: "Appointment not found" }, { status: 404 })
    }

    const appointment = appointments[0]

    if (appointment.status !== "rejected") {
      return NextResponse.json(
        { message: "Only rejected appointments can have documents re-uploaded" },
        { status: 400 },
      )
    }

    // Reset document verification status and change appointment status to pending
    await query(
      `UPDATE appointments 
       SET status = 'pending',
           boarding_id_verified = NULL,
           boarding_signature_verified = NULL,
           boarding_id_verified_at = NULL,
           boarding_signature_verified_at = NULL,
           boarding_id_rejection_reason = NULL,
           boarding_signature_rejection_reason = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [appointmentId, userId],
    )

    // Create notification for admin
    await query(
      `INSERT INTO notifications (user_id, type, title, message, related_id, created_at)
       VALUES (?, 'appointment', 'Documents Re-uploaded', 'A client has re-uploaded boarding documents for appointment #${appointmentId}', ?, NOW())`,
      [1, appointmentId], // user_id 1 is typically admin
    )

    return NextResponse.json({
      success: true,
      message: "Document verification reset. You can now upload new documents.",
    })
  } catch (error) {
    console.error("Error resetting document verification:", error)
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
