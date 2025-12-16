import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const serviceId = Number.parseInt(params.id)

    if (isNaN(serviceId)) {
      return NextResponse.json({ success: false, error: "Invalid service ID" }, { status: 400 })
    }

    const services = await query(
      `SELECT 
        s.*,
        sc.name as category_name,
        sc.color as category_color
       FROM services s
       LEFT JOIN service_categories sc ON s.category_id = sc.id
       WHERE s.id = ?`,
      [serviceId],
    )

    if (services.length === 0) {
      return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      service: services[0],
    })
  } catch (error) {
    console.error("Error fetching service:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch service" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const serviceId = Number.parseInt(params.id)
    const body = await request.json()
    const { name, description, price, duration_minutes, category_id, status } = body

    if (isNaN(serviceId)) {
      return NextResponse.json({ success: false, error: "Invalid service ID" }, { status: 400 })
    }

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

    // Check if service exists
    const existingService = await query("SELECT id FROM services WHERE id = ?", [serviceId])

    if (existingService.length === 0) {
      return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 })
    }

    // Check if category exists and is active
    const categoryCheck = await query("SELECT id FROM service_categories WHERE id = ? AND is_active = 1", [category_id])

    if (categoryCheck.length === 0) {
      return NextResponse.json({ success: false, error: "Invalid or inactive category selected" }, { status: 400 })
    }

    // Check if name is already taken by another service
    const duplicateName = await query("SELECT id FROM services WHERE name = ? AND id != ?", [name.trim(), serviceId])

    if (duplicateName.length > 0) {
      return NextResponse.json({ success: false, error: "Service name already exists" }, { status: 400 })
    }

    // Update service
    await query(
      `UPDATE services 
       SET name = ?, description = ?, price = ?, duration_minutes = ?, category_id = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name.trim(),
        description?.trim() || null,
        Number.parseFloat(price),
        Number.parseInt(duration_minutes),
        Number.parseInt(category_id),
        status || "active",
        serviceId,
      ],
    )

    // Get updated service with category info
    const updatedService = await query(
      `SELECT 
        s.*,
        sc.name as category_name,
        sc.color as category_color
       FROM services s
       LEFT JOIN service_categories sc ON s.category_id = sc.id
       WHERE s.id = ?`,
      [serviceId],
    )

    return NextResponse.json({
      success: true,
      message: "Service updated successfully",
      service: updatedService[0],
    })
  } catch (error) {
    console.error("Error updating service:", error)
    return NextResponse.json({ success: false, error: "Failed to update service" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const serviceId = Number.parseInt(params.id)

    if (isNaN(serviceId)) {
      return NextResponse.json({ success: false, error: "Invalid service ID" }, { status: 400 })
    }

    // Check if service exists
    const existingService = await query("SELECT id FROM services WHERE id = ?", [serviceId])

    if (existingService.length === 0) {
      return NextResponse.json({ success: false, error: "Service not found" }, { status: 404 })
    }

    // Check if service is being used in any appointments
    const appointmentsUsingService = await query("SELECT COUNT(*) as count FROM appointments WHERE service_id = ?", [
      serviceId,
    ])

    if (appointmentsUsingService[0].count > 0) {
      return NextResponse.json(
        { success: false, error: "Cannot delete service that is being used in appointments" },
        { status: 400 },
      )
    }

    // Delete service
    await query("DELETE FROM services WHERE id = ?", [serviceId])

    return NextResponse.json({
      success: true,
      message: "Service deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting service:", error)
    return NextResponse.json({ success: false, error: "Failed to delete service" }, { status: 500 })
  }
}
