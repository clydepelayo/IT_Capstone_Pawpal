import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id

    if (!orderId) {
      return NextResponse.json({ message: "Order ID is required" }, { status: 400 })
    }

    // Get user ID from cookies
    const userIdCookie = request.cookies.get("user_id")

    if (!userIdCookie) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = userIdCookie.value

    // Verify order belongs to user
    const orderCheck = await query("SELECT id FROM orders WHERE id = ? AND user_id = ?", [orderId, userId])
    if (!orderCheck || (orderCheck as any[]).length === 0) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 })
    }

    // Fetch order items with product details
    const items = await query(
      `
      SELECT 
        oi.id,
        oi.product_id,
        oi.quantity,
        oi.price,
        p.name as product_name,
        p.photo_url
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
      ORDER BY oi.id
    `,
      [orderId],
    )

    return NextResponse.json(items || [])
  } catch (error) {
    console.error("Error fetching order items:", error)
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
