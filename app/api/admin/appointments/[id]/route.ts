import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { sendNotificationEmail } from "@/lib/email"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Check if user is admin or employee
    // const userRole = request.cookies.get("user_role")?.value
    // if (userRole !== "admin" && userRole !== "employee") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const appointments = await query(
      `
      SELECT 
        a.*,
        CONCAT(u.first_name, ' ', u.last_name) as client_name,
        u.email as client_email,
        u.phone as client_phone,
        p.name as pet_name,
        p.species,
        p.breed,
        TIMESTAMPDIFF(YEAR, p.birth_date, CURDATE()) as pet_age,
        s.name as service_name,
        s.description as service_description,
        s.price as service_price,
        c.cage_number,
        c.type as cage_type,
        c.size_category as cage_size_category,
        c.location as cage_location,
        c.amenities as cage_amenities,
        c.daily_rate as cage_rate
      FROM appointments a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN pets p ON a.pet_id = p.id
      LEFT JOIN services s ON a.service_id = s.id
      LEFT JOIN cages c ON a.cage_id = c.id
      WHERE a.id = ?
    `,
      [id],
    )

    if (appointments.length === 0) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    return NextResponse.json(appointments[0])
  } catch (error) {
    console.error("Error fetching appointment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Check if user is admin or employee
    // const userRole = request.cookies.get("user_role")?.value
    // if (userRole !== "admin" && userRole !== "employee") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const body = await request.json()
    const { status, notes, total_amount, action } = body

    console.log("[v0] Updating appointment:", { id, status, notes, total_amount, action })

    // Get current appointment details for notification
    const currentAppointment = await query(
      `
      SELECT a.*, u.id as user_id, u.email as user_email, u.first_name as first_name,
      p.name as pet_name, s.name as service_name, a.receipt_verified, a.payment_method
      FROM appointments a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN pets p ON a.pet_id = p.id
      LEFT JOIN services s ON a.service_id = s.id
      WHERE a.id = ?
    `,
      [id],
    )

    if (currentAppointment.length === 0) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    const appointment = currentAppointment[0]
    const oldStatus = appointment.status

    if (status && (status === "in_progress" || status === "completed")) {
      const paymentMethod = appointment.payment_method?.toLowerCase()

      // Only check receipt verification for GCash and PayMaya payments
      if (paymentMethod !== "cash" && !appointment.receipt_verified) {
        return NextResponse.json(
          {
            error: "Payment must be verified before changing status to in progress or completed",
            currentStatus: appointment.status,
          },
          { status: 400 },
        )
      }
    }

    console.log("[v0] Current appointment data:", {
      cage_id: appointment.cage_id,
      pet_id: appointment.pet_id,
      check_in_date: appointment.check_in_date,
      check_out_date: appointment.check_out_date,
      appointment_date: appointment.appointment_date,
    })

    // Handle different actions
    let newStatus = status
    const updateFields = []
    const updateValues = []

    if (action === "verify_receipt") {
      // When verifying receipt, update status to "paid"
      newStatus = "paid"
      updateFields.push("status = ?", "updated_at = NOW()")
      updateValues.push(newStatus)
    } else if (action === "reject_receipt") {
      // When rejecting receipt, update status to "pending payment"
      newStatus = "pending payment"
      updateFields.push("status = ?", "updated_at = NOW()")
      updateValues.push(newStatus)
    } else {
      // Regular status update
      updateFields.push("status = ?", "updated_at = NOW()")
      updateValues.push(status)

      if (notes !== undefined) {
        updateFields.push("notes = ?")
        updateValues.push(notes)
      }

      if (total_amount !== undefined) {
        updateFields.push("total_amount = ?")
        updateValues.push(total_amount)
      }
    }

    // Add the ID parameter at the end
    updateValues.push(id)

    // Build and execute the update query
    const updateQuery = `
      UPDATE appointments 
      SET ${updateFields.join(", ")}
      WHERE id = ?
    `

    console.log("Executing query:", updateQuery, updateValues)

    const updateResult = await query(updateQuery, updateValues)
    console.log("Update result:", updateResult)

    if (appointment.cage_id) {
      let cageReservationStatus = "reserved"
      let cageStatus = "available"
      let cageUpdateQuery = ""

      console.log("[v0] Processing cage update for cage_id:", appointment.cage_id, "new status:", newStatus)

      switch (newStatus) {
        case "in_progress":
          cageReservationStatus = "checked_in"
          cageStatus = "occupied"
          // Update cage with current occupancy info
          cageUpdateQuery = `
            UPDATE cages 
            SET status = ?,
                current_pet_id = ?,
                current_appointment_id = ?,
                check_in_date = ?,
                check_out_date = ?,
                updated_at = NOW()
            WHERE id = ?
          `
          const checkInDate = appointment.check_in_date || appointment.appointment_date
          const checkOutDate = appointment.check_out_date

          console.log("[v0] Updating cage to occupied:", {
            cageStatus,
            pet_id: appointment.pet_id,
            appointment_id: id,
            checkInDate,
            checkOutDate,
            cage_id: appointment.cage_id,
          })

          await query(cageUpdateQuery, [
            cageStatus,
            appointment.pet_id,
            id,
            checkInDate,
            checkOutDate,
            appointment.cage_id,
          ])
          console.log("[v0] Cage updated successfully")
          break

        case "completed":
        case "cancelled":
        case "rejected":
          cageReservationStatus = newStatus === "completed" ? "checked_out" : "cancelled"
          cageStatus = "available"
          // Clear cage occupancy info
          cageUpdateQuery = `
            UPDATE cages 
            SET status = ?,
                current_pet_id = NULL,
                current_appointment_id = NULL,
                check_in_date = NULL,
                check_out_date = NULL,
                updated_at = NOW()
            WHERE id = ?
          `
          console.log("[v0] Clearing cage occupancy for cage_id:", appointment.cage_id)
          await query(cageUpdateQuery, [cageStatus, appointment.cage_id])
          console.log("[v0] Cage cleared successfully")
          break

        default:
          cageReservationStatus = "reserved"
          // For other statuses, just ensure cage is available if not occupied
          cageUpdateQuery = `
            UPDATE cages 
            SET status = ?,
                updated_at = NOW()
            WHERE id = ? AND current_appointment_id IS NULL
          `
          await query(cageUpdateQuery, [cageStatus, appointment.cage_id])
      }

      // Also update cage_reservations table
      await query(
        `UPDATE cage_reservations 
         SET status = ?, updated_at = NOW() 
         WHERE appointment_id = ?`,
        [cageReservationStatus, id],
      )

      console.log(
        `[v0] Updated cage ${appointment.cage_id} status to ${cageStatus} and cage_reservations status to ${cageReservationStatus} for appointment ${id}`,
      )

      // Verify the cage update
      const verifyCageUpdate = await query("SELECT * FROM cages WHERE id = ?", [appointment.cage_id])
      console.log("[v0] Cage after update:", verifyCageUpdate[0])
    } else {
      console.log("[v0] No cage_id found for this appointment, skipping cage update")
    }

    // Verify the update worked
    const verifyResult = await query("SELECT status FROM appointments WHERE id = ?", [id])
    console.log("Verification result:", verifyResult)

    if (verifyResult.length === 0) {
      return NextResponse.json({ error: "Failed to verify update" }, { status: 500 })
    }

    const updatedStatus = verifyResult[0].status
    console.log("Updated status:", updatedStatus)

    // Create notification and send email if status changed
    if (oldStatus !== newStatus && appointment.user_id) {
      try {
        // Check if notifications table exists
        const tableExists = await query('SHOW TABLES LIKE "notifications"')

        if (tableExists && tableExists.length > 0) {
          let notificationTitle = ""
          let notificationMessage = ""
          let emailType: "success" | "error" | "info" | "warning" | "appointment_confirmed" = "info"

          switch (newStatus) {
            case "confirmed":
              notificationTitle = "Appointment Confirmed"
              notificationMessage = `✅ Your appointment for ${appointment.pet_name || "your pet"} has been confirmed for ${appointment.appointment_date} at ${appointment.appointment_time}.`
              emailType = "appointment_confirmed"
              break
            case "paid":
              notificationTitle = "Payment Verified"
              notificationMessage = `✅ Your payment for ${appointment.pet_name || "your pet"}'s appointment has been verified and approved.`
              emailType = "success"
              break
            case "pending payment":
              notificationTitle = "Payment Required"
              notificationMessage = `❌ Your receipt for ${appointment.pet_name || "your pet"}'s appointment was rejected. Please upload a new receipt.`
              emailType = "error"
              break
            case "completed":
              notificationTitle = "Appointment Completed"
              notificationMessage = `✅ Your appointment for ${appointment.pet_name || "your pet"} has been completed. ${notes ? "Notes: " + notes : ""}`
              emailType = "success"
              break
            case "cancelled":
              notificationTitle = "Appointment Cancelled"
              notificationMessage = `❌ Your appointment for ${appointment.pet_name || "your pet"} has been cancelled. ${notes ? "Reason: " + notes : ""}`
              emailType = "error"
              break
            case "in_progress":
              notificationTitle = "Appointment Started"
              notificationMessage = `🏥 Your appointment for ${appointment.pet_name || "your pet"} is now in progress.`
              emailType = "info"
              break
            default:
              notificationTitle = "Appointment Updated"
              notificationMessage = `📋 Your appointment for ${appointment.pet_name || "your pet"} has been updated to ${newStatus}.`
              emailType = "info"
          }

          await query(
            `
            INSERT INTO notifications (user_id, type, title, message, related_id, related_type, is_read, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
          `,
            [
              appointment.user_id,
              `appointment_${newStatus.replace(" ", "_")}`,
              notificationTitle,
              notificationMessage,
              id,
              "appointment",
              false,
            ],
          )

          console.log("Notification created successfully")

          // Send email notification
          if (appointment.user_email) {
            sendNotificationEmail({
              userEmail: appointment.user_email,
              userName: appointment.first_name || "Valued Customer",
              title: notificationTitle,
              message: notificationMessage,
              type: emailType,
              actionUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/pwa/appointments/${id}`,
              actionText: "View Appointment",
            }).catch((error) => {
              console.error("Failed to send email notification:", error)
            })
            console.log(`Email notification queued for appointment ${id} status update`)
          }
        }
      } catch (notificationError) {
        console.error("Error creating notification:", notificationError)
        // Don't fail the appointment update if notification creation fails
      }
    }

    return NextResponse.json({
      success: true,
      status: updatedStatus,
      message: "Appointment updated successfully",
    })
  } catch (error) {
    console.error("Error updating appointment:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Check if user is admin (only admin can delete)
    const userRole = request.cookies.get("user_role")?.value
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    // Get appointment details before deletion for notification
    const appointmentDetails = await query(
      `
      SELECT a.*, u.id as user_id, u.email as user_email, u.first_name as first_name,
      p.name as pet_name
      FROM appointments a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN pets p ON a.pet_id = p.id
      WHERE a.id = ?
    `,
      [id],
    )

    if (appointmentDetails.length === 0) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    const appointment = appointmentDetails[0]

    // Delete the appointment
    await query("DELETE FROM appointments WHERE id = ?", [id])

    // Create notification for deletion
    if (appointment.user_id) {
      try {
        const tableExists = await query('SHOW TABLES LIKE "notifications"')

        if (tableExists && tableExists.length > 0) {
          const notificationTitle = "Appointment Deleted"
          const notificationMessage = `🗑️ Your appointment for ${appointment.pet_name || "your pet"} scheduled for ${appointment.appointment_date} has been deleted by the administrator.`

          await query(
            `
            INSERT INTO notifications (user_id, type, title, message, related_id, related_type, is_read, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
          `,
            [
              appointment.user_id,
              "appointment_deleted",
              notificationTitle,
              notificationMessage,
              id,
              "appointment",
              false,
            ],
          )

          // Send email notification
          if (appointment.user_email) {
            sendNotificationEmail({
              userEmail: appointment.user_email,
              userName: appointment.first_name || "Valued Customer",
              title: notificationTitle,
              message: notificationMessage,
              type: "error",
            }).catch((error) => {
              console.error("Failed to send email notification:", error)
            })
            console.log(`Email notification queued for appointment ${id} deletion`)
          }
        }
      } catch (notificationError) {
        console.error("Error creating deletion notification:", notificationError)
      }
    }

    return NextResponse.json({ success: true, message: "Appointment deleted successfully" })
  } catch (error) {
    console.error("Error deleting appointment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
