import nodemailer from "nodemailer"

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export interface NotificationEmail {
  userEmail: string
  userName: string
  title: string
  message: string
  type: "success" | "error" | "info" | "warning" | "order_confirmed" | "appointment_confirmed"
  actionUrl?: string
  actionText?: string
}

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number.parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter()

    console.log("Sending email:", {
      to: options.to,
      subject: options.subject,
    })

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Pawpal Veterinary" <noreply@pawpal.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    console.log("Email sent successfully:", info.messageId)
    return true
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}

export function generateNotificationEmailHTML({
  userName,
  title,
  message,
  type,
  actionUrl,
  actionText,
}: NotificationEmail): string {
  const colors = {
    success: "#10b981",
    error: "#ef4444",
    info: "#3b82f6",
    warning: "#f59e0b",
    order_confirmed: "#8b5cf6",
    appointment_confirmed: "#8b5cf6",
  }

  const color = colors[type] || colors.info

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); max-width: 600px;">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🐾 Pawpal</h1>
                  <p style="margin: 10px 0 0; color: #e0e7ff; font-size: 14px;">Veterinary Care & Pet Services</p>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">Hello ${userName},</p>
                  
                  <div style="background-color: ${color}15; border-left: 4px solid ${color}; padding: 20px; margin: 20px 0; border-radius: 4px;">
                    <h2 style="margin: 0 0 10px; color: ${color}; font-size: 20px; font-weight: 600;">${title}</h2>
                    <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.6;">${message}</p>
                  </div>

                  ${
                    actionUrl && actionText
                      ? `
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${actionUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                        ${actionText}
                      </a>
                    </div>
                  `
                      : ""
                  }

                  <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px;">
                    If you have any questions, please don't hesitate to contact us.
                  </p>

                  <p style="margin: 20px 0 0; color: #374151; font-size: 14px;">
                    Best regards,<br>
                    <strong>The Pawpal Team</strong>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                  <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 1.5;">
                    This is an automated notification from Pawpal Veterinary Services.<br>
                    Please do not reply to this email.
                  </p>
                  <p style="margin: 15px 0 0; color: #9ca3af; font-size: 11px;">
                    © ${new Date().getFullYear()} Pawpal. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

export function generateNotificationEmailText({
  userName,
  title,
  message,
  actionUrl,
  actionText,
}: NotificationEmail): string {
  let text = `Hello ${userName},\n\n`
  text += `${title}\n\n`
  text += `${message}\n\n`

  if (actionUrl && actionText) {
    text += `${actionText}: ${actionUrl}\n\n`
  }

  text += `If you have any questions, please don't hesitate to contact us.\n\n`
  text += `Best regards,\nThe Pawpal Team\n\n`
  text += `---\nThis is an automated notification from Pawpal Veterinary Services.\n`
  text += `Please do not reply to this email.`

  return text
}

export async function sendNotificationEmail(data: NotificationEmail): Promise<boolean> {
  const html = generateNotificationEmailHTML(data)
  const text = generateNotificationEmailText(data)

  return sendEmail({
    to: data.userEmail,
    subject: `${data.title} - Pawpal`,
    html,
    text,
  })
}
