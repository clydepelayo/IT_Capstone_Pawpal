import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Debug: Log all cookies
    console.log("All cookies:", request.cookies.getAll())

    // Get user ID from session/cookie
    const userId = request.cookies.get("user_id")?.value
    const userEmail = request.cookies.get("user_email")?.value
    const userRole = request.cookies.get("user_role")?.value

    console.log("Auth check - User ID:", userId, "Email:", userEmail, "Role:", userRole)

    if (!userId) {
      console.log("No user_id cookie found")
      return NextResponse.json({ error: "Unauthorized - No session found" }, { status: 401 })
    }

    // Validate userId is not undefined before query
    const userIdNumber = Number.parseInt(userId, 10)
    if (isNaN(userIdNumber)) {
      console.log("Invalid user ID:", userId)
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    console.log("Fetching profile for user ID:", userIdNumber)

    // Fetch user profile with all fields
    const userResult = (await query(
      "SELECT id, first_name, last_name, email, phone, address, role, is_active FROM users WHERE id = ?",
      [userIdNumber],
    )) as any[]

    console.log("Query executed successfully, results:", userResult.length)

    if (userResult.length === 0) {
      console.log("User not found in database for ID:", userIdNumber)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userResult[0]

    // Check if user is active
    if (!user.is_active) {
      console.log("User account is deactivated:", userIdNumber)
      return NextResponse.json({ error: "Account is deactivated" }, { status: 401 })
    }

    console.log("Profile fetched successfully for user:", user.email)

    // Return complete profile with address and contact number
    return NextResponse.json({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone || null,
      address: user.address || null,
      contact: user.phone || user.email,
      role: user.role,
    })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch user profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate userId
    const userIdNumber = Number.parseInt(userId, 10)
    if (isNaN(userIdNumber)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const { first_name, last_name, phone, address } = await request.json()

    console.log("Updating profile for user ID:", userIdNumber)

    // Update user profile including address and phone
    await query(
      "UPDATE users SET first_name = ?, last_name = ?, phone = ?, address = ?, updated_at = NOW() WHERE id = ?",
      [first_name, last_name, phone, address, userIdNumber],
    )

    console.log("Profile updated successfully for user ID:", userIdNumber)

    return NextResponse.json({ message: "Profile updated successfully" })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json(
      {
        error: "Failed to update profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
