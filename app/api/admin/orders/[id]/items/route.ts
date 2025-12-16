import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { cookies } from "next/headers"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies()
    const userRole = cookieStore.get("user_role")?.value

    // if (!userRole) {
    //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    // }

    // Only admin and employee can access this endpoint
    // if (userRole !== "admin" && userRole !== "employee") {
    //   return NextResponse.json({ message: "Forbidden - Admin or Employee access required" }, { status: 403 })
    // }

    const { id: orderId } = await params

    // Fetch order items with product details
    const orderItems = await query(
      `
      SELECT 
        oi.id,
        oi.order_id,
        oi.product_id,
        oi.quantity,
        oi.price,
        p.name as product_name,
        p.photo_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
      ORDER BY oi.id
    `,
      [orderId],
    )

    return NextResponse.json(orderItems)
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
