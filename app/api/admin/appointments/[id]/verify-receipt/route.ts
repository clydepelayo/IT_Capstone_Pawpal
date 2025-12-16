import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { cookies } from "next/headers"
import { sendNotificationEmail } from "@/lib/email"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const userRole = cookieStore.get("user_role")?.value
    const userId = cookieStore.get("user_id")?.value

    // if (!userRole || (userRole !== "admin" && userRole !== "employee")) {
    //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    // }

    const body = await request.json()
    const { approved } = body

    console.log("[v0] Verifying receipt for appointment:", id, "Approved:", approved)

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
      return NextResponse.json({ message: "Appointment not found" }, { status: 404 })
    }

    const appointment = appointmentResult[0]

    if (!appointment.receipt_url) {
      return NextResponse.json({ message: "No receipt found for this appointment" }, { status: 400 })
    }

    const newStatus = approved ? "paid" : "pending payment"

    const verifiedBy = approved && userId ? Number.parseInt(userId) : null
    const verifiedAt = approved ? new Date() : null

    await query(
      `UPDATE appointments 
       SET status = ?, 
           receipt_verified = ?,
           receipt_verified_at = ?,
           receipt_verified_by = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [newStatus, approved ? 1 : 0, verifiedAt, verifiedBy, id],
    )

    console.log("[v0] Updated appointment status to:", newStatus, "receipt_verified:", approved)

    if (approved) {
      await query(
        `UPDATE transactions 
         SET status = 'completed', updated_at = NOW()
         WHERE appointment_id = ? AND transaction_type = 'appointment'`,
        [id],
      )
    }

    const notificationTitle = approved ? "Payment Verified" : "Receipt Rejected"
    const notificationMessage = approved
      ? "Your payment has been verified and your appointment is confirmed!"
      : "Your payment receipt was rejected. Please upload a valid receipt."

    try {
      await query(
        `INSERT INTO notifications (user_id, title, message, type, related_id, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, 0, NOW())`,
        [
          appointment.user_id,
          notificationTitle,
          notificationMessage,
          approved ? "payment_verified" : "receipt_rejected",
          id,
        ],
      )

      // Send email notification
      if (appointment.user_email) {
        sendNotificationEmail({
          userEmail: appointment.user_email,
          userName: appointment.first_name || "Valued Customer",
          title: notificationTitle,
          message: notificationMessage,
          type: approved ? "payment_verified" : "receipt_rejected",
          actionUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/pwa/appointments/${id}`,
          actionText: "View Appointment Details",
        }).catch((error) => {
          console.error("Failed to send email notification:", error)
        })
        console.log(`[v0] Email notification queued for appointment ${id} receipt verification`)
      }
    } catch (notifError) {
      console.error("[v0] Error creating notification or sending email:", notifError)
    }

    const updatedAppointment = await query(
      `SELECT 
        a.*,
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        u.email as user_email,
        p.name as pet_name,
        s.name as service_name
      FROM appointments a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN pets p ON a.pet_id = p.id
      LEFT JOIN services s ON a.service_id = s.id
      WHERE a.id = ?`,
      [id],
    )

    console.log(
      "[v0] Receipt verification complete. New status:",
      updatedAppointment[0]?.status,
      "receipt_verified:",
      updatedAppointment[0]?.receipt_verified,
    )

    return NextResponse.json({
      message: approved
        ? "Receipt verified and appointment marked as paid successfully"
        : "Receipt rejected successfully",
      appointment: updatedAppointment[0],
    })
  } catch (error) {
    console.error("[v0] Error verifying receipt:", error)
    return NextResponse.json(
      {
        message: "Failed to verify receipt",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
