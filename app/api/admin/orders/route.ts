import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    // const cookieStore = cookies()
    // const sessionCookie = cookieStore.get("session")

    // if (!sessionCookie) {
    //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    // }

    // const sessionQuery = `
    //   SELECT user_id, role FROM sessions 
    //   WHERE session_id = ? AND expires_at > NOW()
    // `
    // const sessionResults = await query(sessionQuery, [sessionCookie.value])

    // if (!sessionResults.length || sessionResults[0].role !== "admin") {
    //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    // }

    const ordersQuery = `
      SELECT 
        o.id, 
        CONCAT('ORD-', LPAD(o.id, 4, '0')) as order_number,
        o.user_id,
        o.customer_name,
        o.customer_email,
        o.customer_phone,
        DATE_FORMAT(o.created_at, '%Y-%m-%d %H:%i:%s') as order_date,
        o.total_amount,
        o.subtotal,
        o.shipping_fee,
        o.payment_method,
        o.status,
        o.receipt_url,
        o.shipping_address,
        o.notes,
        CONCAT(u.first_name, ' ', u.last_name) as client_name,
        u.email as user_email,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id, o.user_id, o.customer_name, o.customer_email, o.customer_phone, 
               o.created_at, o.total_amount, o.subtotal, o.shipping_fee, o.payment_method,
               o.status, o.receipt_url, o.shipping_address, o.notes, u.first_name, u.last_name, u.email
      ORDER BY o.created_at DESC
    `
    const orders = await query(ordersQuery)

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
