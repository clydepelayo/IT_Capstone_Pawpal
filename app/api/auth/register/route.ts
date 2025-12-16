import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { query } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, phone, password, address } = await request.json()

    // Check if user already exists
    const existingUsers = (await query("SELECT id FROM users WHERE email = ?", [email])) as any[]

    if (existingUsers.length > 0) {
      return NextResponse.json({ message: "User already exists with this email" }, { status: 400 })
    }

    // Hash password
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Insert new user
    const result = await query(
      `INSERT INTO users (first_name, last_name, email, phone, password_hash, address, role) 
       VALUES (?, ?, ?, ?, ?, ?, 'client')`,
      [firstName, lastName, email, phone, passwordHash, address],
    )

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
