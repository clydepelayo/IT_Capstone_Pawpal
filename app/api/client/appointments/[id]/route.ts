import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = request.cookies.get("user_id")?.value
    const { id: appointmentId } = await params

    console.log("Fetching appointment details for ID:", appointmentId, "User:", userId)

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const appointmentIdInt = Number.parseInt(appointmentId)

    if (isNaN(appointmentIdInt)) {
      return NextResponse.json({ message: "Invalid appointment ID" }, { status: 400 })
    }

    const appointments = await query(
      `SELECT 
        a.*,
        GROUP_CONCAT(DISTINCT p.name ORDER BY p.name SEPARATOR ', ') as pet_names,
        GROUP_CONCAT(DISTINCT p.species ORDER BY p.name SEPARATOR ', ') as pet_species,
        GROUP_CONCAT(DISTINCT p.breed ORDER BY p.name SEPARATOR ', ') as pet_breeds,
        GROUP_CONCAT(DISTINCT p.gender ORDER BY p.name SEPARATOR ', ') as pet_genders,
        GROUP_CONCAT(DISTINCT p.weight ORDER BY p.name SEPARATOR ', ') as pet_weights,
        GROUP_CONCAT(DISTINCT TIMESTAMPDIFF(YEAR, p.birth_date, CURDATE()) ORDER BY p.name SEPARATOR ', ') as pet_ages_years,
        GROUP_CONCAT(DISTINCT TIMESTAMPDIFF(MONTH, p.birth_date, CURDATE()) % 12 ORDER BY p.name SEPARATOR ', ') as pet_ages_months,
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
        END as total_boarding_cost
      FROM appointments a
      LEFT JOIN appointment_pets ap ON a.id = ap.appointment_id
      LEFT JOIN pets p ON ap.pet_id = p.id
      JOIN services s ON a.service_id = s.id
      LEFT JOIN categories cat ON s.category_id = cat.id
      LEFT JOIN cage_reservations cr ON a.id = cr.appointment_id
      LEFT JOIN cages c ON a.cage_id = c.id OR cr.cage_id = c.id
      WHERE a.id = ? AND a.user_id = ?
      GROUP BY a.id`,
      [appointmentIdInt, userId],
    )

    console.log("Raw query result:", JSON.stringify(appointments, null, 2))

    if (appointments.length === 0) {
      return NextResponse.json({ message: "Appointment not found" }, { status: 404 })
    }

    const appointment = appointments[0]

    console.log("[v0] Appointment pet data:", {
      pet_names: appointment.pet_names,
      pet_species: appointment.pet_species,
      pet_breeds: appointment.pet_breeds,
      pet_genders: appointment.pet_genders,
      pet_weights: appointment.pet_weights,
      pet_ages_years: appointment.pet_ages_years,
      pet_ages_months: appointment.pet_ages_months
    })

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

    const ageYearsArray = appointment.pet_ages_years ? appointment.pet_ages_years.split(', ') : []
    const ageMonthsArray = appointment.pet_ages_months ? appointment.pet_ages_months.split(', ') : []
    
    const petAgesDisplay = ageYearsArray.map((years: string, index: number) => {
      const y = parseInt(years) || 0
      const m = parseInt(ageMonthsArray[index] || '0') || 0
      
      if (y === 0 && m === 0) return "Newborn"
      if (y === 0) return `${m} month${m > 1 ? "s" : ""}`
      if (m === 0) return `${y} year${y > 1 ? "s" : ""}`
      return `${y}y ${m}m`
    }).join(', ')

    appointment.pet_ages_display = petAgesDisplay

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

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const userId = request.cookies.get("user_id")?.value
    const { id: appointmentId } = await params

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { status, notes } = await request.json()

    // Update appointment
    await query(
      `UPDATE appointments SET 
       status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [status, notes, appointmentId, userId],
    )

    return NextResponse.json({ message: "Appointment updated successfully" })
  } catch (error) {
    console.error("Error updating appointment:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
