import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const services = await query(`
      SELECT 
        s.id,
        s.name,
        s.description,
        s.price,
        s.duration_minutes,
        s.is_active,
        s.category_id,
        s.created_at,
        s.updated_at,
        sc.name as category,
        sc.color as category_color
      FROM services s
      LEFT JOIN service_categories sc ON s.category_id = sc.id
      WHERE s.is_active = TRUE
      ORDER BY sc.name, s.name
    `)

    return NextResponse.json(services)
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
