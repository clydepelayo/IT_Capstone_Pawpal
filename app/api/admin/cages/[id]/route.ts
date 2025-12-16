import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cageId = Number.parseInt(params.id)

    if (isNaN(cageId)) {
      return NextResponse.json({ success: false, error: "Invalid cage ID" }, { status: 400 })
    }

    const cages = await query(
      `SELECT 
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
       WHERE c.id = ?`,
      [cageId],
    )

    if (cages.length === 0) {
      return NextResponse.json({ success: false, error: "Cage not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      cage: cages[0],
    })
  } catch (error) {
    console.error("Error fetching cage:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch cage" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cageId = Number.parseInt(params.id)
    const body = await request.json()
    const { cage_number, cage_type, capacity, description, daily_rate, status } = body

    if (isNaN(cageId)) {
      return NextResponse.json({ success: false, error: "Invalid cage ID" }, { status: 400 })
    }

    // Check if cage exists
    const existingCage = await query("SELECT id FROM cages WHERE id = ?", [cageId])

    if (existingCage.length === 0) {
      return NextResponse.json({ success: false, error: "Cage not found" }, { status: 404 })
    }

    // Check if cage number is already taken by another cage
    if (cage_number) {
      const duplicateCage = await query("SELECT id FROM cages WHERE cage_number = ? AND id != ?", [
        cage_number.trim(),
        cageId,
      ])

      if (duplicateCage.length > 0) {
        return NextResponse.json({ success: false, error: "Cage number already exists" }, { status: 400 })
      }
    }

    // Build update query dynamically
    const updateFields = []
    const updateValues = []

    if (cage_number) {
      updateFields.push("cage_number = ?")
      updateValues.push(cage_number.trim())
    }

    if (cage_type) {
      updateFields.push("cage_type = ?")
      updateValues.push(cage_type)
    }

    if (capacity !== undefined) {
      updateFields.push("capacity = ?")
      updateValues.push(capacity)
    }

    if (description !== undefined) {
      updateFields.push("description = ?")
      updateValues.push(description?.trim() || null)
    }

    if (daily_rate !== undefined) {
      updateFields.push("daily_rate = ?")
      updateValues.push(Number.parseFloat(daily_rate))
    }

    if (status) {
      updateFields.push("status = ?")
      updateValues.push(status)
    }

    updateFields.push("updated_at = NOW()")
    updateValues.push(cageId)

    // Update cage
    await query(`UPDATE cages SET ${updateFields.join(", ")} WHERE id = ?`, updateValues)

    // Get updated cage
    const updatedCage = await query(
      `SELECT 
        c.*,
        p.name as current_pet_name,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name
       FROM cages c
       LEFT JOIN pets p ON c.current_pet_id = p.id
       LEFT JOIN users u ON p.user_id = u.id
       WHERE c.id = ?`,
      [cageId],
    )

    return NextResponse.json({
      success: true,
      message: "Cage updated successfully",
      cage: updatedCage[0],
    })
  } catch (error) {
    console.error("Error updating cage:", error)
    return NextResponse.json({ success: false, error: "Failed to update cage" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cageId = Number.parseInt(params.id)

    if (isNaN(cageId)) {
      return NextResponse.json({ success: false, error: "Invalid cage ID" }, { status: 400 })
    }

    // Check if cage exists
    const existingCage = await query("SELECT id, status FROM cages WHERE id = ?", [cageId])

    if (existingCage.length === 0) {
      return NextResponse.json({ success: false, error: "Cage not found" }, { status: 404 })
    }

    // Check if cage is currently occupied
    if (existingCage[0].status === "occupied") {
      return NextResponse.json({ success: false, error: "Cannot delete occupied cage" }, { status: 400 })
    }

    // Check if cage has active reservations
    const activeReservations = await query(
      "SELECT COUNT(*) as count FROM cage_reservations WHERE cage_id = ? AND status IN ('reserved', 'checked_in')",
      [cageId],
    )

    if (activeReservations[0].count > 0) {
      return NextResponse.json(
        { success: false, error: "Cannot delete cage with active reservations" },
        { status: 400 },
      )
    }

    // Delete cage
    await query("DELETE FROM cages WHERE id = ?", [cageId])

    return NextResponse.json({
      success: true,
      message: "Cage deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting cage:", error)
    return NextResponse.json({ success: false, error: "Failed to delete cage" }, { status: 500 })
  }
}
