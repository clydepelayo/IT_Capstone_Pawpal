import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Get user ID from cookies
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: appointmentId } = await params

    // Verify appointment belongs to user and get appointment details
    const appointments = await query(
      "SELECT id, appointment_date, appointment_time, status FROM appointments WHERE id = ? AND user_id = ?",
      [appointmentId, userId],
    )

    if (!Array.isArray(appointments) || appointments.length === 0) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    const appointment = appointments[0] as any

    // Check if appointment can be cancelled
    if (appointment.status !== "pending") {
      return NextResponse.json({ error: "Only pending appointments can be cancelled" }, { status: 400 })
    }

    // Check if appointment is more than 24 hours away
    const appointmentDateTime = new Date(`${appointment.appointment_date} ${appointment.appointment_time}`)
    const now = new Date()
    const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilAppointment < 24) {
      return NextResponse.json(
        { error: "Appointments can only be cancelled at least 24 hours in advance" },
        { status: 400 },
      )
    }

    // Cancel the appointment
    await query("UPDATE appointments SET status = 'cancelled', updated_at = NOW() WHERE id = ?", [appointmentId])

    return NextResponse.json({ message: "Appointment cancelled successfully" })
  } catch (error) {
    console.error("Error cancelling appointment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
