import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import bcryptjs from "bcryptjs"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    console.log("=== TOKEN VALIDATION REQUEST ===")
    console.log("Token received:", token)

    if (!token) {
      console.log("ERROR: No token provided")
      return NextResponse.json({ success: false, valid: false, message: "Token is required" }, { status: 400 })
    }

    // Check if token exists and is valid
    console.log("Querying database for token...")
    const resets = (await query(
      "SELECT id, user_id, token, expires_at, used, created_at FROM password_resets WHERE token = ?",
      [token],
    )) as any[]

    console.log("Query result:", JSON.stringify(resets, null, 2))

    if (!resets || resets.length === 0) {
      console.log("ERROR: Token not found in database")
      return NextResponse.json({ success: false, valid: false, message: "Invalid token" }, { status: 400 })
    }

    const reset = resets[0]
    console.log("Found reset record:", {
      id: reset.id,
      user_id: reset.user_id,
      expires_at: reset.expires_at,
      used: reset.used,
      created_at: reset.created_at,
    })

    // Check if token is already used
    if (reset.used === 1 || reset.used === true) {
      console.log("ERROR: Token already used")
      return NextResponse.json(
        { success: false, valid: false, message: "Token has already been used" },
        { status: 400 },
      )
    }

    // Check if token is expired
    const now = new Date()
    const expiresAt = new Date(reset.expires_at)
    console.log("Current time:", now.toISOString())
    console.log("Token expires at:", expiresAt.toISOString())
    console.log("Time until expiration (minutes):", (expiresAt.getTime() - now.getTime()) / 1000 / 60)

    if (expiresAt <= now) {
      console.log("ERROR: Token expired")
      return NextResponse.json({ success: false, valid: false, message: "Token has expired" }, { status: 400 })
    }

    console.log("SUCCESS: Token is valid")
    return NextResponse.json({ success: true, valid: true, message: "Token is valid" })
  } catch (error) {
    console.error("Token validation error:", error)
    return NextResponse.json({ success: false, valid: false, message: "Failed to validate token" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    console.log("=== PASSWORD RESET REQUEST ===")
    console.log("Token received:", token)

    if (!token || !password) {
      console.log("ERROR: Missing token or password")
      return NextResponse.json({ success: false, message: "Token and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      console.log("ERROR: Password too short")
      return NextResponse.json({ success: false, message: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Check if token exists and is valid
    console.log("Querying database for token...")
    const resets = (await query("SELECT id, user_id, token, expires_at, used FROM password_resets WHERE token = ?", [
      token,
    ])) as any[]

    console.log("Query result:", JSON.stringify(resets, null, 2))

    if (!resets || resets.length === 0) {
      console.log("ERROR: Token not found")
      return NextResponse.json({ success: false, message: "Invalid reset token" }, { status: 400 })
    }

    const reset = resets[0]

    // Check if token is already used
    if (reset.used === 1 || reset.used === true) {
      console.log("ERROR: Token already used")
      return NextResponse.json({ success: false, message: "This reset link has already been used" }, { status: 400 })
    }

    // Check if token is expired
    const now = new Date()
    const expiresAt = new Date(reset.expires_at)

    if (expiresAt <= now) {
      console.log("ERROR: Token expired")
      return NextResponse.json({ success: false, message: "This reset link has expired" }, { status: 400 })
    }

    // Hash new password
    console.log("Hashing new password...")
    const hashedPassword = await bcryptjs.hash(password, 10)

    // Update user password_hash (NOT password)
    console.log("Updating user password_hash...")
    await query("UPDATE users SET password_hash = ? WHERE id = ?", [hashedPassword, reset.user_id])

    // Mark token as used
    console.log("Marking token as used...")
    await query("UPDATE password_resets SET used = 1 WHERE token = ?", [token])

    console.log("SUCCESS: Password reset completed for user:", reset.user_id)

    return NextResponse.json({ success: true, message: "Password has been reset successfully" })
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json({ success: false, message: "Failed to reset password" }, { status: 500 })
  }
}
