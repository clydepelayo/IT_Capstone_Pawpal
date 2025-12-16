import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { cookies } from "next/headers"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = request.cookies.get("user_id")?.value
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }


    const user = JSON.parse(userId)
    const orderId = params.id

    console.log("Canceling order:", orderId, "for user:", user.id)

    // First, check if the order exists and belongs to the user
    const orderCheck = (await query("SELECT id, status, user_id FROM orders WHERE id = ? AND user_id = ?", [
      orderId,
      user,
    ])) as any[]

    if (orderCheck.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const order = orderCheck[0]

    // Check if order can be cancelled (only pending orders can be cancelled)
    if (order.status.toLowerCase() !== "pending") {
      return NextResponse.json({ error: "Only pending orders can be cancelled" }, { status: 400 })
    }

    // Update order status to cancelled
    await query("UPDATE orders SET status = ? WHERE id = ? AND user_id = ?", ["cancelled", orderId, user])

    console.log("Order cancelled successfully:", orderId)

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
    })
  } catch (error) {
    console.error("Error cancelling order:", error)
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 })
  }
}
