import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const categoryId = Number.parseInt(params.id)

    if (isNaN(categoryId)) {
      return NextResponse.json({ success: false, error: "Invalid category ID" }, { status: 400 })
    }

    const categories = await query(
      `SELECT 
        sc.*,
        COUNT(s.id) as service_count
       FROM service_categories sc
       LEFT JOIN services s ON sc.id = s.category_id
       WHERE sc.id = ?
       GROUP BY sc.id`,
      [categoryId],
    )

    if (categories.length === 0) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      category: categories[0],
    })
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch category" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const categoryId = Number.parseInt(params.id)

    if (isNaN(categoryId)) {
      return NextResponse.json({ success: false, error: "Invalid category ID" }, { status: 400 })
    }

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

    // Check if category exists
    const existingCategory = await query("SELECT id FROM service_categories WHERE id = ?", [categoryId])

    if (existingCategory.length === 0) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 })
    }

    // Check if name already exists (excluding current category)
    const nameCheck = await query("SELECT id FROM service_categories WHERE name = ? AND id != ?", [
      name.trim(),
      categoryId,
    ])

    if (nameCheck.length > 0) {
      return NextResponse.json({ success: false, error: "Category name already exists" }, { status: 400 })
    }

    // Update category
    await query(
      `UPDATE service_categories 
       SET name = ?, description = ?, color = ?, icon = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name.trim(),
        description?.trim() || null,
        color || "#6b7280",
        icon || "tag",
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
        categoryId,
      ],
    )

    // Get updated category
    const updatedCategory = await query("SELECT * FROM service_categories WHERE id = ?", [categoryId])

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory[0],
    })
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json({ success: false, error: "Failed to update category" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const categoryId = Number.parseInt(params.id)

    if (isNaN(categoryId)) {
      return NextResponse.json({ success: false, error: "Invalid category ID" }, { status: 400 })
    }

    // Check if category exists
    const existingCategory = await query("SELECT id FROM service_categories WHERE id = ?", [categoryId])

    if (existingCategory.length === 0) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 })
    }

    // Check if category is being used by any services
    const servicesUsingCategory = await query("SELECT COUNT(*) as count FROM services WHERE category_id = ?", [
      categoryId,
    ])

    if (servicesUsingCategory[0].count > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete category. It is being used by ${servicesUsingCategory[0].count} service(s).`,
        },
        { status: 400 },
      )
    }

    // Delete category
    await query("DELETE FROM service_categories WHERE id = ?", [categoryId])

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ success: false, error: "Failed to delete category" }, { status: 500 })
  }
}
