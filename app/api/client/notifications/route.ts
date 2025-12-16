import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { sendNotificationEmail } from "@/lib/email"

export async function GET(request: NextRequest) {
  try {
    // Get user ID from cookie
    const userIdCookie = request.cookies.get("user_id")
    if (!userIdCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number.parseInt(userIdCookie.value)

    // Check if notifications table exists
    const tableExists = await query('SHOW TABLES LIKE "notifications"')
    if (!tableExists || tableExists.length === 0) {
      return NextResponse.json({
        notifications: [],
        unreadCount: 0,
      })
    }

    // Fetch notifications for the user
    const notifications = await query(
      `
      SELECT 
        id, type, title, message, related_id, related_type, 
        is_read, created_at, updated_at
      FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 20
    `,
      [userId],
    )

    // Get unread count
    const unreadResult = await query(
      `
      SELECT COUNT(*) as count 
      FROM notifications 
      WHERE user_id = ? AND is_read = FALSE
    `,
      [userId],
    )

    const unreadCount = unreadResult[0]?.count || 0

    return NextResponse.json({
      notifications: notifications || [],
      unreadCount,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({
      notifications: [],
      unreadCount: 0,
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user ID from cookie
    const userIdCookie = request.cookies.get("user_id")
    if (!userIdCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number.parseInt(userIdCookie.value)
    const { type, title, message, related_id, related_type } = await request.json()

    // Check if notifications table exists
    const tableExists = await query('SHOW TABLES LIKE "notifications"')
    if (!tableExists || tableExists.length === 0) {
      return NextResponse.json({ success: false, error: "Notifications table not found" }, { status: 500 })
    }

    // Insert notification
    const result = await query(
      `
      INSERT INTO notifications (user_id, type, title, message, related_id, related_type, is_read, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `,
      [userId, type, title, message, related_id, related_type],
    )

    // Get user details for email
    const users = await query(`SELECT email, name FROM users WHERE id = ?`, [userId])

    if (users && users.length > 0) {
      const user = users[0]

      // Determine action URL based on related_type
      let actionUrl = ""
      let actionText = ""

      if (related_type === "order" && related_id) {
        actionUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/pwa/orders/${related_id}`
        actionText = "View Order"
      } else if (related_type === "appointment" && related_id) {
        actionUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/pwa/appointments/${related_id}`
        actionText = "View Appointment"
      }

      // Send email notification (don't await to avoid blocking)
      sendNotificationEmail({
        userEmail: user.email,
        userName: user.name,
        title,
        message,
        type: type === "success" ? "success" : type === "error" ? "error" : type === "warning" ? "warning" : "info",
        actionUrl,
        actionText,
      }).catch((error) => {
        console.error("Failed to send email notification:", error)
      })
    }

    return NextResponse.json({
      success: true,
      notificationId: result.insertId,
    })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create notification",
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Get user ID from cookie
    const userIdCookie = request.cookies.get("user_id")
    if (!userIdCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number.parseInt(userIdCookie.value)
    const { notificationId, markAllAsRead } = await request.json()

    // Check if notifications table exists
    const tableExists = await query('SHOW TABLES LIKE "notifications"')
    if (!tableExists || tableExists.length === 0) {
      return NextResponse.json({ success: false, error: "Notifications table not found" })
    }

    if (markAllAsRead) {
      // Mark all notifications as read for this user
      await query(
        `
        UPDATE notifications 
        SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP 
        WHERE user_id = ? AND is_read = FALSE
      `,
        [userId],
      )
    } else if (notificationId) {
      // Mark specific notification as read
      await query(
        `
        UPDATE notifications 
        SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ? AND user_id = ?
      `,
        [notificationId, userId],
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating notifications:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update notifications",
      },
      { status: 500 },
    )
  }
}
