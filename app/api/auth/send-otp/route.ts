import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import nodemailer from "nodemailer"

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, role } = body

    console.log("=== Send OTP Request ===")
    console.log("Email:", email)
    console.log("Role:", role)

    if (!email || !role) {
      return NextResponse.json({ success: false, message: "Email and role are required" }, { status: 400 })
    }

    // Check if account is locked
    const lockoutStatus = await checkAccountLockout(email)
    if (lockoutStatus.locked && lockoutStatus.lockedUntil) {
      const remainingMinutes = Math.ceil((lockoutStatus.lockedUntil.getTime() - Date.now()) / 60000)
      console.log("❌ Account is locked, cannot send OTP")
      return NextResponse.json(
        {
          success: false,
          message: `Account is temporarily locked. Please try again in ${remainingMinutes} minute(s).`,
          locked: true,
          lockedUntil: lockoutStatus.lockedUntil.toISOString(),
          remainingMinutes,
        },
        { status: 423 },
      )
    }

    // Verify user exists with this email and role
    const users = (await query("SELECT id, email, role FROM users WHERE email = ? AND role = ?", [
      email,
      role,
    ])) as any[]

    if (!users || users.length === 0) {
      console.log("❌ User not found")
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    console.log("✅ User found, generating OTP...")

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    console.log("Generated OTP:", otp)
    console.log("Expires at:", expiresAt.toISOString())

    // Mark all previous OTPs for this email/role as verified (invalidate them)
    await query("UPDATE otps SET is_verified = TRUE WHERE email = ? AND role = ?", [email, role])
    console.log("✅ Invalidated all previous OTPs")

    // Store OTP in database
    await query("INSERT INTO otps (email, otp_code, role, expires_at, is_verified) VALUES (?, ?, ?, ?, FALSE)", [
      email,
      otp,
      role,
      expiresAt,
    ])

    console.log("✅ OTP stored in database")

    // Send email using nodemailer with Gmail
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER, // Your Gmail address
          pass: process.env.EMAIL_PASSWORD, // Your Gmail App Password
        },
      })

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP Code - Pawpal Clinic",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🐾 Pawpal Clinic</h1>
            </div>
            <div style="background-color: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Your One-Time Password</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.5;">
                Hello! You've requested to login to your pet care account. Please use the OTP code below:
              </p>
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; text-align: center; border-radius: 8px; margin: 30px 0;">
                <div style="color: white; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${otp}
                </div>
              </div>
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #856404; font-size: 14px;">
                  ⏱️ This code will expire in <strong>10 minutes</strong>
                </p>
              </div>
              <p style="color: #666; font-size: 14px; line-height: 1.5;">
                If you didn't request this code, please ignore this email or contact our support team if you have concerns.
              </p>
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
              <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                This is an automated message, please do not reply to this email.
              </p>
            </div>
          </div>
        `,
      }

      await transporter.sendMail(mailOptions)
      console.log("✅ OTP email sent successfully to:", email)

      return NextResponse.json({
        success: true,
        message: "OTP sent successfully to your email",
      })
    } catch (emailError: any) {
      console.error("❌ Email sending failed:", emailError)

      // Return more detailed error for debugging
      return NextResponse.json(
        {
          success: false,
          message: "Failed to send OTP email. Please check your email configuration.",
          error: emailError.message,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("❌ Send OTP error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send OTP. Please try again.",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
