import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Fetching services from /api/admin/services")
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const status = searchParams.get("status")

    console.log("[v0] Search params:", { search, category, status })

    let sql = `
      SELECT 
        s.id,
        s.name,
        s.description,
        s.price,
        s.duration_minutes,
        s.category_id,
        s.status,
        s.is_active,
        s.created_at,
        s.updated_at,
        sc.name as category_name,
        sc.color as category_color
      FROM services s
      LEFT JOIN service_categories sc ON s.category_id = sc.id
    `

    const params: any[] = []
    const conditions: string[] = []

    if (search) {
      conditions.push("(s.name LIKE ? OR s.description LIKE ?)")
      params.push(`%${search}%`, `%${search}%`)
    }

    if (category && category !== "all") {
      conditions.push("s.category_id = ?")
      params.push(Number.parseInt(category))
    }

    if (status && status !== "all") {
      conditions.push("s.status = ?")
      params.push(status)
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ")
    }

    sql += " ORDER BY s.created_at DESC"

    console.log("[v0] Executing SQL query")
    const services = await query(sql, params)
    console.log("[v0] Services fetched successfully:", services.length)

    return NextResponse.json({
      success: true,
      services: services,
    })
  } catch (error) {
    console.error("[v0] Error fetching services:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch services",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, price, duration_minutes, category_id, status } = body

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Service name is required" }, { status: 400 })
    }

    if (!price || price <= 0) {
      return NextResponse.json({ success: false, error: "Valid price is required" }, { status: 400 })
    }

    if (!duration_minutes || duration_minutes <= 0) {
      return NextResponse.json({ success: false, error: "Valid duration is required" }, { status: 400 })
    }

    if (!category_id) {
      return NextResponse.json({ success: false, error: "Category is required" }, { status: 400 })
    }

    // Check if category exists and is active
    const categoryCheck = await query("SELECT id FROM service_categories WHERE id = ? AND is_active = 1", [category_id])

    if (categoryCheck.length === 0) {
      return NextResponse.json({ success: false, error: "Invalid or inactive category selected" }, { status: 400 })
    }

    // Check if name already exists
    const existingService = await query("SELECT id FROM services WHERE name = ?", [name.trim()])

    if (existingService.length > 0) {
      return NextResponse.json({ success: false, error: "Service name already exists" }, { status: 400 })
    }

    // Insert new service
    const result = await query(
      `INSERT INTO services (name, description, price, duration_minutes, category_id, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        description?.trim() || null,
        Number.parseFloat(price),
        Number.parseInt(duration_minutes),
        Number.parseInt(category_id),
        status || "active",
      ],
    )

    const newService = await query(
      `SELECT 
        s.id,
        s.name,
        s.description,
        s.price,
        s.duration_minutes,
        s.category_id,
        s.status,
        s.is_active,
        s.created_at,
        s.updated_at,
        sc.name as category,
        sc.name as category_name,
        sc.color as category_color
       FROM services s
       LEFT JOIN service_categories sc ON s.category_id = sc.id
       WHERE s.id = ?`,
      [result.insertId],
    )

    return NextResponse.json({
      success: true,
      message: "Service created successfully",
      service: newService[0],
    })
  } catch (error) {
    console.error("Error creating service:", error)
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ success: false, error: "Service name already exists" }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: "Failed to create service" }, { status: 500 })
  }
}
