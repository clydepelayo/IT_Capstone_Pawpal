import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const {
      pet_ids, // Changed from pet_id to pet_ids array
      service_id,
      appointment_date,
      appointment_time,
      notes,
      payment_method,
      payment_amount,
      cage_id,
      check_in_date,
      check_out_date,
      boarding_days,
      cage_rate,
      boarding_instructions,
    } = body

    console.log("[v0] Creating single appointment for multiple pets:", {
      userId,
      pet_ids,
      pet_count: pet_ids?.length,
      service_id,
      cage_id,
      check_in_date,
      check_out_date,
      boarding_days,
      cage_rate,
    })

    if (!pet_ids || !Array.isArray(pet_ids) || pet_ids.length === 0 || !service_id || !payment_method) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get service details
    const serviceResult = await query(
      `SELECT s.*, c.name as category_name 
       FROM services s 
       LEFT JOIN categories c ON s.category_id = c.id 
       WHERE s.id = ?`,
      [service_id],
    )

    if (!serviceResult || serviceResult.length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    const service = serviceResult[0]
    const servicePrice = Number(service.price)
    const finalPaymentAmount = payment_amount || servicePrice

    // Check if it's a boarding service
    const isBoardingService = service.category_name?.toLowerCase().includes("boarding")

    console.log("[v0] Service details:", {
      service_id,
      category_name: service.category_name,
      isBoardingService,
    })

    // For boarding services, validate additional fields
    if (isBoardingService) {
      if (!cage_id || !check_in_date || !check_out_date) {
        return NextResponse.json(
          { error: "Cage and boarding dates are required for boarding services" },
          { status: 400 },
        )
      }

      // Verify cage exists
      const cageCheck = await query("SELECT id, cage_number, cage_type, daily_rate FROM cages WHERE id = ?", [cage_id])

      if (!cageCheck || cageCheck.length === 0) {
        return NextResponse.json({ error: "Selected cage does not exist" }, { status: 404 })
      }

      console.log("[v0] Cage verified:", cageCheck[0])

      // Check cage availability
      const conflictingReservations = await query(
        `SELECT cr.id, cr.check_in_date, cr.check_out_date, a.status
         FROM cage_reservations cr
         JOIN appointments a ON cr.appointment_id = a.id
         WHERE cr.cage_id = ? 
         AND a.status NOT IN ('cancelled', 'rejected')
         AND (
           (cr.check_in_date <= ? AND cr.check_out_date >= ?) OR
           (cr.check_in_date <= ? AND cr.check_out_date >= ?) OR
           (cr.check_in_date >= ? AND cr.check_out_date <= ?)
         )`,
        [cage_id, check_in_date, check_in_date, check_out_date, check_out_date, check_in_date, check_out_date],
      )

      if (conflictingReservations.length > 0) {
        console.log("[v0] Conflicting reservations found:", conflictingReservations)
        return NextResponse.json({ error: "Selected cage is not available for the chosen dates" }, { status: 409 })
      }
    }

    // Determine initial status based on payment method
    let initialStatus = "pending"
    if (payment_method === "cash") {
      initialStatus = "pending"
    } else {
      initialStatus = "pending payment"
    }

    // Set appointment date and time for boarding services
    const finalAppointmentDate = appointment_date
    const finalAppointmentTime = appointment_time

    const appointmentResult = await query(
      `INSERT INTO appointments (
        user_id, 
        pet_id,
        service_id, 
        appointment_date, 
        appointment_time, 
        status, 
        notes, 
        payment_method, 
        payment_amount,
        service_amount,
        cage_id,
        check_in_date,
        check_out_date,
        boarding_days,
        cage_rate,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        userId,
        pet_ids[0], // Use first pet as primary for legacy compatibility
        service_id,
        finalAppointmentDate,
        finalAppointmentTime,
        initialStatus,
        notes,
        payment_method,
        finalPaymentAmount,
        servicePrice,
        cage_id || null,
        check_in_date || null,
        check_out_date || null,
        boarding_days || null,
        cage_rate || null,
      ],
    )

    const appointmentId = appointmentResult.insertId
    console.log("[v0] Created single appointment with ID:", appointmentId)

    for (const petId of pet_ids) {
      await query(
        `INSERT INTO appointment_pets (appointment_id, pet_id) VALUES (?, ?)`,
        [appointmentId, petId]
      )
    }
    console.log(`[v0] Linked ${pet_ids.length} pet(s) to appointment ${appointmentId}`)

    if (isBoardingService && cage_id) {
      // Create one cage reservation record for the appointment
      const petNames = []
      for (const petId of pet_ids) {
        const petResult = await query("SELECT name FROM pets WHERE id = ?", [petId])
        if (petResult && petResult.length > 0) {
          petNames.push(petResult[0].name)
        }
      }

      const specialInstructions = boarding_instructions 
        ? `${boarding_instructions} [Pets: ${petNames.join(', ')}]`
        : `Pets: ${petNames.join(', ')}`

      await query(
        `INSERT INTO cage_reservations (
          cage_id,
          appointment_id,
          user_id,
          pet_id,
          check_in_date,
          check_out_date,
          total_days,
          total_amount,
          special_instructions,
          status,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'reserved', NOW())`,
        [
          cage_id,
          appointmentId,
          userId,
          pet_ids[0], // Use first pet as primary reference
          check_in_date,
          check_out_date,
          boarding_days,
          (cage_rate || 0) * (boarding_days || 1),
          specialInstructions,
        ],
      )

      console.log(`[v0] Created single cage reservation for ${pet_ids.length} pet(s)`)

      // Verify the appointment was saved with cage_id
      const verifyAppointment = await query(
        "SELECT id, cage_id, check_in_date, check_out_date FROM appointments WHERE id = ?",
        [appointmentId],
      )
      console.log("[v0] Verified appointment data:", verifyAppointment[0])
    }

    return NextResponse.json({
      message: "Appointment booked successfully",
      appointment_id: appointmentId,
      status: initialStatus,
      is_boarding: isBoardingService,
      pet_count: pet_ids.length,
    })
  } catch (error) {
    console.error("[v0] Error creating appointment:", error)
    return NextResponse.json({ 
      error: "Failed to book appointment",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user ID from cookies
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    console.log("[v0] Fetching appointments for user:", userId)

    let useNewSchema = true
    try {
      await query("SELECT 1 FROM appointment_pets LIMIT 1")
    } catch (error) {
      console.log("[v0] appointment_pets table not found, using legacy schema")
      useNewSchema = false
    }

    let appointments
    
    if (useNewSchema) {
      appointments = await query(
        `SELECT 
          a.id,
          a.appointment_date,
          a.appointment_time,
          a.status,
          a.notes,
          a.payment_method,
          a.payment_amount,
          a.service_amount,
          a.receipt_url,
          a.cage_id,
          a.check_in_date,
          a.check_out_date,
          a.boarding_days,
          a.cage_rate,
          a.boarding_id_url,
          a.boarding_signature_url,
          a.boarding_id_verified,
          a.boarding_signature_verified,
          a.boarding_id_rejection_reason,
          a.boarding_signature_rejection_reason,
          GROUP_CONCAT(DISTINCT p.name SEPARATOR ', ') as pet_names,
          s.name as service_name,
          s.description as service_description,
          s.price as service_price,
          s.duration_minutes as service_duration,
          c.cage_number,
          c.cage_type,
          c.daily_rate as cage_daily_rate,
          cat.name as category_name,
          cr.id as cage_reservation_id,
          cr.status as cage_reservation_status,
          cr.total_days as reservation_total_days,
          cr.total_amount as reservation_total_amount
        FROM appointments a
        LEFT JOIN appointment_pets ap ON a.id = ap.appointment_id
        LEFT JOIN pets p ON ap.pet_id = p.id
        JOIN services s ON a.service_id = s.id
        LEFT JOIN categories cat ON s.category_id = cat.id
        LEFT JOIN cages c ON a.cage_id = c.id
        LEFT JOIN cage_reservations cr ON cr.appointment_id = a.id
        WHERE a.user_id = ?
        GROUP BY a.id
        ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
        [userId],
      )
    } else {
      appointments = await query(
        `SELECT 
          a.id,
          a.appointment_date,
          a.appointment_time,
          a.status,
          a.notes,
          a.payment_method,
          a.payment_amount,
          a.service_amount,
          a.receipt_url,
          a.cage_id,
          a.check_in_date,
          a.check_out_date,
          a.boarding_days,
          a.cage_rate,
          a.boarding_id_url,
          a.boarding_signature_url,
          a.boarding_id_verified,
          a.boarding_signature_verified,
          a.boarding_id_rejection_reason,
          a.boarding_signature_rejection_reason,
          p.name as pet_names,
          s.name as service_name,
          s.description as service_description,
          s.price as service_price,
          s.duration_minutes as service_duration,
          c.cage_number,
          c.cage_type,
          c.size as cage_size,
          c.daily_rate as cage_daily_rate,
          cat.name as category_name,
          cr.id as cage_reservation_id,
          cr.status as cage_reservation_status,
          cr.total_days as reservation_total_days,
          cr.total_amount as reservation_total_amount
        FROM appointments a
        LEFT JOIN pets p ON a.pet_id = p.id
        JOIN services s ON a.service_id = s.id
        LEFT JOIN categories cat ON s.category_id = cat.id
        LEFT JOIN cages c ON a.cage_id = c.id
        LEFT JOIN cage_reservations cr ON cr.appointment_id = a.id
        WHERE a.user_id = ?
        ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
        [userId],
      )
    }

    console.log(`[v0] Found ${appointments.length} appointments`)

    return NextResponse.json({ appointments })
  } catch (error) {
    console.error("[v0] Error fetching appointments:", error)
    return NextResponse.json({ 
      error: "Failed to fetch appointments", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}
