import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    // const userRole = request.cookies.get("user_role")?.value
    // if (userRole !== "admin") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    // Get recent appointments (last 10)
    const appointmentsResult = await query(`
      SELECT 
        a.id,
        a.appointment_date,
        a.appointment_time,
        a.status,
        a.created_at,
        COALESCE(CONCAT(u.first_name, ' ', u.last_name), u.first_name, 'Unknown Client') as client_name,
        COALESCE(p.name, 'Unknown Pet') as pet_name,
        COALESCE(s.name, 'Unknown Service') as service_name
      FROM appointments a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN pets p ON a.pet_id = p.id
      LEFT JOIN services s ON a.service_id = s.id
      ORDER BY a.created_at DESC
      LIMIT 10
    `)

    const appointments = (appointmentsResult as any[]).map((appointment) => ({
      id: appointment.id,
      client: appointment.client_name,
      pet: appointment.pet_name,
      service: appointment.service_name,
      date: appointment.appointment_date,
      time: appointment.appointment_time || "N/A",
      status: appointment.status || "pending",
      created_at: appointment.created_at,
    }))

    return NextResponse.json(appointments)
  } catch (error) {
    console.error("Error fetching recent appointments:", error)
    return NextResponse.json([])
  }
}
