import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Fetch all users
    const users = await query(`
      SELECT 
        id, first_name, last_name, email, phone, role, 
        is_active, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `)

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
