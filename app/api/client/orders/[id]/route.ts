import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { cookies } from "next/headers"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // const cookieStore = await cookies()
    // const userCookie = cookieStore.get("user")

    // if (!userCookie) {
    //   return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    // }

    // const user = JSON.parse(userCookie.value)
    // if (!user.id) {
    //   return NextResponse.json({ error: "Invalid user session" }, { status: 401 })
    // }

    const userId = request.cookies.get("user_id")?.value

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    const user = JSON.parse(userId)

    const { id: orderId } = await params
    console.log("Fetching order details for order:", orderId, "user:", user)

    // First, get the order details
    const orderQuery = `
      SELECT 
        o.*,
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        u.email as user_email,
        u.phone as user_phone
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ? AND o.user_id = ?
    `

    const orderResult = (await query(orderQuery, [orderId, user])) as any[]

    if (orderResult.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const order = orderResult[0]

    // Get order items
    const itemsQuery = `
      SELECT 
        oi.*,
        p.name as product_name,
        p.photo_url
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
      ORDER BY oi.id
    `

    const itemsResult = (await query(itemsQuery, [orderId])) as any[]

    // Process items to handle photo URLs
    const processedItems = itemsResult.map((item) => {
      let photoUrl = item.photo_url || item.photos
      if (photoUrl && photoUrl.startsWith("[")) {
        try {
          const photos = JSON.parse(photoUrl)
          photoUrl = Array.isArray(photos) && photos.length > 0 ? photos[0] : null
        } catch (e) {
          console.log("Error parsing photos JSON:", e)
        }
      }
      return {
        ...item,
        photo_url: photoUrl,
      }
    })

    // Combine order with items
    const orderWithItems = {
      ...order,
      items: processedItems,
    }

    console.log("Order details fetched successfully:", orderWithItems.id)

    return NextResponse.json(orderWithItems)
  } catch (error) {
    console.error("Error fetching order details:", error)
    return NextResponse.json({ error: "Failed to fetch order details" }, { status: 500 })
  }
}
