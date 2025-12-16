import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const status = searchParams.get("status")

    let sql = `
      SELECT 
        sc.*,
        COUNT(s.id) as service_count
      FROM service_categories sc
      LEFT JOIN services s ON sc.id = s.category_id
    `

    const params: any[] = []
    const conditions: string[] = []

    if (search) {
      conditions.push("(sc.name LIKE ? OR sc.description LIKE ?)")
      params.push(`%${search}%`, `%${search}%`)
    }

    if (status && status !== "all") {
      if (status === "active") {
        conditions.push("sc.is_active = ?")
        params.push(1)
      } else if (status === "inactive") {
        conditions.push("sc.is_active = ?")
        params.push(0)
      }
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ")
    }

    sql += " GROUP BY sc.id ORDER BY sc.created_at DESC"

    const categories = await query(sql, params)

    return NextResponse.json({
      success: true,
      categories: categories,
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, color, icon, is_active } = body

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Category name is required" }, { status: 400 })
    }

    if (name.length > 100) {
      return NextResponse.json(
        { success: false, error: "Category name must be less than 100 characters" },
        { status: 400 },
      )
    }

    // Check if name already exists
    const existingCategory = await query("SELECT id FROM service_categories WHERE name = ?", [name.trim()])

    if (existingCategory.length > 0) {
      return NextResponse.json({ success: false, error: "Category name already exists" }, { status: 400 })
    }

    // Insert new category
    const result = await query(
      `INSERT INTO service_categories (name, description, color, icon, is_active) 
       VALUES (?, ?, ?, ?, ?)`,
      [name.trim(), description?.trim() || null, color || "#6b7280", icon || "tag", is_active !== false ? 1 : 0],
    )

    // Get the created category
    const newCategory = await query("SELECT * FROM service_categories WHERE id = ?", [result.insertId])

    return NextResponse.json({
      success: true,
      message: "Category created successfully",
      category: newCategory[0],
    })
  } catch (error) {
    console.error("Error creating category:", error)
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ success: false, error: "Category name already exists" }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: "Failed to create category" }, { status: 500 })
  }
}
