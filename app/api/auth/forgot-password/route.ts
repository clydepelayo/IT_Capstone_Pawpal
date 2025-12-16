import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import crypto from "crypto"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    console.log("=== FORGOT PASSWORD REQUEST ===")
    console.log("Email:", email)

    if (!email) {
      console.log("ERROR: No email provided")
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    // Check if user exists
    console.log("Checking if user exists...")
    const users = (await query("SELECT id, email, first_name, last_name FROM users WHERE email = ?", [email])) as any[]

    console.log("User lookup result:", users)

    if (!users || users.length === 0) {
      console.log("User not found, but returning success for security")
      // Don't reveal if email exists
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, you will receive a password reset link.",
      })
    }

    const user = users[0]
    console.log("User found:", { id: user.id, email: user.email })

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex")
    console.log("Generated token:", token)

    // Store token in database (expires in 1 hour)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
    console.log("Token expires at:", expiresAt.toISOString())

    await query(
      `INSERT INTO password_resets (user_id, token, expires_at, used) 
       VALUES (?, ?, ?, 0)
       ON DUPLICATE KEY UPDATE 
       token = VALUES(token), 
       expires_at = VALUES(expires_at), 
       used = 0`,
      [user.id, token, expiresAt],
    )

    console.log("Token stored in database")

    // Send email with reset link
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`
    console.log("Reset URL:", resetUrl)

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    const fullName =
      user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name || "User"

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request - Veterinary Clinic",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi ${fullName},</p>
              <p>We received a request to reset your password for your Veterinary Clinic account.</p>
              <p>Click the button below to reset your password:</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </p>
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul>
                  <li>This link will expire in <strong>1 hour</strong></li>
                  <li>If you didn't request this, please ignore this email</li>
                  <li>Your password won't change until you create a new one</li>
                </ul>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
              <p>Best regards,<br>Veterinary Clinic Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    console.log("Reset email sent successfully")

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, you will receive a password reset link.",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to process password reset request. Please try again." },
      { status: 500 },
    )
  }
}
