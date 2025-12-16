import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    // const userRole = request.cookies.get("user_role")?.value
    // if (userRole !== "admin") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const ordersResult = await query(`
      SELECT 
        t.id,
        t.amount as total,
        t.status,
        t.transaction_date,
        CONCAT(u.first_name, ' ', u.last_name) as client_name,
        o.id as order_id,
        COUNT(DISTINCT oi.id) as item_count
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN orders o ON t.reference_id = o.id AND t.transaction_type = 'product_purchase'
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE t.transaction_type = 'product_purchase'
      GROUP BY t.id, t.amount, t.status, t.transaction_date, u.first_name, u.last_name, o.id
      ORDER BY t.transaction_date DESC
      LIMIT 10
    `)

    const ordersWithItems = await Promise.all(
      (ordersResult as any[]).map(async (order) => {
        let orderItems = []

        if (order.order_id) {
          const itemsResult = await query(
            `SELECT 
              COALESCE(p.name, 'Unknown Product') as product_name,
              oi.quantity,
              oi.price as unit_price,
              (oi.quantity * oi.price) as total_price
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?`,
            [order.order_id],
          )
          orderItems = itemsResult as any[]
          console.log("[v0] Order items for order", order.order_id, ":", orderItems)
        }

        return {
          id: order.id,
          client: order.client_name,
          total: Number.parseFloat(order.total) || 0,
          items: order.item_count || 0,
          status: order.status || "pending",
          created_at: order.transaction_date,
          order_items: orderItems,
        }
      }),
    )

    console.log("[v0] Recent orders with items:", JSON.stringify(ordersWithItems, null, 2))

    return NextResponse.json(ordersWithItems)
  } catch (error) {
    console.error("Error fetching recent orders:", error)
    return NextResponse.json([])
  }
}
