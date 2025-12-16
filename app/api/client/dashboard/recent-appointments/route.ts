import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Get user ID from session/cookie
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch recent appointments with service and pet details
    const recentAppointments = (await query(
      `
      SELECT 
        a.id,
        s.name as service_name,
        p.name as pet_name,
        a.appointment_date,
        a.status,
        s.price
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      JOIN pets p ON a.pet_id = p.id
      WHERE a.user_id = ?
      ORDER BY a.appointment_date DESC
      LIMIT 5
    `,
      [userId],
    )) as any[]

    // Format the appointments data
    const formattedAppointments = recentAppointments.map((appointment) => ({
      id: appointment.id,
      service_name: appointment.service_name,
      pet_name: appointment.pet_name,
      appointment_date: appointment.appointment_date,
      status: appointment.status,
      price: Number.parseFloat(appointment.price) || 0,
    }))

    return NextResponse.json(formattedAppointments)
  } catch (error) {
    console.error("Error fetching recent appointments:", error)
    return NextResponse.json({ error: "Failed to fetch recent appointments" }, { status: 500 })
  }
}
