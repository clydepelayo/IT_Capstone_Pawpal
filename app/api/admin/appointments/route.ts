import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const userRole = request.cookies.get("user_role")?.value
    // if (userRole !== "admin" && userRole !== "employee") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const appointments = await query(`
      SELECT 
        a.id,
        a.user_id,
        a.service_id,
        a.cage_id,
        a.appointment_date,
        a.appointment_time,
        a.status,
        a.payment_method,
        a.total_amount,
        a.receipt_url,
        a.receipt_verified,
        a.receipt_verified_at,
        a.receipt_verified_by,
        a.notes,
        a.created_at,
        a.updated_at,
        a.check_in_date,
        a.check_out_date,
        a.boarding_days,
        a.boarding_id_url,
        a.boarding_signature_url,
        a.boarding_id_verified,
        a.boarding_signature_verified,
        a.boarding_id_verified_at,
        a.boarding_signature_verified_at,
        a.boarding_id_rejection_reason,
        a.boarding_signature_rejection_reason,
        CONCAT(u.first_name, ' ', u.last_name) as client_full_name,
        u.email as client_email,
        u.phone as client_phone,
        GROUP_CONCAT(DISTINCT p.name SEPARATOR ', ') as pet_names,
        GROUP_CONCAT(DISTINCT p.species SEPARATOR ', ') as pet_species,
        GROUP_CONCAT(DISTINCT p.breed SEPARATOR ', ') as pet_breeds,
        s.name as service_name,
        s.price as service_price,
        s.duration_minutes as service_duration,
        c.name as category_name,
        cg.id as cage_id_full,
        cg.cage_number,
        cg.cage_type,
        cg.daily_rate as cage_rate
      FROM appointments a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN appointment_pets ap ON a.id = ap.appointment_id
      LEFT JOIN pets p ON ap.pet_id = p.id
      LEFT JOIN services s ON a.service_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      LEFT JOIN cages cg ON a.cage_id = cg.id
      GROUP BY a.id
      ORDER BY a.created_at DESC, a.appointment_date DESC, a.appointment_time DESC
    `)

    return NextResponse.json(appointments)
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
