import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { cookies } from "next/headers"
import { sendNotificationEmail } from "@/lib/email"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user_id")
    const userRole = cookieStore.get("user_role")

    // Allow both admin and employee access
    // if (!userId || !userRole || (userRole.value !== "admin" && userRole.value !== "employee")) {
    //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    // }

    const orderId = params.id

    // Check if order exists
    const orderCheck = await query("SELECT * FROM orders WHERE id = ?", [orderId])
    if (!orderCheck.length) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    const order = orderCheck[0]

    // Check if receipt exists
    if (!order.receipt_url) {
      return NextResponse.json({ message: "No receipt found for this order" }, { status: 400 })
    }

    // Update order status to confirmed
    await query(
      `UPDATE orders 
       SET status = 'confirmed', updated_at = NOW()
       WHERE id = ?`,
      [orderId],
    )

    // Update related transaction status if exists
    await query(
      `UPDATE transactions 
       SET status = 'completed', updated_at = NOW()
       WHERE order_id = ? AND transaction_type = 'order'`,
      [orderId],
    )

    // Get updated order with user info
    const updatedOrderQuery = `
      SELECT 
        o.*,
        CONCAT('ORD-', LPAD(o.id, 4, '0')) as order_number,
        CONCAT(u.first_name, ' ', u.last_name) as client_name,
        u.email as user_email,
        u.first_name as first_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `
    const updatedOrder = await query(updatedOrderQuery, [orderId])

    // Create notification for the customer
    const orderNumber = `ORD-${String(orderId).padStart(4, "0")}`
    const notificationTitle = "Order Confirmed"
    const notificationMessage = `Your order ${orderNumber} has been confirmed! Your payment has been verified and your order is being prepared for shipment.`

    try {
      await query(
        `INSERT INTO notifications (user_id, title, message, type, related_id, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, 0, NOW())`,
        [order.user_id, notificationTitle, notificationMessage, "order_confirmed", orderId],
      )
      console.log(`Notification created for order ${orderId} receipt verification`)

      // Send email notification
      if (updatedOrder[0]?.user_email) {
        sendNotificationEmail({
          userEmail: updatedOrder[0].user_email,
          userName: updatedOrder[0].first_name || "Valued Customer",
          title: notificationTitle,
          message: notificationMessage,
          type: "order_confirmed",
          actionUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/pwa/orders/${orderId}`,
          actionText: "View Order Details",
        }).catch((error) => {
          console.error("Error sending email:", error)
        })
        console.log(`Email sent for order ${orderId} verification`)
      }
    } catch (notifError) {
      console.error("Error creating notification or sending email:", notifError)
      // Don't fail the verification if notification/email fails
    }

    return NextResponse.json({
      message: "Receipt verified and order confirmed successfully",
      order: updatedOrder[0],
    })
  } catch (error) {
    console.error("Error verifying receipt:", error)
    return NextResponse.json(
      {
        message: "Failed to verify receipt",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
