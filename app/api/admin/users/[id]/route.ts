import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id

    // Fetch user details
    const users = await query(
      `SELECT id, first_name, last_name, email, phone, role, address, is_active, created_at, updated_at 
       FROM users WHERE id = ?`,
      [userId],
    )

    if (users.length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json(users[0])
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { first_name, last_name, email, phone, address, role, is_active } = await request.json()
    const userId = params.id

    // Check if email is already taken by another user
    const existingUsers = await query("SELECT id FROM users WHERE email = ? AND id != ?", [email, userId])

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json({ error: "Email is already in use by another user" }, { status: 400 })
    }

    // Update user
    await query(
      `UPDATE users 
       SET first_name = ?, last_name = ?, email = ?, phone = ?, address = ?, role = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [first_name, last_name, email, phone, address, role, is_active, userId],
    )

    return NextResponse.json({
      message: "User updated successfully",
      success: true,
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { is_active } = await request.json()
    const userId = params.id

    await query("UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [is_active, userId])

    return NextResponse.json({ message: "User updated successfully" })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id

    await query("DELETE FROM users WHERE id = ?", [userId])

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
