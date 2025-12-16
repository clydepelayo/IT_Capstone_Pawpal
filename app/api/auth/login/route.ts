import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import bcryptjs from "bcryptjs"

// Helper function to get client IP
function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }

  if (realIp) {
    return realIp
  }

  return "unknown"
}

// Helper function to check if account is locked
async function checkAccountLockout(email: string): Promise<{ locked: boolean; lockedUntil?: Date; reason?: string }> {
  try {
    const lockouts = (await query(
      `SELECT locked_until, lockout_reason 
       FROM account_lockouts 
       WHERE email = ? AND locked_until > NOW()
       ORDER BY locked_until DESC 
       LIMIT 1`,
      [email],
    )) as any[]

    if (lockouts && lockouts.length > 0) {
      return {
        locked: true,
        lockedUntil: new Date(lockouts[0].locked_until),
        reason: lockouts[0].lockout_reason,
      }
    }

    return { locked: false }
  } catch (error) {
    console.error("Error checking account lockout:", error)
    return { locked: false }
  }
}

// Helper function to get failed attempt count in last hour
async function getRecentFailedAttempts(email: string): Promise<number> {
  try {
    const result = (await query(
      `SELECT COUNT(*) as count 
       FROM login_attempts 
       WHERE email = ? 
       AND success = FALSE 
       AND attempt_time > DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
      [email],
    )) as any[]

    return result[0]?.count || 0
  } catch (error) {
    console.error("Error getting failed attempts:", error)
    return 0
  }
}

// Helper function to lock account
async function lockAccount(email: string, minutes: number, reason: string) {
  try {
    await query(
      `INSERT INTO account_lockouts (email, locked_until, lockout_reason)
       VALUES (?, DATE_ADD(NOW(), INTERVAL ? MINUTE), ?)
       ON DUPLICATE KEY UPDATE 
       locked_until = DATE_ADD(NOW(), INTERVAL ? MINUTE),
       lockout_reason = ?`,
      [email, minutes, reason, minutes, reason],
    )
  } catch (error) {
    console.error("Error locking account:", error)
  }
}

// Helper function to log login attempt
async function logLoginAttempt(email: string, success: boolean, ip: string, userAgent: string) {
  try {
    await query(
      `INSERT INTO login_attempts (email, success, ip_address, user_agent)
       VALUES (?, ?, ?, ?)`,
      [email, success, ip, userAgent],
    )
  } catch (error) {
    console.error("Error logging login attempt:", error)
  }
}

// Helper function to clear failed attempts on successful login
async function clearFailedAttempts(email: string) {
  try {
    await query(
      `DELETE FROM login_attempts 
       WHERE email = ? AND success = FALSE`,
      [email],
    )

    await query(
      `DELETE FROM account_lockouts 
       WHERE email = ?`,
      [email],
    )
  } catch (error) {
    console.error("Error clearing failed attempts:", error)
  }
}

export async function POST(request: Request) {
  try {
    const { email, password, role = "client" } = await request.json()

    console.log("Login attempt for:", email, "role:", role)

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 })
    }

    const ip = getClientIp(request)
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Check if account is locked
    const lockoutStatus = await checkAccountLockout(email)
    if (lockoutStatus.locked && lockoutStatus.lockedUntil) {
      const remainingMinutes = Math.ceil((lockoutStatus.lockedUntil.getTime() - Date.now()) / 60000)
      return NextResponse.json(
        {
          success: false,
          message: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${remainingMinutes} minute(s).`,
          locked: true,
          lockedUntil: lockoutStatus.lockedUntil.toISOString(),
          remainingMinutes,
        },
        { status: 423 },
      ) // 423 Locked
    }

    // Query user from database using password_hash column
    const users = (await query(
      "SELECT id, first_name, last_name, email, password_hash, role FROM users WHERE email = ? AND role = ?",
      [email, role],
    )) as any[]

    if (!users || users.length === 0) {
      console.log("User not found")
      await logLoginAttempt(email, false, ip, userAgent)

      // Get failed attempt count
      const failedAttempts = await getRecentFailedAttempts(email)

      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
          failedAttempts: failedAttempts + 1,
        },
        { status: 401 },
      )
    }

    const user = users[0]

    // Compare password with hashed password_hash
    const passwordMatch = await bcryptjs.compare(password, user.password_hash)

    if (!passwordMatch) {
      console.log("Password mismatch")
      await logLoginAttempt(email, false, ip, userAgent)

      // Get failed attempt count
      const failedAttempts = await getRecentFailedAttempts(email)
      console.log(`Failed attempts for ${email}: ${failedAttempts}`)

      // Lock account based on failed attempts - UPDATED DURATIONS
      if (failedAttempts >= 10) {
        await lockAccount(email, 20, "10+ failed login attempts") // Changed from 30 to 20 minutes
        return NextResponse.json(
          {
            success: false,
            message: "Too many failed login attempts. Your account has been locked for 20 minutes.",
            locked: true,
            failedAttempts: failedAttempts + 1,
            remainingMinutes: 20,
          },
          { status: 423 },
        )
      } else if (failedAttempts >= 5) {
        await lockAccount(email, 5, "5+ failed login attempts") // Changed from 10 to 5 minutes
        return NextResponse.json(
          {
            success: false,
            message: "Too many failed login attempts. Your account has been locked for 5 minutes.",
            locked: true,
            failedAttempts: failedAttempts + 1,
            remainingMinutes: 5,
          },
          { status: 423 },
        )
      }

      // Return remaining attempts warning
      const remainingAttempts = 5 - failedAttempts
      if (remainingAttempts <= 3 && remainingAttempts > 0) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid email or password. ${remainingAttempts} attempt(s) remaining before account lockout.`,
            failedAttempts: failedAttempts + 1,
            remainingAttempts,
          },
          { status: 401 },
        )
      }

      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
          failedAttempts: failedAttempts + 1,
        },
        { status: 401 },
      )
    }

    console.log("Login successful for user:", user.id)

    // Log successful attempt
    await logLoginAttempt(email, true, ip, userAgent)

    // Clear any failed attempts and lockouts
    await clearFailedAttempts(email)

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    })

    // Set authentication cookies with correct names (user_id and user_role to match middleware)
    response.cookies.set("user_id", user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    response.cookies.set("user_role", user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    console.log("✅ Cookies set: user_id =", user.id, ", user_role =", user.role)

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "Login failed. Please try again." }, { status: 500 })
  }
}
