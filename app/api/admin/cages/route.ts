import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const type = searchParams.get("type")
    const checkIn = searchParams.get("check_in")
    const checkOut = searchParams.get("check_out")

    let sql = `
      SELECT 
        c.*,
        p.name as current_pet_name,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name,
        a.appointment_date,
        a.appointment_time
      FROM cages c
      LEFT JOIN pets p ON c.current_pet_id = p.id
      LEFT JOIN appointments a ON c.current_appointment_id = a.id
      LEFT JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `
    const params: any[] = []

    if (status && status !== "all") {
      sql += " AND c.status = ?"
      params.push(status)
    }

    if (type && type !== "all") {
      sql += " AND c.cage_type = ?"
      params.push(type)
    }

    // Check availability for specific date range
    if (checkIn && checkOut) {
      sql += ` AND c.id NOT IN (
        SELECT cage_id FROM cage_reservations 
        WHERE status IN ('reserved', 'checked_in') 
        AND (
          (check_in_date <= ? AND check_out_date >= ?) OR
          (check_in_date <= ? AND check_out_date >= ?) OR
          (check_in_date >= ? AND check_out_date <= ?)
        )
      )`
      params.push(checkOut, checkIn, checkIn, checkOut, checkIn, checkOut)
    }

    sql += " ORDER BY c.cage_number"

    const cages = await query(sql, params)

    return NextResponse.json({
      success: true,
      cages: cages,
    })
  } catch (error) {
    console.error("Error fetching cages:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch cages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cage_number, cage_type, capacity, description, daily_rate } = body

    // Validation
    if (!cage_number || cage_number.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Cage number is required" }, { status: 400 })
    }

    if (!cage_type) {
      return NextResponse.json({ success: false, error: "Cage type is required" }, { status: 400 })
    }

    if (!daily_rate || daily_rate <= 0) {
      return NextResponse.json({ success: false, error: "Valid daily rate is required" }, { status: 400 })
    }

    // Check if cage number already exists
    const existingCage = await query("SELECT id FROM cages WHERE cage_number = ?", [cage_number.trim()])

    if (existingCage.length > 0) {
      return NextResponse.json({ success: false, error: "Cage number already exists" }, { status: 400 })
    }

    // Insert cage
    const result = await query(
      `INSERT INTO cages (cage_number, cage_type, capacity, description, daily_rate, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'available', NOW(), NOW())`,
      [cage_number.trim(), cage_type, capacity || 1, description?.trim() || null, Number.parseFloat(daily_rate)],
    )

    return NextResponse.json({
      success: true,
      message: "Cage created successfully",
      cage: {
        id: result.insertId,
        cage_number: cage_number.trim(),
        cage_type,
        capacity: capacity || 1,
        description: description?.trim() || null,
        daily_rate: Number.parseFloat(daily_rate),
        status: "available",
      },
    })
  } catch (error) {
    console.error("Error creating cage:", error)
    return NextResponse.json({ success: false, error: "Failed to create cage" }, { status: 500 })
  }
}
