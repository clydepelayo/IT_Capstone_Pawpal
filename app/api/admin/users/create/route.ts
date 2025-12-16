import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { first_name, last_name, email, password, phone, address, role } = body

    // Validate required fields
    if (!first_name || !last_name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate role
    if (!["admin", "employee"].includes(role)) {
      return NextResponse.json({ error: "Invalid role. Must be admin or employee" }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await query("SELECT id FROM users WHERE email = ?", [email])

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert new user with password_hash column
    const result = await query(
      `INSERT INTO users (first_name, last_name, email, password_hash, phone, address, role, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, hashedPassword, phone || null, address || null, role, true],
    )

    return NextResponse.json(
      {
        message: "User created successfully",
        userId: (result as any).insertId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
