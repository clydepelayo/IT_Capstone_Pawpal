import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const checkInDate = searchParams.get("check_in_date")
    const checkOutDate = searchParams.get("check_out_date")

    if (!checkInDate || !checkOutDate) {
      return NextResponse.json({ error: "Check-in and check-out dates are required" }, { status: 400 })
    }

    // Calculate number of days
    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)
    const totalDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

    if (totalDays <= 0) {
      return NextResponse.json({ error: "Check-out date must be after check-in date" }, { status: 400 })
    }

    // Get all available cages regardless of size - show all options to user
    const availableCages = await query(
      `SELECT 
        c.id,
        c.cage_number,
        c.cage_type,
        c.capacity,
        c.daily_rate,
        c.description,
        c.status
      FROM cages c
      WHERE c.status = 'available'
      AND c.id NOT IN (
        SELECT DISTINCT cr.cage_id
        FROM cage_reservations cr
        WHERE cr.status IN ('reserved', 'checked_in')
        AND (
          (cr.check_in_date <= ? AND cr.check_out_date >= ?) OR
          (cr.check_in_date <= ? AND cr.check_out_date >= ?) OR
          (cr.check_in_date >= ? AND cr.check_out_date <= ?)
        )
      )
      ORDER BY c.cage_type, c.cage_number`,
      [checkInDate, checkInDate, checkOutDate, checkOutDate, checkInDate, checkOutDate],
    )

    // Add calculated fields to each cage
    const cagesWithCalculations = availableCages.map((cage: any) => ({
      ...cage,
      total_days: totalDays,
      total_amount: cage.daily_rate * totalDays,
    }))

    return NextResponse.json({ cages: cagesWithCalculations })
  } catch (error) {
    console.error("Error checking cage availability:", error)
    return NextResponse.json({ error: "Failed to check cage availability" }, { status: 500 })
  }
}
