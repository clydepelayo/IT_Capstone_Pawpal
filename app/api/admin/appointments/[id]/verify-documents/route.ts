import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { cookies } from "next/headers"
import { sendNotificationEmail } from "@/lib/email"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const userRole = cookieStore.get("user_role")?.value
    const userId = cookieStore.get("user_id")?.value || null

    const body = await request.json()
    const { documentType, approved, rejectionReason } = body

    if (!documentType || (documentType !== "id" && documentType !== "signature")) {
      return NextResponse.json({ error: "Invalid document type" }, { status: 400 })
    }

    if (!approved && !rejectionReason) {
      return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 })
    }

    const appointmentResult = await query(
      `SELECT a.*, 
              CONCAT(u.first_name, ' ', u.last_name) as user_name,
              u.email as user_email,
              u.first_name as first_name
       FROM appointments a
       JOIN users u ON a.user_id = u.id
       WHERE a.id = ?`,
      [id],
    )

    if (!appointmentResult || appointmentResult.length === 0) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    const appointment = appointmentResult[0]
    const now = new Date().toISOString().slice(0, 19).replace("T", " ")

    if (documentType === "id") {
      await query(
        `UPDATE appointments 
         SET boarding_id_verified = ?,
             boarding_id_verified_at = ?,
             boarding_id_verified_by = ?,
             boarding_id_rejection_reason = ?
         WHERE id = ?`,
        [
          approved ? 1 : 0,
          approved ? now : null,
          approved ? userId : null,
          approved ? null : rejectionReason || null,
          id,
        ],
      )
    } else {
      await query(
        `UPDATE appointments 
         SET boarding_signature_verified = ?,
             boarding_signature_verified_at = ?,
             boarding_signature_verified_by = ?,
             boarding_signature_rejection_reason = ?
         WHERE id = ?`,
        [
          approved ? 1 : 0,
          approved ? now : null,
          approved ? userId : null,
          approved ? null : rejectionReason || null,
          id,
        ],
      )
    }

    if (!approved) {
      await query(
        `UPDATE appointments 
         SET status = 'rejected'
         WHERE id = ?`,
        [id],
      )
    }

    const notificationTitle = approved
      ? `${documentType === "id" ? "ID" : "Signature"} Verified`
      : `${documentType === "id" ? "ID" : "Signature"} Rejected - Appointment Rejected`

    const notificationMessage = approved
      ? `Your ${documentType === "id" ? "ID document" : "signature"} has been verified for your boarding reservation.`
      : `Your ${documentType === "id" ? "ID document" : "signature"} was rejected. Reason: ${rejectionReason}. Your appointment has been marked as rejected. Please contact us to resubmit.`

    try {
      await query(
        `INSERT INTO notifications (user_id, title, message, type, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [appointment.user_id, notificationTitle, notificationMessage, approved ? "success" : "error"],
      )

      // Send email notification
      if (appointment.user_email) {
        sendNotificationEmail({
          userEmail: appointment.user_email,
          userName: appointment.first_name || "Valued Customer",
          title: notificationTitle,
          message: notificationMessage,
          type: approved ? "success" : "error",
          actionUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/pwa/appointments/${id}`,
          actionText: "View Appointment Details",
        }).catch((error) => {
          console.error("Failed to send email notification:", error)
        })
        console.log(`Email notification queued for document verification (${documentType}) - appointment ${id}`)
      }
    } catch (error) {
      console.error("Error creating notification or sending email:", error)
    }

    const [updated] = await query(
      "SELECT boarding_id_verified, boarding_signature_verified FROM appointments WHERE id = ?",
      [id],
    )

    const bothVerified = updated.boarding_id_verified === 1 && updated.boarding_signature_verified === 1

    if (bothVerified) {
      const allVerifiedTitle = "All Documents Verified"
      const allVerifiedMessage = "All your boarding documents have been verified! Your reservation is ready to proceed."

      try {
        await query(
          `INSERT INTO notifications (user_id, title, message, type, created_at)
           VALUES (?, ?, ?, ?, NOW())`,
          [appointment.user_id, allVerifiedTitle, allVerifiedMessage, "success"],
        )

        // Send email for all documents verified
        if (appointment.user_email) {
          sendNotificationEmail({
            userEmail: appointment.user_email,
            userName: appointment.first_name || "Valued Customer",
            title: allVerifiedTitle,
            message: allVerifiedMessage,
            type: "success",
            actionUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/pwa/appointments/${id}`,
            actionText: "View Appointment Details",
          }).catch((error) => {
            console.error("Failed to send email notification:", error)
          })
          console.log(`Email notification queued for all documents verified - appointment ${id}`)
        }
      } catch (error) {
        console.error("Error creating notification or sending email:", error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `${documentType === "id" ? "ID" : "Signature"} ${approved ? "verified" : "rejected"} successfully${!approved ? ". Appointment status changed to rejected." : ""}`,
      bothVerified,
      statusChanged: !approved,
    })
  } catch (error) {
    console.error("Error verifying document:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
