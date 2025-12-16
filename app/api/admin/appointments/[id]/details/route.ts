import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const userRole = request.cookies.get("user_role")?.value
    const { id: appointmentId } = await params

    console.log("Admin fetching appointment details for ID:", appointmentId, "Role:", userRole)

    // Check if user is admin or employee
    // if (!userRole || (userRole !== "admin" && userRole !== "employee")) {
    //   return NextResponse.json({ message: "Unauthorized - Admin or Employee access required" }, { status: 401 })
    // }

    const appointmentIdInt = Number.parseInt(appointmentId)

    if (isNaN(appointmentIdInt)) {
      return NextResponse.json({ message: "Invalid appointment ID" }, { status: 400 })
    }

    // Fetch appointment details with pet, service, user, and cage information
    const appointments = await query(
      `SELECT 
        a.*,
        CONCAT(u.first_name, ' ', u.last_name) as client_name,
        u.email as client_email,
        u.phone as client_phone,
        p.name as pet_name,
        p.species,
        p.breed as pet_breed,
        p.birth_date as pet_birth_date,
        p.gender,
        p.weight as weight_kg,
        p.color as pet_color,
        s.name as service_name,
        s.description as service_description,
        s.price as service_price,
        s.duration_minutes as service_duration,
        s.category as service_category,
        c.id as cage_id_from_table,
        c.cage_number,
        c.cage_type,
        c.capacity as cage_capacity,
        c.description as cage_description,
        c.daily_rate as cage_daily_rate,
        c.status as cage_status,
        cr.id as cage_reservation_id,
        cr.check_in_date as reservation_check_in,
        cr.check_out_date as reservation_check_out,
        cr.total_days as reservation_total_days,
        cr.total_amount as reservation_total_amount,
        cr.special_instructions as boarding_instructions,
        cr.status as reservation_status,
        cat.name as category_name,
        CASE 
          WHEN s.category = 'boarding' OR cat.name LIKE '%boarding%' THEN 1 
          ELSE 0 
        END as is_boarding,
        CASE 
          WHEN a.check_in_date IS NOT NULL AND a.check_out_date IS NOT NULL 
          THEN DATEDIFF(a.check_out_date, a.check_in_date)
          WHEN cr.check_in_date IS NOT NULL AND cr.check_out_date IS NOT NULL 
          THEN DATEDIFF(cr.check_out_date, cr.check_in_date)
          ELSE 0 
        END as boarding_duration_days,
        CASE 
          WHEN a.check_in_date IS NOT NULL AND a.check_out_date IS NOT NULL 
          THEN TIMESTAMPDIFF(HOUR, a.check_in_date, a.check_out_date)
          WHEN cr.check_in_date IS NOT NULL AND cr.check_out_date IS NOT NULL 
          THEN TIMESTAMPDIFF(HOUR, cr.check_in_date, cr.check_out_date)
          ELSE 0 
        END as boarding_duration_hours,
        CASE 
          WHEN a.boarding_days IS NOT NULL AND a.cage_rate IS NOT NULL
          THEN a.boarding_days * a.cage_rate
          WHEN cr.total_amount IS NOT NULL
          THEN cr.total_amount
          WHEN cr.check_in_date IS NOT NULL AND cr.check_out_date IS NOT NULL AND c.daily_rate IS NOT NULL
          THEN DATEDIFF(cr.check_out_date, cr.check_in_date) * c.daily_rate
          ELSE 0 
        END as total_boarding_cost,
        TIMESTAMPDIFF(YEAR, p.birth_date, CURDATE()) as age_years,
        TIMESTAMPDIFF(MONTH, p.birth_date, CURDATE()) % 12 as age_months
      FROM appointments a
      JOIN users u ON a.user_id = u.id
      JOIN pets p ON a.pet_id = p.id
      JOIN services s ON a.service_id = s.id
      LEFT JOIN categories cat ON s.category_id = cat.id
      LEFT JOIN cage_reservations cr ON a.id = cr.appointment_id
      LEFT JOIN cages c ON a.cage_id = c.id OR cr.cage_id = c.id
      WHERE a.id = ?`,
      [appointmentIdInt],
    )

    console.log("Admin query result:", JSON.stringify(appointments, null, 2))

    if (appointments.length === 0) {
      return NextResponse.json({ message: "Appointment not found" }, { status: 404 })
    }

    const appointment = appointments[0]

    // Log cage information for debugging
    console.log("Cage details:", {
      cage_id_from_appointments: appointment.cage_id,
      cage_id_from_table: appointment.cage_id_from_table,
      cage_number: appointment.cage_number,
      cage_type: appointment.cage_type,
      cage_capacity: appointment.cage_capacity,
      cage_reservation_id: appointment.cage_reservation_id,
      is_boarding: appointment.is_boarding,
      check_in_date: appointment.check_in_date || appointment.reservation_check_in,
      check_out_date: appointment.check_out_date || appointment.reservation_check_out,
    })

    // Calculate age from birth_date
    if (appointment.pet_birth_date) {
      const today = new Date()
      const birthDate = new Date(appointment.pet_birth_date)
      let years = today.getFullYear() - birthDate.getFullYear()
      let months = today.getMonth() - birthDate.getMonth()

      if (months < 0) {
        years--
        months += 12
      }

      if (today.getDate() < birthDate.getDate()) {
        months--
        if (months < 0) {
          years--
          months += 12
        }
      }

      // Add calculated age to response
      appointment.calculated_age = {
        years,
        months,
        display:
          years === 0 && months === 0
            ? "Newborn"
            : years === 0
              ? `${months} month${months > 1 ? "s" : ""}`
              : months === 0
                ? `${years} year${years > 1 ? "s" : ""}`
                : `${years}y ${months}m`,
      }
    }

    // Ensure cage details are accessible with consistent naming
    if (appointment.cage_id || appointment.cage_id_from_table) {
      appointment.cage_details = {
        cage_id: appointment.cage_id || appointment.cage_id_from_table,
        cage_number: appointment.cage_number,
        cage_type: appointment.cage_type,
        cage_capacity: appointment.cage_capacity,
        cage_description: appointment.cage_description,
        cage_daily_rate: appointment.cage_daily_rate,
        cage_status: appointment.cage_status,
        cage_location: appointment.cage_location,
        cage_amenities: appointment.cage_amenities,
        check_in_date: appointment.check_in_date || appointment.reservation_check_in,
        check_out_date: appointment.check_out_date || appointment.reservation_check_out,
        boarding_instructions: appointment.boarding_instructions,
        reservation_status: appointment.reservation_status,
      }
    }

    return NextResponse.json(appointment)
  } catch (error) {
    console.error("Error fetching appointment details:", error)
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
