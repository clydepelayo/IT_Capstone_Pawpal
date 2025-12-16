import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { cookies } from "next/headers"
import { sendNotificationEmail } from "@/lib/email"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const userRole = cookieStore.get("user_role")?.value

    // if (!userRole || (userRole !== "admin" && userRole !== "employee")) {
    //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    // }

    const orderQuery = `
      SELECT 
        o.*,
        CONCAT('ORD-', LPAD(o.id, 4, '0')) as order_number,
        CONCAT(u.first_name, ' ', u.last_name) as client_name,
        u.email as user_email,
        u.phone as client_phone,
        u.address as client_address
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `
    const orders = await query(orderQuery, [id])

    if (!orders || orders.length === 0) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    const itemsQuery = `
      SELECT 
        oi.id,
        oi.order_id,
        oi.product_id,
        oi.quantity,
        oi.price,
        COALESCE(p.name, 'Unknown Product') as product_name,
        p.photo_url
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
      ORDER BY oi.id
    `
    const items = await query(itemsQuery, [id])

    const orderWithItems = {
      ...orders[0],
      items: items || [],
    }

    return NextResponse.json(orderWithItems)
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ message: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const userRole = cookieStore.get("user_role")?.value

    // if (!userRole || (userRole !== "admin" && userRole !== "employee")) {
    //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    // }

    const body = await request.json()
    const { status, notes } = body

    // Get current order details for notification
    const currentOrderQuery = `
      SELECT o.*, u.id as user_id, u.email as user_email, u.first_name as first_name,
      CONCAT('ORD-', LPAD(o.id, 4, '0')) as order_number
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `
    const currentOrder = await query(currentOrderQuery, [id])

    if (!currentOrder || currentOrder.length === 0) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    const order = currentOrder[0]
    const oldStatus = order.status

    // Update order
    const updateFields = ["status = ?", "updated_at = NOW()"]
    const updateValues = [status]

    if (notes !== undefined) {
      updateFields.push("notes = ?")
      updateValues.push(notes)
    }

    updateValues.push(id)

    const updateQuery = `
      UPDATE orders 
      SET ${updateFields.join(", ")}
      WHERE id = ?
    `

    await query(updateQuery, updateValues)

    // Create notification and send email if status changed
    if (oldStatus !== status && order.user_id) {
      try {
        const tableExists = await query('SHOW TABLES LIKE "notifications"')

        if (tableExists && tableExists.length > 0) {
          let notificationTitle = ""
          let notificationMessage = ""
          let emailType: "success" | "error" | "info" | "warning" = "info"

          switch (status) {
            case "confirmed":
              notificationTitle = "Order Confirmed"
              notificationMessage = `✅ Your order ${order.order_number} has been confirmed and is being prepared for delivery.`
              emailType = "success"
              break
            case "processing":
              notificationTitle = "Order Processing"
              notificationMessage = `📦 Your order ${order.order_number} is now being processed. ${notes ? "Note: " + notes : ""}`
              emailType = "info"
              break
            case "shipped":
              notificationTitle = "Order Shipped"
              notificationMessage = `🚚 Great news! Your order ${order.order_number} has been shipped and is on its way to you. ${notes ? "Tracking info: " + notes : ""}`
              emailType = "success"
              break
            case "delivered":
              notificationTitle = "Order Delivered"
              notificationMessage = `✅ Your order ${order.order_number} has been delivered! We hope you enjoy your purchase.`
              emailType = "success"
              break
            case "cancelled":
              notificationTitle = "Order Cancelled"
              notificationMessage = `❌ Your order ${order.order_number} has been cancelled. ${notes ? "Reason: " + notes : ""}`
              emailType = "error"
              break
            case "refunded":
              notificationTitle = "Order Refunded"
              notificationMessage = `💰 Your order ${order.order_number} has been refunded. ${notes ? "Note: " + notes : ""}`
              emailType = "info"
              break
            default:
              notificationTitle = "Order Updated"
              notificationMessage = `📋 Your order ${order.order_number} status has been updated to ${status}.`
              emailType = "info"
          }

          await query(
            `
            INSERT INTO notifications (user_id, type, title, message, related_id, related_type, is_read, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
          `,
            [order.user_id, `order_${status}`, notificationTitle, notificationMessage, id, "order", false],
          )

          // Send email notification
          if (order.user_email) {
            sendNotificationEmail({
              userEmail: order.user_email,
              userName: order.first_name || "Valued Customer",
              title: notificationTitle,
              message: notificationMessage,
              type: emailType,
              actionUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/pwa/orders/${id}`,
              actionText: "View Order",
            }).catch((error) => {
              console.error("Failed to send email notification:", error)
            })
            console.log(`Email sent for order ${id} status update`)
          }
        }
      } catch (notificationError) {
        console.error("Error creating notification:", notificationError)
      }
    }

    const updatedOrderQuery = `
      SELECT 
        o.*,
        CONCAT('ORD-', LPAD(o.id, 4, '0')) as order_number,
        CONCAT(u.first_name, ' ', u.last_name) as client_name,
        u.email as user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `
    const updatedOrder = await query(updatedOrderQuery, [id])

    // Fetch updated order items with product details
    const updatedItemsQuery = `
      SELECT 
        oi.id,
        oi.order_id,
        oi.product_id,
        oi.quantity,
        oi.price,
        COALESCE(p.name, 'Unknown Product') as product_name,
        p.photo_url
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
      ORDER BY oi.id
    `
    const updatedItems = await query(updatedItemsQuery, [id])

    // Include items in the updated order response
    const orderWithUpdatedItems = {
      ...updatedOrder[0],
      items: updatedItems || [],
    }

    return NextResponse.json({
      message: "Order updated successfully",
      order: orderWithUpdatedItems,
    })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ message: "Failed to update order" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const userRole = cookieStore.get("user_role")?.value

    if (!userRole || userRole !== "admin") {
      return NextResponse.json({ message: "Unauthorized - Admin access required" }, { status: 401 })
    }

    // Get order details before deletion
    const orderDetailsQuery = `
      SELECT o.*, u.id as user_id, u.email as user_email, u.first_name as first_name,
      CONCAT('ORD-', LPAD(o.id, 4, '0')) as order_number
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `
    const orderDetails = await query(orderDetailsQuery, [id])

    if (!orderDetails || orderDetails.length === 0) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    const order = orderDetails[0]

    // Delete the order
    await query("DELETE FROM orders WHERE id = ?", [id])

    // Create notification for deletion
    if (order.user_id) {
      try {
        const tableExists = await query('SHOW TABLES LIKE "notifications"')

        if (tableExists && tableExists.length > 0) {
          const notificationTitle = "Order Deleted"
          const notificationMessage = `🗑️ Your order ${order.order_number} has been deleted by the administrator.`

          await query(
            `
            INSERT INTO notifications (user_id, type, title, message, related_id, related_type, is_read, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
          `,
            [order.user_id, "order_deleted", notificationTitle, notificationMessage, id, "order", false],
          )

          // Send email notification
          if (order.user_email) {
            sendNotificationEmail({
              userEmail: order.user_email,
              userName: order.first_name || "Valued Customer",
              title: notificationTitle,
              message: notificationMessage,
              type: "error",
            }).catch((error) => {
              console.error("Failed to send email notification:", error)
            })
            console.log(`Email sent for order ${id} deletion`)
          }
        }
      } catch (notificationError) {
        console.error("Error creating deletion notification:", notificationError)
      }
    }

    return NextResponse.json({ message: "Order deleted successfully" })
  } catch (error) {
    console.error("Error deleting order:", error)
    return NextResponse.json({ message: "Failed to delete order" }, { status: 500 })
  }
}
